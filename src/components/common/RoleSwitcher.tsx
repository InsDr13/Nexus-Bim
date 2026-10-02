import React, { useState } from 'react';
import { 
  Store, 
  ShieldAlert, 
  Briefcase, 
  ShoppingBag, 
  ShoppingCart, 
  Home,
  Database,
  User,
  LogOut,
  LogIn,
  Link2,
  Check,
  UserPlus,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '../../types/database';

export type ActiveAppView = 'landing' | 'marketplace' | 'admin' | 'vendor' | 'customer';

interface RoleSwitcherProps {
  currentView: ActiveAppView;
  onViewChange: (view: ActiveAppView) => void;
  cartCount: number;
  onOpenCart: () => void;
  favoritesCount: number;
  appMode?: 'real' | 'demo';
  onToggleAppMode?: (mode: 'real' | 'demo') => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (mode?: 'login' | 'signup_vendor' | 'signup_customer') => void;
  onSignOut?: () => void;
  onViewVendorStore?: (slug: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentView,
  onViewChange,
  cartCount,
  onOpenCart,
  currentUser = null,
  onOpenAuth,
  onSignOut,
  onViewVendorStore,
}) => {
  const [copiedSlug, setCopiedSlug] = useState(false);

  const handleCopyVendorLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/#vendeur/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const isVendor = currentUser?.role === 'vendor';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.is_super_admin;
  const isCustomer = currentUser?.role === 'customer';

  return (
    <div className="bg-[#090e1a] border-b border-slate-800 px-3 sm:px-6 py-2.5 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left Side: Mode Production Supabase (Pas de mode démo) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-emerald-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Production (Supabase)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Center: Navigation Selector for Views */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none font-['Plus_Jakarta_Sans',sans-serif]">
          
          {/* Landing Page */}
          <button
            onClick={() => onViewChange('landing')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'landing'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Accueil</span>
          </button>

          {/* Marketplace */}
          <button
            onClick={() => onViewChange('marketplace')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'marketplace'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Marketplace</span>
          </button>

          {/* Espace Client (si connecté client) */}
          {isCustomer && (
            <button
              onClick={() => onViewChange('customer')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'customer'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Mes Achats & Téléchargements</span>
            </button>
          )}

          {/* Espace Vendeur (toujours accessible ou redirection pour s'inscrire) */}
          <button
            onClick={() => onViewChange('vendor')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'vendor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>{isVendor ? 'Mon Espace Vendeur' : 'Espace Vendeur'}</span>
          </button>

          {/* Bouton direct "Ma Boutique Publique" si vendeur connecté */}
          {isVendor && currentUser?.store_slug && onViewVendorStore && (
            <button
              onClick={() => onViewVendorStore(currentUser.store_slug!)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Apercevoir votre boutique telle que les clients la voient"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ma Boutique Publique</span>
            </button>
          )}

          {/* Espace Administration (uniquement pour Super Admin ou Admin) */}
          {isAdmin && (
            <button
              onClick={() => onViewChange('admin')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                  : 'text-purple-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Administration</span>
            </button>
          )}
        </div>

        {/* Right Zone: Cart & Auth Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
          
          {/* Quick Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-blue-500/50 transition-all text-xs font-semibold cursor-pointer"
            title="Ouvrir le panier"
          >
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <span>Panier</span>
            {cartCount > 0 ? (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            ) : (
              <span className="text-slate-500 text-xs font-mono">(0)</span>
            )}
          </button>

          {/* User Account / Auth Actions */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/40"
                />
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-bold text-white leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-400 font-medium">
                    {currentUser.role === 'vendor' ? 'Vendeur' : currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'Client'}
                  </div>
                </div>
              </div>

              {/* Quick Copy Storefront Link for vendor */}
              {isVendor && currentUser.store_slug && (
                <button
                  onClick={(e) => handleCopyVendorLink(currentUser.store_slug!, e)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                  title={`Copier le lien public de votre boutique (#vendeur/${currentUser.store_slug})`}
                >
                  {copiedSlug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              )}

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 transition-colors cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => onOpenAuth ? onOpenAuth('signup_vendor') : null}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Ouvrir une Boutique</span>
              </button>

              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : null}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Connexion</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
