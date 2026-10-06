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
  'category_name',
  'price',
  'original_price',
  'image',
  'secondary_image',
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
  'name',
  'urdu_name',
  'tagline',
  'description',
  'hero_image',
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

  // Helper to ensure full URL for demo images so user can preview or change them
  const toFullImageUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const resolved = getAssetUrl(path);
    return resolved.startsWith('http') ? resolved : `${origin}${resolved.startsWith('/') ? '' : '/'}${resolved}`;
  };

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
          },
        },
      },
      {
        properties: {
          title: 'Categories',
          gridProperties: {
            frozenRowCount: 1,
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
  const productRows = PRODUCTS.map((p) => [
    p.id,
    p.name,
    p.category,
    p.categoryName,
    p.price,
    p.originalPrice || '',
    toFullImageUrl(p.image),
    p.secondaryImage ? toFullImageUrl(p.secondaryImage) : '',
    p.fabric,
    p.embroidery,
    p.pieces,
    p.leadTime,
    p.status,
    p.isFeatured ? 'TRUE' : 'FALSE',
    p.isBestseller ? 'TRUE' : 'FALSE',
    p.isNewArrival ? 'TRUE' : 'FALSE',
    p.description,
  ]);

  const allProductValues = [PRODUCT_SHEET_HEADERS, ...productRows];

  // 3. Prepare all demo categories rows
  const categoryRows = Object.values(CATEGORY_THEMES).map((theme) => [
    theme.id,
    theme.name,
    theme.urduName,
    theme.tagline,
    theme.description,
    toFullImageUrl(theme.heroImage),
  ]);

  const allCategoryValues = [CATEGORY_SHEET_HEADERS, ...categoryRows];

  // 4. Batch populate both sheets
  const batchUpdateValuesPayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'Products!A1:Q' + allProductValues.length,
        values: allProductValues,
      },
      {
        range: 'Categories!A1:F' + allCategoryValues.length,
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
  const rangeProducts = 'Products!A1:Q500';
  const rangeCategories = 'Categories!A1:F100';

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
  const catNameIdx = getIdx('category_name', 3);
  const priceIdx = getIdx('price', 4);
  const origPriceIdx = getIdx('original_price', 5);
  const imgIdx = getIdx('image', 6);
  const secImgIdx = getIdx('secondary_image', 7);
  const fabricIdx = getIdx('fabric', 8);
  const embIdx = getIdx('embroidery', 9);
  const piecesIdx = getIdx('pieces', 10);
  const leadIdx = getIdx('lead_time', 11);
  const statusIdx = getIdx('status', 12);
  const featIdx = getIdx('featured', 13);
  const bestIdx = getIdx('bestseller', 14);
  const newIdx = getIdx('new_arrival', 15);
  const descIdx = getIdx('description', 16);

  const parsedProducts: Product[] = rows
    .filter((r: any[]) => r && r[titleIdx] && r[titleIdx].toString().trim() !== '')
    .map((r: any[], index: number) => {
      const id = r[idIdx]?.toString().trim() || `prod-${index + 1}`;
      const name = r[titleIdx]?.toString().trim() || 'Bridal Masterpiece';
      const category = (r[catIdx]?.toString().trim() || 'nikah') as CategoryId;
      const categoryName = r[catNameIdx]?.toString().trim() || 'Bridal Collection';

      const cleanNum = (val: any) => {
        if (!val) return 0;
        const cleaned = val.toString().replace(/[^0-9.]/g, '');
        return Number(cleaned) || 0;
      };

      const price = cleanNum(r[priceIdx]) || 150000;
      const originalPrice = r[origPriceIdx] ? cleanNum(r[origPriceIdx]) : undefined;
      const image = r[imgIdx]?.toString().trim() || '/images/nikah_ivory_couture_1791159230888.jpg';
      const secondaryImage = r[secImgIdx]?.toString().trim() || undefined;
      const fabric = r[fabricIdx]?.toString().trim() || 'Pure Raw Silk';
      const embroidery = r[embIdx]?.toString().trim() || 'Handcrafted Zardozi & Tilla Work';
      const pieces = r[piecesIdx]?.toString().trim() || '3-Piece Ensemble';
      const leadTime = r[leadIdx]?.toString().trim() || '6 to 8 Weeks';
      const status = (r[statusIdx]?.toString().trim() || 'Made to Order') as 'Made to Order' | 'Stitched' | 'Unstitched';

      const isTruth = (val: any) => {
        if (!val) return false;
        const s = val.toString().toUpperCase().trim();
        return s === 'TRUE' || s === 'YES' || s === '1';
      };

      const isFeatured = isTruth(r[featIdx]);
      const isBestseller = isTruth(r[bestIdx]);
      const isNewArrival = isTruth(r[newIdx]);
      const description = r[descIdx]?.toString().trim() || 'Bespoke bridal creation handcrafted in Karachi atelier.';

      return {
        id,
        name,
        category,
        categoryName,
        price,
        originalPrice,
        image,
        secondaryImage,
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
          `${fabric} with handcrafted needlework`,
          `${embroidery} with authentic dabka and crystals`,
          'Tailored with 3-inch seam margins for fitting adjustments',
          'Insured worldwide delivery with tracking',
        ],
      };
    });

  // Parse Categories if provided in second tab
  let parsedCategories: CategoryTheme[] = Object.values(CATEGORY_THEMES);
  if (categoryValueRange.length >= 2) {
    const catRows = categoryValueRange.slice(1);
    const customCategories: CategoryTheme[] = catRows
      .filter((r: any[]) => r && r[0] && r[1])
      .map((r: any[]) => {
        const id = r[0].toString().trim();
        const base = CATEGORY_THEMES[id] || CATEGORY_THEMES['nikah'];
        return {
          ...base,
          id,
          name: r[1]?.toString().trim() || base.name,
          urduName: r[2]?.toString().trim() || base.urduName,
          tagline: r[3]?.toString().trim() || base.tagline,
          description: r[4]?.toString().trim() || base.description,
          heroImage: r[5]?.toString().trim() || base.heroImage,
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
  if (!cleanId) throw new Error('Invalid Spreadsheet ID');

  // Try gviz endpoint first (supports named sheet=Products)
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=Products`;
  const exportUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/export?format=csv`;

  let csvText = '';
  try {
    const res = await fetch(gvizUrl);
    if (res.ok) {
      const text = await res.text();
      if (!text.includes('<!DOCTYPE html>') && text.trim().length > 0) {
        csvText = text;
      }
    }
  } catch (e) {
    console.warn('gviz endpoint failed, trying export endpoint', e);
  }

  if (!csvText) {
    const res = await fetch(exportUrl);
    if (!res.ok) {
      throw new Error(
        `Could not access Google Sheet. Please make sure your sheet is set to "Anyone with the link can view" (in Google Sheets click Share > Anyone with the link).`
      );
    }
    const text = await res.text();
    if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com')) {
      throw new Error(
        `Permission denied: Please open your Google Sheet, click "Share" at top right, and choose "Anyone with the link can view".`
      );
    }
    csvText = text;
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
  const catNameIdx = getIdx('category_name', 3);
  const priceIdx = getIdx('price', 4);
  const origPriceIdx = getIdx('original_price', 5);
  const imgIdx = getIdx('image', 6);
  const secImgIdx = getIdx('secondary_image', 7);
  const fabricIdx = getIdx('fabric', 8);
  const embIdx = getIdx('embroidery', 9);
  const piecesIdx = getIdx('pieces', 10);
  const leadIdx = getIdx('lead_time', 11);
  const statusIdx = getIdx('status', 12);
  const featIdx = getIdx('featured', 13);
  const bestIdx = getIdx('bestseller', 14);
  const newIdx = getIdx('new_arrival', 15);
  const descIdx = getIdx('description', 16);

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
      const category = (r[catIdx]?.trim() || 'nikah') as CategoryId;
      const categoryName = r[catNameIdx]?.trim() || 'Bridal Collection';

      const price = cleanNum(r[priceIdx]) || 150000;
      const originalPrice = r[origPriceIdx] ? cleanNum(r[origPriceIdx]) : undefined;
      const image = r[imgIdx]?.trim() || '/images/nikah_ivory_couture_1791159230888.jpg';
      const secondaryImage = r[secImgIdx]?.trim() || undefined;
      const fabric = r[fabricIdx]?.trim() || 'Pure Raw Silk';
      const embroidery = r[embIdx]?.trim() || 'Handcrafted Zardozi & Tilla Work';
      const pieces = r[piecesIdx]?.trim() || '3-Piece Ensemble';
      const leadTime = r[leadIdx]?.trim() || '6 to 8 Weeks';
      const status = (r[statusIdx]?.trim() || 'Made to Order') as 'Made to Order' | 'Stitched' | 'Unstitched';

      return {
        id,
        name,
        category,
        categoryName,
        price,
        originalPrice,
        image,
        secondaryImage,
        fabric,
        embroidery,
        pieces,
        leadTime,
        status,
        isFeatured: isTruth(r[featIdx]),
        isBestseller: isTruth(r[bestIdx]),
        isNewArrival: isTruth(r[newIdx]),
        description: r[descIdx]?.trim() || 'Bespoke bridal couture handcrafted in Karachi atelier.',
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
 * Generates ready-to-paste CSV text of all demo products so the user can easily paste it into Google Sheets.
 */
export const generateDemoProductsCsv = (): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const toFullImageUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const resolved = getAssetUrl(path);
    return resolved.startsWith('http') ? resolved : `${origin}${resolved.startsWith('/') ? '' : '/'}${resolved}`;
  };

  const rows = [
    PRODUCT_SHEET_HEADERS.join(','),
    ...PRODUCTS.map((p) =>
      [
        `"${p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.categoryName}"`,
        p.price,
        p.originalPrice || '',
        `"${toFullImageUrl(p.image)}"`,
        p.secondaryImage ? `"${toFullImageUrl(p.secondaryImage)}"` : '""',
        `"${p.fabric.replace(/"/g, '""')}"`,
        `"${p.embroidery.replace(/"/g, '""')}"`,
        `"${p.pieces}"`,
        `"${p.leadTime}"`,
        `"${p.status}"`,
        p.isFeatured ? 'TRUE' : 'FALSE',
        p.isBestseller ? 'TRUE' : 'FALSE',
        p.isNewArrival ? 'TRUE' : 'FALSE',
        `"${p.description.replace(/"/g, '""')}"`,
      ].join(',')
    ),
  ];

  return rows.join('\n');
};

