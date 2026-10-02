import React, { useState } from 'react';
import { 
  Store, 
  ShieldAlert, 
  Briefcase, 
  ShoppingBag, 
  ShoppingCart, 
  Home,
  Database,
  Sparkles,
  User,
  LogOut,
  LogIn,
  Link2,
  CheckCircle,
  Crown,
  Copy,
  Check,
  UserPlus
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
  appMode = 'real',
  onToggleAppMode,
  currentUser = null,
  onOpenAuth,
  onSignOut,
  onViewVendorStore,
}) => {
  const [copiedSlug, setCopiedSlug] = useState(false);

  const handleCopyVendorLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/vendeur/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  return (
    <div className="bg-[#090e1a] border-b border-slate-800 px-3 sm:px-6 py-2.5 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left Side: Mode Indicator / Switcher (Mode Réel Supabase vs Mode Démo) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => onToggleAppMode && onToggleAppMode('real')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                appMode === 'real'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Connecté à la base de données Supabase lfndoimqzxvqsosxgeys"
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>Mode Réel (Supabase)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </button>

            <button
              onClick={() => onToggleAppMode && onToggleAppMode('demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                appMode === 'demo'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Consulter les données de démonstration pré-remplies"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Mode Démo</span>
            </button>
          </div>
        </div>

        {/* Center: Navigation Selector for Views */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none font-['Plus_Jakarta_Sans',sans-serif]">
          
          {/* Landing Page */}
          <button
            onClick={() => onViewChange('landing')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
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
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
              currentView === 'marketplace'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Marketplace</span>
          </button>

          {/* EN MODE RÉEL : Visibilité strictement conditionnée par le rôle de l'utilisateur connecté */}
          {appMode === 'real' ? (
            <>
              {/* Espace Client (uniquement si connecté avec rôle customer) */}
              {currentUser && currentUser.role === 'customer' && (
                <button
                  onClick={() => onViewChange('customer')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    currentView === 'customer'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Mes Achats & Téléchargements</span>
                </button>
              )}

              {/* Espace Vendeur (uniquement si connecté avec rôle vendor) */}
              {currentUser && currentUser.role === 'vendor' && (
                <button
                  onClick={() => onViewChange('vendor')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    currentView === 'vendor'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>Mon Espace Vendeur</span>
                </button>
              )}

              {/* Espace Administration (uniquement si connecté en tant que Super Admin ou Admin) */}
              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.is_super_admin) && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    currentView === 'admin'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                      : 'text-purple-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Espace Administration</span>
                </button>
              )}
            </>
          ) : (
            /* EN MODE DÉMO : Boutons de démonstration visibles pour tester les interfaces */
            <>
              <button
                onClick={() => onViewChange('customer')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  currentView === 'customer'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Menu Client (Démo)</span>
              </button>

              <button
                onClick={() => onViewChange('vendor')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  currentView === 'vendor'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Menu Vendeur (Démo)</span>
              </button>

              <button
                onClick={() => onViewChange('admin')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Menu Admin (Démo)</span>
              </button>
            </>
          )}
        </div>

        {/* Right Zone: Cart & Auth Status */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
          
          {/* Quick Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-blue-500/50 transition-all text-xs font-semibold"
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
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/40"
                />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-white truncate max-w-[130px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold capitalize flex items-center gap-1">
                    {currentUser.is_super_admin && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                    {currentUser.role === 'vendor' ? 'Vendeur Certifié' : currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'Client Acheteur'}
                  </span>
                </div>
              </div>

              {/* Vendor unique link button (ex: vendeur/studio-arch) */}
              {currentUser.role === 'vendor' && currentUser.store_slug && (
                <div className="hidden xl:flex items-center gap-1 bg-blue-950/50 border border-blue-500/40 rounded-lg p-1 text-xs">
                  <button
                    onClick={() => onViewVendorStore && onViewVendorStore(currentUser.store_slug!)}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-blue-300 hover:text-white font-mono text-[11px]"
                    title="Voir ma vitrine vendeur publique"
                  >
                    <Link2 className="w-3 h-3 text-blue-400" />
                    <span>vendeur/{currentUser.store_slug}</span>
                  </button>
                  <button
                    onClick={(e) => handleCopyVendorLink(currentUser.store_slug!, e)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-blue-600/30"
                    title="Copier le lien direct de ma boutique"
                  >
                    {copiedSlug ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}

              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth && onOpenAuth('signup_vendor')}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                title="Ouvrir un compte vendeur avec lien unique"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Devenir Vendeur</span>
              </button>

              <button
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
