import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Star, 
  Check, 
  ShieldCheck, 
  Download, 
  Clock, 
  Layers, 
  Box, 
  FileCode, 
  FileText, 
  Cpu, 
  Key, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  ArrowRight, 
  Home, 
  ShoppingBag, 
  Store, 
  HelpCircle, 
  Video, 
  Headphones, 
  UserCheck, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  SlidersHorizontal, 
  X,
  Menu,
  Building,
  Compass,
  ArrowUpRight,
  Filter,
  CheckCircle,
  ExternalLink,
  Shield,
  FileCheck,
  Send,
  Database,
  Plus
} from 'lucide-react';
import { Product, ProductCategory, SoftwareName, ProductType } from '../../types/database';
import { NexusLogo } from '../common/NexusLogo';

interface MarketplaceViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  onNavigateToVendor: () => void;
  onNavigateToClient: () => void;
  onViewVendorStore: (vendorName: string) => void;
  onNavigateToLanding?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup_vendor' | 'signup_customer') => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  favorites,
  onToggleFavorite,
  onNavigateToVendor,
  onNavigateToClient,
  onViewVendorStore,
  onNavigateToLanding,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSoftware, setSelectedSoftware] = useState<string>('all');
  const [selectedProductType, setSelectedProductType] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'paid' | 'free'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'sales' | 'price_asc'>('recent');
  const [addedItemIds, setAddedItemIds] = useState<{ [key: string]: boolean }>({});
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Mobile states
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const categories: { id: ProductCategory; label: string; desc: string; icon: any }[] = [
    { id: 'BIM & CAD', label: 'BIM & CAD', desc: 'Familles, gabarits, maquettes IFC/RVT', icon: FileCode },
    { id: '3D Models', label: '3D Models', desc: 'Objets, mobilier, textures PBR, scènes', icon: Box },
    { id: 'Ingénierie', label: 'Ingénierie', desc: 'Calculs de charges, structures béton & acier', icon: Layers },
    { id: 'Design', label: 'Design', desc: 'Mobilier contemporain, agencement, luminaires', icon: Sparkles },
    { id: 'Logiciels & Scripts', label: 'Logiciels & Scripts', desc: 'Add-ins Revit, Dynamo, Grasshopper, licences', icon: Cpu },
    { id: 'Ressources', label: 'Ressources', desc: 'Dossiers PDF, plans de ferraillage, guides', icon: FileText },
    { id: 'Formations', label: 'Formations', desc: 'Cours vidéo & masterclasses BIM certifiées', icon: Video },
    { id: 'Services', label: 'Services', desc: 'Consultations, audits et modélisation sur-mesure', icon: Headphones },
  ];

  const softwareList: SoftwareName[] = [
    'Revit',
    'Archicad',
    'SketchUp',
    'AutoCAD',
    'Rhino',
    'Blender',
    '3ds Max'
  ];

  const productTypeTabs: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'Tous les produits', icon: Store },
    { id: 'construction_plan', label: 'Plans & Modèles BIM', icon: FileCode },
    { id: 'object_3d', label: 'Objets 3D & Mobilier', icon: Box },
    { id: 'pdf_document', label: 'Dossiers & E-books PDF', icon: FileText },
    { id: 'software_plugin', label: 'Logiciels & Scripts', icon: Cpu },
    { id: 'activation_key', label: 'Clés d\'activation', icon: Key },
    { id: 'video_course', label: 'Formations Vidéo', icon: Video },
    { id: 'consulting_service', label: 'Services & Prestations', icon: Headphones },
  ];

  const faqs = [
    {
      q: 'Quels sont les types de produits numériques vendus sur Nexus BIM ?',
      a: 'Nexus BIM accueille tous les formats numériques professionnels : modèles BIM (.rvt, .ifc, .pln), objets 3D et familles (.rfa, .skp, .fbx), dossiers de plans PDF, add-ins et plugins pour Revit/Archicad, clés d\'activation de logiciels, ainsi que des formations vidéo et consultations techniques.'
    },
    {
      q: 'Comment s\'effectuent les paiements et quelle est la devise ?',
      a: 'Tous les prix et transactions sur Nexus BIM sont libellés en dollars américains ($ USD). Les paiements sont sécurisés par carte bancaire (chiffrement SSL 256-bit). Les fichiers et licences sont mis à disposition instantanément après confirmation.'
    },
    {
      q: 'Comment devenir vendeur et commencer à publier ses créations ?',
      a: 'L\'inscription est ouverte à tous les architectes, ingénieurs et créateurs 3D. Cliquez sur « Devenir créateur », configurez votre profil en 2 minutes, fixez vos prix en USD et mettez vos fichiers en vente. Vous touchez 85% du prix de vente directement.'
    },
    {
      q: 'Comment et quand les vendeurs reçoivent-ils leurs revenus ?',
      a: 'Les créateurs peuvent demander un virement de leur solde disponible à tout moment depuis l\'onglet « Mes revenus » par virement bancaire SWIFT/SEPA, Stripe, Wise ou PayPal sous 24 à 48 heures ouvrées.'
    },
    {
      q: 'Les fichiers achetés sont-ils disponibles à vie ?',
      a: 'Oui. Chaque achat donne droit à un accès permanent depuis votre espace « Mes achats », avec téléchargements illimités, clés d\'activation archivées et accès direct aux futures mises à jour publiées par le créateur.'
    }
  ];

  // Filtering products
  const filteredProducts = products.filter((p) => {
    if (p.status !== 'published') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.vendor_name.toLowerCase().includes(q) ||
        p.software.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedSoftware !== 'all' && p.software !== selectedSoftware) return false;
    if (selectedProductType !== 'all' && p.product_type !== selectedProductType) return false;
    if (priceFilter === 'paid' && p.price === 0) return false;
    if (priceFilter === 'free' && p.price > 0) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'sales') return b.sales_count - a.sales_count;
    if (sortBy === 'price_asc') return a.price - b.price;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  const getProductTypeLabel = (type: ProductType) => {
    switch (type) {
      case 'object_3d': return 'Objet 3D';
      case 'construction_plan': return 'Modèle BIM';
      case 'digital_file': return 'Fichier ZIP';
      case 'pdf_document': return 'Dossier PDF';
      case 'software_plugin': return 'Plugin / Script';
      case 'activation_key': return 'Clé Licence';
      case 'video_course': return 'Formation';
      case 'consulting_service': return 'Consultation';
      case 'protected_link': return 'Lien Privé';
    }
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSoftware !== 'all' ? 1 : 0) +
    (selectedProductType !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSoftware('all');
    setSelectedProductType('all');
    setPriceFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-0">
      
      {/* ========================================================================= */}
      {/* 0. ACCUEIL BRAND HEADER WITH PROMINENT LOGO & MOBILE 3-BARS MENU */}
      {/* ========================================================================= */}
      <header className="bg-[#090e1a]/95 border-b border-slate-800/80 sticky top-14 z-30 backdrop-blur-md">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Prominent Nexus BIM Logo */}
          <NexusLogo 
            size="lg" 
            showSubtitle 
            onClick={onNavigateToLanding ? onNavigateToLanding : () => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-300">
            {onNavigateToLanding && (
              <button 
                onClick={onNavigateToLanding} 
                className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-blue-400 font-bold"
              >
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </button>
            )}
            <a href="#catalog" className="hover:text-blue-400 transition-colors">Explorer le catalogue</a>
            <a href="#become-vendor" className="hover:text-blue-400 transition-colors">Devenir vendeur</a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a>
            <button onClick={onNavigateToClient} className="hover:text-blue-400 transition-colors">Mes achats</button>
          </nav>

          {/* Right Action + Mobile 3-Bar Hamburger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onNavigateToVendor}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30"
            >
              <Store className="w-4 h-4" />
              <span>Ouvrir ma boutique</span>
            </button>

            {/* Mobile 3-Bars Hamburger Button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 transition-colors"
              aria-label="Menu de navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileNavOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#0c1424] px-4 py-5 space-y-4 animate-fadeIn">
            <nav className="flex flex-col gap-2 font-medium text-sm text-slate-200">
              {onNavigateToLanding && (
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    onNavigateToLanding();
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-blue-400 font-bold transition-colors text-left"
                >
                  <Home className="w-4 h-4" />
                  <span>Accueil (Landing Page)</span>
                </button>
              )}
              <a
                href="#catalog"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <Store className="w-4 h-4 text-blue-400" />
                <span>Explorer le catalogue</span>
              </a>
              <a
                href="#become-vendor"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Comment devenir vendeur ?</span>
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Foire aux questions (FAQ)</span>
              </a>
              <button
                onClick={() => { setIsMobileNavOpen(false); onNavigateToClient(); }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>Mes achats & téléchargements</span>
              </button>
            </nav>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => { setIsMobileNavOpen(false); onNavigateToVendor(); }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
              >
                <Store className="w-4 h-4" />
                <span>Espace Vendeur / Ouvrir ma boutique</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL HERO SECTION WITH PURE WHITE SEARCH BAR */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#090e1a] via-[#0d1629] to-[#0b1120] border-b border-slate-800/80">
        
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Headline & Pure White Search Bar */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              
              <h1 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-[1.14]">
                La Plateforme Première pour l'Architecture, le{' '}
                <span className="italic font-medium text-sky-400">
                  BIM & l'Ingénierie Digitale
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Accélérez la conception et l'exécution de vos projets. Téléchargez des maquettes numériques certifiées, des familles Revit paramétriques, des détails d'exécution, des scripts d'automatisation et des formations d'experts. En dollars américains (<strong className="text-white font-semibold">$ USD</strong>).
              </p>

              {/* Value proposition badges */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-300 font-medium">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Conformité IFC & LOD 350 vérifiée</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-200">
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Téléchargement immédiat</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-slate-200">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Paiements sécurisés en $ USD</span>
                </span>
              </div>

              {/* =================================================================== */}
              {/* PURE WHITE SEARCH BAR (EXPLICITEMENT DEMANDÉE PAR L'UTILISATEUR) */}
              {/* =================================================================== */}
              <div className="pt-2 max-w-2xl space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-white border-2 border-slate-200 shadow-2xl transition-all focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
                  
                  <div className="flex items-center gap-3 px-3 flex-1 w-full">
                    <Search className="w-5 h-5 text-blue-600 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un modèle BIM, famille Revit, plan PDF, plugin, clé..."
                      className="bg-transparent text-sm sm:text-base text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none w-full py-1.5"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      const el = document.getElementById('catalog');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors shrink-0 shadow-md shadow-blue-600/30"
                  >
                    <span>Rechercher</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>

                {/* Quick Software Pills */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="text-slate-400 font-medium">Logiciels :</span>
                  {softwareList.map((sw) => (
                    <button
                      key={sw}
                      onClick={() => {
                        setSelectedSoftware(selectedSoftware === sw ? 'all' : sw);
                        const el = document.getElementById('catalog');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`px-3 py-1 rounded-lg font-semibold border transition-all ${
                        selectedSoftware === sw
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      {sw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Counters in USD */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-5 border-t border-slate-800/80 max-w-xl">
                <div>
                  <div className="text-xl sm:text-3xl font-black text-white font-mono">10 000+</div>
                  <div className="text-xs sm:text-sm text-slate-400">ressources vérifiées</div>
                </div>
                <div>
                  <div className="text-xl sm:text-3xl font-black text-white font-mono">1 500+</div>
                  <div className="text-xs sm:text-sm text-slate-400">créateurs certifiés</div>
                </div>
                <div>
                  <div className="text-xl sm:text-3xl font-black text-white font-mono">50 000+</div>
                  <div className="text-xs sm:text-sm text-slate-400">professionnels actifs</div>
                </div>
              </div>

            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group">
                <img
                  src="/src/assets/images/hero_bim_villa_1790765033156.jpg"
                  alt="Modèle BIM Villa Contemporaine"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Floating pill badge */}
                {products.length > 0 ? (
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/70 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Modèle BIM Phare · {products[0].lod_level || 'LOD 350'}</span>
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">{products[0].title}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">Par {products[0].vendor_name} · ${products[0].price.toFixed(2)} USD</p>
                    </div>
                    <button
                      onClick={() => onSelectProduct(products[0])}
                      className="p-2 sm:p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shrink-0 shadow-md shadow-blue-600/30"
                      title="Voir le produit"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-blue-500/40 flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        <span>Mode Réel Supabase · Catalogue Vierge</span>
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">Espace Créateurs & Vendeurs Ouvert</h3>
                      <p className="text-[11px] text-slate-400">Publiez vos modèles BIM ou basculez en Mode Démo</p>
                    </div>
                    <button
                      onClick={() => onOpenAuth ? onOpenAuth('signup_vendor') : onNavigateToVendor()}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shrink-0 shadow-md shadow-blue-600/30 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Publier</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="border-t border-slate-800 bg-[#090e1a]/90 py-4 sm:py-5">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Produits vérifiés</div>
                <div className="text-[11px] sm:text-xs text-slate-400">Qualité et conformité BIM</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Paiement en $ USD</div>
                <div className="text-[11px] sm:text-xs text-slate-400">Transactions chiffrées SSL</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Téléchargement instantané</div>
                <div className="text-[11px] sm:text-xs text-slate-400">Accès permanent garanti</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Support réactif 24/7</div>
                <div className="text-[11px] sm:text-xs text-slate-400">Assistance par créateurs experts</div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. POPULAR CATEGORIES */}
      {/* ========================================================================= */}
      <section className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight">Catégories professionnelles</h2>
            <p className="text-xs sm:text-sm text-slate-400">Explorez les univers métiers de la modélisation, du calcul et du design</p>
          </div>
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedSoftware('all'); }}
            className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>Toutes les catégories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(isSelected ? 'all' : cat.id);
                  const el = document.getElementById('catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className={`p-2 sm:p-2.5 rounded-xl w-fit mb-2 ${isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-blue-400'}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5 truncate">{cat.label}</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-2 leading-tight">{cat.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN CATALOG WITH RESPONSIVE TOOLBAR & FILTERS (MOBILE & TABLET) */}
      {/* ========================================================================= */}
      <section id="catalog" className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Mobile & Tablet Filter Drawer Trigger Button */}
        <div className="lg:hidden flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span className="text-xs sm:text-sm font-bold text-white">Filtres de recherche</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            {isMobileFilterOpen ? 'Fermer les filtres' : 'Modifier les filtres'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar (Desktop + Responsive Mobile Slide-down) */}
          <aside className={`
            ${isMobileFilterOpen ? 'block' : 'hidden'} lg:block lg:col-span-3 space-y-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-md shadow-lg
          `}>
            
            {/* Quick Links Menu */}
            <div className="space-y-1.5 pb-4 border-b border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
                <span>Navigation</span>
                {activeFiltersCount > 0 && (
                  <button onClick={resetAllFilters} className="text-xs text-blue-400 hover:underline lowercase font-semibold">
                    réinitialiser
                  </button>
                )}
              </div>
              <button
                onClick={() => { resetAllFilters(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-left transition-colors ${
                  activeFiltersCount === 0 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Catalogue Global ({products.length})</span>
              </button>
              <button
                onClick={onNavigateToClient}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 text-left transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>Mes achats & téléchargements</span>
              </button>
              <button
                onClick={onNavigateToClient}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Mes favoris</span>
                </div>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono font-bold">{favorites.length}</span>
              </button>
            </div>

            {/* Catégories Filter */}
            <div className="space-y-1.5 pb-4 border-b border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Catégories
              </div>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left ${
                  selectedCategory === 'all' ? 'text-blue-400 bg-slate-800 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>Toutes les catégories</span>
                <span className="font-mono text-xs text-slate-400">{products.length}</span>
              </button>
              {categories.map((c) => {
                const count = products.filter(p => p.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left ${
                      selectedCategory === c.id ? 'text-blue-400 bg-slate-800 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-xs text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Software Filter */}
            <div className="space-y-1.5 pb-4 border-b border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Logiciel BIM / CAO
              </div>
              <button
                onClick={() => setSelectedSoftware('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left ${
                  selectedSoftware === 'all' ? 'text-blue-400 bg-slate-800 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>Tous les logiciels</span>
              </button>
              {softwareList.map((sw) => {
                const count = products.filter(p => p.software === sw).length;
                return (
                  <button
                    key={sw}
                    onClick={() => setSelectedSoftware(sw)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left ${
                      selectedSoftware === sw ? 'text-blue-400 bg-slate-800 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{sw}</span>
                    <span className="font-mono text-xs text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Tarification USD Filter */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Tarification ($ USD)
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    priceFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setPriceFilter('paid')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    priceFilter === 'paid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Payants
                </button>
                <button
                  onClick={() => setPriceFilter('free')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    priceFilter === 'free' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Gratuits
                </button>
              </div>
            </div>

          </aside>

          {/* Right Main Catalog Grid */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar: Search & Chariow Type Tabs */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-4 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-normal text-white flex items-center gap-2">
                    <span>Catalogue Nexus BIM</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-semibold">
                      {filteredProducts.length} articles
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400">Modèles vérifiés en USD avec téléchargement immédiat.</p>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 self-end sm:self-auto text-xs sm:text-sm">
                  <span className="text-slate-400">Trier par :</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="sales">Meilleures ventes</option>
                    <option value="price_asc">Prix croissant</option>
                  </select>
                </div>
              </div>

              {/* Chariow-style Product Type Tabs (Scrollable on mobile) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm scrollbar-none">
                {productTypeTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = selectedProductType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedProductType(tab.id)}
                      className={`px-3 py-2 rounded-xl whitespace-nowrap font-medium transition-all border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-md shadow-blue-600/20'
                          : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Product Cards Grid with Luminous White Surfaces for High Contrast */}
            {products.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-6 p-6 sm:p-10 max-w-2xl mx-auto shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
                  <Store className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                    <Database className="w-3.5 h-3.5" />
                    <span>Mode Réel Supabase · Aucun Produit Enregistré</span>
                  </div>
                  <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white">
                    La Marketplace est vierge au départ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Aucun vendeur n'a encore publié de modèle BIM dans la base de données Supabase. Créez votre profil vendeur pour obtenir votre lien unique et publier vos premières créations, ou basculez en Mode Démo pour explorer le catalogue d'exemple.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onOpenAuth ? onOpenAuth('signup_vendor') : onNavigateToVendor()}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer Compte Vendeur & Publier</span>
                  </button>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4 p-6">
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">Aucun produit ne correspond à ces critères</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Essayez de réinitialiser vos filtres de recherche ou de sélectionner une autre catégorie.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/20"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((prod) => {
                  const isFav = favorites.includes(prod.id);
                  const isJustAdded = addedItemIds[prod.id];

                  return (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-2xl cursor-pointer flex flex-col text-slate-900"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                        <img
                          src={prod.image_url}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Software & Type Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600 text-white shadow-md">
                            {prod.software}
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-black/70 backdrop-blur-sm text-slate-200 border border-white/10">
                            {getProductTypeLabel(prod.product_type)}
                          </span>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(prod.id);
                          }}
                          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md transition-colors ${
                            isFav 
                              ? 'bg-rose-500 text-white shadow-lg' 
                              : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/90'
                          }`}
                          title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Card Content with Crisp White Surface */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                            <span className="uppercase tracking-wider text-blue-600">{prod.category}</span>
                            <span className="font-mono text-slate-400">{prod.file_size}</span>
                          </div>

                          <h3 className="font-['EB_Garamond',serif] text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            {prod.title}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        </div>

                        {/* Vendor Info + Rating */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewVendorStore(prod.vendor_name);
                            }}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={prod.vendor_avatar}
                              alt={prod.vendor_name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-bold text-slate-800 hover:text-blue-600">{prod.vendor_name}</span>
                          </div>

                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{prod.rating}</span>
                            <span className="text-slate-400 font-normal">({prod.reviews_count})</span>
                          </div>
                        </div>

                        {/* Price in USD + Add to Cart Button */}
                        <div className="pt-2 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prix en USD</div>
                            <div className="text-xl font-black text-slate-900 font-mono">
                              ${prod.price.toFixed(2)} <span className="text-xs font-sans text-blue-600">USD</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleAddToCart(e, prod)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md ${
                              isJustAdded
                                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Ajouté</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>Ajouter</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. ÉTAPES POUR CRÉER UN COMPTE ET DEVENIR VENDEUR (Fond Blanc Lumineux) */}
      {/* ========================================================================= */}
      <section id="become-vendor" className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="rounded-3xl bg-white text-slate-900 border border-slate-200 p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-xl">
          
          <div className="max-w-3xl space-y-3 mb-10">
            <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold border border-blue-200">
              Espace Créateurs & Agences
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Comment créer un compte et devenir vendeur sur Nexus BIM ?
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed">
              Monétisez vos maquettes 3D, gabarits Revit, scripts d'automatisation et savoir-faire auprès de milliers d'architectes et ingénieurs à travers le monde.
            </p>
          </div>

          {/* 4 Steps Grid in White / Light Slate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Step 1 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-blue-500 hover:bg-blue-50/40 transition-all shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-base shadow-sm">
                01
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Créez votre profil créateur</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Renseignez votre nom ou studio, ajoutez votre logo et présentez vos spécialités (Revit, Archicad, structure, etc.).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-blue-500 hover:bg-blue-50/40 transition-all shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-base shadow-sm">
                02
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Importez vos fichiers numériques</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Glissez-déposez vos modèles BIM (.rvt, .ifc), familles, archives ZIP, dossiers PDF techniques ou licences.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-blue-500 hover:bg-blue-50/40 transition-all shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-base shadow-sm">
                03
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Fixez vos prix en $ USD</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Définissez votre tarification en dollars américains, choisissez le type de licence (pro ou illimité) et publiez.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-base shadow-sm">
                04
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Encaissez directement vos revenus</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Suivez vos ventes en temps réel et demandez un retrait vers votre compte bancaire (virement SEPA/SWIFT, Stripe ou Wise).
              </p>
            </div>

          </div>

          {/* CTA Box */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-700 text-xs sm:text-sm font-semibold">
              Prêt à vendre vos premières créations BIM dès aujourd'hui ?
            </div>
            <button
              onClick={onNavigateToVendor}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              <span>Accéder à l'espace vendeur</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FAQ SECTION (Fond Blanc Lumineux & Haute Lisibilité) */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs sm:text-sm font-bold border border-blue-500/20">
            Foire Aux Questions
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Questions fréquentes sur Nexus BIM
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Retrouvez toutes les réponses essentielles pour acheter et vendre sur la marketplace.
          </p>
        </div>

        {/* Accordion FAQ in White Cards */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white text-slate-900 border border-slate-200 overflow-hidden shadow-xs hover:border-blue-300 transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. COMPREHENSIVE ARCHITECTURAL FOOTER (AMÉLIORÉ EXPLICITEMENT) */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-800 bg-[#080d19] text-slate-300 mt-16 pt-12 sm:pt-16 pb-12">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Top Footer Banner: Newsletter & Brand summary */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left max-w-xl">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Recevez les nouveaux modèles et gabarits BIM chaque semaine
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Inscrivez-vous à notre veille professionnelle : familles Revit gratuites, nouveaux plugins et actualités du secteur AEC.
              </p>
            </div>

            <div className="w-full lg:w-auto flex-1 max-w-md">
              {newsletterSubscribed ? (
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Merci ! Vous êtes inscrit à la lettre d'information.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) setNewsletterSubscribed(true);
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="votre.email@agence.com"
                    className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors shrink-0 flex items-center justify-center gap-2 shadow-md shadow-blue-600/30"
                  >
                    <span>S'abonner</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* 4 Main Footer Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10 text-xs sm:text-sm">
            
            {/* Col 1: Brand presentation (span 2 on small screens) */}
            <div className="col-span-2 space-y-4">
              <NexusLogo size="md" showSubtitle onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                La place de marché internationale dédiée aux architectes, bureaux d'études, ingénieurs structure et créateurs 3D. Modèles certifiés, gabarits et logiciels distribués en dollars américains (<span className="text-white font-medium">$ USD</span>).
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">IFC 4 Ready</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">LOD 350 / 400</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">PBR 4K</span>
              </div>
            </div>

            {/* Col 2: Marketplace */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Marketplace</h4>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><a href="#catalog" className="hover:text-blue-400 transition-colors">Modèles BIM & Revit (.rvt)</a></li>
                <li><a href="#catalog" className="hover:text-blue-400 transition-colors">Objets 3D & Mobilier (.rfa, .skp)</a></li>
                <li><a href="#catalog" className="hover:text-blue-400 transition-colors">Dossiers d'exécution PDF</a></li>
                <li><a href="#catalog" className="hover:text-blue-400 transition-colors">Plugins & Scripts Dynamo</a></li>
                <li><a href="#catalog" className="hover:text-blue-400 transition-colors">Clés d'activation logicielles</a></li>
                <li><a href="#catalog" className="hover:text-blue-400 transition-colors">Formations & Masterclasses</a></li>
              </ul>
            </div>

            {/* Col 3: Espace Vendeurs */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Espace Créateurs</h4>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><button onClick={onNavigateToVendor} className="hover:text-blue-400 transition-colors text-left">Ouvrir une boutique</button></li>
                <li><a href="#become-vendor" className="hover:text-blue-400 transition-colors">Comment devenir vendeur</a></li>
                <li><button onClick={onNavigateToVendor} className="hover:text-blue-400 transition-colors text-left">Tableau de bord créateur</button></li>
                <li><button onClick={onNavigateToVendor} className="hover:text-blue-400 transition-colors text-left">Gestion des revenus en USD</button></li>
                <li><button onClick={onNavigateToVendor} className="hover:text-blue-400 transition-colors text-left">Retraits par virement SEPA/SWIFT</button></li>
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">Barème des commissions</a></li>
              </ul>
            </div>

            {/* Col 4: Support & Légal */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Assistance & Sécurité</h4>
              <ul className="space-y-2 text-slate-400 font-medium">
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">Foire aux questions (FAQ)</a></li>
                <li><button onClick={onNavigateToClient} className="hover:text-blue-400 transition-colors text-left">Mes achats & téléchargements</button></li>
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">Licences d'exploitation commerciale</a></li>
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">Paiement sécurisé SSL 256-bit</a></li>
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">Politique de confidentialité</a></li>
                <li><a href="#faq" className="hover:text-blue-400 transition-colors">Conditions Générales de Vente</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Guarantee bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 <strong>Nexus BIM Technologies Inc.</strong> Tous droits réservés. Plateforme de produits numériques pour l'ingénierie et l'architecture.
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Devise : Dollar Américain ($ USD)</span>
              </span>
              <span>·</span>
              <span>Stripe Connect Verified</span>
              <span>·</span>
              <span>Supabase Ready</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
