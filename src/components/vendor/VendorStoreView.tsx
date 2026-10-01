import React, { useState } from 'react';
import { 
  Store, 
  ArrowLeft, 
  Share2, 
  Copy, 
  Check, 
  Star, 
  CheckCircle, 
  ShieldCheck, 
  ShoppingBag, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { Product, VendorStoreSettings } from '../../types/database';
import { NexusLogo } from '../common/NexusLogo';

interface VendorStoreViewProps {
  vendorSlug: string;
  vendorName: string;
  vendorAvatar?: string;
  vendorRating?: number;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateBack: () => void;
}

export const VendorStoreView: React.FC<VendorStoreViewProps> = ({
  vendorSlug,
  vendorName,
  vendorAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  vendorRating = 4.9,
  products,
  onSelectProduct,
  onAddToCart,
  onNavigateBack,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const vendorProducts = products.filter(p => 
    (p.vendor_slug && p.vendor_slug.toLowerCase() === vendorSlug.toLowerCase()) ||
    (p.vendor_name && p.vendor_name.toLowerCase() === vendorName.toLowerCase())
  );

  const cleanSlug = vendorSlug || vendorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const fullStoreUrl = `https://nexusbim.app/vendeur/${cleanSlug}`;

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(fullStoreUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredProducts = vendorProducts.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchFilter.trim()) {
      return (
        p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.software.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Bar with Return */}
      <div className="bg-[#0a101f] border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 sticky top-14 z-30">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Retour au catalogue global</span>
        </button>

        {/* Unique Link Copy Button */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-blue-400 font-bold">Lien boutique :</span>
            <span className="text-emerald-400 font-semibold">{fullStoreUrl}</span>
          </div>

          <button
            onClick={handleCopyStoreLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Lien copié !' : 'Partager la boutique'}</span>
          </button>
        </div>
      </div>

      {/* Vendor Store Hero Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-10 sm:py-14 relative space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Vendor Profile Info */}
            <div className="flex items-center gap-5">
              <img
                src={vendorAvatar}
                alt={vendorName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-blue-500/30 bg-slate-800 shadow-xl shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h1 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl font-normal text-white tracking-tight">
                    {vendorName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle className="w-3 h-3" />
                    Créateur Vérifié
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{vendorRating} / 5.0</span>
                  </div>
                  <span>·</span>
                  <span className="font-mono text-blue-300">{vendorProducts.length} ressource(s) publiée(s)</span>
                  <span>·</span>
                  <span className="text-slate-400">Garantie d'intégrité 100% testée</span>
                </div>

                {/* Unique Store Link Badge */}
                <div className="pt-1 flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>URL Boutique :</span>
                  <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    vendeur/{cleanSlug}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Modèles BIM</span>
                <strong className="text-lg font-bold text-white font-mono">{vendorProducts.length}</strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Note Moyenne</span>
                <strong className="text-lg font-bold text-amber-400 font-mono">4.9 / 5</strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Distribution</span>
                <strong className="text-lg font-bold text-emerald-400 font-mono">Instantanée</strong>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Catalog for this Vendor */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-10 space-y-6">
        
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-normal text-white">
              Catalogue exclusif de {vendorName}
            </h2>
            <p className="text-xs text-slate-400">
              Tous les fichiers numériques, maquettes d’exécution et familles conçus par ce studio.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher dans cette boutique..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3 p-6">
            <Store className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Aucun produit ne correspond à votre recherche</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ce vendeur propose {vendorProducts.length} modèle(s) dans d'autres catégories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all p-4 space-y-3 flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl"
              >
                <div className="space-y-3">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-blue-400 border border-blue-500/30">
                      {product.software}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white">
                      {product.file_format}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-mono">{product.category}</div>
                    <h3 className="font-['EB_Garamond',serif] text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {product.title}
                    </h3>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-['EB_Garamond',serif] text-xl font-bold text-white">
                    ${product.price.toFixed(2)} <span className="font-sans text-xs font-normal text-slate-400">USD</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
