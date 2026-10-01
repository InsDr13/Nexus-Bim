import React, { useState } from 'react';
import { 
  Store, 
  ArrowRight, 
  Check, 
  FileCode, 
  Box, 
  FolderArchive, 
  FileText, 
  Cpu, 
  Key, 
  Video, 
  Headphones, 
  ShieldCheck, 
  Sliders, 
  ChevronRight, 
  ChevronDown, 
  Menu, 
  X,
  Compass,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { NexusLogo } from '../common/NexusLogo';

interface LandingPageProps {
  onNavigateToMarketplace: () => void;
  onNavigateToVendor: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToMarketplace,
  onNavigateToVendor,
}) => {
  const [salesPerMonth, setSalesPerMonth] = useState(35);
  const [averagePrice, setAveragePrice] = useState(65);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

  // Revenue projection calculation
  const grossMonthly = salesPerMonth * averagePrice;
  const netMonthly = grossMonthly * 0.85;
  const netAnnual = netMonthly * 12;

  // Types de produits vendus avec switch interactif et explication
  const productTypesShowcase = [
    {
      id: 'bim',
      label: 'Maquettes BIM',
      code: 'TYPE-01',
      format: 'Revit (.rvt) · IFC 4 · Archicad (.pln)',
      icon: FileCode,
      headline: 'Maquettes BIM d’Exécution & Gabarits d’Agence',
      description: 'Maquettes 3D paramétriques complètes comprenant l’arborescence des vues, les nomenclatures automatiques et les phases d’exécution. Modélisées selon la norme ISO 19650 avec niveaux de détails rigoureux du LOD 200 au LOD 400.',
      forWho: 'Architectes DPLG, Bureaux d’études TCE et Coordinateurs BIM',
      specs: [
        { label: 'Classification', val: 'Uniformat II / OmniClass' },
        { label: 'Interopérabilité', val: 'IFC 4 Design Transfer View' },
        { label: 'Gabarit inclus', val: 'Feuilles, cartouches et styles' },
        { label: 'Contrôle', val: 'Géométrie sans clash vérifiée' },
      ],
      sampleProduct: {
        title: 'Villa Contemporaine R+1 (Revit 2025 · LOD 350)',
        creator: 'StudioArch Atelier',
        price: '$49.00 USD',
        image: '/src/assets/images/hero_bim_villa_1790765033156.jpg',
        badge: 'IFC 4 & RVT',
      },
    },
    {
      id: '3d',
      label: 'Objets 3D & Mobilier',
      code: 'TYPE-02',
      format: 'Familles Revit (.rfa) · SketchUp · FBX · OBJ',
      icon: Box,
      headline: 'Familles Paramétriques & Mobilier Contemporain',
      description: 'Composants d’agencement intérieur, mobilier d’architecte et luminaires avec cotes paramétriques éditables. Double représentation : géométrie 2D ultra-propre en plan de masse et géométrie 3D texturée PBR 4K.',
      forWho: 'Architectes d’intérieur, Designers d’espaces et Modeleurs 3D',
      specs: [
        { label: 'Textures', val: 'PBR 4K (Albedo, Normal, Roughness)' },
        { label: 'Paramètres', val: 'Dimensions hauteur/largeur éditables' },
        { label: 'Optimisation', val: 'Maillage allégé sans polygones inutiles' },
        { label: 'Compatibilité', val: 'Revit 2022–2026, 3ds Max, Enscape' },
      ],
      sampleProduct: {
        title: 'Fauteuil Scandinave Minimaliste (RFA + SKP + FBX)',
        creator: 'DesignNordic Lab',
        price: '$29.90 USD',
        image: '/src/assets/images/product_furniture_chair_1790765057627.jpg',
        badge: 'PBR Textures',
      },
    },
    {
      id: 'plans',
      label: 'Détails & Coupes PDF',
      code: 'TYPE-03',
      format: 'Dossiers PDF Vectoriels · Plans DWG Cotés',
      icon: FileText,
      headline: 'Dossiers de Détails d’Exécution & Notes de Calculs',
      description: 'Fiches et carnets de coupes techniques à grande échelle (1:5, 1:10) : isolation thermique par l’extérieur, étanchéité de toitures, façades ventilées et notes de calcul de descente de charges conformes aux Eurocodes.',
      forWho: 'Ingénieurs Structure, Maîtres d’œuvre et Conducteurs de travaux',
      specs: [
        { label: 'Format vectoriel', val: 'PDF haute résolution + DWG modifiable' },
        { label: 'Normes de calcul', val: 'Eurocode 2 (Béton) & Eurocode 3 (Acier)' },
        { label: 'Coupes détaillées', val: 'Échelles 1:5, 1:10 et 1:20 cotées' },
        { label: 'Notice', val: 'Prescriptions CCTP intégrées' },
      ],
      sampleProduct: {
        title: 'Carnet de Détails Façades Ventilées & Menuiseries (DWG + PDF)',
        creator: 'Ingénierie Bâtir+',
        price: '$39.00 USD',
        image: '/src/assets/images/arch_axonometric_bim_1790771754486.jpg',
        badge: 'Eurocodes Conformes',
      },
    },
    {
      id: 'scripts',
      label: 'Plugins & Scripts',
      code: 'TYPE-04',
      format: 'Dynamo (.dyn) · Grasshopper (.gh) · Add-ins C#',
      icon: Cpu,
      headline: 'Automatisations Dynamo, Grasshopper & Add-ins .NET',
      description: 'Scripts de productivité pour automatiser le quotidien d’une agence : génération de plans de ferraillage, renumérotation automatique des portes/pièces, exports IFC automatisés et formes génératives.',
      forWho: 'BIM Managers, Développeurs AEC et Modeleurs paramétriques',
      specs: [
        { label: 'Code source', val: 'Nœuds documentés & code C# propre' },
        { label: 'Versions', val: 'Revit 2023, 2024, 2025, 2026' },
        { label: 'Installation', val: 'Script prêt à charger avec notice' },
        { label: 'Mises à jour', val: 'Accès aux correctifs garanti' },
      ],
      sampleProduct: {
        title: 'Pack de 12 Scripts Dynamo pour Revit (Nomenclatures & Métriques)',
        creator: 'BIM Automation Pro',
        price: '$45.00 USD',
        image: '/src/assets/images/arch_studio_workspace_1790771766458.jpg',
        badge: 'Dynamo 2.19+',
      },
    },
    {
      id: 'keys',
      label: 'Clés de Licence',
      code: 'TYPE-05',
      format: 'Clés logicielles d’activation & Tokens API',
      icon: Key,
      headline: 'Licences Logicielles & Outils Métier d’Ingénierie',
      description: 'Distribution instantanée de clés d’activation et licences perpétuelles pour add-ins spécialisés, calculateurs thermiques, extensions de modélisation et convertisseurs de formats IFC.',
      forWho: 'Agences d’architecture et bureaux d’études équipés',
      specs: [
        { label: 'Distribution', val: 'Émission immédiate de la clé d’activation' },
        { label: 'Sauvegarde', val: 'Archivée à vie dans le compte client' },
        { label: 'Activation', val: '1 poste de travail ou licence flottante' },
        { label: 'Assistance', val: 'Support éditeur 12 mois inclus' },
      ],
      sampleProduct: {
        title: 'Licence Annuelle Plugin IFC Checker Suite (Revit / Navisworks)',
        creator: 'CodeArch Softwares',
        price: '$79.00 USD',
        image: '/src/assets/images/bim_commercial_tower_1790765045061.jpg',
        badge: 'Clé Instantanée',
      },
    },
    {
      id: 'video',
      label: 'Formations Vidéo',
      code: 'TYPE-06',
      format: 'Modules vidéo HD · Fichiers d’exercices (.rvt)',
      icon: Video,
      headline: 'Masterclasses & Formations Pratiques de Praticiens',
      description: 'Parcours d’apprentissage complets découpés en modules courts et concrets, animés par des professionnels en activité avec maquettes d’exercices téléchargeables et méthodologies applicables immédiatement.',
      forWho: 'Collaborateurs d’agences et indépendants en perfectionnement',
      specs: [
        { label: 'Format', val: 'Vidéos 4K/1080p chapitrées avec transcription' },
        { label: 'Fichiers fournis', val: 'Maquettes sources .RVT à chaque étape' },
        { label: 'Accès', val: 'Accès permanent illimité sans abonnement' },
        { label: 'Attestation', val: 'Certificat de complétion téléchargeable' },
      ],
      sampleProduct: {
        title: 'Masterclass : Coordination BIM TCE & Détection d’Interférences',
        creator: 'BIM Academy Elite',
        price: '$89.00 USD',
        image: '/src/assets/images/product_mep_industrial_1790765067272.jpg',
        badge: 'Vidéo + RVT',
      },
    }
  ];

  const editorialTestimonials = [
    {
      author: 'Alexandre Martin',
      role: 'BIM Manager & Associé, StudioArch',
      quote: 'Nexus BIM a transformé nos bibliothèques internes en une source pérenne de valorisation. La rigueur apportée aux spécifications techniques (LOD, classification IFC, versions logicielles) assure une confiance totale auprès des maîtres d’œuvre qui achètent nos maquettes.',
      metrics: '140+ maquettes distribuées · Évaluation 4.9/5',
    },
    {
      author: 'Claire D’Ormesson',
      role: 'Ingénieure en Chef Structures, Groupe Bâtir+',
      quote: 'La vente de nos feuilles de calculs et gabarits de ferraillage se faisait au compte-gouttes. Disposer d’un atelier professionnel où chaque acheteur dispose d’un accès chiffré immédiat et de factures conformes a libéré notre temps d’ingénierie.',
      metrics: '85 dossiers techniques validés',
    },
    {
      author: 'Marc Vanhoutte',
      role: 'Architecte DPLG, Atelier MV Architecture',
      quote: 'Une présentation épurée, une typographie élégante, aucun bruit visuel superflu. C’est la première plateforme qui traite nos créations avec le niveau d’exigence éditoriale qu’elles méritent.',
      metrics: '210 acquisitions de modèles 3D',
    },
  ];

  const faqItems = [
    {
      q: 'Comment s’organise l’ouverture d’une boutique créateur ?',
      a: 'L’inscription d’un atelier ou studio est immédiate et sans frais d’adhésion. Vous renseignez votre dénomination professionnelle, téléchargez vos fichiers numériques avec leurs spécifications détaillées (version logicielle, LOD, formats inclus), et fixez librement votre tarification en $ USD.',
    },
    {
      q: 'Quelle est la commission appliquée sur les ventes ?',
      a: 'Nexus BIM applique une commission transparente de 15% sur les transactions finalisées. Elle couvre l’hébergement sécurisé des archives lourdes, le contrôle d’intégrité des fichiers, la bande passante globale et le traitement bancaire chiffré. 85% de la valeur nette vous reviennent directement.',
    },
    {
      q: 'Comment les fichiers et la propriété intellectuelle sont-ils protégés ?',
      a: 'Chaque fichier est hébergé sur des serveurs chiffrés. Lors de l’acquisition, un lien signé horodaté et une clé d’accès nominative sont générés pour le compte de l’acheteur. Les conditions d’utilisation encadrent strictement les droits d’usage dans les projets d’architecture.',
    },
    {
      q: 'Sous quel délai les fonds sont-ils transférés ?',
      a: 'Dès qu’une vente est confirmée, votre solde disponible est actualisé en temps réel. Vous pouvez déclencher un virement à tout moment vers votre compte bancaire (virement SEPA, SWIFT ou compte Stripe Connect). Les versements sont traités sous 24 à 48 heures ouvrées.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-slate-900 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. ÉLÉGANT HEADER ARCHITECTURAL ÉPURÉ (NAV RÉDUITE EN MODE PC + COULEURS LOGO) */}
      {/* ========================================================================= */}
      <header className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-[0_4px_20px_-10px_rgba(37,99,235,0.08)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
          
          {/* Logo authentique et fidèle avec rendu net */}
          <div className="flex items-center gap-10">
            <NexusLogo theme="light" size="lg" showSubtitle />
            
            {/* Desktop Minimalist Nav - STRICTEMENT RÉDUIT À 2 MENUS ESSENTIELS SUR PC */}
            <nav className="hidden xl:flex items-center gap-8 text-[13px] tracking-wide font-medium text-stone-600">
              <a href="#disciplines" className="hover:text-blue-700 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>Catalogue</span>
              </a>
              <a href="#atelier" className="hover:text-blue-700 transition-colors flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>Créateurs</span>
              </a>
            </nav>
          </div>

          {/* Dual Action Buttons (Avec touches harmonieuses des couleurs du logo) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onNavigateToMarketplace}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs sm:text-sm font-semibold transition-all border border-stone-300/80 flex items-center gap-2"
            >
              <Store className="w-4 h-4 text-[#0284c7]" />
              <span>Voir la marketplace</span>
            </button>

            {/* Bouton aux couleurs exactes du logo Nexus BIM (#1d4ed8, #2563eb, #0284c7) */}
            <button
              onClick={onNavigateToVendor}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] hover:from-[#1e40af] hover:to-[#0369a1] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 flex items-center gap-2"
            >
              <span>Créer une boutique</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#bae6fd]" />
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 border border-stone-200"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-stone-800" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-stone-200 px-6 py-5 space-y-3 animate-fadeIn shadow-lg">
            <a href="#disciplines" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-stone-800 hover:text-[#0284c7]">Catalogue & Typologies</a>
            <a href="#atelier" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-stone-800 hover:text-[#0284c7]">Espace Créateurs & Atelier</a>
            <a href="#simulateur" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-stone-800 hover:text-[#0284c7]">Simulateur de Gains</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-stone-800 hover:text-[#0284c7]">FAQ</a>
            <div className="pt-4 border-t border-stone-200 flex flex-col gap-2.5">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToMarketplace(); }}
                className="w-full py-3 rounded-xl bg-stone-100 text-stone-900 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-[#0284c7]" />
                <span>Explorer la marketplace</span>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateToVendor(); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25"
              >
                <span>Ouvrir ma boutique</span>
                <ArrowRight className="w-4 h-4 text-[#bae6fd]" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO MONOGRAPHIQUE : TYPOGRAPHIE EB GARAMOND & TOUCHES COULEUR LOGO */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 lg:pt-16 pb-16 sm:pb-20 border-b border-stone-200 bg-white">
        
        {/* Subtle architectural guide lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f1ef_1px,transparent_1px),linear-gradient(to_bottom,#f1f1ef_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        {/* Logo Ambient Glow Backlight (Subtiles touches de bleu/cyan du logo) */}
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-gradient-to-br from-[#38bdf8]/15 via-[#2563eb]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Authoritative Editorial Hook */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Refined unboxed kicker avec signature chromatique du logo Nexus */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50/70 border border-blue-200/80 text-xs tracking-wide uppercase font-bold text-[#1d4ed8]">
                <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
                <span>Plateforme d’ingénierie & architecture numérique</span>
              </div>

              {/* Main Headline in EB Garamond fine serifs avec format équilibré */}
              <h1 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-normal text-stone-950 tracking-tight leading-[1.2]">
                L’atelier de référence pour la distribution de{' '}
                <span className="italic font-medium text-[#0284c7]">
                  maquettes BIM & ressources architecturales.
                </span>
              </h1>

              {/* Sophisticated architectural paragraph */}
              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed font-normal">
                Nexus BIM met à la disposition des architectes, ingénieurs d’études et designers une infrastructure dédiée au partage et à la vente de gabarits Revit, maquettes IFC certifiées, objets paramétriques et détails de structure conformes aux normes professionnelles.
              </p>

              {/* Dual Restrained Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <button
                  onClick={onNavigateToVendor}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] hover:brightness-105 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2.5 group"
                >
                  <span>Ouvrir une boutique créateur</span>
                  <ArrowRight className="w-4 h-4 text-[#bae6fd] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={onNavigateToMarketplace}
                  className="px-6 py-3 rounded-xl bg-stone-100 hover:bg-stone-200/70 text-stone-900 border border-stone-300 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4 text-[#0284c7]" />
                  <span>Explorer le catalogue</span>
                </button>
              </div>

              {/* Architectural Quality Standards */}
              <div className="pt-6 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-600">
                <div className="space-y-0.5">
                  <span className="block font-['EB_Garamond',serif] text-xl font-bold text-stone-950">LOD 200–400</span>
                  <span className="text-stone-500 font-medium">Niveau de détail audité</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block font-['EB_Garamond',serif] text-xl font-bold text-stone-950">IFC 4 & 2x3</span>
                  <span className="text-stone-500 font-medium">Interopérabilité openBIM</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block font-['EB_Garamond',serif] text-xl font-bold text-stone-950">Revit 2022–26</span>
                  <span className="text-stone-500 font-medium">Familles paramétriques</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block font-['EB_Garamond',serif] text-xl font-bold text-[#0284c7]">100% Vérifié</span>
                  <span className="text-stone-500 font-medium">Contrôle d’intégrité</span>
                </div>
              </div>

            </div>

            {/* Right Column: High-End Architectural Photography Asset Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-white border border-stone-300/80 shadow-xl overflow-hidden group">
                
                {/* Real Architectural Pavilion Photograph */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src="/src/assets/images/arch_minimalist_pavilion_1790771742177.jpg"
                    alt="Pavillon architectural d’avant-garde"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                  
                  {/* Discreet technical tag avec touche bleue */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold text-stone-900 border border-blue-200/80 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
                    <span>Modèle BIM certifié</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-mono text-stone-300 uppercase tracking-widest">Maquette d’exécution</span>
                    <h3 className="font-['EB_Garamond',serif] text-2xl font-normal leading-tight text-white">
                      Pavillon d’Exposition Minéral (IFC 4 & RVT)
                    </h3>
                  </div>
                </div>

                {/* Technical Metadata Panel */}
                <div className="p-5 bg-white space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                        alt="StudioArch"
                        className="w-8 h-8 rounded-full object-cover border border-stone-200"
                      />
                      <div>
                        <span className="font-bold text-stone-900 block leading-tight">StudioArch Atelier</span>
                        <span className="text-[11px] text-stone-500">BIM Manager & Architecte DPLG</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                      LOD 350
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-stone-600 font-mono">
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-center">
                      <span className="block text-stone-400">Logiciel</span>
                      <strong className="text-stone-800">Revit 2025</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-center">
                      <span className="block text-stone-400">Fichier</span>
                      <strong className="text-stone-800">142 Mo .RVT</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50 border border-stone-100 text-center">
                      <span className="block text-stone-400">Licence</span>
                      <strong className="text-stone-800">Projet Pro</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-stone-500">
                      Distribution immédiate des fichiers sources
                    </div>
                    <button
                      onClick={onNavigateToMarketplace}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                    >
                      <span>Consulter la fiche</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. TYPES DE PRODUITS NUMÉRIQUES AVEC EFFET DE SWITCH COMPACT */}
      {/* ========================================================================= */}
      <section id="disciplines" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200">
          <div className="space-y-1 max-w-2xl">
            <span className="text-xs font-mono tracking-widest uppercase text-[#0284c7] font-semibold">
              01 / Catalogue & Formats de Produits
            </span>
            <h2 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-normal text-stone-950 tracking-tight">
              Les typologies de ressources vendues sur la plateforme
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md font-normal leading-relaxed">
            Basculez entre les catégories pour explorer les formats de fichiers, les spécifications requises et un exemple type d'ouvrage.
          </p>
        </div>

        {/* Compact Segmented Switch Tabs (Prise en main fluide, n'occupe pas beaucoup d'espace vertical) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/70 rounded-xl overflow-x-auto scrollbar-none border border-stone-300/80">
          {productTypesShowcase.map((t, index) => {
            const Icon = t.icon;
            const isSelected = selectedTypeIndex === index;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTypeIndex(index)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white text-blue-700 shadow-sm border border-blue-200 font-bold ring-1 ring-blue-500/20'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#2563eb]' : 'text-stone-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Product Type Interactive Panel (Compacité verticale ~340px) */}
        {(() => {
          const currentType = productTypesShowcase[selectedTypeIndex];
          return (
            <div 
              key={currentType.id}
              className="rounded-2xl bg-white border border-stone-300/90 shadow-sm p-6 sm:p-7 animate-fadeIn transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left side: Technical explanation, target & specs */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 font-bold text-blue-700">
                      {currentType.code}
                    </span>
                    <span>{currentType.format}</span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-stone-950 leading-snug">
                      {currentType.headline}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                      {currentType.description}
                    </p>
                  </div>

                  <div className="text-xs text-stone-500 italic">
                    Public cible : <strong className="text-stone-800 not-italic font-medium">{currentType.forWho}</strong>
                  </div>

                  {/* 4 Technical Attributes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {currentType.specs.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/90 space-y-0.5">
                        <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">{s.label}</span>
                        <strong className="block text-xs font-semibold text-stone-900 leading-tight">{s.val}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      onClick={onNavigateToMarketplace}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2"
                    >
                      <Store className="w-3.5 h-3.5 text-stone-300" />
                      <span>Consulter les {currentType.label.toLowerCase()} dans la marketplace</span>
                    </button>

                    <button
                      onClick={onNavigateToVendor}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
                    >
                      <span>Vendre ce format</span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  </div>
                </div>

                {/* Right side: Architectural Product Preview Card */}
                <div className="lg:col-span-5">
                  <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between text-xs pb-1">
                      <span className="font-mono text-stone-400 uppercase tracking-widest text-[11px]">Exemple en boutique</span>
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {currentType.sampleProduct.badge}
                      </span>
                    </div>

                    <div className="relative aspect-16/9 rounded-lg overflow-hidden border border-stone-200 bg-stone-200">
                      <img
                        src={currentType.sampleProduct.image}
                        alt={currentType.sampleProduct.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="font-['EB_Garamond',serif] text-lg font-bold text-stone-950 leading-snug line-clamp-1">
                        {currentType.sampleProduct.title}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500 font-medium">{currentType.sampleProduct.creator}</span>
                        <span className="font-mono font-black text-stone-900 text-sm">
                          {currentType.sampleProduct.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

      </section>

      {/* ========================================================================= */}
      {/* 4. L'ATELIER VENDEUR & COMMENT ÇA MARCHE */}
      {/* ========================================================================= */}
      <section id="atelier" className="bg-stone-100/70 border-y border-stone-200 py-16 sm:py-24">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Professional Architectural Studio Workspace */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl overflow-hidden border border-stone-300 shadow-lg bg-white">
                <img
                  src="/src/assets/images/arch_studio_workspace_1790771766458.jpg"
                  alt="Espace de travail et maquettes d’architecture"
                  className="w-full h-[360px] sm:h-[420px] object-cover"
                />
                <div className="p-6 bg-white space-y-2 border-t border-stone-200">
                  <div className="text-xs font-mono text-[#0284c7] uppercase tracking-widest font-bold">
                    Infrastructure Créateur Dédiée
                  </div>
                  <h4 className="font-['EB_Garamond',serif] text-2xl font-bold text-stone-950">
                    Votre atelier numérique personnel
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Personnalisez votre identité, gérez votre catalogue, suivez vos acquisitions et organisez vos transferts bancaires depuis une interface d’administration claire et isolée.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: The 3 Operational Steps */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-mono tracking-widest uppercase text-[#0284c7] font-semibold">
                  02 / Processus Créateur
                </span>
                <h2 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight leading-tight">
                  Valorisez les savoir-faire techniques de votre agence
                </h2>
                <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed">
                  Trois étapes sobres pour transformer vos gabarits de projets et bibliothèques internes en ressources partagées.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                
                <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#1d4ed8] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      ÉTAPE 01
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">Configuration de l’atelier</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 pl-1">
                    Indiquez la raison sociale de votre studio, déposez votre sigle d’agence et paramétrez vos coordonnées de virement bancaire.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#1d4ed8] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      ÉTAPE 02
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">Dépôt des modèles avec indexation</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 pl-1">
                    Téléversez vos fichiers sources et qualifiez leurs attributs : versions logicielles, LOD, gabarits de calques et captures de rendu.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#1d4ed8] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      ÉTAPE 03
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">Distribution chiffrée et reversement</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 pl-1">
                    Les confrères acquièrent vos ressources en toute sécurité. Les gains nets (85%) sont comptabilisés et virés sous 24 à 48 heures.
                  </p>
                </div>

              </div>

              <div className="pt-2">
                <button
                  onClick={onNavigateToVendor}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] hover:brightness-105 text-white font-bold text-sm transition-all shadow-md shadow-blue-500/25 inline-flex items-center gap-2"
                >
                  <span>Créer mon atelier vendeur</span>
                  <ArrowRight className="w-4 h-4 text-[#bae6fd]" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SIMULATEUR DE PROJECTION ÉPURÉ (DESIGN SOBRE ET PROFESSIONNEL) */}
      {/* ========================================================================= */}
      <section id="simulateur" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        <div className="rounded-3xl bg-white border border-stone-300 p-8 sm:p-12 lg:p-16 shadow-xl space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-mono tracking-widest uppercase text-[#0284c7] font-semibold">
                03 / Simulation financière
              </span>
              <h2 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight">
                Estimation de vos reversements créateur
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md font-normal leading-relaxed">
              Modélisez vos revenus prévisionnels sur la base de vos volumes de téléchargements et de votre tarification unitaire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Slider 1 */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-medium text-stone-700">Volume mensuel de téléchargements estimés :</span>
                  <span className="font-mono text-lg font-bold text-blue-700">{salesPerMonth} acquisitions</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={salesPerMonth}
                  onChange={(e) => setSalesPerMonth(parseInt(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                />
                <div className="flex justify-between text-[11px] font-mono text-stone-400">
                  <span>5 acquisitions</span>
                  <span>100 acquisitions</span>
                  <span>200+ acquisitions</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-medium text-stone-700">Tarif unitaire moyen par ressource :</span>
                  <span className="font-mono text-lg font-bold text-blue-700">{averagePrice} $ USD</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="300"
                  step="5"
                  value={averagePrice}
                  onChange={(e) => setAveragePrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                />
                <div className="flex justify-between text-[11px] font-mono text-stone-400">
                  <span>15 $</span>
                  <span>150 $</span>
                  <span>300 $</span>
                </div>
              </div>

              <div className="text-xs text-stone-500 border-l-2 border-[#2563eb] pl-4 space-y-1">
                <p className="font-semibold text-stone-800">Reversement garanti de 85% de la valeur nette de chaque vente.</p>
                <p>Aucun abonnement mensuel, aucun coût fixe d’hébergement.</p>
              </div>

            </div>

            {/* Right Projection Box */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-2xl bg-blue-50/50 border border-blue-200/90 space-y-6 shadow-sm">
                
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-[#0284c7] uppercase tracking-widest font-bold">
                    Reversement mensuel net (85%)
                  </span>
                  <div className="font-['EB_Garamond',serif] text-4xl sm:text-5xl font-bold text-[#1d4ed8]">
                    ${Math.round(netMonthly).toLocaleString()} <span className="font-sans text-xl font-normal text-stone-600">USD</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-200 flex items-center justify-between text-xs text-stone-700 font-mono">
                  <span>Projection annuelle nette :</span>
                  <strong className="text-blue-900 text-sm font-bold">${Math.round(netAnnual).toLocaleString()} USD / an</strong>
                </div>

                <button
                  onClick={onNavigateToVendor}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] hover:brightness-105 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/25"
                >
                  <span>Créer ma boutique dès aujourd'hui</span>
                  <ArrowRight className="w-4 h-4 text-[#bae6fd]" />
                </button>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. RIGUEUR TECHNIQUE & AXONOMÉTRIE */}
      {/* ========================================================================= */}
      <section id="rigueur" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono tracking-widest uppercase text-[#0284c7] font-semibold">
              04 / Normes & Qualité
            </span>
            <h2 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight leading-tight">
              Une exigence bâtie par des praticiens pour des praticiens
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              Contrairement aux banques de données généralistes non vérifiées, chaque ressource soumise sur Nexus BIM répond à une charte de modélisation exigeante : propreté des géométries, nomenclature standardisée des calques et des matériaux, absence de conflits paramétriques.
            </p>

            <div className="space-y-3.5 pt-2 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#2563eb] mt-1 shrink-0" />
                <span><strong>Structuration IFC 4 certifiée :</strong> Arborescences spatiales valides, types de propriétés Pset et GUIDs stables.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#2563eb] mt-1 shrink-0" />
                <span><strong>Familles Revit optimisées :</strong> Poids de fichier allégé, paramètres partagés conformes et géométrie 2D/3D découplée.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#2563eb] mt-1 shrink-0" />
                <span><strong>Textures PBR prêtes au rendu :</strong> Canaux Albedo, Normal, Roughness et Displacement étalonnés à l’échelle 1:1.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-stone-50">
              <img
                src="/src/assets/images/arch_axonometric_bim_1790771754486.jpg"
                alt="Dessin axonométrique technique BIM"
                className="w-full h-[380px] sm:h-[440px] object-cover"
              />
              <div className="p-4 bg-white border-t border-stone-200 text-xs text-stone-500 font-mono flex items-center justify-between">
                <span>Axonométrie structurelle · Détail d’assemblage</span>
                <span className="text-[#0284c7] font-semibold">Fichier source vérifié</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 7. ÉTUDES DE CAS & TÉMOIGNAGES PROFESSIONNELS EN EB GARAMOND */}
      {/* ========================================================================= */}
      <section className="bg-white border-y border-stone-200 py-16 sm:py-24">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono tracking-widest uppercase text-[#0284c7] font-semibold">
              05 / Retours de confrères
            </span>
            <h2 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight">
              Témoignages de la communauté d’agences
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {editorialTestimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-stone-50/70 border border-stone-200/90 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="text-blue-500 font-serif text-3xl leading-none">“</div>
                  <p className="font-['EB_Garamond',serif] text-base sm:text-lg text-stone-800 italic leading-relaxed">
                    {t.quote}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200/80 space-y-1">
                  <div className="font-bold text-sm text-stone-900">{t.author}</div>
                  <div className="text-xs text-stone-500 font-medium">{t.role}</div>
                  <div className="text-[11px] font-mono text-blue-700 pt-1 font-semibold">{t.metrics}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOIRE AUX QUESTIONS TECHNIQUE */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-10">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-mono tracking-widest uppercase text-[#0284c7] font-semibold">
            06 / Questions & Modalités
          </span>
          <h2 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl font-normal text-stone-950 tracking-tight">
            Foire aux questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl bg-white border border-stone-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-stone-900 hover:text-blue-700 text-sm sm:text-base transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 9. APPEL FINAL ARCHITECTURAL ÉLÉGANT & SOBRE AVEC DÉGRADÉ LOGO */}
      {/* ========================================================================= */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-[#0c1424] via-[#091122] to-[#040812] text-white p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden border border-slate-800">
          
          {/* Subtle logo color glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#2563eb]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-5 relative">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-sky-400 font-bold">
              Rejoindre la communauté professionnelle
            </span>
            <h2 className="font-['EB_Garamond',serif] text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-tight text-white">
              Déployez la boutique numérique de votre agence.
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
              Valorisez vos bibliothèques Revit, modèles IFC et détails techniques auprès de milliers de praticiens à travers le monde.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <button
                onClick={onNavigateToVendor}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] hover:brightness-110 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <span>Créer ma boutique</span>
                <ArrowRight className="w-4 h-4 text-[#bae6fd]" />
              </button>

              <button
                onClick={onNavigateToMarketplace}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-stone-200 border border-slate-700 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-[#38bdf8]" />
                <span>Explorer le catalogue</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER ARCHITECTURAL ÉPURÉ */}
      {/* ========================================================================= */}
      <footer className="border-t border-stone-200 bg-white text-stone-600 py-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-100">
            <NexusLogo theme="light" size="md" showSubtitle />
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-stone-700">
              <button onClick={onNavigateToMarketplace} className="hover:text-[#2563eb] transition-colors">Catalogue BIM</button>
              <button onClick={onNavigateToVendor} className="hover:text-[#2563eb] transition-colors">Espace Vendeur</button>
              <a href="#disciplines" className="hover:text-[#2563eb] transition-colors">Formats pris en charge</a>
              <a href="#simulateur" className="hover:text-[#2563eb] transition-colors">Simulation de gains</a>
              <a href="#faq" className="hover:text-[#2563eb] transition-colors">FAQ</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-mono">
            <div>
              © 2026 <strong>Nexus BIM Technologies</strong> · Plateforme d’ingénierie et de modélisation numérique.
            </div>
            <div className="flex items-center gap-3">
              <span>openBIM & IFC Standard</span>
              <span>·</span>
              <span>LOD 200–400</span>
              <span>·</span>
              <span className="text-[#0284c7]">Reversement garanti 85%</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
