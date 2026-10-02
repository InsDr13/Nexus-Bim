import React, { useState, useEffect, useRef } from 'react';
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
  KeyRound, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Building2, 
  Upload, 
  Globe,
  Loader2,
  Info,
  PlusCircle
} from 'lucide-react';
import { supabaseAuthService, supabaseStorageService } from '../../services/supabase';
import { UserProfile } from '../../types/database';
import { NexusLogo } from '../common/NexusLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup_vendor' | 'signup_customer';
  onViewStorefront?: (slug: string) => void;
}

// Presets visuels d'architecture pour une identité soignée immédiate
const PRESET_LOGOS = [
  { id: 'geo', label: 'Studio Géométrique', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { id: 'arch', label: 'Atelier Minimaliste', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
  { id: 'cad', label: 'Ingénierie & Calcul', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  { id: 'bim', label: 'BIM Management', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' },
];

const PRESET_BANNERS = [
  { id: 'villa', label: 'Villa Contemporaine', url: '/src/assets/images/hero_bim_villa_1790765033156.jpg' },
  { id: 'tower', label: 'Tour Commerciale', url: '/src/assets/images/bim_commercial_tower_1790765045061.jpg' },
  { id: 'axono', label: 'Axonométrie BIM', url: '/src/assets/images/arch_axonometric_bim_1790771754486.jpg' },
  { id: 'studio', label: 'Atelier & Studio', url: '/src/assets/images/arch_studio_workspace_1790771766458.jpg' },
];

const INITIAL_SPECIALTY_OPTIONS = [
  'Modélisation Revit & openBIM (LOD 200 à 400)',
  'Gabarits Revit, Familles paramétriques (.rfa)',
  'Plans de Construction, Permis & Exécution (.dwg, .pdf)',
  'Calculs de Structure & Béton Armé (Eurocodes)',
  'Génie Climatique, Plomberie & CVC / MEP',
  'Modélisation 3D & Rendu photoréaliste (Blender/3ds Max)',
  'Plugins C# .NET & Scripts Dynamo / Grasshopper',
  'Design d\'intérieur & Mobilier contemporain',
  'Autre (préciser mon domaine d\'expertise)'
];

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
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Étape 2 : Identité de la Boîte / Studio
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [specialtyList, setSpecialtyList] = useState<string[]>(INITIAL_SPECIALTY_OPTIONS);
  const [specialty, setSpecialty] = useState(INITIAL_SPECIALTY_OPTIONS[0]);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Étape 3 : Logo, Bannière & Présentation
  const [logoUrl, setLogoUrl] = useState(PRESET_LOGOS[0].url);
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [bio, setBio] = useState('');

  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Loading & Upload states
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Status & Notification banner
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'info' | 'success' | 'warning'; text: string } | null>(null);

  // Vendor Created Celebration View State
  const [createdVendorUser, setCreatedVendorUser] = useState<UserProfile | null>(null);
  const [copiedCreatedLink, setCopiedCreatedLink] = useState(false);

  // Auto-scroll scrollable content whenever an error or status occurs
  useEffect(() => {
    if (errorMsg || statusMsg) {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [errorMsg, statusMsg]);

  // Reset state on open/mode change
  useEffect(() => {
    if (isOpen) {
      setCreatedVendorUser(null);
      setErrorMsg(null);
      setStatusMsg(null);
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
    const fullUrl = `${window.location.origin}/#vendeur/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCreatedLink(true);
    setTimeout(() => setCopiedCreatedLink(false), 2500);
  };

  // UPLOAD RÉEL DU LOGO VERS SUPABASE STORAGE AVEC GESTION DE QUOTA
  const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setErrorMsg(null);
    setStatusMsg({ type: 'info', text: 'Optimisation et téléversement du logo vers Supabase Storage...' });

    try {
      const result = await supabaseStorageService.uploadFile(file, 'avatar', storeSlug || 'studio');
      setLogoUrl(result.url);

      if (result.isLocalFallback) {
        setStatusMsg({
          type: 'warning',
          text: 'Logo optimisé et chargé avec succès (format ultra-léger évitant tout dépassement de quota). Note : le bucket "avatars" de votre projet Supabase peut être créé via le script SQL pour l\'hébergement direct.'
        });
      } else {
        setStatusMsg({
          type: 'success',
          text: 'Logo téléversé avec succès dans le stockage officiel Supabase !'
        });
      }
    } catch (err: any) {
      setErrorMsg('Erreur lors du téléversement du logo : ' + (err.message || 'Échec'));
    } finally {
      setIsUploadingLogo(false);
      if (logoFileRef.current) logoFileRef.current.value = '';
    }
  };

  // UPLOAD RÉEL DE LA BANNIÈRE VERS SUPABASE STORAGE AVEC GESTION DE QUOTA
  const handleUploadBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    setErrorMsg(null);
    setStatusMsg({ type: 'info', text: 'Optimisation et téléversement de la bannière vers Supabase Storage...' });

    try {
      const result = await supabaseStorageService.uploadFile(file, 'banner', storeSlug || 'studio');
      setBannerUrl(result.url);

      if (result.isLocalFallback) {
        setStatusMsg({
          type: 'warning',
          text: 'Bannière optimisée et chargée avec succès (format ultra-léger évitant tout dépassement de quota). Note : le bucket "banners" peut être configuré dans Supabase avec le script SQL.'
        });
      } else {
        setStatusMsg({
          type: 'success',
          text: 'Bannière téléversée avec succès dans le stockage officiel Supabase !'
        });
      }
    } catch (err: any) {
      setErrorMsg('Erreur lors du téléversement de la bannière : ' + (err.message || 'Échec'));
    } finally {
      setIsUploadingBanner(false);
      if (bannerFileRef.current) bannerFileRef.current.value = '';
    }
  };

  // Ajout manuel d'un domaine personnalisé
  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialty.trim();
    if (!trimmed) {
      setErrorMsg('Veuillez saisir votre domaine d\'expertise personnalisé.');
      return;
    }
    if (!specialtyList.includes(trimmed)) {
      setSpecialtyList([trimmed, ...specialtyList.filter(s => !s.startsWith('Autre')), 'Autre (préciser mon domaine d\'expertise)']);
    }
    setSpecialty(trimmed);
    setStatusMsg({ type: 'success', text: `Domaine d'expertise personnalisé "${trimmed}" ajouté avec succès !` });
  };

  const isCustomSpecialtySelected = specialty.startsWith('Autre');

  // Carousel Next Step Validation
  const handleNextStep = () => {
    setErrorMsg(null);

    if (carouselStep === 1) {
      if (!name.trim()) {
        setErrorMsg('Veuillez renseigner votre nom complet ou le nom du responsable.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Veuillez renseigner un identifiant de connexion.');
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
        setErrorMsg('Les deux mots de passe ne correspondent pas.');
        return;
      }
      setCarouselStep(2);
    } else if (carouselStep === 2) {
      if (!storeName.trim()) {
        setErrorMsg('Veuillez renseigner le nom de votre boîte, studio ou agence.');
        return;
      }
      if (!storeSlug.trim()) {
        setErrorMsg('Veuillez renseigner l\'identifiant URL de votre boutique.');
        return;
      }
      if (isCustomSpecialtySelected && !customSpecialty.trim()) {
        setErrorMsg('Veuillez préciser votre domaine d\'expertise dans le champ prévu à cet effet.');
        return;
      }
      setCarouselStep(3);
    }
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      if (mode === 'login') {
        if (!loginIdentifier.trim()) {
          throw new Error('Veuillez renseigner votre identifiant ou email.');
        }
        const { user, error } = await supabaseAuthService.signIn(loginIdentifier, loginPassword);
        if (error) throw new Error(error);
        if (user) {
          onSuccess(user);
          onClose();
        }
      } else {
        // Mode Création de compte Vendeur
        const cleanSlug = storeSlug
          .toLowerCase()
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-');

        const resolvedSpecialty = isCustomSpecialtySelected
          ? (customSpecialty.trim() || 'Architecture & BIM')
          : specialty;

        const { user, error } = await supabaseAuthService.signUpVendor({
          username: username.trim(),
          email: email.trim(),
          password: password,
          name: name.trim() || storeName.trim(),
          storeName: storeName.trim(),
          storeSlug: cleanSlug,
          company: storeName.trim(),
          specialty: resolvedSpecialty,
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          address: address.trim(),
          websiteUrl: websiteUrl.trim(),
          contactEmail: email.trim(),
          logoUrl: logoUrl,
          bannerUrl: bannerUrl,
          bio: bio.trim() || `Atelier officiel ${storeName.trim()}. Spécialisé en ${resolvedSpecialty}. Fichiers et modèles certifiés.`
        });

        if (error) throw new Error(error);
        if (user) {
          setCreatedVendorUser(user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillSuperAdmin = () => {
    setLoginIdentifier('superadmin');
    setLoginPassword('superadmin');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-white sm:border sm:border-slate-200/90 sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header clair, lumineux & responsive */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <NexusLogo size="sm" showSubtitle />
          <button 
            onClick={() => {
              setCreatedVendorUser(null);
              onClose();
            }}
            className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 1. ÉCRAN DE SUCCÈS : BOUTIQUE CRÉÉE AVEC LIEN GÉNÉRÉ */}
        {createdVendorUser ? (
          <div className="p-5 sm:p-8 space-y-6 text-center overflow-y-auto flex-1 bg-white">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold font-mono uppercase tracking-wider">
                Compte Vendeur Créé avec Succès
              </span>
              <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-slate-900 pt-1">
                Félicitations, votre boutique est en ligne !
              </h3>
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                Votre boutique officielle <strong>« {createdVendorUser.company || storeName} »</strong> est configurée avec votre logo, votre bannière et vos coordonnées.
              </p>
            </div>

            {/* Carte du Lien Unique Généré */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border-2 border-blue-500/30 text-left space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base text-blue-800 font-bold">
                <span className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-600" />
                  Lien Public de Votre Boutique :
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Actif & Accessible
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-300 font-mono text-xs sm:text-sm md:text-base text-slate-900 font-bold break-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
                <span className="text-blue-600 truncate">
                  {window.location.origin}/#vendeur/{createdVendorUser.store_slug}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCreatedLink(createdVendorUser.store_slug!)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 transition-colors shadow-sm font-sans text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
                  title="Copier le lien"
                >
                  {copiedCreatedLink ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Lien copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le lien</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Partagez ce lien directement avec vos clients, confrères ou sur LinkedIn pour qu'ils accèdent directement à votre vitrine officielle et à vos produits.
              </p>
            </div>

            {/* Boutons d'Action */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  const userToPass = createdVendorUser;
                  setCreatedVendorUser(null);
                  onSuccess(userToPass);
                  onClose();
                }}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer min-h-[50px]"
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
                  className="w-full py-3 sm:py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>Voir ma boutique publique en ligne</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Onglets clairs : Se Connecter vs Devenir Vendeur */}
            <div className="flex border-b border-slate-200 text-sm sm:text-base font-bold shrink-0 bg-slate-50">
              <button
                type="button"
                onClick={() => { 
                  setMode('login'); 
                  setErrorMsg(null); 
                  setStatusMsg(null);
                  setCreatedVendorUser(null);
                }}
                className={`flex-1 py-3.5 sm:py-4 px-3 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'login' 
                    ? 'border-blue-600 text-blue-700 bg-white font-bold shadow-sm' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Se Connecter</span>
              </button>

              <button
                type="button"
                onClick={() => { 
                  setMode('signup_vendor'); 
                  setErrorMsg(null); 
                  setStatusMsg(null);
                  setCreatedVendorUser(null);
                }}
                className={`flex-1 py-3.5 sm:py-4 px-3 text-center transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'signup_vendor' 
                    ? 'border-blue-600 text-blue-700 bg-white font-bold shadow-sm' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-sm sm:text-base">Ouvrir une Boutique</span>
                <span className="hidden md:inline px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Vendeur
                </span>
              </button>
            </div>

            {/* MESSAGE INDICATIF & ALERTES FIXES TOUJOURS VISIBLES EN HAUT DU FORMULAIRE */}
            {(errorMsg || statusMsg) && (
              <div className="shrink-0 p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 animate-fadeIn">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 flex items-start justify-between gap-3 text-sm sm:text-base shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                      <div className="font-semibold leading-relaxed">{errorMsg}</div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setErrorMsg(null)}
                      className="p-1 text-red-400 hover:text-red-700 rounded-lg"
                      title="Masquer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {statusMsg && !errorMsg && (
                  <div className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-sm sm:text-base shadow-sm ${
                    statusMsg.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                      : statusMsg.type === 'warning'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-blue-50 border-blue-300 text-blue-900'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      {statusMsg.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                      ) : statusMsg.type === 'warning' ? (
                        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                      ) : (
                        <Loader2 className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 animate-spin" />
                      )}
                      <div className="font-semibold leading-relaxed">{statusMsg.text}</div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setStatusMsg(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                      title="Masquer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Contenu Déroulant du Formulaire */}
            <div 
              ref={scrollContainerRef}
              className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-white"
            >
              {/* MODE 1 : CONNEXION */}
              {mode === 'login' && (
                <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
                  <div className="text-center space-y-1 pb-2">
                    <h2 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-slate-900">
                      Connexion à Nexus BIM
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500">
                      Accédez à votre espace Vendeur, Client ou Administrateur
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Identifiant ou Adresse Email
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="superadmin, nom_utilisateur ou email@agence.com"
                        className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-base sm:text-sm transition-all font-medium min-h-[46px]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={handleFillSuperAdmin}
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                      >
                        Identifiants Superadmin
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none text-base sm:text-sm transition-all font-medium min-h-[46px]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connexion en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Se connecter à mon compte</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* MODE 2 : CRÉATION DE COMPTE VENDEUR (CAROUSEL RESPONSIVE EN 3 ÉTAPES) */}
              {mode === 'signup_vendor' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Indicateur de Progression en 3 Étapes - Optimisé Mobile */}
                  <div className="bg-slate-50 p-2 sm:p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => setCarouselStep(1)}
                      className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[38px] ${
                        carouselStep === 1 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        carouselStep === 1 ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>1</span>
                      <span className="hidden sm:inline">Responsable</span>
                      <span className="sm:hidden">Compte</span>
                    </button>

                    <div className="w-3 sm:w-6 h-0.5 bg-slate-300 shrink-0" />

                    <button
                      type="button"
                      onClick={() => {
                        if (name && username && email && password) setCarouselStep(2);
                      }}
                      className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[38px] ${
                        carouselStep === 2 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        carouselStep === 2 ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>2</span>
                      <span className="hidden sm:inline">Votre Boîte</span>
                      <span className="sm:hidden">Studio</span>
                    </button>

                    <div className="w-3 sm:w-6 h-0.5 bg-slate-300 shrink-0" />

                    <button
                      type="button"
                      onClick={() => {
                        if (name && username && email && password && storeName && storeSlug) setCarouselStep(3);
                      }}
                      className={`flex-1 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[38px] ${
                        carouselStep === 3 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        carouselStep === 3 ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>3</span>
                      <span className="hidden sm:inline">Logo & Bannière</span>
                      <span className="sm:hidden">Médias</span>
                    </button>
                  </div>

                  {/* ÉTAPE 1 : IDENTIFIANTS & RESPONSABLE */}
                  {carouselStep === 1 && (
                    <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                          Étape 1 : Informations du Responsable
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Identifiants de connexion et coordonnées du titulaire
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                            Nom et Prénom *
                          </label>
                          <div className="relative">
                            <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Ex: Jean Dupont"
                              className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                            Identifiant de connexion *
                          </label>
                          <div className="relative">
                            <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                              placeholder="jean_dupont"
                              className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium font-mono min-h-[46px]"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                          Adresse Email professionnelle *
                        </label>
                        <div className="relative">
                          <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contact@atelier-dupont.com"
                            className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                            Mot de passe *
                          </label>
                          <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                            Confirmer mot de passe *
                          </label>
                          <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full py-3.5 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                        >
                          <span>Suivant : Informations de votre Boîte / Studio</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ÉTAPE 2 : INFORMATIONS DE LA BOÎTE / STUDIO & LIEN UNIQUE */}
                  {carouselStep === 2 && (
                    <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                          Étape 2 : Votre Boîte / Studio & Spécialité
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Configurez l'enseigne commerciale et l'adresse web de votre boutique
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                          Nom de la Boîte / Agence / Studio *
                        </label>
                        <div className="relative">
                          <Building2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={storeName}
                            onChange={(e) => handleStoreNameChange(e.target.value)}
                            placeholder="Ex: Studio Archibim, Atelier Parametric, BIM Nova..."
                            className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                            required
                          />
                        </div>
                      </div>

                      {/* Aperçu Dynamique du Lien Unique de la Boutique */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                        <label className="block text-xs sm:text-sm font-bold text-blue-900 flex items-center gap-1.5">
                          <LinkIcon className="w-4 h-4 text-blue-600" />
                          <span>Identifiant d'URL Unique (Slug de la Boutique) *</span>
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <span className="text-xs sm:text-sm font-mono text-slate-600 font-semibold truncate bg-white sm:bg-transparent px-2.5 py-1.5 sm:p-0 rounded border sm:border-0 border-slate-200">
                            {window.location.origin}/#vendeur/
                          </span>
                          <input
                            type="text"
                            value={storeSlug}
                            onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                            placeholder="nom-de-votre-boite"
                            className="flex-1 px-3 py-2 rounded-lg bg-white border border-blue-300 font-mono text-sm sm:text-base font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-200 min-h-[42px]"
                            required
                          />
                        </div>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Ce lien direct permettra aux visiteurs d'accéder directement à vos produits et à votre vitrine officielle.
                        </p>
                      </div>

                      {/* DOMAINE D'EXPERTISE / SPÉCIALITÉ AVEC OPTION AUTRES */}
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800">
                          Domaine d'expertise / Spécialité *
                        </label>
                        <select
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-base sm:text-sm outline-none font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 min-h-[46px] cursor-pointer"
                        >
                          {specialtyList.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>

                        {/* Champ additionnel si "Autre" est sélectionné */}
                        {isCustomSpecialtySelected && (
                          <div className="p-3.5 rounded-xl bg-blue-50/70 border-2 border-blue-300 space-y-2 animate-fadeIn">
                            <label className="block text-xs sm:text-sm font-bold text-blue-900 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <span>Précisez votre domaine d'expertise personnalisé *</span>
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                type="text"
                                value={customSpecialty}
                                onChange={(e) => setCustomSpecialty(e.target.value)}
                                placeholder="Ex: Énergétique du bâtiment, Acoustique, Urbanisme..."
                                className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-blue-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-base sm:text-sm font-semibold outline-none min-h-[42px]"
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomSpecialty}
                                className="px-3.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer min-h-[40px]"
                              >
                                <PlusCircle className="w-4 h-4" />
                                <span>Ajouter au domaine</span>
                              </button>
                            </div>
                            <p className="text-xs text-blue-700">
                              Votre domaine personnalisé sera affiché directement sur votre vitrine vendeur et votre fiche atelier.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                            Téléphone Direct
                          </label>
                          <div className="relative">
                            <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+33 6 12 34 56 78"
                              className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                            WhatsApp Professionnel
                          </label>
                          <div className="relative">
                            <MessageCircle className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="tel"
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(e.target.value)}
                              placeholder="+33 6 12 34 56 78"
                              className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                            Adresse / Ville
                          </label>
                          <div className="relative">
                            <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Paris, France"
                              className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                            Site Web (Optionnel)
                          </label>
                          <div className="relative">
                            <Globe className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="url"
                              value={websiteUrl}
                              onChange={(e) => setWebsiteUrl(e.target.value)}
                              placeholder="https://mon-studio.com"
                              className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium min-h-[46px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setCarouselStep(1)}
                          className="px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base transition-colors flex items-center gap-2 cursor-pointer min-h-[46px]"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="flex-1 py-3.5 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                        >
                          <span>Suivant : Logo & Bannière Visuelle</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ÉTAPE 3 : LOGO, BANNIÈRE & PRÉSENTATION DE LA BOÎTE */}
                  {carouselStep === 3 && (
                    <div className="space-y-5 sm:space-y-6 animate-fadeIn">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                          Étape 3 : Identité Visuelle de la Boutique
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Personnalisez le logo, la bannière d'en-tête et la description de votre atelier
                        </p>
                      </div>

                      {/* 1. LOGO DE LA BOUTIQUE */}
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800">
                          Logo de la Boîte / Studio
                        </label>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="relative shrink-0 mx-auto sm:mx-0">
                            <img 
                              src={logoUrl} 
                              alt="Aperçu Logo" 
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-slate-200"
                            />
                            {isUploadingLogo && (
                              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2.5 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              {PRESET_LOGOS.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => setLogoUrl(p.url)}
                                  className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                    logoUrl === p.url 
                                      ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 font-medium'
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input 
                                type="file" 
                                ref={logoFileRef} 
                                onChange={handleUploadLogoFile} 
                                accept="image/*" 
                                className="hidden" 
                              />
                              <button
                                type="button"
                                disabled={isUploadingLogo}
                                onClick={() => logoFileRef.current?.click()}
                                className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[40px] disabled:opacity-60"
                              >
                                {isUploadingLogo ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                    <span>Upload en cours...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-blue-600" />
                                    <span>Uploader mon logo</span>
                                  </>
                                )}
                              </button>
                              <input
                                type="text"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="Ou URL https://..."
                                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 outline-none focus:border-blue-600 min-h-[40px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. BANNIÈRE DE LA BOUTIQUE */}
                      <div className="space-y-2">
                        <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800">
                          Bannière d'en-tête de la Boutique
                        </label>
                        
                        <div className="space-y-3 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="h-28 sm:h-36 rounded-xl overflow-hidden relative shadow-inner bg-slate-900">
                            <img 
                              src={bannerUrl} 
                              alt="Aperçu Bannière" 
                              className="w-full h-full object-cover"
                            />
                            {isUploadingBanner && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-bold gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                <span>Upload de la bannière...</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3 sm:p-4">
                              <span className="text-white text-xs sm:text-sm font-bold">
                                {storeName || 'Votre Boutique'} · Vitrine Officielle
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {PRESET_BANNERS.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setBannerUrl(b.url)}
                                className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  bannerUrl === b.url 
                                    ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 font-medium'
                                }`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input 
                              type="file" 
                              ref={bannerFileRef} 
                              onChange={handleUploadBannerFile} 
                              accept="image/*" 
                              className="hidden" 
                            />
                            <button
                              type="button"
                              disabled={isUploadingBanner}
                              onClick={() => bannerFileRef.current?.click()}
                              className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm min-h-[40px] disabled:opacity-60"
                            >
                              {isUploadingBanner ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                  <span>Upload en cours...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 text-blue-600" />
                                  <span>Uploader une bannière</span>
                                </>
                              )}
                            </button>
                            <input
                              type="text"
                              value={bannerUrl}
                              onChange={(e) => setBannerUrl(e.target.value)}
                              placeholder="Ou URL https://..."
                              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 outline-none focus:border-blue-600 min-h-[40px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. BIO / HISTORIQUE */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold uppercase sm:normal-case tracking-wider sm:tracking-normal text-slate-800 mb-1.5">
                          Description & Présentation de l'Atelier
                        </label>
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Présentez votre studio, vos certifications BIM, vos logiciels de prédilection et vos engagements de qualité..."
                          className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-base sm:text-sm outline-none font-medium"
                        />
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setCarouselStep(2)}
                          className="px-5 py-3 sm:py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Retour</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || isUploadingLogo || isUploadingBanner}
                          className="flex-1 py-3.5 sm:py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Création de votre boutique en cours...</span>
                            </>
                          ) : (
                            <>
                              <Store className="w-5 h-5" />
                              <span>Créer & Activer ma Boutique Officielle</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
