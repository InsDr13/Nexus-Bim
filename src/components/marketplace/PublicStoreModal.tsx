import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  Copy, 
  Check, 
  Link2, 
  ExternalLink,
  ShoppingCart,
  Search,
  Box,
  FileCode,
  FolderArchive,
  FileText,
  Cpu,
  Key,
  Video,
  Share2,
  MapPin,
  Phone,
  MessageCircle,
  Mail
} from 'lucide-react';
import { Product, VendorStoreSettings, ProductType } from '../../types/database';

interface PublicStoreModalProps {
  vendorName: string;
  vendorSlug?: string;
  products: Product[];
  settings: VendorStoreSettings;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const PublicStoreModal: React.FC<PublicStoreModalProps> = ({
  vendorName,
  vendorSlug,
  products,
  settings,
  onClose,
  onSelectProduct,
  onAddToCart,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSoftware, setSelectedSoftware] = useState<string>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Compute clean unique slug
  const activeSlug = vendorSlug || vendorName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const vendorDirectUrl = `${window.location.origin}/vendeur/${activeSlug}`;

  // Filter vendor products
  const vendorProducts = products.filter(p => {
    const matchName = p.vendor_name.toLowerCase() === vendorName.toLowerCase();
    const matchSlug = p.vendor_slug && p.vendor_slug.toLowerCase() === activeSlug.toLowerCase();
    return matchName || matchSlug;
  });

  const filteredProducts = vendorProducts.filter(p => {
    if (selectedSoftware !== 'all' && p.software !== selectedSoftware) return false;
    if (searchQuery.trim()) {
      return p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.category.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(vendorDirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddToCartClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 1500);
    }
  };

  const getProductTypeIcon = (type: ProductType) => {
    switch (type) {
      case 'construction_plan': return FileCode;
      case 'object_3d': return Box;
      case 'digital_file': return FolderArchive;
      case 'pdf_document': return FileText;
      case 'software_plugin': return Cpu;
      case 'activation_key': return Key;
      case 'video_course': return Video;
      default: return Box;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c1424] border border-slate-800 rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with Close and Return buttons */}
        <div className="relative h-48 sm:h-64 bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={settings.banner_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1400'}
            alt={settings.store_name || vendorName}
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1424] via-[#0c1424]/40 to-transparent" />
          
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 backdrop-blur-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la Marketplace</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Unique Link Bar inside Banner */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-blue-500/30 text-xs font-mono">
              <span className="text-blue-400 font-bold flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" />
                Lien Boutique :
              </span>
              <span className="text-white font-semibold">vendeur/{activeSlug}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 backdrop-blur-md transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Lien Copié !' : 'Copier le Lien Public'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Store Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 -mt-10 relative z-10 space-y-6 pb-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-[#0c1424] bg-slate-800 shadow-2xl shrink-0">
                <img
                  src={settings.logo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                  alt={settings.store_name || vendorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{settings.store_name || vendorName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Créateur Vérifié
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">{settings.tagline || 'Studio de modélisation BIM & conception d\'ingénierie.'}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-5 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <div className="text-center">
                <div className="text-base font-bold text-white font-mono">{vendorProducts.length}</div>
                <div className="text-[11px] text-slate-400">Modèles</div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-base font-bold text-white font-mono">1.8k</div>
                <div className="text-[11px] text-slate-400">Ventes</div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center">
                <div className="text-base font-bold text-amber-400 font-mono flex items-center gap-1 justify-center">
                  <Star className="w-4 h-4 fill-current" />
                  <span>4.9</span>
                </div>
                <div className="text-[11px] text-slate-400">Avis</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="text-xs sm:text-sm text-slate-300 bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 leading-relaxed space-y-3">
            <p>{settings.bio || `Bienvenue sur la boutique officielle de ${vendorName}. Retrouvez nos familles Revit paramétriques, gabarits et scripts Dynamo prêts pour la production.`}</p>
            
            {/* Contact details */}
            {(settings.address || settings.phone || settings.whatsapp || settings.contact_email) && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2.5 text-xs">
                {settings.address && (
                  <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{settings.address}</span>
                  </div>
                )}
                {settings.phone && (
                  <a 
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{settings.phone}</span>
                  </a>
                )}
                {settings.whatsapp && (
                  <a 
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {settings.contact_email && (
                  <a 
                    href={`mailto:${settings.contact_email}`}
                    className="flex items-center gap-1.5 text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>{settings.contact_email}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans la boutique..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['all', 'Revit', 'Archicad', 'AutoCAD', 'SketchUp', 'Rhino'].map(soft => (
                <button
                  key={soft}
                  onClick={() => setSelectedSoftware(soft)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedSoftware === soft
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {soft === 'all' ? 'Tous les logiciels' : soft}
                </button>
              ))}
            </div>
          </div>

          {/* Products in USD */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Catalogue de {settings.store_name || vendorName} ({filteredProducts.length} articles en $ USD)
              </h3>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                Aucun produit ne correspond à votre recherche.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredProducts.map((prod) => {
                  const Icon = getProductTypeIcon(prod.product_type);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 group flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-video relative overflow-hidden bg-slate-950">
                          <img
                            src={prod.image_url}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-slate-300 text-[11px] font-medium border border-white/10">
                            <Icon className="w-3 h-3 text-blue-400" />
                            <span>{prod.software}</span>
                          </div>
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-blue-600 font-mono font-bold text-white text-xs shadow-md">
                            ${prod.price.toFixed(2)} USD
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                            {prod.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {prod.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">{prod.file_format} · {prod.file_size}</span>
                        {onAddToCart && (
                          <button
                            onClick={(e) => handleAddToCartClick(e, prod)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                              addedProductId === prod.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{addedProductId === prod.id ? 'Ajouté !' : 'Ajouter'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
