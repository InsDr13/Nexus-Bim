/**
 * @license
 * Nexus BIM - Marketplace Multi-Vendeurs de Produits Numériques
 * Architecture Frontend Production GUI avec connecteur officiel Supabase (Projet ID: lfndoimqzxvqsosxgeys).
 * Mode Production uniquement - Isolation stricte par rôle (Admin, Vendeur, Client).
 */

import React, { useState, useEffect } from 'react';
import { Product, Order, UserProfile, VendorStoreSettings } from './types/database';
import { INITIAL_STORE_SETTINGS } from './data/mockData';
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
  supabaseAuthService, 
  supabaseDatabaseService, 
  generateSupabaseSQLSchema,
  safeLocalStorageSetItem
} from './services/supabase';
import { Database, X, Copy, Check } from 'lucide-react';

export default function App() {
  // Navigation & Active View (Landing page as default Accueil)
  const [currentView, setCurrentView] = useState<ActiveAppView>('landing');

  // AUTH STATE : current authenticated profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => supabaseAuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup_vendor' | 'signup_customer'>('login');

  // SQL Schema Modal state
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);

  // Products state (Catalogue de production)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexus_real_products');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  // Orders state (Commandes réelles en production)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nexus_real_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  // Users state (Super Admin pré-configuré par défaut: login superadmin / superadmin)
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
    return saved ? JSON.parse(saved) : [];
  });

  // Cart
  const [cartItems, setCartItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexus_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals & Store routing
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVendorForStore, setSelectedVendorForStore] = useState<string | null>(null);

  // 1. Initial Data Sync with Supabase (Production)
  useEffect(() => {
    supabaseDatabaseService.getProducts().then(res => {
      if (res && res.length > 0) setProducts(res);
    });
    supabaseDatabaseService.getOrders().then(res => {
      if (res && res.length > 0) setOrders(res);
    });
    supabaseDatabaseService.getUsers().then(res => {
      if (res && res.length > 0) setUsers(res);
    });
  }, []);

  // Sync state to local production cache
  useEffect(() => {
    safeLocalStorageSetItem('nexus_real_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeLocalStorageSetItem('nexus_real_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeLocalStorageSetItem('nexus_real_profiles', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    safeLocalStorageSetItem('nexus_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    safeLocalStorageSetItem('nexus_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    safeLocalStorageSetItem('nexus_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Handle URL hash and pathname for direct vendor link: #vendeur/nom-unique ou /vendeur/nom-unique
  useEffect(() => {
    const checkVendorRouting = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#vendeur/')) {
        const slug = decodeURIComponent(hash.replace('#vendeur/', '').trim());
        if (slug) {
          setSelectedVendorForStore(slug);
        }
      }
      const pathname = window.location.pathname;
      if (pathname.startsWith('/vendeur/')) {
        const slug = decodeURIComponent(pathname.replace('/vendeur/', '').trim());
        if (slug) {
          setSelectedVendorForStore(slug);
        }
      }
    };

    checkVendorRouting();
    window.addEventListener('hashchange', checkVendorRouting);
    window.addEventListener('popstate', checkVendorRouting);
    return () => {
      window.removeEventListener('hashchange', checkVendorRouting);
      window.removeEventListener('popstate', checkVendorRouting);
    };
  }, []);

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'signup_vendor' | 'signup_customer' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (!users.some(u => u.id === user.id || u.email === user.email)) {
      setUsers(prev => [user, ...prev]);
    }
    // Redirection automatique selon le rôle
    if (user.role === 'vendor') {
      setCurrentView('vendor');
    } else if (user.role === 'admin' || user.role === 'super_admin') {
      setCurrentView('admin');
    } else if (user.role === 'customer') {
      setCurrentView('customer');
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
    try {
      await supabaseDatabaseService.createOrder(newOrder);
    } catch (err) {
      console.warn('Order sync note:', err);
    }

    setOrders(prev => [newOrder, ...prev]);

    // Incrémente le nombre de ventes sur chaque produit commandé
    setProducts(prev => 
      prev.map(p => {
        const bought = newOrder.items.some(item => item.product_id === p.id);
        return bought ? { ...p, sales_count: (p.sales_count || 0) + 1 } : p;
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
    try {
      await supabaseDatabaseService.createProduct(newProduct);
    } catch (err) {
      console.warn('Product create sync note:', err);
    }
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await supabaseDatabaseService.updateProduct(updatedProduct.id, updatedProduct);
    } catch (err) {}
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await supabaseDatabaseService.deleteProduct(productId);
    } catch (err) {}
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Resolve Store Info for the Public Storefront
  const activeVendorProfile = selectedVendorForStore
    ? users.find(u => 
        (u.store_slug && u.store_slug.toLowerCase() === selectedVendorForStore.toLowerCase()) ||
        (u.company && u.company.toLowerCase() === selectedVendorForStore.toLowerCase()) ||
        (u.name && u.name.toLowerCase() === selectedVendorForStore.toLowerCase())
      )
    : null;

  const resolvedStoreSettings: VendorStoreSettings = activeVendorProfile
    ? {
        vendor_id: activeVendorProfile.id,
        store_name: activeVendorProfile.company || activeVendorProfile.name,
        tagline: activeVendorProfile.specialty ? `Atelier spécialisé en ${activeVendorProfile.specialty}` : (storeSettings.tagline || ''),
        bio: activeVendorProfile.bio || storeSettings.bio || '',
        logo_url: activeVendorProfile.avatar || storeSettings.logo_url,
        banner_url: activeVendorProfile.banner_url || storeSettings.banner_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
        primary_color: storeSettings.primary_color || '#2563eb',
        phone: activeVendorProfile.phone,
        whatsapp: activeVendorProfile.whatsapp,
        address: activeVendorProfile.address,
        contact_email: activeVendorProfile.contact_email || activeVendorProfile.email,
        followers_count: storeSettings.followers_count || 0
      }
    : storeSettings;

  const resolvedVendorDisplayName = activeVendorProfile?.company || activeVendorProfile?.name || selectedVendorForStore || 'Atelier';

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. Supabase Readiness & SQL Migration Banner */}
      <SupabaseStatusBanner 
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      {/* 2. Navigation Globale & Sélecteur de Vues */}
      <RoleSwitcher
        currentView={currentView}
        onViewChange={setCurrentView}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        favoritesCount={favorites.length}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onViewVendorStore={(slug) => setSelectedVendorForStore(slug)}
      />

      {/* 3. Vues Principales selon le rôle et l'écran actif */}
      <div className="flex-1">
        
        {/* PAGE D'ACCUEIL */}
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

        {/* VUE MARKETPLACE */}
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
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* ESPACE CLIENT */}
        {currentView === 'customer' && (
          <ClientPortal
            orders={orders}
            favorites={favorites}
            allProducts={products}
            onNavigateToMarketplace={() => setCurrentView('marketplace')}
            onNavigateToVendor={() => setCurrentView('vendor')}
            onSelectProduct={setSelectedProduct}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* ESPACE VENDEUR */}
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
            orders={orders}
            onViewVendorStore={(slug) => setSelectedVendorForStore(slug)}
            onUserAuthenticated={handleAuthSuccess}
          />
        )}

        {/* ESPACE ADMINISTRATEUR */}
        {currentView === 'admin' && (
          <AdminPortal
            products={products}
            users={users}
            onNavigateToMarketplace={() => setCurrentView('marketplace')}
            currentUser={currentUser}
            onAddAdminUser={(newAdmin) => setUsers(prev => [newAdmin, ...prev])}
            onOpenAuth={handleOpenAuth}
            orders={orders}
            onUserAuthenticated={handleAuthSuccess}
          />
        )}

      </div>

      {/* 4. Modales Globales */}

      {/* Tiroir Panier & Commande */}
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

      {/* Modale Détail Produit */}
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

      {/* Vitrine Boutique Publique Vendeur Accessible par Lien (#vendeur/nom-unique) */}
      {selectedVendorForStore && (
        <PublicStoreModal
          vendorName={resolvedVendorDisplayName}
          vendorSlug={selectedVendorForStore}
          products={products}
          settings={resolvedStoreSettings}
          onClose={() => {
            setSelectedVendorForStore(null);
            if (window.location.hash.startsWith('#vendeur/')) {
              window.location.hash = '';
            }
          }}
          onSelectProduct={(p) => {
            setSelectedVendorForStore(null);
            setSelectedProduct(p);
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Modale d'Authentification Lumineuse (Création Boutique Vendeur, Connexion) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        onViewStorefront={(slug) => setSelectedVendorForStore(slug)}
      />

      {/* Modale Schéma & Migration SQL Supabase */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-[#0c1424] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                  Script SQL de Migration Supabase (Mode Production)
                </h3>
              </div>
              <button 
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Copiez et collez ce script directement dans l'éditeur SQL de votre dashboard Supabase (SQL Editor &gt; New Query) pour initialiser toutes les tables (<code className="text-emerald-400 font-mono">profiles, vendor_stores, products, orders, order_items, payout_requests</code>) et leurs index sur votre projet <strong className="text-emerald-400 font-mono">lfndoimqzxvqsosxgeys</strong>.
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                {isCopiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopiedSql ? 'Script Copié dans le Presse-papier !' : 'Copier tout le Script SQL'}</span>
              </button>

              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Marketplace */}
      {currentView === 'marketplace' && (
        <footer className="border-t border-slate-800 bg-[#090e1a] text-slate-400 text-xs sm:text-sm py-10">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="font-extrabold text-white text-base">NEXUS BIM</span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span>Plateforme multi-vendeurs de produits numériques pour professionnels (Devise : $ USD)</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-slate-400 font-medium">
              <button onClick={() => setCurrentView('landing')} className="hover:text-blue-400 transition-colors text-white font-bold cursor-pointer">Accueil</button>
              <button onClick={() => setCurrentView('customer')} className="hover:text-blue-400 transition-colors cursor-pointer">Espace Client</button>
              <button onClick={() => setCurrentView('vendor')} className="hover:text-blue-400 transition-colors cursor-pointer">Espace Vendeur</button>
              <button onClick={() => setCurrentView('admin')} className="hover:text-blue-400 transition-colors cursor-pointer">Espace Administrateur</button>
              <span>© 2026 Nexus BIM. Mode Production.</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
