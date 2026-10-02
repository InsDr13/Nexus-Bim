import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Store, 
  Briefcase, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Check, 
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Crown,
  KeyRound,
  Layers,
  Phone
} from 'lucide-react';
import { supabaseAuthService, DEFAULT_SUPER_ADMIN } from '../../services/supabase';
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
  // Mode : 'login' ou 'signup_vendor' (Le client crée son compte au panier lors du paiement)
  const [mode, setMode] = useState<'login' | 'signup_vendor'>(
    initialMode === 'signup_vendor' ? 'signup_vendor' : 'login'
  );

  // Form Fields - Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Fields - Vendor Creation (Multi-Step Carousel)
  const [carouselStep, setCarouselStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [specialty, setSpecialty] = useState('Modélisation Revit & openBIM');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [phone, setPhone] = useState('');

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

  // Carousel Next Step Validation
  const handleNextStep = () => {
    setErrorMsg(null);

    if (carouselStep === 1) {
      if (!username.trim()) {
        setErrorMsg('Veuillez renseigner un nom d\'utilisateur.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Veuillez renseigner une adresse email valide.');
        return;
      }
      if (!password || password.length < 4) {
        setErrorMsg('Le mot de passe doit comporter au moins 4 caractères.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Les deux mots de passe ne correspondent pas. Veuillez vérifier votre saisie.');
        return;
      }
      setCarouselStep(2);
    } else if (carouselStep === 2) {
      if (!name.trim()) {
        setErrorMsg('Veuillez renseigner votre nom complet.');
        return;
      }
      if (!storeName.trim()) {
        setErrorMsg('Veuillez renseigner le nom de votre atelier / boutique.');
        return;
      }
      if (!storeSlug.trim()) {
        setErrorMsg('Veuillez choisir un identifiant unique (URL) pour votre boutique.');
        return;
      }
      setCarouselStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (carouselStep > 1) {
      setCarouselStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!loginIdentifier.trim()) {
          throw new Error('Veuillez renseigner votre nom d\'utilisateur ou email.');
        }
        if (!loginPassword) {
          throw new Error('Veuillez saisir votre mot de passe.');
        }

        const { user, error } = await supabaseAuthService.signIn(loginIdentifier, loginPassword);
        if (error) throw new Error(error);
        if (user) {
          onSuccess(user);
          onClose();
        }
      } else {
        // Mode Inscription Vendeur (Final Step)
        if (password !== confirmPassword) {
          throw new Error('Les deux mots de passe ne correspondent pas.');
        }
        if (!storeSlug) {
          throw new Error('Veuillez renseigner un identifiant unique pour votre boutique.');
        }

        const finalSpecialty = specialty === 'Autre' 
          ? (customSpecialty.trim() || 'Modélisation & Ingénierie BIM')
          : specialty;

        const { user, error } = await supabaseAuthService.signUpVendor({
          username: username.trim(),
          email: email.trim(),
          password,
          name: name.trim(),
          storeName: storeName.trim() || name.trim(),
          storeSlug: storeSlug.trim(),
          specialty: finalSpecialty,
          phone: phone.trim()
        });

        if (error) throw new Error(error);
        if (user) {
          setCreatedVendorUser(user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'authentification.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Superadmin Fill Helper
  const handleFillSuperAdmin = () => {
    setLoginIdentifier('superadmin');
    setLoginPassword('superadmin');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="w-full max-w-lg bg-[#0a101f] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#090e1a]">
          <NexusLogo size="sm" showSubtitle />
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CREATED VENDOR SUCCESS VIEW */}
        {createdVendorUser ? (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto animate-fadeIn">
            <div className="w-18 h-18 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono uppercase tracking-wider">
                Compte Vendeur Créé avec Succès
              </span>
              <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white pt-1">
                Bienvenue dans Nexus BIM, {createdVendorUser.name} !
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Votre boutique <strong>« {createdVendorUser.company || storeName} »</strong> est maintenant enregistrée. Vous pouvez dès à présent ajouter vos modèles BIM et recevoir vos paiements directs en USD.
              </p>
            </div>

            {/* Prominent Storefront Link Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/40 text-left space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-sm text-blue-400 font-bold">
                <span className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-400" />
                  Votre Lien Unique de Vitrine Publique :
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Prêt à partager
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sm sm:text-base text-white font-bold break-all flex items-center justify-between gap-3">
                <span className="text-emerald-400 truncate">
                  nexusbim.app/vendeur/{createdVendorUser.store_slug}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCreatedLink(createdVendorUser.store_slug!)}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
                  title="Copier le lien"
                >
                  {copiedCreatedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs sm:text-sm text-blue-200 leading-relaxed">
                💡 <strong>Personnalisation complète :</strong> Vous pouvez compléter vos informations supplémentaires (logo, bannière, adresse physique, téléphone, WhatsApp professionnel et email de contact) dans l'onglet <strong>« Ma boutique »</strong> de votre espace vendeur.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  onSuccess(createdVendorUser);
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm sm:text-base font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <span>Accéder à mon tableau de bord vendeur</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {onViewStorefront && (
                <button
                  type="button"
                  onClick={() => {
                    onViewStorefront(createdVendorUser.store_slug!);
                    onSuccess(createdVendorUser);
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Apercevoir ma page vitrine de produits</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switchers: Se Connecter vs Devenir Vendeur */}
            <div className="flex border-b border-slate-800 text-sm font-bold shrink-0 bg-[#0c1326]">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className={`flex-1 py-3.5 text-center transition-all border-b-2 flex items-center justify-center gap-2 ${
                  mode === 'login' 
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10 font-bold' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Se Connecter</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('signup_vendor'); setErrorMsg(null); setCarouselStep(1); }}
                className={`flex-1 py-3.5 text-center transition-all border-b-2 flex items-center justify-center gap-2 ${
                  mode === 'signup_vendor' 
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Créer Compte Vendeur</span>
              </button>
            </div>

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODE 1 : CONNEXION UNIVERSELLE */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 overflow-y-auto">
                <div className="space-y-1">
                  <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                    Connexion à votre espace
                  </h3>
                  <p className="text-sm text-slate-400">
                    Saisissez vos identifiants. L'application identifie automatiquement votre rôle (Super Admin, Vendeur ou Client).
                  </p>
                </div>

                {/* Login Identifier (Username or Email) */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-200 flex items-center justify-between">
                    <span>Nom d'utilisateur ou Adresse Email</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="superadmin ou votre.email@agence.com"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-200">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Vérification des accès...</span>
                  ) : (
                    <>
                      <span>Se Connecter</span>
                      <ArrowRight className="w-5 h-5 text-blue-200" />
                    </>
                  )}
                </button>

                {/* Superadmin Pre-configured Access Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-mono">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Accès Super Administrateur :</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillSuperAdmin}
                      className="text-xs font-bold text-blue-400 hover:text-white underline cursor-pointer"
                    >
                      Remplir automatiquement
                    </button>
                  </div>
                  <div className="text-xs font-mono text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Login: <strong className="text-white">superadmin</strong></span>
                    <span>Mot de passe: <strong className="text-white">superadmin</strong></span>
                  </div>
                </div>

                {/* Client Account Notice */}
                <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
                  🛒 <strong>Acheteurs & Clients :</strong> Votre compte client est créé automatiquement lors de la commande dans votre panier pour rattacher vos factures et téléchargements.
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* MODE 2 : CRÉATION COMPTE VENDEUR EN FORMAT CARROUSEL MULTI-ÉTAPES */}
            {/* ========================================================================= */}
            {mode === 'signup_vendor' && (
              <div className="p-6 sm:p-7 space-y-5 overflow-y-auto">
                
                {/* Carousel Progress Stepper Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="font-mono text-emerald-400">
                      Étape {carouselStep} sur 3
                    </span>
                    <span className="text-slate-300">
                      {carouselStep === 1 && '1. Identifiants & Sécurité'}
                      {carouselStep === 2 && '2. Identité de l\'Atelier'}
                      {carouselStep === 3 && '3. Spécialité & Création'}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${(carouselStep / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step 1: Identifiants & Mot de passe entré 2 fois */}
                {carouselStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                        Étape 1 : Identifiants & Sécurité
                      </h3>
                      <p className="text-sm text-slate-400">
                        Choisissez votre nom d'utilisateur et sécurisez votre accès vendeur.
                      </p>
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-200">
                        Nom d'utilisateur (Username) *
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="ex: alex_martin"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-mono font-medium"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-200">
                        Adresse Email professionnelle *
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre.email@atelier.com"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Password - Entré une première fois */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-200">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Password - Confirmation (Entré DEUX FOIS comme requis) */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-200 flex items-center justify-between">
                        <span>Confirmez le mot de passe *</span>
                        {confirmPassword && password === confirmPassword && (
                          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Identique
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmez votre mot de passe"
                          className={`w-full bg-slate-900 border rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none font-medium ${
                            confirmPassword && password !== confirmPassword 
                              ? 'border-rose-500 focus:border-rose-500' 
                              : 'border-slate-700/80 focus:border-emerald-500'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continuer vers l'Atelier</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Step 2: Identité & Boutique (Store Name + Slug) */}
                {carouselStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                        Étape 2 : Identité de votre Atelier
                      </h3>
                      <p className="text-sm text-slate-400">
                        Votre nom et l'adresse web unique de votre vitrine de vente.
                      </p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-200">
                        Votre Nom Complet *
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Alexandre Martin"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Store Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-200">
                        Nom de l'Atelier / Studio BIM *
                      </label>
                      <div className="relative">
                        <Store className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={storeName}
                          onChange={(e) => handleStoreNameChange(e.target.value)}
                          placeholder="Ex: StudioArch Atelier"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Unique Storefront URL Slug */}
                    <div className="space-y-2 p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                      <label className="text-sm font-bold text-blue-300 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-blue-400" />
                        <span>Votre Lien Unique de Vitrine Publique *</span>
                      </label>
                      
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-mono text-slate-300">
                        <span className="text-blue-400 font-bold select-none">vendeur/</span>
                        <input
                          type="text"
                          required
                          value={storeSlug}
                          onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="nom-unique"
                          className="bg-transparent text-emerald-400 font-bold focus:outline-none flex-1 font-mono text-sm sm:text-base"
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        URL directe : <span className="font-mono text-blue-300">nexusbim.app/vendeur/{storeSlug || 'votre-nom'}</span>
                      </p>
                    </div>

                    {/* Buttons: Back / Next */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Continuer vers la Spécialité</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Spécialité (avec option "Autre" + champ de saisie) & Finalisation */}
                {carouselStep === 3 && (
                  <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                        Étape 3 : Spécialité Principale
                      </h3>
                      <p className="text-sm text-slate-400">
                        Indiquez votre domaine d'expertise BIM pour guider les acheteurs.
                      </p>
                    </div>

                    {/* Specialty Select */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-200">
                        Spécialité Principale *
                      </label>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="Modélisation Revit & openBIM">Modélisation Revit & openBIM</option>
                        <option value="Objets 3D, Familles & Design Mobilier">Objets 3D, Familles & Design Mobilier</option>
                        <option value="Ingénierie Structure & Eurocodes">Ingénierie Structure & Eurocodes</option>
                        <option value="Automatisation Dynamo, Python & .NET">Automatisation Dynamo, Python & .NET</option>
                        <option value="Archicad, IFC 4 & Gabarits">Archicad, IFC 4 & Gabarits</option>
                        <option value="Plans 2D/3D & Détails Constructifs">Plans 2D/3D & Détails Constructifs</option>
                        <option value="Formations & Logiciels BIM">Formations & Logiciels BIM</option>
                        <option value="Autre">Autre (préciser ci-dessous)</option>
                      </select>
                    </div>

                    {/* Custom Specialty Field if "Autre" is selected */}
                    {specialty === 'Autre' && (
                      <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 animate-fadeIn">
                        <label className="text-sm font-bold text-emerald-300">
                          Précisez votre spécialité personnalisée *
                        </label>
                        <input
                          type="text"
                          required
                          value={customSpecialty}
                          onChange={(e) => setCustomSpecialty(e.target.value)}
                          placeholder="Ex : Coordination Fluides MEP, Scans 3D..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    )}

                    {/* Optional Phone / WhatsApp contact at signup */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-200">
                        Téléphone / WhatsApp professionnel (Optionnel)
                      </label>
                      <div className="relative">
                        <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+33 6 12 34 56 78"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                      ℹ️ Après inscription, vous pourrez compléter à tout moment vos informations (logo de l'atelier, adresse physique du studio, téléphone WhatsApp, email direct) depuis votre espace vendeur.
                    </div>

                    {/* Submit & Back buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:brightness-105 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="animate-pulse">Création de votre atelier en cours...</span>
                        ) : (
                          <>
                            <span>Créer mon Compte Vendeur</span>
                            <Check className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
