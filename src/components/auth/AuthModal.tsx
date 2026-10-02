import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Store, 
  Briefcase, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Crown,
  KeyRound,
  Phone,
  MapPin,
  MessageCircle,
  Building2
} from 'lucide-react';
import { supabaseAuthService } from '../../services/supabase';
import { UserProfile } from '../../types/database';
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
  // Mode : 'login' ou 'signup_vendor'
  const [mode, setMode] = useState<'login' | 'signup_vendor'>('login');

  // Form Fields - Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Fields - Vendor Creation (Multi-Step Carousel)
  const [carouselStep, setCarouselStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Identité de la Maison / Entreprise
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');

  // Spécialité & Présentation
  const [specialty, setSpecialty] = useState('Modélisation Revit & openBIM');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [bio, setBio] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Vendor Created Celebration View State (Reset upon open/close)
  const [createdVendorUser, setCreatedVendorUser] = useState<UserProfile | null>(null);
  const [copiedCreatedLink, setCopiedCreatedLink] = useState(false);

  // RESET STATE ON OPEN / LOGOUT / MODE CHANGE
  // Résout le problème du modal bloqué sur le message de succès de la précédente boutique créée
  useEffect(() => {
    if (isOpen) {
      setCreatedVendorUser(null);
      setErrorMsg(null);
      setCopiedCreatedLink(false);
      setCarouselStep(1);
      if (initialMode === 'signup_vendor') {
        setMode('signup_vendor');
      } else {
        setMode('login');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Auto-generate slug when storeName changes
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
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
        setErrorMsg('Veuillez renseigner un nom d\'utilisateur (identifiant de connexion).');
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
      if (!storeName.trim()) {
        setErrorMsg('Veuillez renseigner le nom de la Maison / Studio / Entreprise.');
        return;
      }
      if (!storeSlug.trim()) {
        setErrorMsg('Veuillez choisir un identifiant unique (URL) pour votre vitrine.');
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
          throw new Error('Veuillez renseigner votre nom d\'utilisateur ou adresse email.');
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

        const houseName = storeName.trim();

        const { user, error } = await supabaseAuthService.signUpVendor({
          username: username.trim(),
          email: email.trim(),
          password,
          name: houseName, // Le nom principal est le nom de la maison/studio
          storeName: houseName,
          storeSlug: storeSlug.trim(),
          specialty: finalSpecialty,
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          address: address.trim(),
          contactEmail: email.trim(),
          bio: bio.trim() || `Atelier officiel ${houseName}. Spécialiste en ${finalSpecialty}.`
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="w-full max-w-xl bg-[#0b1222] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-800/90 flex items-center justify-between shrink-0 bg-[#080d19]">
          <NexusLogo size="sm" showSubtitle />
          <button 
            onClick={() => {
              setCreatedVendorUser(null);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CREATED VENDOR SUCCESS VIEW */}
        {createdVendorUser ? (
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-11 h-11" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono uppercase tracking-wider">
                Compte Vendeur Créé avec Succès
              </span>
              <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white pt-1">
                Bienvenue dans Nexus BIM, {createdVendorUser.name} !
              </h3>
              <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
                Votre boutique officielle <strong>« {createdVendorUser.company || storeName} »</strong> est prête. Vos informations et coordonnées ont été conservées dans votre espace de gestion.
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
                💡 <strong>Coordonnées conservées :</strong> Vous pouvez uploader le logo et la bannière de votre Maison dans l'onglet <strong>« Ma boutique & coordonnées »</strong> de votre espace vendeur.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  const userToPass = createdVendorUser;
                  setCreatedVendorUser(null);
                  onSuccess(userToPass);
                  onClose();
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <span>Accéder à mon tableau de bord vendeur</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {onViewStorefront && (
                <button
                  type="button"
                  onClick={() => {
                    const userToPass = createdVendorUser;
                    setCreatedVendorUser(null);
                    onViewStorefront(userToPass.store_slug!);
                    onSuccess(userToPass);
                    onClose();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Apercevoir ma page vitrine officielle</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switchers: Se Connecter vs Devenir Vendeur */}
            <div className="flex border-b border-slate-800 text-sm sm:text-base font-bold shrink-0 bg-[#090e19]">
              <button
                type="button"
                onClick={() => { 
                  setMode('login'); 
                  setErrorMsg(null); 
                  setCreatedVendorUser(null);
                }}
                className={`flex-1 py-4 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
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
                onClick={() => { 
                  setMode('signup_vendor'); 
                  setErrorMsg(null); 
                  setCreatedVendorUser(null);
                  setCarouselStep(1); 
                }}
                className={`flex-1 py-4 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'signup_vendor' 
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Devenir Vendeur</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="m-5 mb-0 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MODE 1 : CONNEXION UNIVERSELLE (Username / Email + Mot de passe) */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                  <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white">
                    Connexion à votre espace
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400">
                    Saisissez vos identifiants. L'application identifie automatiquement votre profil selon votre rôle (Super Admin, Vendeur ou Client).
                  </p>
                </div>

                {/* Login Identifier (Username or Email) */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-slate-200">
                    Nom d'utilisateur ou Adresse Email
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="superadmin ou nom_utilisateur ou email@agence.com"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-slate-200">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300 font-mono">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Accès Super Administrateur pré-configuré :</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillSuperAdmin}
                      className="text-xs sm:text-sm font-bold text-blue-400 hover:text-white underline cursor-pointer"
                    >
                      Remplir automatiquement
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Login: <strong className="text-white">superadmin</strong></span>
                    <span>Mot de passe: <strong className="text-white">superadmin</strong></span>
                  </div>
                </div>

                {/* Client Account Notice */}
                <div className="text-center pt-2 border-t border-slate-800 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  🛒 <strong>Acheteurs & Clients :</strong> Votre compte client est créé automatiquement au niveau du panier lors du paiement pour enregistrer vos achats.
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* MODE 2 : CRÉATION COMPTE VENDEUR EN FORMAT CARROUSEL MULTI-ÉTAPES */}
            {/* ========================================================================= */}
            {mode === 'signup_vendor' && (
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                
                {/* Carousel Progress Stepper Header */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-400">
                    <span className="font-mono text-emerald-400">
                      Étape {carouselStep} sur 3
                    </span>
                    <span className="text-slate-300">
                      {carouselStep === 1 && '1. Identifiants & Sécurité'}
                      {carouselStep === 2 && '2. Identité de la Maison'}
                      {carouselStep === 3 && '3. Spécialité & Contact'}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${(carouselStep / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step 1: Identifiants & Mot de passe entré 2 fois */}
                {carouselStep === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white">
                        Étape 1 : Identifiants & Sécurité
                      </h3>
                      <p className="text-sm sm:text-base text-slate-400">
                        Choisissez votre identifiant unique et sécurisez votre accès avec un mot de passe entré 2 fois.
                      </p>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label className="text-sm sm:text-base font-bold text-slate-200">
                        Nom d'utilisateur (Username de connexion) *
                      </label>
                      <div className="relative">
                        <User className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="ex: atelier_martin"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-mono font-medium"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm sm:text-base font-bold text-slate-200">
                        Adresse Email professionnelle *
                      </label>
                      <div className="relative">
                        <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contact@atelier-martin.com"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Password - Entré une première fois */}
                    <div className="space-y-2">
                      <label className="text-sm sm:text-base font-bold text-slate-200">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Password - Confirmation (Entré DEUX FOIS comme requis) */}
                    <div className="space-y-2">
                      <label className="text-sm sm:text-base font-bold text-slate-200 flex items-center justify-between">
                        <span>Confirmez le mot de passe (saisie répétée) *</span>
                        {confirmPassword && password === confirmPassword && (
                          <span className="text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-1">
                            <Check className="w-4 h-4" /> Mots de passe identiques
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Répétez votre mot de passe"
                          className={`w-full bg-slate-900 border rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white focus:outline-none font-medium ${
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
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continuer vers l'Identité de la Maison</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Step 2: Identité de la Maison / Entreprise (Store Name + Slug + Coordonnées) */}
                {carouselStep === 2 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white">
                        Étape 2 : Identité de la Maison & Vitrine
                      </h3>
                      <p className="text-sm sm:text-base text-slate-400">
                        Renseignez le nom de votre Maison / Studio et ses coordonnées directes. Ces informations seront conservées dans votre espace.
                      </p>
                    </div>

                    {/* Nom de la Maison / Entreprise */}
                    <div className="space-y-2">
                      <label className="text-sm sm:text-base font-bold text-slate-200">
                        Nom de la Maison / Studio / Entreprise *
                      </label>
                      <div className="relative">
                        <Building2 className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          type="text"
                          required
                          value={storeName}
                          onChange={(e) => handleStoreNameChange(e.target.value)}
                          placeholder="Ex: StudioArch BIM, Cabinet Novatech, Atelier Design 3D..."
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Unique Storefront URL Slug */}
                    <div className="space-y-2 p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                      <label className="text-sm sm:text-base font-bold text-blue-300 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-blue-400" />
                        <span>Votre Lien Unique de Vitrine Publique *</span>
                      </label>
                      
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm sm:text-base font-mono text-slate-300">
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
                      <p className="text-xs sm:text-sm text-slate-400">
                        Lien officiel : <span className="font-mono text-blue-300">nexusbim.app/vendeur/{storeSlug || 'votre-nom'}</span>
                      </p>
                    </div>

                    {/* Téléphone & WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>Téléphone de contact</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+33 1 42 68 00 00"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          <span>WhatsApp Professionnel</span>
                        </label>
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+33 6 12 34 56 78"
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-2xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Adresse Physique */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span>Adresse physique de l'Atelier / Bureau</span>
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: 14 Boulevard Haussmann, 75009 Paris, France"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Buttons: Back / Next */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm sm:text-base transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Continuer vers la Spécialité</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Spécialité & Finalisation */}
                {carouselStep === 3 && (
                  <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
                    <div className="space-y-1">
                      <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white">
                        Étape 3 : Spécialité & Création
                      </h3>
                      <p className="text-sm sm:text-base text-slate-400">
                        Définissez le domaine d'expertise de votre Maison et finalisez la création de votre compte vendeur.
                      </p>
                    </div>

                    {/* Spécialité principale avec Option Autre */}
                    <div className="space-y-2">
                      <label className="text-sm sm:text-base font-bold text-slate-200">
                        Spécialité Principale de la Maison *
                      </label>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                      >
                        <option value="Modélisation Revit & openBIM">Modélisation Revit & openBIM (Architecture & Structures)</option>
                        <option value="Ingénierie des Structures & Eurocodes">Ingénierie des Structures & Notes de Calcul</option>
                        <option value="Fluides, CVC & MEP">Fluides, CVC & Réseaux MEP</option>
                        <option value="Design d'Intérieur & Mobilier 3D">Design d'Intérieur, Agencement & Mobilier 3D</option>
                        <option value="Développement Plugins & Outils BIM">Développement Add-ins Revit, Dynamo & Scripts Python</option>
                        <option value="Détails d'Exécution & Normes BTP">Carnets de Détails d'Exécution PDF & DWG</option>
                        <option value="Formations Vidéo & Masterclass BIM">Formations Vidéo & Accompagnement Professionnel</option>
                        <option value="Autre">Autre (Saisir votre propre spécialité personnalisée)</option>
                      </select>
                    </div>

                    {/* Si Autre est sélectionné : champ texte pour entrer l'information */}
                    {specialty === 'Autre' && (
                      <div className="space-y-2 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 animate-fadeIn">
                        <label className="text-sm font-bold text-emerald-300">
                          Précisez votre spécialité personnalisée *
                        </label>
                        <input
                          type="text"
                          required
                          value={customSpecialty}
                          onChange={(e) => setCustomSpecialty(e.target.value)}
                          placeholder="Ex: Scanner 3D & Nuages de points vers BIM, Rénovation énergétique..."
                          className="w-full bg-slate-900 border border-emerald-500/60 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-400 font-medium"
                        />
                      </div>
                    )}

                    {/* Description / Slogan */}
                    <div className="space-y-2">
                      <label className="text-sm sm:text-base font-bold text-slate-200">
                        Présentation courte / Slogan de la Maison
                      </label>
                      <textarea
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Ex: Bureau d'études spécialisé dans la production de maquettes d'exécution et familles paramétriques certifiées."
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    {/* Summary Card */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs sm:text-sm text-slate-300">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Récapitulatif de votre Maison :</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>Maison : <span className="text-white font-bold">{storeName || 'Non défini'}</span></div>
                        <div>Lien : <span className="text-emerald-400 font-bold">/{storeSlug || 'slug'}</span></div>
                        <div>Username : <span className="text-white">{username}</span></div>
                        <div>Email : <span className="text-white">{email}</span></div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm sm:text-base transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Retour</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="animate-pulse">Enregistrement de la Maison...</span>
                        ) : (
                          <>
                            <span>Créer ma Maison & Obtenir mon Lien</span>
                            <Check className="w-5 h-5 text-white" />
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
