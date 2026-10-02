/**
 * @license
 * Nexus BIM - Marketplace Multi-Vendeurs de Produits Numériques
 * Architecture Frontend GUI avec isolation par rôle (Admin, Vendeur, Client)
 * et connecteur officiel Supabase (Projet ID: lfndoimqzxvqsosxgeys).
 */

import React, { useState, useEffect } from 'react';
import { Product, Order, UserProfile, VendorStoreSettings } from './types/database';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_USERS, 
  INITIAL_ORDERS, 
  INITIAL_STORE_SETTINGS 
} from './data/mockData';
import { SupabaseStatusBanner } from './components/common/SupabaseStatusBanner';
import { RoleSwitcher, ActiveAppView } from './components/common/RoleSwitcher';
import { LandingPage } from './components/landing/LandingPage';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { ProductDetailModal } from './components/marketplace/ProductDetailModal';
import { PublicStoreModal } from './components/marketplace/PublicStoreModal';
import { ClientPortal } from './components/client/ClientPortal';
import { VendorPortal } from './components/vendor/VendorPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { 
  getAppMode, 
  setAppMode, 
  supabaseAuthService, 
  supabaseDatabaseService, 
  generateSupabaseSQLSchema 
} from './services/supabase';
import { Database, X, Copy, Check } from 'lucide-react';

export default function App() {
  // Navigation & Active View (Landing page as default Accueil)
  const [currentView, setCurrentView] = useState<ActiveAppView>('landing');

  // APP MODE : AU lancement de l'application, on est déjà en mode réel par défaut
  const [appMode, setAppModeState] = useState<'real' | 'demo'>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('nexus_app_mode') : null;
    return saved === 'demo' ? 'demo' : 'real';
  });

  // AUTH STATE : current authenticated profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => supabaseAuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup_vendor' | 'signup_customer'>('login');

  // SQL Schema Modal state
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);

  // Products state (separating real mode vs demo mode - Real starts EMPTY as requested)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexus_real_products');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return []; // En mode réel: catalogue commence propre
  });

  // Orders state (Real starts EMPTY as requested)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nexus_real_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return []; // En mode réel: commence propre
  });

  // Users state (Real has default Super Admin pré-configuré: login superadmin / superadmin)
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('nexus_real_profiles');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [{
      id: 'usr_super_admin',
      username: 'superadmin',
      email: 'superadmin@nexusbim.com',
      name: 'Super Administrateur',
      role: 'super_admin',
      is_super_admin: true,
      company: 'Nexus BIM Core',
      specialty: 'Direction & Sécurité Plateforme',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      status: 'active',
      created_at: '2026-01-01T00:00:00Z'
    }];
  });

  // Vendor Store settings
  const [storeSettings, setStoreSettings] = useState<VendorStoreSettings>(() => {
    const saved = localStorage.getItem('nexus_store_settings');
    return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_favorites');
    return saved ? JSON.parse(saved) : ['prod-1', 'prod-3'];
  });

  // Cart
  const [cartItems, setCartItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendorForStore, setSelectedVendorForStore] = useState<string | null>(null);

  // 1. Initial Data Sync on App Mode change
  useEffect(() => {
    if (appMode === 'real') {
      // In real mode: check Supabase or real storage
      supabaseDatabaseService.getProducts().then(res => {
        setProducts(res || []);
      });
      supabaseDatabaseService.getOrders().then(res => {
        setOrders(res || []);
      });
      supabaseDatabaseService.getUsers().then(res => {
        if (res && res.length > 0) {
          setUsers(res);
        }
      });
    } else {
      // In demo mode: restore initial mock fixtures
      const savedProd = localStorage.getItem('nexus_demo_products');
      setProducts(savedProd ? JSON.parse(savedProd) : INITIAL_PRODUCTS);
      const savedOrd = localStorage.getItem('nexus_demo_orders');
      setOrders(savedOrd ? JSON.parse(savedOrd) : INITIAL_ORDERS);
      const savedUsers = localStorage.getItem('nexus_demo_users');
      setUsers(savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS);
    }
  }, [appMode]);

  // Sync to LocalStorage according to active Mode
  useEffect(() => {
    const key = appMode === 'real' ? 'nexus_real_products' : 'nexus_demo_products';
    localStorage.setItem(key, JSON.stringify(products));
  }, [products, appMode]);

  useEffect(() => {
    const key = appMode === 'real' ? 'nexus_real_orders' : 'nexus_demo_orders';
    localStorage.setItem(key, JSON.stringify(orders));
  }, [orders, appMode]);

  useEffect(() => {
    const key = appMode === 'real' ? 'nexus_real_profiles' : 'nexus_demo_users';
    localStorage.setItem(key, JSON.stringify(users));
  }, [users, appMode]);

  useEffect(() => {
    localStorage.setItem('nexus_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('nexus_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Handle URL hash or path for direct vendor link: #vendeur/nom-unique
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#vendeur/')) {
        const slug = hash.replace('#vendeur/', '').trim();
        if (slug) {
          setSelectedVendorForStore(slug);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Mode Toggle Handler
  const handleToggleAppMode = (mode: 'real' | 'demo') => {
    setAppMode(mode);
    setAppModeState(mode);

    if (mode === 'real') {
      const savedProducts = localStorage.getItem('nexus_real_products');
      setProducts(savedProducts ? JSON.parse(savedProducts) : []);
      const savedOrders = localStorage.getItem('nexus_real_orders');
      setOrders(savedOrders ? JSON.parse(savedOrders) : []);
      const savedUsers = localStorage.getItem('nexus_real_profiles');
      setUsers(savedUsers ? JSON.parse(savedUsers) : [{
        id: 'usr_super_admin',
        email: 'admin@nexusbim.com',
        name: 'Super Administrateur',
        role: 'super_admin',
        is_super_admin: true,
        company: 'Nexus BIM Core',
        specialty: 'Administration & Sécurité',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        status: 'active',
        created_at: new Date().toISOString()
      }]);
      supabaseDatabaseService.getProducts().then(res => setProducts(res || []));
      supabaseDatabaseService.getOrders().then(res => setOrders(res || []));
      supabaseDatabaseService.getUsers().then(res => { if (res && res.length > 0) setUsers(res); });
    } else {
      const savedProducts = localStorage.getItem('nexus_demo_products');
      setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS);
      const savedOrders = localStorage.getItem('nexus_demo_orders');
      setOrders(savedOrders ? JSON.parse(savedOrders) : INITIAL_ORDERS);
      const savedUsers = localStorage.getItem('nexus_demo_users');
      setUsers(savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS);
    }
  };

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'signup_vendor' | 'signup_customer' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // Automatic redirection based on authenticated user's role
    if (user.role === 'vendor') {
      setCurrentView('vendor'); // Redirect to vendor management portal
    } else if (user.role === 'admin' || user.role === 'super_admin') {
      setCurrentView('admin'); // Redirect to admin portal
    } else if (user.role === 'customer') {
      setCurrentView('customer'); // Redirect to customer downloads
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await supabaseAuthService.signOut();
    setCurrentUser(null);
    setCurrentView('landing');
  };

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    if (!cartItems.some(i => i.id === product.id)) {
      setCartItems(prev => [...prev, product]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderCompleted = async (newOrder: Order) => {
    // If real mode, persist to Supabase
    if (appMode === 'real') {
      try {
        await supabaseDatabaseService.createOrder(newOrder);
      } catch (err) {
        console.warn('Order sync note:', err);
      }
    }

    setOrders(prev => [newOrder, ...prev]);

    // Also increment sales count on each ordered product
    setProducts(prev => 
      prev.map(p => {
        const bought = newOrder.items.some(item => item.product_id === p.id);
        return bought ? { ...p, sales_count: p.sales_count + 1 } : p;
      })
    );
  };

  // Favorites Handlers
  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Vendor Product Handlers
  const handleAddProduct = async (newProduct: Product) => {
    // If in real mode, write to Supabase
    if (appMode === 'real') {
      try {
        await supabaseDatabaseService.createProduct(newProduct);
      } catch (err) {
        console.warn('Product create sync note:', err);
      }
    }
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (appMode === 'real') {
      try {
        await supabaseDatabaseService.updateProduct(updatedProduct.id, updatedProduct);
      } catch (err) {}
    }
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = async (productId: string) => {
    if (appMode === 'real') {
      try {
        await supabaseDatabaseService.deleteProduct(productId);
      } catch (err) {}
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Supabase Readiness & Mode Banner */}
      <SupabaseStatusBanner 
        appMode={appMode} 
        onModeChange={handleToggleAppMode}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      {/* 2. Actor Role Selector & Global Navigation Bar */}
      <RoleSwitcher
        currentView={currentView}
        onViewChange={setCurrentView}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        favoritesCount={favorites.length}
        appMode={appMode}
        onToggleAppMode={handleToggleAppMode}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onViewVendorStore={(slug) => setSelectedVendorForStore(slug)}
      />

      {/* 3. Main Views (Each actor has their strictly dedicated interface) */}
      <div className="flex-1">
        
        {/* LANDING PAGE */}
        {currentView === 'landing' && (
          <LandingPage
            onNavigateToMarketplace={() => {
              setCurrentView('marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToVendor={() => {
              setCurrentView('vendor');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* MARKETPLACE VIEW */}
        {currentView === 'marketplace' && (
          <MarketplaceView
            products={products}
            onSelectProduct={setSelectedProduct}
            onAddToCart={handleAddToCart}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToVendor={() => setCurrentView('vendor')}
            onNavigateToClient={() => setCurrentView('customer')}
            onViewVendorStore={(vendor) => setSelectedVendorForStore(vendor)}
            onNavigateToLanding={() => setCurrentView('landing')}
            appMode={appMode}
            onToggleAppMode={handleToggleAppMode}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* CLIENT MENU */}
        {currentView === 'customer' && (
          <ClientPortal
            orders={orders}
            favorites={favorites}
            allProducts={products}
            onNavigateToMarketplace={() => setCurrentView('marketplace')}
            onNavigateToVendor={() => setCurrentView('vendor')}
            onSelectProduct={setSelectedProduct}
            currentUser={currentUser}
            appMode={appMode}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* VENDOR MENU */}
        {currentView === 'vendor' && (
          <VendorPortal
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            storeSettings={storeSettings}
            onUpdateStoreSettings={setStoreSettings}
            onNavigateToMarketplace={() => setCurrentView('marketplace')}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            appMode={appMode}
            orders={orders}
            onViewVendorStore={(slug) => setSelectedVendorForStore(slug)}
            onUserAuthenticated={handleAuthSuccess}
          />
        )}

        {/* ADMINISTRATOR MENU */}
        {currentView === 'admin' && (
          <AdminPortal
            products={products}
            users={users}
            onNavigateToMarketplace={() => setCurrentView('marketplace')}
            currentUser={currentUser}
            onAddAdminUser={(newAdmin) => setUsers(prev => [newAdmin, ...prev])}
            appMode={appMode}
            onOpenAuth={handleOpenAuth}
            orders={orders}
            onUserAuthenticated={handleAuthSuccess}
          />
        )}

      </div>

      {/* 4. Global Modals and Drawers */}

      {/* Cart & Checkout Drawer (Requires customer account before payment!) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOrderCompleted={handleOrderCompleted}
        currentUser={currentUser}
        onUserAuthenticated={handleAuthSuccess}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onViewVendorStore={(vendor) => {
          setSelectedProduct(null);
          setSelectedVendorForStore(vendor);
        }}
      />

      {/* Public Vendor Store Modal (vendeur/nom-unique) */}
      {selectedVendorForStore && (
        <PublicStoreModal
          vendorName={selectedVendorForStore}
          vendorSlug={selectedVendorForStore}
          products={products}
          settings={storeSettings}
          onClose={() => setSelectedVendorForStore(null)}
          onSelectProduct={(p) => {
            setSelectedVendorForStore(null);
            setSelectedProduct(p);
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Authentication Modal (Vendor, Customer, Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        onViewStorefront={(slug) => setSelectedVendorForStore(slug)}
      />

      {/* SQL Schema Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1424] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                  Script SQL Schéma Supabase
                </h3>
              </div>
              <button 
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copiez et collez ce script directement dans l'éditeur SQL de votre dashboard Supabase (SQL Editor &gt; New Query) pour initialiser toutes les tables et politiques RLS sur votre projet <strong className="text-emerald-400">lfndoimqzxvqsosxgeys</strong>.
            </p>

            <pre className="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-y-auto max-h-96">
              {generateSupabaseSQLSchema()}
            </pre>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateSupabaseSQLSchema());
                  setIsCopiedSql(true);
                  setTimeout(() => setIsCopiedSql(false), 2500);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30"
              >
                {isCopiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopiedSql ? 'Script Copié dans le Presse-papier !' : 'Copier tout le Script SQL'}</span>
              </button>

              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer (for Marketplace view) */}
      {currentView === 'marketplace' && (
        <footer className="border-t border-slate-800 bg-[#090e1a] text-slate-400 text-xs sm:text-sm py-10">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="font-extrabold text-white text-base">NEXUS BIM</span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span>La marketplace des produits numériques pour les professionnels (Paiements en $ USD)</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-slate-400 font-medium">
              <button onClick={() => setCurrentView('landing')} className="hover:text-blue-400 transition-colors text-white font-bold">Accueil</button>
              <button onClick={() => setCurrentView('customer')} className="hover:text-blue-400 transition-colors">Espace Client</button>
              <button onClick={() => setCurrentView('vendor')} className="hover:text-blue-400 transition-colors">Espace Vendeur</button>
              <button onClick={() => setCurrentView('admin')} className="hover:text-blue-400 transition-colors">Espace Administrateur</button>
              <span>© 2026 Nexus BIM. Tous droits réservés.</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
