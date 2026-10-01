import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Store, 
  Briefcase, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { supabaseAuthService } from '../../services/supabase';
import { UserProfile, UserRole } from '../../types/database';
import { NexusLogo } from '../common/NexusLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup_vendor' | 'signup_customer';
  onViewStorefront?: (slug: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  onViewStorefront,
}) => {
  const [mode, setMode] = useState<'login' | 'signup_vendor' | 'signup_customer'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Vendor specific fields
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [specialty, setSpecialty] = useState('Modélisation Revit & openBIM');
  const [company, setCompany] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Vendor Created Celebration View State
  const [createdVendorUser, setCreatedVendorUser] = useState<UserProfile | null>(null);
  const [copiedCreatedLink, setCopiedCreatedLink] = useState(false);

  if (!isOpen) return null;

  // Auto-generate slug when storeName changes
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    setStoreSlug(slug);
  };

  const handleCopyCreatedLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/vendeur/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCreatedLink(true);
    setTimeout(() => setCopiedCreatedLink(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { user, error } = await supabaseAuthService.signIn(email, password);
        if (error) throw new Error(error);
        if (user) {
          onSuccess(user);
          onClose();
        }
      } else if (mode === 'signup_vendor') {
        if (!storeSlug) throw new Error('Veuillez renseigner un identifiant unique pour votre boutique.');
        const { user, error } = await supabaseAuthService.signUpVendor({
          email,
          password,
          name,
          storeName: storeName || name,
          storeSlug,
          specialty,
          company
        });
        if (error) throw new Error(error);
        if (user) {
          // Display the vendor celebration screen with their unique showcase link
          setCreatedVendorUser(user);
        }
      } else if (mode === 'signup_customer') {
        const { user, error } = await supabaseAuthService.signUpCustomer({
          email,
          password,
          name,
          company
        });
        if (error) throw new Error(error);
        if (user) {
          onSuccess(user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login helper for demo testing
  const handleQuickDemoLogin = async (role: UserRole) => {
    const demoAccounts = {
      vendor: { email: 'alex@studioarch-paris.com', name: 'Alexandre Martin (StudioArch)' },
      customer: { email: 'thomas.leroy@architectes-paris.com', name: 'Thomas Leroy' },
      admin: { email: 'admin@nexusbim.com', name: 'Alex Martin (Super Admin)' },
      super_admin: { email: 'admin@nexusbim.com', name: 'Super Administrateur' }
    };

    const acc = demoAccounts[role];
    const { user } = await supabaseAuthService.signIn(acc.email, 'password123');
    if (user) {
      onSuccess(user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#0a101f] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
          <NexusLogo size="sm" showSubtitle />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CREATED VENDOR SUCCESS VIEW : RENVOIE LE LIEN DE SA PAGE VITRINE */}
        {createdVendorUser ? (
          <div className="p-6 sm:p-7 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                Compte Vendeur Créé avec Succès
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white pt-1">
                Félicitations {createdVendorUser.name} !
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Votre atelier <strong>« {createdVendorUser.company || storeName} »</strong> est maintenant configuré dans la base de données Supabase.
              </p>
            </div>

            {/* Prominent Storefront Link Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/40 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Lien de votre Page Vitrine Publique :
                </span>
                <span className="text-[11px] font-mono text-emerald-400">Prêt à partager</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-white font-bold break-all flex items-center justify-between gap-2">
                <span className="text-emerald-400 truncate">
                  nexusbim.app/vendeur/{createdVendorUser.store_slug}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCreatedLink(createdVendorUser.store_slug!)}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-colors shadow-xs"
                  title="Copier le lien"
                >
                  {copiedCreatedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Vos acheteurs peuvent commander directement sur cette URL. Votre vitrine se remplira au fur et à mesure de vos publications.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  onSuccess(createdVendorUser);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Accéder à mon tableau de bord vendeur</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onViewStorefront && (
                <button
                  type="button"
                  onClick={() => {
                    onViewStorefront(createdVendorUser.store_slug!);
                    onSuccess(createdVendorUser);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Voir ma page vitrine de produits</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopyCreatedLink(createdVendorUser.store_slug!)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedCreatedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCreatedLink ? 'Lien copié dans le presse-papier !' : 'Copier mon lien de vitrine'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab switchers */}
            <div className="flex border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'login' 
                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Se Connecter
          </button>
          <button
            onClick={() => { setMode('signup_vendor'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'signup_vendor' 
                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Créer Compte Vendeur
          </button>
          <button
            onClick={() => { setMode('signup_customer'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'signup_customer' 
                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Compte Client
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Description */}
          <div className="text-xs text-slate-400 leading-relaxed">
            {mode === 'login' && 'Accédez à votre espace avec vos identifiants Supabase.'}
            {mode === 'signup_vendor' && 'Ouvrez votre atelier et obtenez votre lien unique personnalisé pour vendre vos modèles.'}
            {mode === 'signup_customer' && 'Créez votre compte acheteur pour accéder à vie à vos téléchargements et factures.'}
          </div>

          {/* Name Field (if signup) */}
          {mode !== 'login' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Votre Nom Complet</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Alexandre Martin"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* Vendor Specific: Store Name & Unique Slug */}
          {mode === 'signup_vendor' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nom du Studio / Boutique</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    placeholder="Ex : StudioArch Atelier"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Unique Vendor Link (Requis par l'utilisateur : vendeur/nom-unique) */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <label className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Votre Lien Unique de Vendeur</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300">
                  <span className="text-blue-400 font-bold select-none">vendeur/</span>
                  <input
                    type="text"
                    required
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="nom-unique"
                    className="bg-transparent text-emerald-400 font-bold focus:outline-none flex-1 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Adresse web directe vers votre vitrine : <span className="font-mono text-blue-300">nexusbim.app/vendeur/{storeSlug || 'votre-nom'}</span>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Spécialité Principale</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Modélisation Revit & openBIM">Modélisation Revit & openBIM</option>
                  <option value="Objets 3D & Design Mobilier">Objets 3D & Design Mobilier</option>
                  <option value="Ingénierie Structure & Eurocodes">Ingénierie Structure & Eurocodes</option>
                  <option value="Automatisation Dynamo & .NET">Automatisation Dynamo & .NET</option>
                  <option value="Archicad & IFC 4">Archicad & IFC 4</option>
                </select>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@agence.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Mot de Passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] hover:brightness-105 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Connexion Supabase en cours...</span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Se Connecter'}
                  {mode === 'signup_vendor' && 'Activer Mon Compte Vendeur'}
                  {mode === 'signup_customer' && 'Créer Mon Compte Acheteur'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#bae6fd]" />
              </>
            )}
          </button>

          {/* Quick Demo Test Accounts Box */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="text-[11px] text-slate-500 font-mono text-center">
              Comptes Supabase de test rapide (1 clic) :
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('vendor')}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 text-center transition-colors"
              >
                Vendeur Pro
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer')}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-center transition-colors"
              >
                Client Acheteur
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-800 text-center transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>

        </form>
          </>
        )}

      </div>
    </div>
  );
};
