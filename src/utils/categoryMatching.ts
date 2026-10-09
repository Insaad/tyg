import { Product, CategoryTheme } from '../types';
import { CATEGORY_THEMES } from '../data/products';

/**
 * Universal matcher that checks whether a product belongs to a given category ID or theme.
 * Works seamlessly with categories imported from haseensofficial.com, Google Sheets, or local data.
 */
export const matchProductToCategory = (
  product: Product,
  categoryId?: string,
  theme?: CategoryTheme
): boolean => {
  if (!categoryId || categoryId.toLowerCase() === 'all') {
    return true;
  }

  const cid = categoryId.toLowerCase().trim();
  const cat = (product.category || '').toLowerCase();
  const sub = (product.subCategory || '').toLowerCase();
  const subsub = (product.subSubCategory || '').toLowerCase();
  const cname = (product.categoryName || '').toLowerCase();
  const title = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const fabric = (product.fabric || '').toLowerCase();
  const pid = (product.id || '').toLowerCase();

  // 1. Direct equality check
  if (cat === cid || sub === cid || subsub === cid || cname === cid || pid === cid) {
    return true;
  }

  // 2. Theme-based lookup if theme is provided
  if (theme) {
    const tId = (theme.id || '').toLowerCase();
    const tName = (theme.name || '').toLowerCase();
    const tSub = (theme.subCategory || '').toLowerCase();
    const tParent = (theme.parentCategory || '').toLowerCase();

    if (tSub && sub.includes(tSub)) return true;
    if (tName && (cname.includes(tName) || title.includes(tName))) return true;
    if (tId && (sub.includes(tId) || cname.includes(tId) || title.includes(tId))) return true;
    if (tParent && cat === tParent && (sub.includes(cid) || cname.includes(cid))) return true;
  }

  // 3. Specific Haseens collection mappings
  switch (cid) {
    case 'dholak':
      return sub.includes('dholak') || cname.includes('dholak') || title.includes('dholak');
    case 'banur':
      return sub.includes('banur') || cname.includes('banur') || title.includes('banur');
    case 'dilruba':
      return sub.includes('dilruba') || cname.includes('dilruba') || title.includes('dilruba');
    case 'naqs':
      return sub.includes('naqs') || cname.includes('naqs') || title.includes('naqs');
    case 'zahia':
      return sub.includes('zahia') || cname.includes('zahia') || title.includes('zahia');
    case 'gulal':
      return sub.includes('gulal') || cname.includes('gulal') || title.includes('gulal');
    case 'sale-10-10':
    case '10-10':
    case 'sale':
      return (
        sub.includes('10.10') ||
        sub.includes('sale') ||
        cat.includes('promotions') ||
        title.includes('10.10') ||
        cname.includes('10.10')
      );
    case 'lawn':
      return cat.includes('lawn') || sub.includes('lawn') || fabric.includes('lawn');
    case 'gharara':
      return sub.includes('gharara') || subsub.includes('gharara') || title.includes('gharara');
    case 'pishwas':
      return sub.includes('pishwas') || subsub.includes('pishwas') || title.includes('pishwas');
    case 'maxi':
      return sub.includes('maxi') || subsub.includes('maxi') || title.includes('maxi');
    case 'lehenga':
      return sub.includes('lehenga') || subsub.includes('lehenga') || title.includes('lehenga');
    case 'sharara':
      return sub.includes('sharara') || subsub.includes('sharara') || title.includes('sharara');
    case 'gown':
      return sub.includes('gown') || subsub.includes('gown') || title.includes('gown');

    // Occasion routes
    case 'nikah':
      return (
        sub.includes('banur') ||
        sub.includes('zahia') ||
        sub.includes('maxi') ||
        sub.includes('pishwas') ||
        title.includes('ivory') ||
        desc.includes('nikah')
      );
    case 'barat':
      return (
        sub.includes('lehenga') ||
        sub.includes('gharara') ||
        sub.includes('dilruba') ||
        desc.includes('barat') ||
        title.includes('red')
      );
    case 'mehndi':
      return (
        sub.includes('sharara') ||
        sub.includes('dholak') ||
        sub.includes('gulal') ||
        desc.includes('mehndi') ||
        desc.includes('sangeet')
      );
    case 'walima':
      return (
        sub.includes('gown') ||
        sub.includes('maxi') ||
        sub.includes('banur') ||
        desc.includes('walima')
      );
    default:
      break;
  }

  // 4. Normalized slug / phrase matching
  const cleanCid = cid.replace(/[-_]/g, ' ').trim();
  if (cleanCid.length > 2) {
    if (
      sub.includes(cleanCid) ||
      subsub.includes(cleanCid) ||
      cname.includes(cleanCid) ||
      cat.includes(cleanCid) ||
      title.includes(cleanCid)
    ) {
      return true;
    }
  }

  // 5. Individual word check for multi-word category names
  const words = cleanCid.split(' ').filter((w) => w.length > 3);
  if (words.length > 0) {
    const combined = `${cat} ${sub} ${subsub} ${cname} ${title}`;
    if (words.some((w) => combined.includes(w))) {
      return true;
    }
  }

  return false;
};

/**
 * Returns a guaranteed valid CategoryTheme for any categoryId.
 * Never returns undefined.
 */
export const resolveCategoryTheme = (
  categoryId?: string,
  dynamicCategories?: CategoryTheme[]
): CategoryTheme => {
  const cid = (categoryId || '').toLowerCase().trim();

  // 1. Check in dynamic categories list
  if (dynamicCategories && dynamicCategories.length > 0) {
    const found = dynamicCategories.find(
      (c) =>
        c.id.toLowerCase() === cid ||
        c.name.toLowerCase() === cid ||
        (c.subCategory && c.subCategory.toLowerCase() === cid)
    );
    if (found) return found;
  }

  // 2. Check in static CATEGORY_THEMES
  if (CATEGORY_THEMES[cid]) {
    return CATEGORY_THEMES[cid];
  }

  // 3. Check by partial match in CATEGORY_THEMES
  const themeValues = Object.values(CATEGORY_THEMES);
  const partial = themeValues.find(
    (t) =>
      t.id.toLowerCase().includes(cid) ||
      cid.includes(t.id.toLowerCase()) ||
      t.name.toLowerCase().includes(cid)
  );
  if (partial) return partial;

  // 4. Safe fallback theme
  const defaultTheme = themeValues[0] || {
    id: cid || 'collection',
    name: (categoryId || 'Bridal Collection').replace(/[-_]/g, ' ').toUpperCase(),
    parentCategory: 'All Products',
    subCategory: categoryId || 'Collection',
    subSubCategory: 'Couture Ensembles',
    urduName: 'شاہی ملبوسات',
    tagline: 'Exquisite Handcrafted Haute Couture by Ashrafi Atelier',
    description: 'Explore signature bridal and formal wear handcrafted with traditional wooden Karchob hand embroidery.',
    heroImage: 'https://cdn.shopify.com/s/files/1/2337/7003/files/20260926202520-edb6e189a5844c5a-media_image.jpg',
    accentColor: '#9E7B3B',
    bgGradient: 'from-[#FAF8F5] to-[#F5EFE6]',
    badgeTone: 'bg-[#9E7B3B]/10 text-[#9E7B3B] border-[#9E7B3B]/30',
    paletteDescription: 'Royal golds, antique silvers, and rich festive velvets.',
  };

  return defaultTheme;
};
