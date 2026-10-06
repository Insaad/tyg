import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { CartItem, PageRoute, Product, WishlistItem, CategoryTheme } from '../types';
import { PRODUCTS, BOUTIQUE_INFO, CATEGORY_THEMES } from '../data/products';
import { ADMIN_CONFIG } from '../config/adminConfig';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  getAccessToken,
  setCachedAccessToken,
} from '../services/googleAuth';
import {
  createCatalogSpreadsheet,
  fetchCatalogFromSpreadsheet,
  fetchPublicCatalogFromSpreadsheet,
  findExistingCatalogSpreadsheet,
  extractSpreadsheetId,
} from '../services/googleSheets';

interface ShopContextType {
  currentRoute: PageRoute;
  setCurrentRoute: (route: PageRoute) => void;
  cart: CartItem[];
  addToCart: (
    product: Product,
    size?: string,
    color?: string,
    stitching?: 'Stitched' | 'Unstitched' | 'Custom Bridal Fit',
    notes?: string
  ) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  wishlist: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;

  activeProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;

  isAppointmentOpen: boolean;
  openAppointmentModal: (prefillNote?: string) => void;
  closeAppointmentModal: () => void;
  appointmentPrefill: string;

  isSizeGuideOpen: boolean;
  openSizeGuideModal: () => void;
  closeSizeGuideModal: () => void;

  isSearchOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;

  formatPKR: (amount: number) => string;
  createWhatsAppLink: (message: string) => string;

  // Products & Categories (Dynamic with Google Sheets support)
  products: Product[];
  categories: CategoryTheme[];

  // Google Sheets Catalog Management
  isGoogleSheetsOpen: boolean;
  openGoogleSheetsModal: () => void;
  closeGoogleSheetsModal: () => void;
  googleUser: User | null;
  isGoogleConnecting: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  isSyncingSheets: boolean;
  sheetsError: string | null;
  lastSyncedAt: string | null;
  handleGoogleSignIn: () => Promise<void>;
  handleGoogleLogout: () => Promise<void>;
  handleCreateCatalogSheet: () => Promise<void>;
  handleSyncFromSheets: () => Promise<void>;
  handleConnectExistingSheet: (urlOrId: string) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentRoute, setCurrentRouteState] = useState<PageRoute>('home');

  const setCurrentRoute = (route: PageRoute) => {
    setCurrentRouteState(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Products state (can be updated live from Google Sheet)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ashrafi_products_catalog');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<CategoryTheme[]>(() => {
    return Object.values(CATEGORY_THEMES);
  });

  // Google Sheets State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return ADMIN_CONFIG.catalogSpreadsheetId || localStorage.getItem('ashrafi_sheet_id') || '';
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    if (ADMIN_CONFIG.catalogSpreadsheetId) {
      return `https://docs.google.com/spreadsheets/d/${ADMIN_CONFIG.catalogSpreadsheetId}/edit`;
    }
    return localStorage.getItem('ashrafi_sheet_url') || '';
  });
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('ashrafi_sheet_synced_at') || null;
  });

  // Secret Admin Access (via #admin, ?admin=true, or keyboard Alt+A / Ctrl+Shift+A)
  useEffect(() => {
    const checkAdminTrigger = () => {
      if (typeof window === 'undefined') return;
      const url = window.location.href;
      if (url.includes('#admin') || url.includes('?admin=true') || url.includes('&admin=true')) {
        setIsGoogleSheetsOpen(true);
      }
    };
    checkAdminTrigger();
    window.addEventListener('hashchange', checkAdminTrigger);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A or Ctrl + Shift + A to open Admin Sheet panel
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsGoogleSheetsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Cart with local storage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ashrafi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ashrafi_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Wishlist with local storage persistence
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('ashrafi_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ashrafi_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Init Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setCachedAccessToken(token);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // UI Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [appointmentPrefill, setAppointmentPrefill] = useState('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const openProductModal = (product: Product) => setActiveProduct(product);
  const closeProductModal = () => setActiveProduct(null);

  const openAppointmentModal = (prefillNote = '') => {
    setAppointmentPrefill(prefillNote);
    setIsAppointmentOpen(true);
  };
  const closeAppointmentModal = () => setIsAppointmentOpen(false);

  const openSizeGuideModal = () => setIsSizeGuideOpen(true);
  const closeSizeGuideModal = () => setIsSizeGuideOpen(false);

  const openSearchModal = () => setIsSearchOpen(true);
  const closeSearchModal = () => setIsSearchOpen(false);

  const openGoogleSheetsModal = () => setIsGoogleSheetsOpen(true);
  const closeGoogleSheetsModal = () => {
    setIsGoogleSheetsOpen(false);
    setSheetsError(null);
  };

  const addToCart = (
    product: Product,
    size = 'Standard (Tailored margins)',
    color = 'As Shown in Lookbook',
    stitching: 'Stitched' | 'Unstitched' | 'Custom Bridal Fit' = 'Stitched',
    notes = ''
  ) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        { product, size, color, quantity: 1, stitchingOption: stitching, customNotes: notes },
      ];
    });
    openCart();
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)));
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.product.id === product.id);
      if (exists) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      return [...prev, { product, addedAt: new Date().toISOString() }];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.product.id === productId);
  };

  const wishlistCount = wishlist.length;

  const formatPKR = (amount: number): string => {
    return `PKR ${amount.toLocaleString('en-PK')}`;
  };

  const createWhatsAppLink = (message: string) => {
    const encoded = encodeURIComponent(message);
    return `${BOUTIQUE_INFO.whatsappUrl}?text=${encoded}`;
  };

  // Background startup sync if hardcoded or stored spreadsheet ID exists
  useEffect(() => {
    const targetId = ADMIN_CONFIG.catalogSpreadsheetId || localStorage.getItem('ashrafi_sheet_id');
    if (targetId) {
      fetchPublicCatalogFromSpreadsheet(targetId)
        .then((res) => {
          if (res.products && res.products.length > 0) {
            setProducts(res.products);
            localStorage.setItem('ashrafi_products_catalog', JSON.stringify(res.products));
          }
        })
        .catch(() => {
          // Keep local products on network/permission error
        });
    }
  }, []);

  // Google Sheets Actions
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleConnecting(true);
      setSheetsError(null);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        // Automatically check if an existing spreadsheet named 'catalog' exists in Drive
        const existing = await findExistingCatalogSpreadsheet(res.accessToken);
        if (existing && !spreadsheetId) {
          const url = `https://docs.google.com/spreadsheets/d/${existing.id}/edit`;
          setSpreadsheetId(existing.id);
          setSpreadsheetUrl(url);
          localStorage.setItem('ashrafi_sheet_id', existing.id);
          localStorage.setItem('ashrafi_sheet_url', url);
        }
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setSheetsError(err?.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsGoogleConnecting(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleLogout();
    setGoogleUser(null);
  };

  const handleCreateCatalogSheet = async () => {
    let token = await getAccessToken();
    if (!token) {
      const signinRes = await googleSignIn();
      if (!signinRes) return;
      setGoogleUser(signinRes.user);
      token = signinRes.accessToken;
    }

    try {
      setIsSyncingSheets(true);
      setSheetsError(null);
      const created = await createCatalogSpreadsheet(token, 'catalog');
      setSpreadsheetId(created.spreadsheetId);
      setSpreadsheetUrl(created.spreadsheetUrl);
      localStorage.setItem('ashrafi_sheet_id', created.spreadsheetId);
      localStorage.setItem('ashrafi_sheet_url', created.spreadsheetUrl);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(timeStr);
      localStorage.setItem('ashrafi_sheet_synced_at', timeStr);
    } catch (err: any) {
      console.error(err);
      setSheetsError(err?.message || 'Failed to create spreadsheet');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSyncFromSheets = async () => {
    const targetId = spreadsheetId || ADMIN_CONFIG.catalogSpreadsheetId;
    if (!targetId) {
      setSheetsError("Please connect or enter your 'catalog' spreadsheet ID first.");
      return;
    }

    setIsSyncingSheets(true);
    setSheetsError(null);

    // 1. Try public/shared sheet fetch first (Zero login / works on GitHub Pages without domain auth!)
    try {
      const publicResult = await fetchPublicCatalogFromSpreadsheet(targetId);
      if (publicResult.products.length > 0) {
        setProducts(publicResult.products);
        localStorage.setItem('ashrafi_products_catalog', JSON.stringify(publicResult.products));
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(timeStr);
        localStorage.setItem('ashrafi_sheet_synced_at', timeStr);
        setIsSyncingSheets(false);
        return;
      }
    } catch (pubErr) {
      // Fall through to OAuth attempt
    }

    // 2. Fallback to OAuth if sheet is strictly private
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        if (!signinRes) {
          setIsSyncingSheets(false);
          return;
        }
        setGoogleUser(signinRes.user);
        token = signinRes.accessToken;
      }

      const result = await fetchCatalogFromSpreadsheet(token, targetId);
      if (result.products.length > 0) {
        setProducts(result.products);
        localStorage.setItem('ashrafi_products_catalog', JSON.stringify(result.products));
      }
      if (result.categories.length > 0) {
        setCategories(result.categories);
      }

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(timeStr);
      localStorage.setItem('ashrafi_sheet_synced_at', timeStr);
    } catch (err: any) {
      console.error(err);
      setSheetsError(
        err?.message ||
          "Could not sync from Google Sheet. Make sure the sheet is shared as 'Anyone with the link can view' (File > Share > Anyone with the link)."
      );
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleConnectExistingSheet = async (urlOrId: string) => {
    const cleanId = extractSpreadsheetId(urlOrId);
    if (!cleanId) {
      setSheetsError('Please enter a valid Google Sheets URL or ID');
      return;
    }

    setIsSyncingSheets(true);
    setSheetsError(null);

    const url = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
    setSpreadsheetId(cleanId);
    setSpreadsheetUrl(url);
    localStorage.setItem('ashrafi_sheet_id', cleanId);
    localStorage.setItem('ashrafi_sheet_url', url);

    // 1. Try public fetch directly (no login needed!)
    try {
      const publicResult = await fetchPublicCatalogFromSpreadsheet(cleanId);
      if (publicResult.products.length > 0) {
        setProducts(publicResult.products);
        localStorage.setItem('ashrafi_products_catalog', JSON.stringify(publicResult.products));
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(timeStr);
        localStorage.setItem('ashrafi_sheet_synced_at', timeStr);
        setIsSyncingSheets(false);
        return;
      }
    } catch (pubErr) {
      // Fall through to OAuth
    }

    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        if (!signinRes) {
          setIsSyncingSheets(false);
          return;
        }
        setGoogleUser(signinRes.user);
        token = signinRes.accessToken;
      }

      const result = await fetchCatalogFromSpreadsheet(token, cleanId);
      if (result.products.length > 0) {
        setProducts(result.products);
        localStorage.setItem('ashrafi_products_catalog', JSON.stringify(result.products));
      }
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(timeStr);
      localStorage.setItem('ashrafi_sheet_synced_at', timeStr);
    } catch (err: any) {
      setSheetsError(
        err?.message ||
          "Could not connect to that Google Sheet. Make sure the sheet is shared as 'Anyone with the link can view' (in Google Sheets click Share > Anyone with the link)."
      );
    } finally {
      setIsSyncingSheets(false);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        activeProduct,
        openProductModal,
        closeProductModal,
        isAppointmentOpen,
        openAppointmentModal,
        closeAppointmentModal,
        appointmentPrefill,
        isSizeGuideOpen,
        openSizeGuideModal,
        closeSizeGuideModal,
        isSearchOpen,
        openSearchModal,
        closeSearchModal,
        formatPKR,
        createWhatsAppLink,
        products,
        categories,
        isGoogleSheetsOpen,
        openGoogleSheetsModal,
        closeGoogleSheetsModal,
        googleUser,
        isGoogleConnecting,
        spreadsheetId,
        spreadsheetUrl,
        isSyncingSheets,
        sheetsError,
        lastSyncedAt,
        handleGoogleSignIn,
        handleGoogleLogout,
        handleCreateCatalogSheet,
        handleSyncFromSheets,
        handleConnectExistingSheet,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
