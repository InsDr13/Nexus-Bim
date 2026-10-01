import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  ShieldCheck, 
  Check, 
  Star, 
  CheckCircle, 
  ExternalLink, 
  KeyRound, 
  FileCode, 
  HardDrive, 
  ArrowLeft,
  Video,
  Headphones,
  Link2,
  Box,
  FolderArchive,
  FileText,
  Cpu,
  Key,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Product } from '../../types/database';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onViewVendorStore?: (vendorName: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onViewVendorStore,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews'>('specs');
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const getProductTypeBadge = (type: Product['product_type']) => {
    switch (type) {
      case 'object_3d':
        return { label: 'Objet 3D / Famille', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'construction_plan':
        return { label: 'Modèle BIM / Plan', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'digital_file':
        return { label: 'Archive Fichiers ZIP', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
      case 'pdf_document':
        return { label: 'Dossier / E-book PDF', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'software_plugin':
        return { label: 'Logiciel / Script Add-in', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'activation_key':
        return { label: 'Clé d\'activation / Licence', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'video_course':
        return { label: 'Formation Vidéo en ligne', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      case 'consulting_service':
        return { label: 'Consultation & Prestation BIM', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' };
      case 'protected_link':
        return { label: 'Lien privé sécurisé', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
    }
  };

  const badgeInfo = getProductTypeBadge(product.product_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Back & Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090e1a] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au catalogue</span>
            </button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5">
              <span>Marketplace</span>
              <span>&gt;</span>
              <span className="text-slate-300">{product.category}</span>
              <span>&gt;</span>
              <span className="text-blue-400 font-medium">{product.software}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Top Grid: Images + Key Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Visuals */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${badgeInfo.color}`}>
                    {badgeInfo.label}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white shadow">
                    {product.software}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2.5">
                {[product.image_url, product.image_url, product.image_url, product.image_url].map((img, i) => (
                  <div 
                    key={i} 
                    className={`aspect-video rounded-xl overflow-hidden border cursor-pointer ${i === 0 ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Right Column Details */}
            <div className="space-y-6">
              <div>
                <h1 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-normal text-white leading-snug tracking-tight">
                  {product.title}
                </h1>
                
                {/* Vendor info */}
                <div className="flex items-center gap-3.5 mt-3.5">
                  <img
                    src={product.vendor_avatar}
                    alt={product.vendor_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Créé par</span>
                      <button
                        onClick={() => onViewVendorStore && onViewVendorStore(product.vendor_name)}
                        className="text-sm font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1"
                      >
                        {product.vendor_name}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-amber-400 mt-0.5">
                      <div className="flex items-center">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="ml-1 font-bold">{product.rating}</span>
                      </div>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">({product.reviews_count} avis clients vérifiés)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing in USD & CTA */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tarif en $ USD</div>
                  <div className="font-['EB_Garamond',serif] text-3xl font-bold text-white tracking-tight">
                    ${product.price.toFixed(2)} <span className="text-sm font-sans font-normal text-blue-400">USD</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isFavorite 
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                        : 'border-slate-800 bg-slate-800 text-slate-300 hover:text-rose-400'
                    }`}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                      addedAnimation
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Ajouté au panier !</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Ajouter au panier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tech Specs Grid */}
              <div className="grid grid-cols-2 gap-3.5 text-xs sm:text-sm bg-black/40 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <span className="text-slate-400">Format de fichier :</span>
                  <div className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    <span>{product.file_format}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Taille du fichier :</span>
                  <div className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <span>{product.file_size}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Compatibilité :</span>
                  <div className="font-semibold text-slate-200">
                    {product.version_compatibility || 'Universel'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Licence :</span>
                  <div className="font-semibold text-slate-200">
                    {product.license_type}
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Téléchargement immédiat et accès à vie garanti</span>
                </div>
                {product.product_type === 'activation_key' && (
                  <div className="flex items-center gap-2 text-cyan-400 font-medium">
                    <KeyRound className="w-4 h-4 shrink-0" />
                    <span>Clé de licence cryptographique délivrée après validation du paiement</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* TABS CONTAINER IN ELEGANT WHITE CARD FOR MAXIMUM READABILITY */}
          {/* ========================================================================= */}
          <div className="rounded-3xl bg-white text-slate-900 border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Tabs Header */}
            <div className="flex items-center gap-4 sm:gap-8 border-b border-slate-200 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm sm:text-base font-bold pb-2 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'specs'
                    ? 'border-blue-600 text-blue-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Spécifications techniques détaillées</span>
              </button>
              
              <button
                onClick={() => setActiveTab('desc')}
                className={`text-sm sm:text-base font-bold pb-2 border-b-2 transition-all ${
                  activeTab === 'desc'
                    ? 'border-blue-600 text-blue-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Description complète
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-sm sm:text-base font-bold pb-2 border-b-2 transition-all ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Avis vérifiés ({product.reviews_count})
              </button>
            </div>

            {/* TAB 1: SPECIFICATIONS TECHNIQUES ADAPTÉES */}
            {activeTab === 'specs' && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 w-fit">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Critères professionnels adaptés au format : {badgeInfo.label}</span>
                </div>

                {/* Detailed Technical Parameters in Light Gray Box */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                  {product.detailed_description || product.description}
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Logiciel & Version</span>
                    <div className="text-base font-extrabold text-slate-900">{product.software}</div>
                    <div className="text-slate-600 font-medium">Compatibilité : {product.version_compatibility || 'Dernières versions'}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Fichiers livrés</span>
                    <div className="text-base font-extrabold text-slate-900 font-mono">{product.file_format}</div>
                    <div className="text-slate-600 font-medium">Poids : {product.file_size}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Exploitation</span>
                    <div className="text-base font-extrabold text-emerald-700">{product.license_type}</div>
                    <div className="text-slate-600 font-medium">Libre pour projets d'agences et chantiers</div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: DESCRIPTION */}
            {activeTab === 'desc' && (
              <div className="space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed animate-fadeIn">
                <p>{product.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-slate-800">Conception optimisée sans doublons ni géométries lourdes inutiles</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-slate-800">Paramètres partagés normalisés conformes aux protocoles BIM</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-slate-800">Fichiers d'exemples et gabarit de projet inclus dans le téléchargement</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-slate-800">Support technique direct par le créateur via la plateforme Nexus BIM</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">Jean-Marc D. · Architecte DPLG</span>
                    <span className="text-slate-500">Il y a 3 jours</span>
                  </div>
                  <div className="flex text-amber-500 text-sm">★★★★★</div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    Modèle d'une netteté irréprochable. L'arborescence du projet et les nomenclatures nous ont fait économiser plusieurs jours de modélisation. Je recommande vivement ce créateur.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">Sophie L. · BIM Manager</span>
                    <span className="text-slate-500">Il y a 1 semaine</span>
                  </div>
                  <div className="flex text-amber-500 text-sm">★★★★★</div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    Conforme à 100% aux spécifications annoncées. Fichiers légers et bien organisés.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
