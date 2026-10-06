import { Product, CategoryTheme, CategoryId } from '../types';
import { PRODUCTS, CATEGORY_THEMES } from '../data/products';
import { getAssetUrl } from '../utils/assets';

export interface SpreadsheetCatalogResult {
  products: Product[];
  categories: CategoryTheme[];
}

const PRODUCT_SHEET_HEADERS = [
  'id',
  'title',
  'category',
  'sub_category',
  'sub_sub_category',
  'category_name',
  'price',
  'original_price',
  'primary_image',
  'secondary_image',
  'image_3',
  'image_4',
  'more_images',
  'all_images',
  'fabric',
  'embroidery',
  'pieces',
  'lead_time',
  'status',
  'featured',
  'bestseller',
  'new_arrival',
  'description',
];

const CATEGORY_SHEET_HEADERS = [
  'id',
  'parent_category',
  'sub_category',
  'sub_sub_category',
  'name',
  'urdu_name',
  'tagline',
  'description',
  'hero_image',
];

export const toFullCatalogImageUrl = (path?: string, origin = ''): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const resolved = getAssetUrl(path);
  return resolved.startsWith('http') ? resolved : `${origin}${resolved.startsWith('/') ? '' : '/'}${resolved}`;
};

export const getProductImagesList = (p: Product, origin = ''): string[] => {
  const list: string[] = [];
  const add = (url?: string) => {
    if (!url) return;
    const full = toFullCatalogImageUrl(url, origin);
    if (full && !list.includes(full)) list.push(full);
  };
  add(p.image);
  add(p.secondaryImage);
  add(p.image3);
  add(p.image4);
  if (Array.isArray(p.galleryImages)) {
    p.galleryImages.forEach(add);
  }
  if (Array.isArray(p.moreImages)) {
    p.moreImages.forEach(add);
  }
  return list;
};

export const mapProductToSheetRow = (p: Product, origin = ''): any[] => {
  const allImgs = getProductImagesList(p, origin);
  const primary = allImgs[0] || toFullCatalogImageUrl(p.image, origin);
  const secondary = allImgs[1] || (p.secondaryImage ? toFullCatalogImageUrl(p.secondaryImage, origin) : '');
  const img3 = allImgs[2] || (p.image3 ? toFullCatalogImageUrl(p.image3, origin) : '');
  const img4 = allImgs[3] || (p.image4 ? toFullCatalogImageUrl(p.image4, origin) : '');
  const more = allImgs.slice(4).join(' | ');
  const allCombined = allImgs.join(' | ');

  return [
    p.id,
    p.name,
    p.category,
    p.subCategory || '',
    p.subSubCategory || '',
    p.categoryName || '',
    p.price,
    p.originalPrice || '',
    primary,
    secondary,
    img3,
    img4,
    more,
    allCombined,
    p.fabric,
    p.embroidery,
    p.pieces,
    p.leadTime,
    p.status,
    p.isFeatured ? 'TRUE' : 'FALSE',
    p.isBestseller ? 'TRUE' : 'FALSE',
    p.isNewArrival ? 'TRUE' : 'FALSE',
    p.description,
  ];
};

export const mapCategoryToSheetRow = (c: CategoryTheme, origin = ''): any[] => [
  c.id,
  c.parentCategory || '',
  c.subCategory || '',
  c.subSubCategory || '',
  c.name,
  c.urduName,
  c.tagline,
  c.description,
  toFullCatalogImageUrl(c.heroImage, origin),
];

/**
 * Searches user's Google Drive for an existing spreadsheet named 'catalog'.
 */
export const findExistingCatalogSpreadsheet = async (
  accessToken: string
): Promise<{ id: string; name: string } | null> => {
  try {
    const q = encodeURIComponent("name = 'catalog' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (error) {
    console.error('Error finding existing catalog spreadsheet:', error);
    return null;
  }
};

/**
 * Creates a new Google Spreadsheet named 'catalog' pre-populated with all demo products and categories.
 */
export const createCatalogSpreadsheet = async (
  accessToken: string,
  title = 'catalog'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // 1. Create Spreadsheet with two sheets: 'Products' and 'Categories'
  const createPayload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Products',
          gridProperties: {
            frozenRowCount: 1,
            rowCount: Math.max(PRODUCTS.length + 50, 500),
            columnCount: 30,
          },
        },
      },
      {
        properties: {
          title: 'Categories',
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 100,
            columnCount: 15,
          },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare all demo product rows
  const productRows = PRODUCTS.map((p) => mapProductToSheetRow(p, origin));
  const allProductValues = [PRODUCT_SHEET_HEADERS, ...productRows];

  // 3. Prepare all demo categories rows
  const categoryRows = Object.values(CATEGORY_THEMES).map((theme) => mapCategoryToSheetRow(theme, origin));
  const allCategoryValues = [CATEGORY_SHEET_HEADERS, ...categoryRows];

  // 4. Batch populate both sheets
  const batchUpdateValuesPayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'Products!A1:W' + allProductValues.length,
        values: allProductValues,
      },
      {
        range: 'Categories!A1:I' + allCategoryValues.length,
        values: allCategoryValues,
      },
    ],
  };

  const popRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchUpdateValuesPayload),
    }
  );

  if (!popRes.ok) {
    console.warn('Could not populate initial values in spreadsheet');
  }

  return { spreadsheetId, spreadsheetUrl };
};

/**
 * Reads and parses products & categories from the connected Google Sheet.
 */
export const fetchCatalogFromSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetCatalogResult> => {
  const rangeProducts = 'Products!A1:W1000';
  const rangeCategories = 'Categories!A1:I200';

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${encodeURIComponent(
      rangeProducts
    )}&ranges=${encodeURIComponent(rangeCategories)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to read spreadsheet: ${err}`);
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  const productValueRange = valueRanges[0]?.values || [];
  const categoryValueRange = valueRanges[1]?.values || [];

  if (productValueRange.length < 2) {
    throw new Error("No products found in 'Products' sheet tab. Make sure row 1 has headers and row 2+ has products.");
  }

  const rawHeaders = productValueRange[0].map((h: string) => h.toString().toLowerCase().trim());
  const rows = productValueRange.slice(1);

  const getIdx = (name: string, fallbackIdx: number) => {
    const idx = rawHeaders.indexOf(name.toLowerCase());
    return idx !== -1 ? idx : fallbackIdx;
  };

  const idIdx = getIdx('id', 0);
  const titleIdx = rawHeaders.indexOf('title') !== -1 ? rawHeaders.indexOf('title') : getIdx('name', 1);
  const catIdx = getIdx('category', 2);
  const subCatIdx = getIdx('sub_category', rawHeaders.indexOf('subcategory') !== -1 ? rawHeaders.indexOf('subcategory') : 3);
  const subSubCatIdx = getIdx('sub_sub_category', rawHeaders.indexOf('subsubcategory') !== -1 ? rawHeaders.indexOf('subsubcategory') : 4);
  const catNameIdx = getIdx('category_name', 5);
  const priceIdx = getIdx('price', 6);
  const origPriceIdx = getIdx('original_price', 7);
  const imgIdx = rawHeaders.indexOf('primary_image') !== -1 ? rawHeaders.indexOf('primary_image') : getIdx('image', 8);
  const secImgIdx = getIdx('secondary_image', 9);
  const img3Idx = getIdx('image_3', rawHeaders.indexOf('image3') !== -1 ? rawHeaders.indexOf('image3') : 10);
  const img4Idx = getIdx('image_4', rawHeaders.indexOf('image4') !== -1 ? rawHeaders.indexOf('image4') : 11);
  const moreImgsIdx = getIdx('more_images', rawHeaders.indexOf('moreimages') !== -1 ? rawHeaders.indexOf('moreimages') : 12);
  const allImgsIdx = getIdx('all_images', rawHeaders.indexOf('allimages') !== -1 ? rawHeaders.indexOf('allimages') : 13);
  const fabricIdx = getIdx('fabric', 14);
  const embIdx = getIdx('embroidery', 15);
  const piecesIdx = getIdx('pieces', 16);
  const leadIdx = getIdx('lead_time', 17);
  const statusIdx = getIdx('status', 18);
  const featIdx = getIdx('featured', 19);
  const bestIdx = getIdx('bestseller', 20);
  const newIdx = getIdx('new_arrival', 21);
  const descIdx = getIdx('description', 22);

  const parsedProducts: Product[] = rows
    .filter((r: any[]) => r && r[titleIdx] && r[titleIdx].toString().trim() !== '')
    .map((r: any[], index: number) => {
      const id = r[idIdx]?.toString().trim() || `prod-${index + 1}`;
      const name = r[titleIdx]?.toString().trim() || 'Bridal Masterpiece';
      const category = (r[catIdx]?.toString().trim() || 'Festive Drops') as CategoryId;
      const subCategory = (subCatIdx !== -1 && r[subCatIdx]) ? r[subCatIdx]?.toString().trim() : undefined;
      const subSubCategory = (subSubCatIdx !== -1 && r[subSubCatIdx]) ? r[subSubCatIdx]?.toString().trim() : undefined;
      const categoryName = r[catNameIdx]?.toString().trim() || 'Festive Collection';

      const cleanNum = (val: any) => {
        if (!val) return 0;
        const cleaned = val.toString().replace(/[^0-9.]/g, '');
        return Number(cleaned) || 0;
      };

      const price = cleanNum(r[priceIdx]) || 25000;
      const originalPrice = r[origPriceIdx] ? cleanNum(r[origPriceIdx]) : undefined;
      const image = r[imgIdx]?.toString().trim() || 'https://cdn.shopify.com/s/files/1/2337/7003/files/20260926202520-edb6e189a5844c5a-media_image.jpg';
      const secondaryImage = (secImgIdx !== -1 && r[secImgIdx]) ? r[secImgIdx]?.toString().trim() : undefined;
      const image3 = (img3Idx !== -1 && r[img3Idx]) ? r[img3Idx]?.toString().trim() : undefined;
      const image4 = (img4Idx !== -1 && r[img4Idx]) ? r[img4Idx]?.toString().trim() : undefined;
      const moreImgsRaw = (moreImgsIdx !== -1 && r[moreImgsIdx]) ? r[moreImgsIdx]?.toString().trim() : '';
      const allImgsRaw = (allImgsIdx !== -1 && r[allImgsIdx]) ? r[allImgsIdx]?.toString().trim() : '';
      const moreImagesList = moreImgsRaw ? moreImgsRaw.split('|').map((s: string) => s.trim()).filter(Boolean) : undefined;
      const allImagesList = allImgsRaw ? allImgsRaw.split('|').map((s: string) => s.trim()).filter(Boolean) : undefined;

      const fabric = r[fabricIdx]?.toString().trim() || 'Pure Raw Silk & Chiffon';
      const embroidery = r[embIdx]?.toString().trim() || 'Handcrafted Zardozi, Tilla & Fine Resham';
      const pieces = r[piecesIdx]?.toString().trim() || '3-Piece (Shirt, Trouser, Dupatta)';
      const leadTime = r[leadIdx]?.toString().trim() || '5 to 7 Weeks';
      const status = (r[statusIdx]?.toString().trim() || 'Stitched') as 'Made to Order' | 'Stitched' | 'Unstitched';

      const isTruth = (val: any) => {
        if (!val) return false;
        const s = val.toString().toUpperCase().trim();
        return s === 'TRUE' || s === 'YES' || s === '1';
      };

      const isFeatured = isTruth(r[featIdx]);
      const isBestseller = isTruth(r[bestIdx]);
      const isNewArrival = isTruth(r[newIdx]);
      const description = r[descIdx]?.toString().trim() || 'Bespoke Pakistani luxury couture handcrafted with generational artistry.';

      return {
        id,
        name,
        category,
        subCategory,
        subSubCategory,
        categoryName,
        price,
        originalPrice,
        image,
        secondaryImage,
        image3,
        image4,
        moreImages: moreImagesList,
        galleryImages: allImagesList || moreImagesList,
        fabric,
        embroidery,
        pieces,
        leadTime,
        status,
        isFeatured,
        isBestseller,
        isNewArrival,
        description,
        colors: ['As Shown in Lookbook', 'Custom Dye Swatch Option'],
        details: [
          `${fabric} with authentic needlework`,
          `${embroidery} with premium embellishments`,
          'Tailored with 3-inch seam margins for fitting adjustments',
          'Insured worldwide express delivery with tracking',
        ],
      };
    });

  // Parse Categories if provided in second tab
  let parsedCategories: CategoryTheme[] = Object.values(CATEGORY_THEMES);
  if (categoryValueRange.length >= 2) {
    const catRows = categoryValueRange.slice(1);
    const customCategories: CategoryTheme[] = catRows
      .filter((r: any[]) => r && r[0])
      .map((r: any[]) => {
        const id = r[0].toString().trim();
        const base = CATEGORY_THEMES[id] || CATEGORY_THEMES['dholak'] || Object.values(CATEGORY_THEMES)[0];
        const hasParent = r.length >= 9;
        const parentCategory = hasParent ? r[1]?.toString().trim() || base.parentCategory : base.parentCategory;
        const subCategory = hasParent ? r[2]?.toString().trim() || base.subCategory : base.subCategory;
        const subSubCategory = hasParent ? r[3]?.toString().trim() || base.subSubCategory : base.subSubCategory;
        const name = hasParent ? r[4]?.toString().trim() || base.name : r[1]?.toString().trim() || base.name;
        const urduName = hasParent ? r[5]?.toString().trim() || base.urduName : r[2]?.toString().trim() || base.urduName;
        const tagline = hasParent ? r[6]?.toString().trim() || base.tagline : r[3]?.toString().trim() || base.tagline;
        const description = hasParent ? r[7]?.toString().trim() || base.description : r[4]?.toString().trim() || base.description;
        const heroImage = hasParent ? r[8]?.toString().trim() || base.heroImage : r[5]?.toString().trim() || base.heroImage;

        return {
          ...base,
          id,
          parentCategory,
          subCategory,
          subSubCategory,
          name,
          urduName,
          tagline,
          description,
          heroImage,
        };
      });

    if (customCategories.length > 0) {
      parsedCategories = customCategories;
    }
  }

  return {
    products: parsedProducts,
    categories: parsedCategories,
  };
};

/**
 * Extracts spreadsheet ID from full Google Sheets URL or raw ID string.
 */
export const extractSpreadsheetId = (urlOrId: string): string => {
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return urlOrId.trim();
};

/**
 * Parses standard CSV text (including quoted cells and multi-line values).
 */
export const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

/**
 * Fetches products from any public or "Anyone with the link can view" Google Sheet directly.
 * ZERO OAuth or Firebase login required — works on GitHub Pages, Netlify, AI Studio, everywhere!
 */
export const fetchPublicCatalogFromSpreadsheet = async (
  spreadsheetId: string
): Promise<SpreadsheetCatalogResult> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('Invalid Spreadsheet ID or URL');

  // Candidate endpoints for public Google Sheet access
  const candidates: string[] = [];
  if (spreadsheetId.includes('/pub?')) {
    candidates.push(spreadsheetId);
  } else {
    candidates.push(`https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=Products`);
    candidates.push(`https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv`);
    candidates.push(`https://docs.google.com/spreadsheets/d/${cleanId}/export?format=csv&sheet=Products`);
    candidates.push(`https://docs.google.com/spreadsheets/d/${cleanId}/export?format=csv`);
  }

  let csvText = '';
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        // If not HTML login page and contains commas/lines, valid CSV!
        if (
          !text.includes('<!DOCTYPE html>') &&
          !text.includes('accounts.google.com') &&
          !text.includes('Sign in to your Google Account') &&
          text.trim().length > 0 &&
          text.includes(',')
        ) {
          csvText = text;
          break;
        }
      }
    } catch {
      // Continue to next candidate URL
    }
  }

  if (!csvText) {
    throw new Error(
      `Your Google Sheet is currently Restricted. Please open your sheet in Google Drive, click the green "Share" button at the top-right, and change General Access from "Restricted" to "Anyone with the link" (Viewer). Once done, your website will sync with zero sign-in required!`
    );
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    throw new Error('Spreadsheet appears empty or has no product rows.');
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim());
  const dataRows = rows.slice(1);

  const getIdx = (name: string, fallbackIdx: number) => {
    const idx = rawHeaders.indexOf(name.toLowerCase());
    return idx !== -1 ? idx : fallbackIdx;
  };

  const idIdx = getIdx('id', 0);
  const titleIdx = rawHeaders.indexOf('title') !== -1 ? rawHeaders.indexOf('title') : getIdx('name', 1);
  const catIdx = getIdx('category', 2);
  const subCatIdx = getIdx('sub_category', rawHeaders.indexOf('subcategory') !== -1 ? rawHeaders.indexOf('subcategory') : 3);
  const subSubCatIdx = getIdx('sub_sub_category', rawHeaders.indexOf('subsubcategory') !== -1 ? rawHeaders.indexOf('subsubcategory') : 4);
  const catNameIdx = getIdx('category_name', 5);
  const priceIdx = getIdx('price', 6);
  const origPriceIdx = getIdx('original_price', 7);
  const imgIdx = rawHeaders.indexOf('primary_image') !== -1 ? rawHeaders.indexOf('primary_image') : getIdx('image', 8);
  const secImgIdx = getIdx('secondary_image', 9);
  const img3Idx = getIdx('image_3', rawHeaders.indexOf('image3') !== -1 ? rawHeaders.indexOf('image3') : 10);
  const img4Idx = getIdx('image_4', rawHeaders.indexOf('image4') !== -1 ? rawHeaders.indexOf('image4') : 11);
  const moreImgsIdx = getIdx('more_images', rawHeaders.indexOf('moreimages') !== -1 ? rawHeaders.indexOf('moreimages') : 12);
  const allImgsIdx = getIdx('all_images', rawHeaders.indexOf('allimages') !== -1 ? rawHeaders.indexOf('allimages') : 13);
  const fabricIdx = getIdx('fabric', 14);
  const embIdx = getIdx('embroidery', 15);
  const piecesIdx = getIdx('pieces', 16);
  const leadIdx = getIdx('lead_time', 17);
  const statusIdx = getIdx('status', 18);
  const featIdx = getIdx('featured', 19);
  const bestIdx = getIdx('bestseller', 20);
  const newIdx = getIdx('new_arrival', 21);
  const descIdx = getIdx('description', 22);

  const cleanNum = (val: any) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    return Number(cleaned) || 0;
  };

  const isTruth = (val: any) => {
    if (!val) return false;
    const s = val.toString().toUpperCase().trim();
    return s === 'TRUE' || s === 'YES' || s === '1';
  };

  const parsedProducts: Product[] = dataRows
    .filter((r) => r && r[titleIdx] && r[titleIdx].trim() !== '')
    .map((r, index) => {
      const id = r[idIdx]?.trim() || `prod-${index + 1}`;
      const name = r[titleIdx]?.trim() || 'Bridal Masterpiece';
      const category = (r[catIdx]?.trim() || 'Festive Drops') as CategoryId;
      const subCategory = (subCatIdx !== -1 && r[subCatIdx]) ? r[subCatIdx]?.trim() : undefined;
      const subSubCategory = (subSubCatIdx !== -1 && r[subSubCatIdx]) ? r[subSubCatIdx]?.trim() : undefined;
      const categoryName = r[catNameIdx]?.trim() || 'Festive Collection';

      const price = cleanNum(r[priceIdx]) || 25000;
      const originalPrice = r[origPriceIdx] ? cleanNum(r[origPriceIdx]) : undefined;
      const image = r[imgIdx]?.trim() || 'https://cdn.shopify.com/s/files/1/2337/7003/files/20260926202520-edb6e189a5844c5a-media_image.jpg';
      const secondaryImage = (secImgIdx !== -1 && r[secImgIdx]) ? r[secImgIdx]?.trim() : undefined;
      const image3 = (img3Idx !== -1 && r[img3Idx]) ? r[img3Idx]?.trim() : undefined;
      const image4 = (img4Idx !== -1 && r[img4Idx]) ? r[img4Idx]?.trim() : undefined;
      const moreImgsRaw = (moreImgsIdx !== -1 && r[moreImgsIdx]) ? r[moreImgsIdx]?.trim() : '';
      const allImgsRaw = (allImgsIdx !== -1 && r[allImgsIdx]) ? r[allImgsIdx]?.trim() : '';
      const moreImagesList = moreImgsRaw ? moreImgsRaw.split('|').map((s) => s.trim()).filter(Boolean) : undefined;
      const allImagesList = allImgsRaw ? allImgsRaw.split('|').map((s) => s.trim()).filter(Boolean) : undefined;

      const fabric = r[fabricIdx]?.trim() || 'Pure Raw Silk & Chiffon';
      const embroidery = r[embIdx]?.trim() || 'Handcrafted Zardozi, Tilla & Fine Resham';
      const pieces = r[piecesIdx]?.trim() || '3-Piece (Shirt, Trouser, Dupatta)';
      const leadTime = r[leadIdx]?.trim() || '5 to 7 Weeks';
      const status = (r[statusIdx]?.trim() || 'Stitched') as 'Made to Order' | 'Stitched' | 'Unstitched';

      return {
        id,
        name,
        category,
        subCategory,
        subSubCategory,
        categoryName,
        price,
        originalPrice,
        image,
        secondaryImage,
        image3,
        image4,
        moreImages: moreImagesList,
        galleryImages: allImagesList || moreImagesList,
        fabric,
        embroidery,
        pieces,
        leadTime,
        status,
        isFeatured: isTruth(r[featIdx]),
        isBestseller: isTruth(r[bestIdx]),
        isNewArrival: isTruth(r[newIdx]),
        description: r[descIdx]?.trim() || 'Bespoke Pakistani luxury couture handcrafted with generational artistry.',
        colors: ['As Shown in Lookbook', 'Custom Dye Swatch Option'],
        details: [
          `${fabric} with handcrafted needlework`,
          `${embroidery} with authentic dabka and crystals`,
          'Tailored with 3-inch seam margins for fitting adjustments',
          'Insured worldwide delivery with tracking',
        ],
      };
    });

  return {
    products: parsedProducts,
    categories: Object.values(CATEGORY_THEMES),
  };
};

/**
 * Generates tab-separated text (TSV) of all 200 products formatted for direct Ctrl+V pasting into Google Sheets cell A1.
 */
export const generateDemoProductsTSV = (): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const rows = [
    PRODUCT_SHEET_HEADERS.join('\t'),
    ...PRODUCTS.map((p) => {
      const row = mapProductToSheetRow(p, origin);
      return row.map((cell) => (cell !== undefined && cell !== null ? String(cell).replace(/[\t\n\r]/g, ' ') : '')).join('\t');
    }),
  ];

  return rows.join('\n');
};

/**
 * Generates tab-separated text (TSV) of all 14 categories formatted for direct Ctrl+V pasting into Google Sheets cell A1.
 */
export const generateDemoCategoriesTSV = (): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const rows = [
    CATEGORY_SHEET_HEADERS.join('\t'),
    ...Object.values(CATEGORY_THEMES).map((c) => {
      const row = mapCategoryToSheetRow(c, origin);
      return row.map((cell) => (cell !== undefined && cell !== null ? String(cell).replace(/[\t\n\r]/g, ' ') : '')).join('\t');
    }),
  ];

  return rows.join('\n');
};

/**
 * Generates ready-to-paste CSV text of all demo products so the user can easily paste it into Google Sheets.
 */
export const generateDemoProductsCsv = (): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const rows = [
    PRODUCT_SHEET_HEADERS.join(','),
    ...PRODUCTS.map((p) => {
      const row = mapProductToSheetRow(p, origin);
      return row
        .map((val) => {
          if (val === undefined || val === null) return '""';
          const str = String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',');
    }),
  ];

  return rows.join('\n');
};

/**
 * Generates ready-to-paste CSV text of all categories so the user can easily paste it into Google Sheets.
 */
export const generateDemoCategoriesCsv = (): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const rows = [
    CATEGORY_SHEET_HEADERS.join(','),
    ...Object.values(CATEGORY_THEMES).map((c) => {
      const row = mapCategoryToSheetRow(c, origin);
      return row
        .map((val) => {
          if (val === undefined || val === null) return '""';
          const str = String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',');
    }),
  ];

  return rows.join('\n');
};

/**
 * Populates or updates an existing connected Google Sheet with all products and categories.
 * Automatically handles tab creation, grid expansion to 500+ rows, and multi-tab sync.
 */
export const populateCatalogToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  productsToExport: Product[] = PRODUCTS,
  categoriesToExport: CategoryTheme[] = Object.values(CATEGORY_THEMES)
): Promise<{ success: boolean; count: number; categoriesCount: number }> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    throw new Error('Please enter a valid Google Sheets URL or ID.');
  }
  if (!accessToken) {
    throw new Error('Google authorization token is missing. Please sign in with your Google account first.');
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // 1. Prepare products rows (all 200 items with complete columns)
  const productRows = productsToExport.map((p) => mapProductToSheetRow(p, origin));
  const allProductValues = [PRODUCT_SHEET_HEADERS, ...productRows];

  // 2. Prepare categories rows (all 14 items)
  const categoryRows = categoriesToExport.map((c) => mapCategoryToSheetRow(c, origin));
  const allCategoryValues = [CATEGORY_SHEET_HEADERS, ...categoryRows];

  // 3. Inspect metadata and ensure grid row capacity exists
  let targetProductTab = 'Products';
  let targetCategoryTab = 'Categories';
  let existingTitles: string[] = [];

  try {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!metaRes.ok) {
      const errText = await metaRes.text();
      if (metaRes.status === 403 || metaRes.status === 401) {
        throw new Error(
          `Google Sheets Access Denied (HTTP ${metaRes.status}): Make sure you are signed into Google with an account that has Edit access to this spreadsheet, or use the 1-Click Copy option below!`
        );
      }
      throw new Error(`Failed to access spreadsheet: ${errText}`);
    }

    const meta = await metaRes.json();
    const existingSheets = meta.sheets || [];
    existingTitles = existingSheets.map((s: any) => s.properties?.title || '');
    const requests: any[] = [];

    // Case A: If user has a default sheet named Sheet1 and no Products tab, rename Sheet1 to Products!
    if (existingTitles.includes('Sheet1') && !existingTitles.includes('Products')) {
      const sheet1 = existingSheets.find((s: any) => s.properties?.title === 'Sheet1');
      if (sheet1) {
        requests.push({
          updateSheetProperties: {
            properties: {
              sheetId: sheet1.properties.sheetId,
              title: 'Products',
              gridProperties: {
                rowCount: Math.max(allProductValues.length + 50, 500),
                columnCount: 30,
                frozenRowCount: 1,
              },
            },
            fields: 'title,gridProperties',
          },
        });
        targetProductTab = 'Products';
      }
    } else if (!existingTitles.includes('Products')) {
      // Products doesn't exist at all, add it
      requests.push({
        addSheet: {
          properties: {
            title: 'Products',
            gridProperties: {
              rowCount: Math.max(allProductValues.length + 50, 500),
              columnCount: 30,
              frozenRowCount: 1,
            },
          },
        },
      });
      targetProductTab = 'Products';
    } else {
      // Products exists, make sure row count is large enough
      const prodSheet = existingSheets.find((s: any) => s.properties?.title === 'Products');
      if (prodSheet) {
        const currentRows = prodSheet.properties?.gridProperties?.rowCount || 100;
        if (currentRows < allProductValues.length + 10) {
          requests.push({
            updateSheetProperties: {
              properties: {
                sheetId: prodSheet.properties.sheetId,
                gridProperties: {
                  rowCount: Math.max(allProductValues.length + 50, 500),
                  columnCount: 30,
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties',
            },
          });
        }
      }
    }

    // Check Categories tab
    if (!existingTitles.includes('Categories')) {
      requests.push({
        addSheet: {
          properties: {
            title: 'Categories',
            gridProperties: {
              rowCount: Math.max(allCategoryValues.length + 30, 100),
              columnCount: 15,
              frozenRowCount: 1,
            },
          },
        },
      });
    } else {
      const catSheet = existingSheets.find((s: any) => s.properties?.title === 'Categories');
      if (catSheet) {
        const currentRows = catSheet.properties?.gridProperties?.rowCount || 50;
        if (currentRows < allCategoryValues.length + 5) {
          requests.push({
            updateSheetProperties: {
              properties: {
                sheetId: catSheet.properties.sheetId,
                gridProperties: {
                  rowCount: Math.max(allCategoryValues.length + 30, 100),
                  columnCount: 15,
                },
              },
              fields: 'gridProperties',
            },
          });
        }
      }
    }

    if (requests.length > 0) {
      try {
        const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        });
        if (!batchRes.ok) {
          console.warn('Batch update structural warning:', await batchRes.text());
        }
      } catch (err) {
        console.warn('Could not run structural batchUpdate:', err);
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Access Denied')) {
      throw err;
    }
    console.warn('Metadata verification warning:', err);
  }

  // 4. Write Products tab directly
  const writeProductsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
      targetProductTab + '!A1'
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: allProductValues,
      }),
    }
  );

  if (!writeProductsRes.ok) {
    // If targetProductTab failed (e.g. rename was skipped), try writing to the first sheet title
    const firstTitle = existingTitles[0] || 'Sheet1';
    if (targetProductTab !== firstTitle) {
      const fallbackRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
          firstTitle + '!A1'
        )}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: allProductValues,
          }),
        }
      );
      if (!fallbackRes.ok) {
        const errText = await fallbackRes.text();
        throw new Error(`Failed to write products to sheet: ${errText}`);
      }
    } else {
      const errText = await writeProductsRes.text();
      throw new Error(`Failed to write products to sheet: ${errText}`);
    }
  }

  // 5. Write Categories tab directly
  try {
    const writeCategoriesRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
        targetCategoryTab + '!A1'
      )}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: allCategoryValues,
        }),
      }
    );
    if (!writeCategoriesRes.ok) {
      console.warn('Categories tab write warning:', await writeCategoriesRes.text());
    }
  } catch (catErr) {
    console.warn('Categories tab write error:', catErr);
  }

  return {
    success: true,
    count: productsToExport.length,
    categoriesCount: categoriesToExport.length,
  };
};

