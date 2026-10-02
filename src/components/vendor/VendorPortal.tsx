import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Star, 
  Plus, 
  Search, 
  ArrowUpRight, 
  CreditCard, 
  Download, 
  Eye, 
  Save, 
  Check, 
  TrendingUp, 
  Wallet, 
  Menu, 
  X, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  Building,
  HelpCircle,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowDownToLine,
  Sliders,
  FileCode,
  Box,
  FolderArchive,
  FileText,
  Cpu,
  Key,
  Video,
  Headphones,
  Link2,
  Trash2,
  ExternalLink,
  Sun,
  Moon,
  FileSpreadsheet,
  Copy,
  Briefcase,
  LogIn,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Printer,
  Edit3,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Product, VendorStoreSettings, PayoutTransaction, ProductType, UserProfile, Order } from '../../types/database';
import { INITIAL_PAYOUTS } from '../../data/mockData';
import { AddProductModal } from './AddProductModal';
import { PrintInvoiceModal } from './PrintInvoiceModal';
import { NexusLogo } from '../common/NexusLogo';
import { exportToCSV, supabaseDatabaseService, supabaseAuthService } from '../../services/supabase';

interface VendorPortalProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  storeSettings: VendorStoreSettings;
  onUpdateStoreSettings: (settings: VendorStoreSettings) => void;
  onNavigateToMarketplace: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (mode?: 'login' | 'signup_vendor' | 'signup_customer') => void;
  appMode?: 'real' | 'demo';
  orders?: Order[];
  onViewVendorStore?: (slug: string) => void;
  onUserAuthenticated?: (user: UserProfile) => void;
}

export const VendorPortal: React.FC<VendorPortalProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  storeSettings,
  onUpdateStoreSettings,
  onNavigateToMarketplace,
  currentUser = null,
  onOpenAuth,
  appMode = 'real',
  orders = [],
  onViewVendorStore,
  onUserAuthenticated,
}) => {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'products' | 'revenue' | 'store' | 'sales' | 'clients' | 'stats' | 'reviews'>('dashboard');
  const [productTab, setProductTab] = useState<'all' | 'published' | 'draft' | 'pending'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [savedSettingsFeedback, setSavedSettingsFeedback] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Print Modal State
  const [printModalConfig, setPrintModalConfig] = useState<{
    isOpen: boolean;
    type: 'sale' | 'all_sales' | 'payout' | 'stats';
    order?: Order | null;
    orders?: Order[];
    payout?: PayoutTransaction | null;
    statsData?: {
      grossSales: number;
      netEarnings: number;
      orderCount: number;
      avgOrder: number;
      productsCount: number;
    };
  }>({ isOpen: false, type: 'sale' });

  // Refs for vendor store logo & banner file uploads
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setBannerUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Active vendor info
  const currentVendorSlug = currentUser?.store_slug || 'studioarch-atelier';
  const currentVendorName = currentUser?.company || currentUser?.name || 'StudioArch';

  // Selected product to inspect dynamic specs
  const [viewingProductSpecs, setViewingProductSpecs] = useState<Product | null>(null);

  // Vendor's own products: matches vendor name or unique slug
  const vendorProducts = products.filter(p => {
    if (currentUser?.store_slug && p.vendor_slug) {
      return p.vendor_slug === currentUser.store_slug;
    }
    if (currentUser?.company) {
      return p.vendor_name === currentUser.company;
    }
    return p.vendor_name === currentVendorName || (appMode === 'demo' && p.vendor_name === 'StudioArch');
  });

  // Real orders calculation for this vendor
  const vendorOrders = orders.filter(o => 
    o.items?.some(i => i.product.vendor_name === currentVendorName || i.product.vendor_slug === currentVendorSlug || (appMode === 'demo' && i.product.vendor_name === 'StudioArch'))
  );

  const realGrossSales = vendorOrders.reduce((acc, order) => {
    const matchingItemsTotal = order.items
      ?.filter(i => i.product.vendor_name === currentVendorName || i.product.vendor_slug === currentVendorSlug || (appMode === 'demo' && i.product.vendor_name === 'StudioArch'))
      .reduce((sum, item) => sum + item.price, 0) || 0;
    return acc + matchingItemsTotal;
  }, 0);

  // Computed metrics (Strictly 0 in Real mode if no sales yet)
  const displayTotalSales = appMode === 'real' ? realGrossSales : 3248.50;
  const displayNetEarnings = displayTotalSales * 0.85;
  const displayPlatformCut = displayTotalSales * 0.15;
  const displayOrderCount = appMode === 'real' ? vendorOrders.length : 48;

  // Payouts & Available Balance Calculation
  const [payouts, setPayouts] = useState<PayoutTransaction[]>(() => 
    appMode === 'real' ? [] : INITIAL_PAYOUTS
  );
  
  // Solde disponible réel : Revenus nets réels - retraits déjà initiés
  const totalPaidOut = payouts.reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = Math.max(0, displayNetEarnings - totalPaidOut);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState(() => 
    appMode === 'real' ? (availableBalance > 0 ? availableBalance.toFixed(2) : '0.00') : '1245.80'
  );
  const [withdrawMethod, setWithdrawMethod] = useState<'Virement bancaire (SEPA/SWIFT)' | 'Stripe' | 'PayPal' | 'Wise'>('Virement bancaire (SEPA/SWIFT)');
  const [accountDetails, setAccountDetails] = useState('US89 3000 4000 0001 2345 6789 012');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState(false);

  // Store customization & additional vendor contact form state
  const [storeName, setStoreName] = useState(currentUser?.company || currentUser?.name || storeSettings.store_name);
  const [tagline, setTagline] = useState(storeSettings.tagline || (currentUser?.specialty ? `Atelier spécialisé en ${currentUser.specialty}` : ''));
  const [bio, setBio] = useState(currentUser?.bio || storeSettings.bio || '');
  const [logoUrl, setLogoUrl] = useState(currentUser?.avatar || storeSettings.logo_url);
  const [bannerUrl, setBannerUrl] = useState(currentUser?.banner_url || storeSettings.banner_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200');
  const [address, setAddress] = useState(currentUser?.address || storeSettings.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || storeSettings.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || storeSettings.whatsapp || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.contact_email || storeSettings.contact_email || currentUser?.email || '');
  const [primaryColor, setPrimaryColor] = useState(storeSettings.primary_color || '#2563eb');

  // Sync store settings whenever currentUser changes (perserve information entered in carousel)
  React.useEffect(() => {
    if (currentUser) {
      setStoreName(currentUser.company || currentUser.name || storeSettings.store_name || '');
      setTagline(storeSettings.tagline || (currentUser.specialty ? `Atelier certifié ${currentUser.specialty}` : ''));
      setBio(currentUser.bio || storeSettings.bio || '');
      setLogoUrl(currentUser.avatar || storeSettings.logo_url || '');
      setBannerUrl(currentUser.banner_url || storeSettings.banner_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200');
      setAddress(currentUser.address || storeSettings.address || '');
      setPhone(currentUser.phone || storeSettings.phone || '');
      setWhatsapp(currentUser.whatsapp || storeSettings.whatsapp || '');
      setContactEmail(currentUser.contact_email || storeSettings.contact_email || currentUser.email || '');
      setPrimaryColor(storeSettings.primary_color || '#2563eb');
    }
  }, [currentUser, storeSettings]);

  // Contextual Sales Label based on vendor specialty
  const contextualSalesLabel = React.useMemo(() => {
    const spec = (currentUser?.specialty || '').toLowerCase();
    if (spec.includes('revit') || spec.includes('bim')) return 'Mes ventes & livraisons BIM';
    if (spec.includes('struct') || spec.includes('calcul')) return "Mes ventes d'études & calculs";
    if (spec.includes('mep') || spec.includes('fluide')) return 'Mes ventes de plans CVC';
    if (spec.includes('mobilier') || spec.includes('design')) return 'Mes ventes de modèles 3D';
    if (spec.includes('plugin') || spec.includes('logiciel')) return 'Mes ventes de plugins & outils';
    return 'Mes ventes';
  }, [currentUser?.specialty]);

  // Multi-vendeurs : Clients propres à ce vendeur
  const vendorClients = React.useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      email: string;
      ordersCount: number;
      totalSpent: number;
      lastOrderDate: string;
      products: string[];
    }>();

    vendorOrders.forEach(o => {
      const email = o.customer_email.toLowerCase();
      const vendorItems = o.items.filter(i => 
        i.product.vendor_name === currentVendorName || 
        i.product.vendor_slug === currentVendorSlug || 
        (appMode === 'demo' && i.product.vendor_name === 'StudioArch')
      );
      const spent = vendorItems.reduce((acc, i) => acc + i.price, 0);
      const titles = vendorItems.map(i => i.product.title);

      if (map.has(email)) {
        const item = map.get(email)!;
        item.ordersCount += 1;
        item.totalSpent += spent;
        item.products = Array.from(new Set([...item.products, ...titles]));
      } else {
        map.set(email, {
          id: o.customer_id || `cust_${Date.now()}`,
          name: o.customer_name,
          email: o.customer_email,
          ordersCount: 1,
          totalSpent: spent,
          lastOrderDate: o.created_at,
          products: titles
        });
      }
    });

    if (map.size === 0 && appMode === 'demo') {
      return [
        {
          id: 'demo_c1',
          name: 'Thomas Leroy',
          email: 'thomas.leroy@architectes-paris.com',
          ordersCount: 3,
          totalSpent: 162.90,
          lastOrderDate: '17 avr. 2025',
          products: ['Bibliothèque de familles Revit - Escaliers', 'Mobilier 3D - Collection scandinave']
        },
        {
          id: 'demo_c2',
          name: 'Sarah Benali',
          email: 's.benali@algerie-bim.com',
          ordersCount: 2,
          totalSpent: 78.90,
          lastOrderDate: '16 avr. 2025',
          products: ['Maison individuelle moderne (Revit)']
        }
      ];
    }

    return Array.from(map.values());
  }, [vendorOrders, currentVendorName, currentVendorSlug, appMode]);

  const handleCopyVendorLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/vendeur/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const filteredProducts = vendorProducts.filter(p => {
    if (productTab === 'published' && p.status !== 'published') return false;
    if (productTab === 'draft' && p.status !== 'draft') return false;
    if (productTab === 'pending' && p.status !== 'pending') return false;
    if (productSearch.trim()) {
      return p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
             p.software.toLowerCase().includes(productSearch.toLowerCase()) ||
             p.category.toLowerCase().includes(productSearch.toLowerCase());
    }
    return true;
  });

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: VendorStoreSettings = {
      ...storeSettings,
      store_name: storeName,
      tagline,
      bio,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      address,
      phone,
      whatsapp,
      contact_email: contactEmail,
      primary_color: primaryColor
    };
    onUpdateStoreSettings(updatedSettings);

    // Synchronisation du profil vendeur complet (logo, adresse, tel, whatsapp, email)
    if (currentUser) {
      try {
        await supabaseAuthService.updateUserProfile(currentUser.id, {
          company: storeName,
          bio,
          avatar: logoUrl,
          address,
          phone,
          whatsapp,
          contact_email: contactEmail
        });
      } catch (err) {
        console.warn('Update user profile note:', err);
      }
    }

    setSavedSettingsFeedback(true);
    setTimeout(() => setSavedSettingsFeedback(false), 3000);
  };

  const handleConfirmWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(withdrawAmount) || 0;
    const newPayout: PayoutTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      amount: amountVal,
      method: withdrawMethod,
      account_info: accountDetails,
      status: 'pending'
    };

    if (appMode === 'real') {
      try {
        await supabaseDatabaseService.requestPayout({
          vendor_id: currentUser?.id || 'v_user',
          vendor_name: currentVendorName,
          gross_revenue: amountVal / 0.85,
          payout_amount: amountVal,
          fee_percent: 15,
          platform_fee: (amountVal / 0.85) * 0.15,
          method: withdrawMethod,
          account_info: accountDetails
        });
      } catch (err) {
        console.warn('Payout Supabase sync note:', err);
      }
    }

    setPayouts([newPayout, ...payouts]);
    setPayoutSuccessMsg(true);
    setTimeout(() => {
      setPayoutSuccessMsg(false);
      setIsWithdrawModalOpen(false);
    }, 1500);
  };

  const navMenuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'products', label: 'Mes produits', icon: Package, badge: vendorProducts.length },
    { id: 'revenue', label: 'Mes revenus', icon: Wallet, highlight: true },
    { id: 'sales', label: contextualSalesLabel, icon: ShoppingBag, badge: vendorOrders.length || (appMode === 'demo' ? 48 : undefined) },
    { id: 'clients', label: 'Mes clients', icon: Users, badge: vendorClients.length },
    { id: 'store', label: 'Ma boutique & Coordonnées', icon: Store },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'reviews', label: 'Avis clients', icon: Star, badge: appMode === 'demo' ? '124' : '0' },
  ];

  const getProductTypeIcon = (type: ProductType) => {
    switch (type) {
      case 'construction_plan': return FileCode;
      case 'object_3d': return Box;
      case 'digital_file': return FolderArchive;
      case 'pdf_document': return FileText;
      case 'software_plugin': return Cpu;
      case 'activation_key': return Key;
      case 'video_course': return Video;
      case 'consulting_service': return Headphones;
      case 'protected_link': return Link2;
      default: return Package;
    }
  };

  // Check Vendor Role & Access
  const isVendor = currentUser && currentUser.role === 'vendor';

  if (!isVendor) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a101f] border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-lg shadow-blue-500/10">
            <Briefcase className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold font-mono">
              Espace Gestion Vendeur & Atelier Créateur
            </span>
            <h2 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white">
              Espace Réservé aux Vendeurs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {currentUser
                ? `Vous êtes actuellement connecté en tant que ${currentUser.name} (${currentUser.role === 'customer' ? 'Client Acheteur' : 'Administrateur'}). Pour gérer une boutique et publier des modèles BIM, activez un profil Vendeur.`
                : `Connectez-vous avec vos identifiants Vendeur pour administrer vos produits et retraits, ou créez votre compte vendeur pour obtenir immédiatement votre lien unique de vitrine.`
              }
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onOpenAuth ? onOpenAuth('signup_vendor') : null}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Créer mon Compte Vendeur & Obtenir mon Lien</span>
            </button>

            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : null}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-blue-400" />
              <span>Se Connecter avec mes Identifiants Vendeur</span>
            </button>

            {appMode === 'demo' && (
              <button
                type="button"
                onClick={async () => {
                  const { user } = await supabaseAuthService.signIn('alex@studioarch-paris.com', 'password123');
                  if (user && onUserAuthenticated) {
                    onUserAuthenticated(user);
                  }
                }}
                className="w-full py-2 rounded-xl bg-blue-950/40 hover:bg-blue-950/60 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Connexion 1-Clic Vendeur Démo (StudioArch)</span>
              </button>
            )}

            <button
              onClick={onNavigateToMarketplace}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a101f] border-b border-slate-800">
        <NexusLogo size="sm" onClick={onNavigateToMarketplace} />
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VENDOR SIDEBAR WITH "MES REVENUS" */}
      {/* ========================================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0a101f] border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 transition-transform duration-300
        md:relative md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="space-y-6">
          {/* Logo & close for mobile */}
          <div className="flex items-center justify-between">
            <NexusLogo size="sm" showSubtitle onClick={onNavigateToMarketplace} />
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with clear readable font size */}
          <nav className="space-y-1.5">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id as any);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                      : item.highlight
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/80 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Box */}
        <div className="pt-5 border-t border-slate-800 mt-6 space-y-3">
          {currentUser ? (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-xs text-blue-400 font-medium truncate">{currentUser.company || currentVendorName}</div>
                </div>
              </div>

              {/* Unique link pill */}
              <div className="flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
                <span className="text-slate-400 truncate">vendeur/{currentVendorSlug}</span>
                <button
                  onClick={() => handleCopyVendorLink(currentVendorSlug)}
                  className="text-blue-400 hover:text-white p-0.5"
                  title="Copier le lien de la boutique"
                >
                  {copiedSlug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2 text-center">
              <p className="text-xs text-slate-300">Vous visitez le tableau de bord vendeur.</p>
              {onOpenAuth && (
                <button
                  onClick={() => onOpenAuth('signup_vendor')}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
                >
                  Créer Mon Compte Vendeur
                </button>
              )}
            </div>
          )}

          <button
            onClick={onNavigateToMarketplace}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la marketplace</span>
          </button>
        </div>

      </aside>

      {/* Backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT WORKSPACE (Avec cartes blanches pour haute lisibilité) */}
      {/* ========================================================================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
        
        {/* ======================================================================= */}
        {/* 1. TABLEAU DE BORD (Cartes blanches lumineuses & KPIs en USD) */}
        {/* ======================================================================= */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header Title with Back & Add Product */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight">Tableau de bord créateur</h1>
                <p className="text-sm text-slate-400">
                  Atelier officiel de <strong>{currentVendorName}</strong> · Performances, ventes et solde en <strong>$ USD</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Effectuer un retrait</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un produit</span>
                </button>
              </div>
            </div>

            {/* VENDOR STORE UNIQUE LINK BANNER (Requis par l'utilisateur: vendeur/nom-unique) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold font-mono flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-400" />
                    Lien Unique Vendeur
                  </span>
                  {currentUser?.role === 'vendor' ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Compte Vendeur Connecté
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Attribué automatiquement</span>
                  )}
                </div>
                
                <div className="text-base sm:text-xl font-bold font-mono text-emerald-400 flex items-center gap-2">
                  <span>nexusbim.app/vendeur/{currentVendorSlug}</span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">
                  Votre vitrine publique dédiée : vos clients accèdent directement à tous vos modèles BIM sans intermédiaire.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => handleCopyVendorLink(currentVendorSlug)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all"
                >
                  {copiedSlug ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSlug ? 'Lien Copié !' : 'Copier le Lien Unique'}</span>
                </button>

                {onViewVendorStore && (
                  <button
                    onClick={() => onViewVendorStore(currentVendorSlug)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-700 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    <span>Visiter Ma Vitrine</span>
                  </button>
                )}
              </div>
            </div>

            {/* Unauthenticated Vendor Alert */}
            {!currentUser && onOpenAuth && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>
                    Vous êtes en mode démo. Créez un compte vendeur réel (via email, mot de passe et nom unique) pour enregistrer vos produits dans Supabase !
                  </span>
                </div>
                <button
                  onClick={() => onOpenAuth('signup_vendor')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold whitespace-nowrap shadow-sm"
                >
                  Créer Compte Vendeur
                </button>
              </div>
            )}

            {/* 4 KPI Cards EN FOND BLANC POUR HAUTE LISIBILITÉ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-2">
                <div className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">Ventes totales</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">${displayTotalSales.toFixed(2)} USD</div>
                <div className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Volume brut encaissé</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-2">
                <div className="text-xs sm:text-sm text-emerald-700 font-bold uppercase tracking-wider">Net Créateur (85%)</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">${displayNetEarnings.toFixed(2)} USD</div>
                <div className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Votre part nette de reversement</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-2">
                <div className="text-xs sm:text-sm text-blue-700 font-bold uppercase tracking-wider">Commission Nexus (15%)</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">${displayPlatformCut.toFixed(2)} USD</div>
                <div className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Frais d'hébergement & sécurité</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-2">
                <div className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">Commandes livrées</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{displayOrderCount}</div>
                <div className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold border border-purple-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>Transactions finalisées</span>
                </div>
              </div>
            </div>

            {/* Middle Grid: Evolution des ventes chart (Blanc) & Solde disponible */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sales Chart in White Card */}
              <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">Évolution des ventes</h3>
                    <p className="text-xs text-slate-500">Revenus bruts perçus en continu (USD)</p>
                  </div>
                  <div className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                    7 derniers jours
                  </div>
                </div>

                {/* SVG Line Chart on crisp white surface */}
                <div className="h-64 relative pt-4">
                  <svg className="w-full h-full" viewBox="0 0 700 200" fill="none" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="vendor-sales-grad-white" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="700" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="0" y1="160" x2="700" y2="160" stroke="#f1f5f9" strokeDasharray="3 3" />

                    <path
                      d="M 20 160 Q 120 170 200 130 T 400 90 T 550 110 T 680 50 L 680 190 L 20 190 Z"
                      fill="url(#vendor-sales-grad-white)"
                    />

                    <path
                      d="M 20 160 Q 120 170 200 130 T 400 90 T 550 110 T 680 50"
                      stroke="#2563eb"
                      strokeWidth="3.5"
                      fill="none"
                    />

                    {[
                      { x: 20, y: 160 },
                      { x: 200, y: 130 },
                      { x: 400, y: 90 },
                      { x: 550, y: 110 },
                      { x: 680, y: 50 }
                    ].map((dot, idx) => (
                      <circle key={idx} cx={dot.x} cy={dot.y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                    ))}
                  </svg>

                  <div className="flex justify-between text-xs font-mono font-medium text-slate-500 pt-2 border-t border-slate-100">
                    <span>12 Avr</span>
                    <span>13 Avr</span>
                    <span>14 Avr</span>
                    <span>15 Avr</span>
                    <span>16 Avr</span>
                    <span>17 Avr</span>
                    <span>18 Avr</span>
                  </div>
                </div>

              </div>

              {/* Solde & Retrait Card (4 cols) EN FOND BLANC */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Solde disponible avec action "Effectuer un retrait" */}
                <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">Solde disponible</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      availableBalance > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {availableBalance > 0 ? 'Actif' : '0.00 USD'}
                    </span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                    ${availableBalance.toFixed(2)} <span className="text-sm font-sans font-normal text-blue-600">USD</span>
                  </div>
                  
                  <button
                    onClick={() => availableBalance > 0 && setIsWithdrawModalOpen(true)}
                    disabled={availableBalance <= 0}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      availableBalance > 0 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer' 
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>Effectuer un retrait</span>
                  </button>
                  <p className="text-xs text-slate-500 text-center font-medium">
                    {availableBalance > 0 
                      ? 'Virement instantané sous 24h par SEPA / SWIFT / Stripe / Wise' 
                      : 'Aucun solde à retirer pour l\'instant ($0.00 USD)'}
                  </p>
                </div>

                {/* Quick Store Info Card */}
                <div className="p-5 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Ma boutique</span>
                    <button onClick={() => setActiveMenu('store')} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                      Personnaliser &rarr;
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={logoUrl || storeSettings.logo_url}
                      alt={storeName}
                      className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{storeName}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {appMode === 'demo' ? '4.8 ★ (124 avis clients vérifiés)' : '0.0 ★ (0 avis client)'}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom: Dernières ventes reçues (FOND BLANC LISIBLE) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Dernières ventes de la Maison</h3>
                  <p className="text-xs text-slate-500">Historique des transactions avec possibilité d'impression PDF</p>
                </div>
                <button onClick={() => setActiveMenu('sales')} className="text-xs sm:text-sm text-blue-600 font-bold hover:underline cursor-pointer">
                  Voir toutes les ventes &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-bold rounded-l-xl">Produit</th>
                      <th className="py-3 px-4 font-bold">Client</th>
                      <th className="py-3 px-4 font-bold">Montant ($ USD)</th>
                      <th className="py-3 px-4 font-bold">Date</th>
                      <th className="py-3 px-4 font-bold rounded-r-xl">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">Bibliothèque de familles Revit - Escaliers</td>
                      <td className="py-3.5 px-4 text-slate-600">Thomas L. (Atelier TL)</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">$84.00 USD</td>
                      <td className="py-3.5 px-4 text-slate-500">17 avr. 2025</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          Payée
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">Mobilier 3D - Collection scandinave</td>
                      <td className="py-3.5 px-4 text-slate-600">Build&Co Client</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">$29.90 USD</td>
                      <td className="py-3.5 px-4 text-slate-500">16 avr. 2025</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          Payée
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">Maison individuelle moderne (Revit)</td>
                      <td className="py-3.5 px-4 text-slate-600">Ingénierie Plus</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">$49.00 USD</td>
                      <td className="py-3.5 px-4 text-slate-500">15 avr. 2025</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                          En cours
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* 2. OPTION "MES REVENUS" (Demandée avec fond blanc pour visibilité) */}
        {/* ======================================================================= */}
        {activeMenu === 'revenue' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mes revenus & Versements</h1>
                <p className="text-sm text-slate-400">
                  Gérez vos gains, consultez vos factures et effectuez des retraits sécurisés en dollars américains ($ USD).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPrintModalConfig({ isOpen: true, type: 'all_sales', orders: vendorOrders })}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all border border-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Imprimer le relevé financier PDF</span>
                </button>

                <button
                  onClick={() => availableBalance > 0 && setIsWithdrawModalOpen(true)}
                  disabled={availableBalance <= 0}
                  className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                    availableBalance > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Effectuer un retrait</span>
                </button>
              </div>
            </div>

            {/* Financial Overview Cards in White Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-emerald-200 shadow-sm space-y-2">
                <div className="text-xs sm:text-sm text-emerald-700 font-bold uppercase tracking-wider">Solde disponible</div>
                <div className="text-3xl font-black text-slate-900 font-mono">${availableBalance.toFixed(2)} USD</div>
                <div className="text-xs text-slate-500 font-medium">
                  {availableBalance > 0 ? 'Prêt pour virement bancaire ou Stripe' : 'Solde initial à 0.00 USD'}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                <div className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">Revenus bruts totaux</div>
                <div className="text-3xl font-black text-slate-900 font-mono">${displayTotalSales.toFixed(2)} USD</div>
                <div className="text-xs text-emerald-600 font-bold">
                  {displayTotalSales > 0 ? `${vendorOrders.length} vente(s) enregistrée(s)` : '0 vente'}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                <div className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">Commission plateforme (15%)</div>
                <div className="text-3xl font-black text-slate-700 font-mono">${displayPlatformCut.toFixed(2)} USD</div>
                <div className="text-xs text-slate-500 font-medium">Hébergement & sécurisation transactions</div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                <div className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-wider">Revenus nets de l'atelier (85%)</div>
                <div className="text-3xl font-black text-blue-600 font-mono">${displayNetEarnings.toFixed(2)} USD</div>
                <div className="text-xs text-slate-500 font-medium">Revenus nets perçus ou disponibles</div>
              </div>

            </div>

            {/* Historical Transactions & Payouts Table in White Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Historique des demandes de retrait</h3>
                  <p className="text-xs text-slate-500">Suivi des virements bancaires et transactions vers vos comptes</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-bold rounded-l-xl">Réf. Transaction</th>
                      <th className="py-3 px-4 font-bold">Date de demande</th>
                      <th className="py-3 px-4 font-bold">Méthode de virement</th>
                      <th className="py-3 px-4 font-bold">Coordonnées / Compte</th>
                      <th className="py-3 px-4 font-bold">Montant ($ USD)</th>
                      <th className="py-3 px-4 font-bold">Statut</th>
                      <th className="py-3 px-4 font-bold text-right rounded-r-xl">Reçu PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {payouts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Aucun retrait n'a encore été effectué. Votre solde s'accumule avec vos ventes.
                        </td>
                      </tr>
                    ) : (
                      payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                          <td className="py-4 px-4 text-slate-600">{p.date}</td>
                          <td className="py-4 px-4 font-semibold text-slate-800">{p.method}</td>
                          <td className="py-4 px-4 text-slate-500 font-mono text-xs">{p.account_info}</td>
                          <td className="py-4 px-4 font-mono font-bold text-slate-900">${p.amount.toFixed(2)} USD</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {p.status === 'completed' ? 'Virement effectué' : 'En cours de traitement'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setPrintModalConfig({ isOpen: true, type: 'payout', payout: p })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold border border-slate-200 cursor-pointer"
                              title="Imprimer le reçu de virement"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Reçu PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. MES PRODUITS VIEW (Fond Blanc Lumineux & Haute Lisibilité) */}
        {/* ======================================================================= */}
        {activeMenu === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight">Mes produits & créations</h1>
                <p className="text-sm text-slate-400">
                  Gérez vos modèles BIM, objets 3D, fichiers ZIP, plugins, formations et leurs spécifications adaptées.
                </p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajouter un produit</span>
              </button>
            </div>

            {/* Filter Tabs in White Card */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm">
              
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setProductTab('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    productTab === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tous ({vendorProducts.length})
                </button>
                <button
                  onClick={() => setProductTab('published')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    productTab === 'published' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Publiés ({vendorProducts.filter(p => p.status === 'published').length})
                </button>
                <button
                  onClick={() => setProductTab('draft')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    productTab === 'draft' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Brouillons ({vendorProducts.filter(p => p.status === 'draft').length})
                </button>
                <button
                  onClick={() => setProductTab('pending')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    productTab === 'pending' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  En révision ({vendorProducts.filter(p => p.status === 'pending').length})
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher par titre, logiciel..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

            {/* Products Table with White Card for Maximum Contrast and Legibility */}
            {vendorProducts.length === 0 ? (
              <div className="p-10 sm:p-14 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                  <Package className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Vous n'avez pas encore publié de produit
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Publiez votre première maquette BIM, gabarit, famille Revit ou plugin. Vos créations s'afficheront instantanément dans votre boutique vitrine officielle et sur la marketplace.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter mon 1er produit</span>
                  </button>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm text-center space-y-3">
                <Search className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Aucun produit ne correspond à votre recherche</h3>
                <p className="text-xs text-slate-500">Essayez de modifier votre terme de recherche ou le filtre de statut.</p>
                <button
                  onClick={() => { setProductSearch(''); setProductTab('all'); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <div className="p-6 sm:p-7 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 font-bold rounded-l-xl">Produit & Type</th>
                      <th className="py-3 px-4 font-bold">Prix ($ USD)</th>
                      <th className="py-3 px-4 font-bold">Ventes</th>
                      <th className="py-3 px-4 font-bold">Statut</th>
                      <th className="py-3 px-4 font-bold text-right rounded-r-xl">Spécifications & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.map((p) => {
                    const TypeIcon = getProductTypeIcon(p.product_type);
                    return (
                      <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{p.title}</div>
                              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  <TypeIcon className="w-3 h-3" />
                                  <span>{p.software}</span>
                                </span>
                                <span>·</span>
                                <span className="text-slate-700">{p.category}</span>
                                <span>·</span>
                                <span className="text-slate-500 font-mono">{p.file_size}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-900 text-base">${p.price.toFixed(2)} USD</td>
                        <td className="py-4 px-4 font-mono text-slate-600 font-semibold">{p.sales_count}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.status === 'published' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {p.status === 'published' ? 'Publié' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsAddModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Modifier ce produit et sa photo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Modifier</span>
                            </button>
                            <button
                              onClick={() => setViewingProductSpecs(p)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Voir les détails techniques adaptés"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Détails</span>
                            </button>
                            <button
                              onClick={() => setProductToDelete(p)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}

          </div>
        )}

        {/* ======================================================================= */}
        {/* OPTION "MES CLIENTS" (Multi-vendeurs : clients ayant commandé chez ce vendeur) */}
        {/* ======================================================================= */}
        {activeMenu === 'clients' && (
          <div className="space-y-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mes clients acheteurs</h1>
                <p className="text-sm text-slate-400">
                  Clients ayant passé commande auprès de l'atelier <strong>{currentVendorName}</strong>.
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
                {vendorClients.length} client(s) actif(s)
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Portefeuille clients de votre boutique</h3>
                <span className="text-xs font-semibold text-slate-500">Isolation multi-vendeurs garantie</span>
              </div>

              {vendorClients.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Users className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">Aucun client pour l'instant</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Partagez votre lien boutique <strong>nexusbim.app/vendeur/{currentVendorSlug}</strong> pour enregistrer vos premières commandes.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-3 px-4 font-bold rounded-l-xl">Client / Agence</th>
                        <th className="py-3 px-4 font-bold">Email de contact</th>
                        <th className="py-3 px-4 font-bold">Commandes passées</th>
                        <th className="py-3 px-4 font-bold">Total dépensé ($ USD)</th>
                        <th className="py-3 px-4 font-bold">Dernier achat</th>
                        <th className="py-3 px-4 font-bold text-right rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {vendorClients.map((client) => (
                        <tr key={client.email} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div>{client.name}</div>
                                <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                                  {client.products.slice(0, 1).join(', ')}{client.products.length > 1 ? ` (+${client.products.length - 1})` : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-mono text-xs">{client.email}</td>
                          <td className="py-4 px-4 font-mono font-bold text-slate-800">{client.ordersCount} commande(s)</td>
                          <td className="py-4 px-4 font-mono font-bold text-emerald-700">${client.totalSpent.toFixed(2)} USD</td>
                          <td className="py-4 px-4 text-slate-500">{client.lastOrderDate}</td>
                          <td className="py-4 px-4 text-right">
                            <a
                              href={`mailto:${client.email}?subject=Suivi de commande Nexus BIM - ${currentVendorName}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Contacter</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 4. MA BOUTIQUE & COORDONNÉES (Informations Supplémentaires Vendeur) */}
        {/* ======================================================================= */}
        {activeMenu === 'store' && (
          <div className="space-y-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Ma boutique & Coordonnées</h1>
                <p className="text-sm text-slate-400">
                  Complétez votre profil vendeur : logo, bannière, adresse physique, téléphone, WhatsApp et email direct.
                </p>
              </div>

              {savedSettingsFeedback && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-bold animate-fadeIn">
                  <Check className="w-4 h-4" />
                  <span>Modifications de l'atelier enregistrées !</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Settings Form in White Card */}
              <form onSubmit={handleSaveStore} className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800">Nom de la boutique / Studio *</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800">Slogan court</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Ex : Familles BIM certifiées & Modélisation Revit"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Logo & Banner URLs + Direct File Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-slate-800">Logo de la Maison</label>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Uploader un fichier</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <img src={logoUrl} alt="Logo preview" className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100" />
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://.../logo.jpg"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-slate-800">Bannière de Vitrine</label>
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Uploader un fichier</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={bannerInputRef}
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <img src={bannerUrl} alt="Banner preview" className="w-16 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100" />
                      <input
                        type="text"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="https://.../banner.jpg"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Coordonnées : Adresse, Téléphone, WhatsApp, Email */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-4">
                  <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Coordonnées & Contact Direct Acheteurs</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800">Adresse physique du studio / Bureau</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex : 14 Boulevard Haussmann, 75009 Paris, France"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Téléphone Fixe / Mobile</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+33 1 42 68 00 00"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Professionnel</span>
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Email de Contact Direct</span>
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@studioarch.com"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-800">Biographie & Présentation détaillée</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800">Couleur d'accentuation</label>
                  <div className="flex items-center gap-3">
                    {['#2563eb', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setPrimaryColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${primaryColor === c ? 'scale-125 ring-2 ring-slate-900' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les coordonnées de mon atelier</span>
                  </button>
                </div>

              </form>

              {/* Live Preview Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aperçu en direct pour vos clients</div>
                
                <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl space-y-4 pb-6">
                  <div className="h-36 bg-slate-900 relative">
                    <img src={bannerUrl} alt="banner" className="w-full h-full object-cover brightness-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                  </div>

                  <div className="px-6 -mt-12 relative flex items-end gap-3.5">
                    <img
                      src={logoUrl}
                      alt="logo"
                      className="w-18 h-18 rounded-2xl object-cover border-4 border-slate-950 shadow-xl bg-slate-800"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">{storeName}</h3>
                      <p className="text-xs text-slate-400">{tagline}</p>
                    </div>
                  </div>

                  {/* Contact Badges in preview */}
                  <div className="px-6 space-y-2 text-xs">
                    {address && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{address}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {phone && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{phone}</span>
                        </span>
                      )}
                      {whatsapp && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-bold">
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </span>
                      )}
                      {contactEmail && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300">
                          <Mail className="w-3 h-3 text-blue-400" />
                          <span>{contactEmail}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {bio}
                  </div>

                  <div className="px-6 grid grid-cols-2 gap-3 text-xs">
                    {vendorProducts.slice(0, 2).map(p => (
                      <div key={p.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="font-bold text-white truncate text-xs">{p.title}</div>
                        <div className="text-blue-400 font-mono font-bold text-xs mt-1">${p.price.toFixed(2)} USD</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* 5. MES VENTES (ADAPTÉ AU CONTEXTE DU TYPE DE VENDEUR) */}
        {/* ======================================================================= */}
        {activeMenu === 'sales' && (
          <div className="space-y-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{contextualSalesLabel}</h1>
                <p className="text-sm text-slate-400">
                  Historique détaillé des transactions et livraisons directes pour l'atelier <strong>{currentVendorName}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPrintModalConfig({ isOpen: true, type: 'all_sales', orders: vendorOrders })}
                  disabled={vendorOrders.length === 0}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    vendorOrders.length > 0 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 cursor-pointer' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le grand livre des ventes PDF</span>
                </button>
              </div>
            </div>

            {/* Sales Table in White Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Registre officiel des ventes</h3>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {vendorOrders.length} vente(s) enregistrée(s)
                </span>
              </div>

              {vendorOrders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">Aucune vente enregistrée pour l'instant</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Votre vitrine <strong>nexusbim.app/vendeur/{currentVendorSlug}</strong> est active. Dès qu'un client achète l'un de vos produits, sa commande apparaîtra ici avec facture PDF téléchargeable.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-3 px-4 font-bold rounded-l-xl">Réf. & Date</th>
                        <th className="py-3 px-4 font-bold">Client Acheteur</th>
                        <th className="py-3 px-4 font-bold">Produits commandés</th>
                        <th className="py-3 px-4 font-bold">Total Brut</th>
                        <th className="py-3 px-4 font-bold text-emerald-700">Net Vendeur (85%)</th>
                        <th className="py-3 px-4 font-bold">Statut</th>
                        <th className="py-3 px-4 font-bold text-right rounded-r-xl">Facture PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {vendorOrders.map((ord) => {
                        const matchingItems = ord.items.filter(i => 
                          i.product.vendor_name === currentVendorName || 
                          i.product.vendor_slug === currentVendorSlug || 
                          (appMode === 'demo' && i.product.vendor_name === 'StudioArch')
                        );
                        const orderGross = matchingItems.reduce((sum, i) => sum + i.price, 0);
                        const orderNet = orderGross * 0.85;

                        return (
                          <tr key={ord.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-4 px-4 font-mono">
                              <div className="font-bold text-slate-900">{ord.id.slice(0, 10)}</div>
                              <div className="text-[11px] text-slate-500">{new Date(ord.created_at).toLocaleDateString('fr-FR')}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-900">{ord.customer_name}</div>
                              <div className="text-xs text-slate-500 font-mono">{ord.customer_email}</div>
                            </td>
                            <td className="py-4 px-4 max-w-xs">
                              {matchingItems.map((item, idx) => (
                                <div key={idx} className="truncate font-semibold text-slate-800 text-xs">
                                  • {item.product.title}
                                </div>
                              ))}
                            </td>
                            <td className="py-4 px-4 font-mono font-bold text-slate-900">${orderGross.toFixed(2)} USD</td>
                            <td className="py-4 px-4 font-mono font-black text-emerald-700">${orderNet.toFixed(2)} USD</td>
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                Payée & Livrée
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => setPrintModalConfig({ isOpen: true, type: 'sale', order: ord })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                                title="Imprimer la facture de vente"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Facture PDF</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 6. STATISTIQUES AVEC LOGIQUE DYNAMIQUE & IMPRESSION PDF */}
        {/* ======================================================================= */}
        {activeMenu === 'stats' && (
          <div className="space-y-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Statistiques de Performance</h1>
                <p className="text-sm text-slate-400">
                  Analytique commerciale en temps réel pour l'atelier <strong>{currentVendorName}</strong>.
                </p>
              </div>

              <button
                onClick={() => setPrintModalConfig({
                  isOpen: true,
                  type: 'stats',
                  statsData: {
                    grossSales: displayTotalSales,
                    netEarnings: displayNetEarnings,
                    orderCount: vendorOrders.length,
                    avgOrder: vendorOrders.length > 0 ? (displayTotalSales / vendorOrders.length) : 0,
                    productsCount: vendorProducts.length
                  }
                })}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer les statistiques PDF</span>
              </button>
            </div>

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chiffre d'Affaires Brut</span>
                <div className="text-3xl font-black text-slate-900 font-mono">${displayTotalSales.toFixed(2)} USD</div>
                <div className="text-xs text-slate-500">{vendorOrders.length} transaction(s)</div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Revenus Nets Vendeur (85%)</span>
                <div className="text-3xl font-black text-emerald-700 font-mono">${displayNetEarnings.toFixed(2)} USD</div>
                <div className="text-xs text-slate-500">Reversement garanti sous 24h</div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Panier Moyen</span>
                <div className="text-3xl font-black text-blue-600 font-mono">
                  ${vendorOrders.length > 0 ? (displayTotalSales / vendorOrders.length).toFixed(2) : '0.00'} USD
                </div>
                <div className="text-xs text-slate-500">Moyenne par commande</div>
              </div>

              <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produits Actifs en Ligne</span>
                <div className="text-3xl font-black text-slate-900 font-mono">{vendorProducts.length}</div>
                <div className="text-xs text-slate-500">Ressources téléchargeables</div>
              </div>
            </div>

            {/* Visual Performance Charts */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Répartition des ventes par logiciel & format</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Revit (.rvt / .rfa)', pct: displayTotalSales > 0 ? 65 : 0, color: 'bg-blue-600' },
                  { label: 'openBIM / IFC 4 (.ifc)', pct: displayTotalSales > 0 ? 20 : 0, color: 'bg-emerald-600' },
                  { label: 'Dossiers techniques PDF', pct: displayTotalSales > 0 ? 10 : 0, color: 'bg-purple-600' },
                  { label: 'Plugins & Scripts (.exe / .dyn)', pct: displayTotalSales > 0 ? 5 : 0, color: 'bg-amber-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono">{item.pct}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 7. AVIS CLIENTS (MIS À ZÉRO PAR DÉFAUT EN MODE RÉEL) */}
        {/* ======================================================================= */}
        {activeMenu === 'reviews' && (
          <div className="space-y-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Avis & Évaluations Clients</h1>
                <p className="text-sm text-slate-400">
                  Retours d'expérience et notes certifiées laissées par vos acheteurs.
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{appMode === 'demo' ? '4.8 / 5.0 (124 avis)' : '0.0 / 5.0 (0 avis)'}</span>
              </div>
            </div>

            <div className="p-8 sm:p-14 rounded-3xl bg-white text-slate-900 border border-slate-200/90 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto">
                <Star className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {appMode === 'demo' ? '124 avis clients certifiés vérifiés' : 'Aucun avis client pour le moment'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  {appMode === 'demo' 
                    ? 'Tous les avis de la démo sont notés 4.8 étoiles sur 5.'
                    : 'Les évaluations et commentaires s\'afficheront ici automatiquement au fur et à mesure que vos acheteurs téléchargent et utilisent vos modèles BIM.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* EFFECTUER UN RETRAIT MODAL (Fond Blanc Lumineux & Haute Lisibilité) */}
      {/* ========================================================================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Effectuer un retrait</h3>
                  <p className="text-xs text-slate-500">Transférez vos gains en $ USD vers votre compte bancaire</p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {payoutSuccessMsg ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-extrabold text-emerald-900">Demande de retrait transmise !</h4>
                <p className="text-xs text-slate-600">
                  Un montant de <strong>${withdrawAmount} USD</strong> a été initié vers {withdrawMethod}. Traitement sous 24h ouvrées.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmWithdrawal} className="space-y-4 text-xs sm:text-sm">
                
                {/* Available balance highlight */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Solde disponible :</span>
                  <span className="font-mono font-black text-emerald-700 text-xl">${availableBalance.toFixed(2)} USD</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold">Montant à retirer ($ USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      max={availableBalance}
                      required
                      disabled={availableBalance <= 0}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-14 py-3 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={availableBalance <= 0}
                      onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                      className="absolute right-3 top-2.5 text-xs text-blue-600 font-bold hover:underline disabled:opacity-40 cursor-pointer"
                    >
                      Max
                    </button>
                  </div>
                  {availableBalance <= 0 && (
                    <p className="text-xs text-rose-500 font-medium">Vous n'avez aucun fonds disponible à retirer ($0.00 USD).</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold">Méthode de virement *</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-semibold text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Virement bancaire (SEPA/SWIFT)">Virement bancaire (SEPA / SWIFT)</option>
                    <option value="Stripe">Stripe Connect Payout</option>
                    <option value="Wise">Wise (TransferWise)</option>
                    <option value="PayPal">PayPal Business</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold">IBAN ou Email de compte bénéficiaire *</label>
                  <input
                    type="text"
                    required
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    placeholder="US89 3000 ... ou email@banque.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Interface GUI prête pour connexion directe à Supabase et Stripe Payouts.</span>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={availableBalance <= 0 || (parseFloat(withdrawAmount) || 0) <= 0 || (parseFloat(withdrawAmount) || 0) > availableBalance}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      availableBalance > 0 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Confirmer le retrait
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW TECHNICAL SPECIFICATIONS MODAL (Spécifications dynamiques adaptées) */}
      {/* ========================================================================= */}
      {viewingProductSpecs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Spécifications techniques adaptées
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fiche générée automatiquement pour le produit : {viewingProductSpecs.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingProductSpecs(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Header */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={viewingProductSpecs.image_url}
                alt={viewingProductSpecs.title}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{viewingProductSpecs.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span className="font-semibold text-blue-700">{viewingProductSpecs.software}</span>
                  <span>·</span>
                  <span>{viewingProductSpecs.category}</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-slate-900">${viewingProductSpecs.price.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            {/* Dynamic Metadata details */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Caractéristiques techniques enregistrées
              </label>
              
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs sm:text-sm text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed font-sans">
                {viewingProductSpecs.detailed_description || viewingProductSpecs.description}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Format :</span>
                <span className="font-bold font-mono text-slate-900">{viewingProductSpecs.file_format}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Poids :</span>
                <span className="font-bold font-mono text-slate-900">{viewingProductSpecs.file_size}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Compatibilité :</span>
                <span className="font-bold text-slate-900">{viewingProductSpecs.version_compatibility || 'Universel'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block">Licence :</span>
                <span className="font-bold text-slate-900">{viewingProductSpecs.license_type}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingProductSpecs(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-colors"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        onAddProduct={onAddProduct}
        onUpdateProduct={onUpdateProduct}
        initialProduct={editingProduct}
        vendorName={currentVendorName}
        vendorSlug={currentVendorSlug}
        vendorAvatar={currentUser?.avatar}
        vendorId={currentUser?.id}
      />

      {/* Print PDF Invoice & Report Modal */}
      <PrintInvoiceModal
        isOpen={printModalConfig.isOpen}
        onClose={() => setPrintModalConfig({ ...printModalConfig, isOpen: false })}
        type={printModalConfig.type}
        order={printModalConfig.order}
        orders={vendorOrders}
        payout={printModalConfig.payout}
        storeSettings={{
          ...storeSettings,
          store_name: storeName,
          logo_url: logoUrl,
          banner_url: bannerUrl,
          phone,
          whatsapp,
          address,
          contact_email: contactEmail
        }}
        currentUser={currentUser}
        statsData={printModalConfig.type === 'stats' ? {
          grossSales: displayTotalSales,
          netEarnings: displayNetEarnings,
          orderCount: vendorOrders.length,
          avgOrder: vendorOrders.length > 0 ? (displayTotalSales / vendorOrders.length) : 0,
          productsCount: vendorProducts.length
        } : undefined}
      />

      {/* Product Deletion Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Supprimer ce produit ?</h3>
                <p className="text-xs text-slate-500">Cette action est définitive et irréversible</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-sm font-bold text-slate-900">{productToDelete.title}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold text-blue-700">{productToDelete.software}</span>
                <span>·</span>
                <span>{productToDelete.category}</span>
                <span>·</span>
                <span className="font-mono font-bold text-slate-900">${productToDelete.price.toFixed(2)} USD</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Êtes-vous certain de vouloir supprimer cette ressource de votre catalogue vendeur ? Le fichier et sa licence associée ne seront plus accessibles à la vente.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
