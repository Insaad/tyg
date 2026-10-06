export type CategoryId = string;

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  subSubCategory?: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImage?: string;
  image3?: string;
  image4?: string;
  galleryImages?: string[];
  moreImages?: string[];
  colors: string[];
  fabric: string;
  shirtFabric?: string;
  trouserFabric?: string;
  dupattaFabric?: string;
  silhouette?: string;
  embroidery: string;
  status: 'Stitched' | 'Unstitched' | 'Made to Order' | 'Semi-Stitched';
  description: string;
  details: string[];
  pieces: string; // e.g. "3-Piece (Shirt, Dupatta, Trouser)"
  leadTime: string; // e.g. "4 to 6 weeks"
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  careInstructions?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
  stitchingOption: 'Stitched' | 'Unstitched' | 'Custom Bridal Fit';
  customNotes?: string;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface CategoryTheme {
  id: string;
  name: string;
  parentCategory?: string;
  subCategory?: string;
  subSubCategory?: string;
  urduName: string;
  tagline: string;
  description: string;
  heroImage: string;
  accentColor: string;
  bgGradient: string;
  badgeTone: string;
  paletteDescription: string;
}

export interface Testimonial {
  id: string;
  brideName: string;
  event: string;
  city: string;
  quote: string;
  outfit: string;
  date: string;
}

export type PageRoute =
  | 'home'
  | 'shop-all'
  | 'product-detail'
  | 'made-to-order'
  | 'about'
  | 'lookbook'
  | 'contact'
  | string;

