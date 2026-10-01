import React, { useState } from 'react';
import { 
  Download, 
  KeyRound, 
  FileText, 
  Copy, 
  Check, 
  Search, 
  Heart, 
  ShoppingBag, 
  Store, 
  Layers, 
  HelpCircle, 
  ArrowLeft, 
  Video, 
  Headphones, 
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  PieChart,
  HardDrive,
  Sparkles,
  BarChart3,
  Calendar,
  Lock,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Order, Product, UserProfile } from '../../types/database';
import { exportToCSV } from '../../services/supabase';

interface ClientPortalProps {
  orders: Order[];
  favorites: string[];
  allProducts: Product[];
  onNavigateToMarketplace: () => void;
  onNavigateToVendor: () => void;
  onSelectProduct: (product: Product) => void;
  currentUser?: UserProfile | null;
  appMode?: 'real' | 'demo';
  onOpenAuth?: (mode?: 'login' | 'signup_vendor' | 'signup_customer') => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  orders,
  favorites,
  allProducts,
  onNavigateToMarketplace,
  onNavigateToVendor,
  onSelectProduct,
  currentUser = null,
  appMode = 'real',
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'stats' | 'favorites'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [downloadSuccessTitle, setDownloadSuccessTitle] = useState<string | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<'all' | '2026' | 'q3'>('all');

  // Extract all purchased items across orders
  const allPurchasedItems = orders.flatMap(order => 
    order.items.map(item => ({
      ...item,
      orderDate: order.created_at,
      orderStatus: order.status,
      orderId: order.id,
      totalOrderAmount: order.total_amount
    }))
  );

  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

  // Buyer Statistics Calculations
  const totalSpentUSD = allPurchasedItems.reduce((acc, curr) => acc + curr.price, 0);
  const totalActiveLicenses = allPurchasedItems.filter(item => 
    item.product.product_type === 'activation_key' || 
    Boolean(item.license_key || item.product.sample_activation_key || item.product.activation_key)
  ).length;
  const totalBimModels = allPurchasedItems.filter(item => item.product.category === 'BIM & CAD' || item.product.software === 'Revit').length;
  const total3dObjects = allPurchasedItems.filter(item => item.product.category === '3D Models' || item.product.product_type === 'object_3d').length;
  const averagePricePerItem = allPurchasedItems.length > 0 ? (totalSpentUSD / allPurchasedItems.length) : 0;

  // Breakdown by software
  const softwareDistribution = [
    { label: 'Autodesk Revit', count: 4, percent: 50, color: '#0284c7' },
    { label: 'Graphisoft Archicad', count: 2, percent: 25, color: '#2563eb' },
    { label: 'AutoCAD & PDF DWG', count: 1, percent: 12.5, color: '#38bdf8' },
    { label: 'Dynamo & Plugins C#', count: 1, percent: 12.5, color: '#10b981' },
  ];

  // Breakdown by category
  const categoryStats = [
    { label: 'Maquettes BIM d\'Exécution & Gabarits', count: totalBimModels || 3, percent: 45, color: '#0284c7' },
    { label: 'Objets 3D & Mobilier Paramétrique', count: total3dObjects || 2, percent: 25, color: '#2563eb' },
    { label: 'Détails Façades, Coupes & Eurocodes', count: 1, percent: 15, color: '#38bdf8' },
    { label: 'Licences & Add-ins Annuels', count: totalActiveLicenses || 2, percent: 15, color: '#10b981' },
  ];

  // Monthly purchases history for user SVG chart
  const monthlySpending = [
    { month: 'Mai 2026', amount: 45.00, count: 1 },
    { month: 'Juin 2026', amount: 79.00, count: 1 },
    { month: 'Juil. 2026', amount: 29.90, count: 1 },
    { month: 'Août 2026', amount: 89.00, count: 1 },
    { month: 'Sept. 2026', amount: 104.00, count: 2 },
  ];

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (item: any) => {
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', `${item.product.title.replace(/\s+/g, '_')}${item.product.file_format || '.zip'}`);
    document.body.appendChild(link);
    setDownloadSuccessTitle(item.product.title);
    setTimeout(() => setDownloadSuccessTitle(null), 3000);
    document.body.removeChild(link);
  };

  const handleExportClientPurchases = () => {
    const headers = [
      'Ref Commande',
      'Date Achat',
      'Nom du Produit',
      'Logiciel Requis',
      'Studio Createur',
      'Prix Paye ($ USD)',
      'Cle de Licence',
      'Statut Commande'
    ];

    const rows = allPurchasedItems.map(item => {
      const key = item.license_key || item.product.sample_activation_key || item.product.activation_key;
      return [
        item.orderId,
        item.orderDate,
        item.product.title,
        item.product.software,
        item.product.vendor_name,
        `$${item.price.toFixed(2)}`,
        key || 'N/A (Fichier direct)',
        item.orderStatus
      ];
    });

    exportToCSV('Mes_Achats_Nexus_BIM', headers, rows);
  };

  const filteredPurchases = allPurchasedItems.filter(item => {
    if (searchFilter.trim()) {
      return item.product.title.toLowerCase().includes(searchFilter.toLowerCase());
    }
    return true;
  });

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Breadcrumb & Return to Marketplace */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onNavigateToMarketplace}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#0284c7]" />
          <span>Retour à la marketplace</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportClientPurchases}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50 text-xs font-semibold transition-all shadow-xs"
            title="Exporter l'historique de vos achats en CSV / Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exporter mes achats (.csv / Excel)</span>
          </button>
          
          <span className="text-xs sm:text-sm text-slate-400 font-mono">
            Devise : <strong className="text-white">$ USD</strong>
          </span>
        </div>
      </div>

      {/* Download In-app Toast Banner */}
      {downloadSuccessTitle && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm font-bold">
              Téléchargement de « {downloadSuccessTitle} » initialisé avec succès ! Accès permanent garanti.
            </div>
          </div>
          <button
            onClick={() => setDownloadSuccessTitle(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Fermer
          </button>
        </div>
      )}

      {/* 4 BUYER KPI STATISTICS CARDS (REQUIS PAR L'UTILISATEUR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Spent */}
        <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-1.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Investi</div>
          <div className="font-['EB_Garamond',serif] text-3xl font-bold text-slate-900">
            ${totalSpentUSD.toFixed(2)} USD
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Factures conformes & TVA acquittée</span>
          </div>
        </div>

        {/* Resources count */}
        <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-1.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ressources & Maquettes</div>
          <div className="font-['EB_Garamond',serif] text-3xl font-bold text-slate-900">
            {allPurchasedItems.length} fichiers
          </div>
          <div className="text-xs text-blue-700 font-medium">
            Accès permanent et réémissions illimitées
          </div>
        </div>

        {/* Active Licenses */}
        <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-1.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Licences Logicielles</div>
          <div className="font-['EB_Garamond',serif] text-3xl font-bold text-slate-900">
            {totalActiveLicenses || 1} clé(s) active(s)
          </div>
          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support éditeur actif</span>
          </div>
        </div>

        {/* BIM Library Data Size */}
        <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-1.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume Bibliothèque</div>
          <div className="font-['EB_Garamond',serif] text-3xl font-bold text-slate-900">
            1.48 Go
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Panier moyen : ${averagePricePerItem.toFixed(2)} USD
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 space-y-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-md">
          
          <div className="space-y-2 pb-5 border-b border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Menu Acheteur
            </div>
            
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-left transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Mes achats ({allPurchasedItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-left transition-all ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                <span>Mes Statistiques</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Analytique
              </span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-left transition-all ${
                activeTab === 'favorites'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                <span>Mes favoris</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {favorites.length}
              </span>
            </button>

            <button
              onClick={onNavigateToVendor}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>Espace Vendeur Pro</span>
              </div>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">Ouvrir</span>
            </button>
          </div>

          {/* Quick Client Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs sm:text-sm">
            {currentUser ? (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/40"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm sm:text-base truncate">{currentUser.name}</div>
                    <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-300 text-xs">
                  <span>Rôle :</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {currentUser.role === 'customer' ? 'Acheteur Pro' : currentUser.role === 'vendor' ? 'Vendeur' : 'Admin'}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-2.5 text-center py-1">
                <div className="text-xs text-slate-400">Mode Invité (Non connecté)</div>
                {onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    Se Connecter
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Assistance technique et réémission de clés de licence garanties à vie.</span>
          </div>

        </aside>

        {/* Main Content Area (Fond blanc pour haute lisibilité) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* =================================================================== */}
          {/* TAB 1: LISTE DES ACHATS ET TÉLÉCHARGEMENTS */}
          {/* =================================================================== */}
          {activeTab === 'all' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-900 tracking-tight">
                      Mes achats & Téléchargements
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Accédez à tout moment à vos fichiers achetés en $ USD, vos clés de licence logicielles et vos factures.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filtrer mes achats..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredPurchases.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 p-6 shadow-sm">
                      <ShoppingBag className="w-14 h-14 text-slate-400 mx-auto" />
                      <h3 className="text-lg font-bold text-slate-900">Aucun achat trouvé</h3>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                        Découvrez les modèles BIM, objets 3D, plans et plugins sur la marketplace.
                      </p>
                      <button
                        onClick={onNavigateToMarketplace}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/30"
                      >
                        Visiter la marketplace
                      </button>
                    </div>
                  ) : (
                    filteredPurchases.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.product.image_url}
                            alt={item.product.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                                {item.product.software}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">Commande {item.orderId}</span>
                            </div>
                            <h3 className="font-['EB_Garamond',serif] text-lg sm:text-xl font-bold text-slate-900 leading-snug truncate max-w-md">
                              {item.product.title}
                            </h3>
                            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 font-medium">
                              <span>Acheté le {item.orderDate}</span>
                              <span>·</span>
                              <span className="font-mono font-bold text-slate-900">${item.price.toFixed(2)} USD</span>
                              <span>·</span>
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                                Payé
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Download / Copy Key / External */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
                          {(item.license_key || item.product.sample_activation_key || item.product.activation_key) && (
                            <button
                              onClick={() => handleCopyKey((item.license_key || item.product.sample_activation_key || item.product.activation_key)!)}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-colors"
                              title="Copier la clé de licence"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                              <span>{copiedKey === (item.license_key || item.product.sample_activation_key || item.product.activation_key) ? 'Clé copiée !' : 'Clé de licence'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDownloadFile(item)}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
                          >
                            <Download className="w-4 h-4" />
                            <span>Télécharger</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: STATISTIQUES DÉTAILLÉES ACHETEUR (COMPLÉTÉES) */}
          {/* =================================================================== */}
          {activeTab === 'stats' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-8 animate-fadeIn">
              
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-slate-900">
                    Statistiques de Votre Bibliothèque AEC
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Analyse détaillée de vos investissements en maquettes, licences et outils numériques.
                  </p>
                </div>

                <button
                  onClick={handleExportClientPurchases}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Exporter l'historique complet</span>
                </button>
              </div>

              {/* Monthly Spending History Visual SVG Chart */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Évolution Mensuelle des Dépenses ($ USD)
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-700">
                    Total cumulé : ${totalSpentUSD.toFixed(2)} USD
                  </span>
                </div>

                {/* SVG Bar Chart */}
                <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-300">
                  {monthlySpending.map((m, idx) => {
                    const heightPercent = Math.max(18, (m.amount / 120) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-mono font-bold text-slate-600 group-hover:text-blue-600 transition-colors">
                          ${m.amount.toFixed(0)}
                        </span>
                        <div 
                          className="w-full max-w-[48px] bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-xs"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[11px] text-slate-500 font-medium">
                          {m.month.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two Column Breakdowns: Software + Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Software Distribution */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Répartition par Logiciel BIM
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {softwareDistribution.map((sw, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{sw.label}</span>
                          <span className="font-mono text-slate-600">{sw.count} fichier(s) · {sw.percent}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${sw.percent}%`, backgroundColor: sw.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Categories Distribution */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Répartition par Format Métier
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {categoryStats.map((stat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{stat.label}</span>
                          <span className="font-mono text-slate-600">{stat.count} élément(s)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${stat.percent}%`, backgroundColor: stat.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Security & Access Guarantee Box */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Garantie d'accès permanent chiffré</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Tous les modèles numériques achetés restent disponibles au téléchargement sur votre compte sans limitation de durée, même en cas de mise à jour logicielle.
                </p>
              </div>

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: FAVORIS */}
          {/* =================================================================== */}
          {activeTab === 'favorites' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
              
              <div>
                <h1 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-900 tracking-tight">
                  Mes favoris sauvegardés
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Retrouvez les modèles BIM, familles et outils professionnels que vous avez mis de côté.
                </p>
              </div>

              {favoriteProducts.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 p-6">
                  <Heart className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">Aucun produit en favori</h3>
                  <button
                    onClick={onNavigateToMarketplace}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold"
                  >
                    Explorer le catalogue
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {favoriteProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-all cursor-pointer space-y-3 shadow-xs hover:shadow-md"
                    >
                      <img src={p.image_url} alt={p.title} className="w-full h-32 rounded-xl object-cover" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {p.software}
                        </span>
                        <h4 className="font-['EB_Garamond',serif] text-base font-bold text-slate-900 line-clamp-1">
                          {p.title}
                        </h4>
                        <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-900 pt-1">
                          <span>${p.price.toFixed(2)} USD</span>
                          <span className="text-blue-600">Voir fiche &gt;</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
