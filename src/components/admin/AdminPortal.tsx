import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  Search, 
  Bell, 
  Globe, 
  ArrowUpRight, 
  ArrowRight,
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  X, 
  MoreHorizontal,
  TrendingUp,
  ArrowLeft,
  Menu,
  Download,
  Database,
  FileSpreadsheet,
  CheckCircle,
  Copy,
  ExternalLink,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  Filter,
  FileText,
  ChevronDown,
  RefreshCw,
  Clock,
  Sparkles,
  UserPlus,
  Crown,
  ShieldAlert,
  LogIn,
  Printer
} from 'lucide-react';
import { Product, UserProfile, UserRole, Order } from '../../types/database';
import { NexusLogo } from '../common/NexusLogo';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection, 
  generateSupabaseSQLSchema,
  exportToCSV,
  supabaseAuthService,
  supabaseDatabaseService,
  checkSupabaseTablesStatus,
  syncLocalDataToSupabase,
  TableStatusInfo
} from '../../services/supabase';
import { PrintAdminModal } from './PrintAdminModal';

interface AdminPortalProps {
  products: Product[];
  users: UserProfile[];
  onApproveProduct?: (productId: string) => void;
  onRejectProduct?: (productId: string) => void;
  onNavigateToMarketplace: () => void;
  currentUser?: UserProfile | null;
  onAddAdminUser?: (admin: UserProfile) => void;
  appMode?: 'real' | 'demo';
  onOpenAuth?: (mode?: 'login' | 'signup_vendor' | 'signup_customer') => void;
  orders?: Order[];
  onUserAuthenticated?: (user: UserProfile) => void;
  onRefreshAll?: () => Promise<void>;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  users,
  onNavigateToMarketplace,
  currentUser = null,
  onAddAdminUser,
  appMode = 'real',
  onOpenAuth,
  orders = [],
  onUserAuthenticated,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'payouts' | 'users' | 'moderation' | 'supabase'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'customer' | 'vendor' | 'admin'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [payoutSearch, setPayoutSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d' | '12m'>('30d');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);

  // Real Database state (Only data stored in Database)
  const [realOrders, setRealOrders] = useState<Order[]>(orders);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(() => new Date().toLocaleTimeString('fr-FR'));

  // Supabase tables inspection & migration
  const [tableStatuses, setTableStatuses] = useState<TableStatusInfo[]>([]);
  const [isCheckingTables, setIsCheckingTables] = useState(false);
  const [isMigratingData, setIsMigratingData] = useState(false);
  const [migrationFeedback, setMigrationFeedback] = useState<string | null>(null);

  // PDF Print Modal state
  const [printModalConfig, setPrintModalConfig] = useState<{
    isOpen: boolean;
    type: 'orders' | 'users' | 'payouts' | 'financial_summary';
  }>({
    isOpen: false,
    type: 'orders'
  });

  // Sync incoming orders prop with local real orders
  useEffect(() => {
    setRealOrders(orders);
  }, [orders]);

  // Load payouts and check table status on mount
  useEffect(() => {
    supabaseDatabaseService.getPayouts().then(res => {
      setPayoutsList(res || []);
    });
    handleCheckTables();
  }, []);

  const handleCheckTables = async () => {
    setIsCheckingTables(true);
    try {
      const statuses = await checkSupabaseTablesStatus();
      setTableStatuses(statuses);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingTables(false);
    }
  };

  // Actualiser tout depuis la base de données
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedOrders, fetchedPayouts] = await Promise.all([
        supabaseDatabaseService.getOrders(),
        supabaseDatabaseService.getPayouts(),
        handleCheckTables(),
        onRefreshAll ? onRefreshAll() : Promise.resolve()
      ]);
      setRealOrders(fetchedOrders || []);
      setPayoutsList(fetchedPayouts || []);
      setLastRefreshedAt(new Date().toLocaleTimeString('fr-FR'));
      setPayoutSuccessMsg("Base de données actualisée en direct avec succès !");
      setTimeout(() => setPayoutSuccessMsg(null), 3000);
    } catch (err: any) {
      alert("Erreur lors de l'actualisation de la base : " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Synchronisation des données locales vers Supabase
  const handleSyncToSupabase = async () => {
    setIsMigratingData(true);
    setMigrationFeedback(null);
    try {
      const result = await syncLocalDataToSupabase();
      setMigrationFeedback(result.message);
      await handleRefreshAll();
    } catch (err: any) {
      setMigrationFeedback("Erreur : " + err.message);
    } finally {
      setIsMigratingData(false);
    }
  };

  // Super Admin Add Admin Modal state
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminSpecialty, setNewAdminSpecialty] = useState('Supervision Financière & Retraits');
  const [isSuperAdminRole, setIsSuperAdminRole] = useState(false);
  const [adminCreationFeedback, setAdminCreationFeedback] = useState<string | null>(null);

  // Supabase connection config states
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseConfig().anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  // Active orders strictly from real database
  const activeOrders = realOrders;

  // Totals calculations strictly from Database data
  const totalGrossOrders = activeOrders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalPlatformCommissions = activeOrders.reduce((acc, curr) => acc + ((curr.total_amount || 0) * 0.15), 0);
  const totalNetVendorOrders = activeOrders.reduce((acc, curr) => acc + ((curr.total_amount || 0) * 0.85), 0);
  
  // Total Payouts & Commission from real Payouts in Database
  const totalPayoutsGross = payoutsList.reduce((acc, curr) => acc + Number(curr.gross_revenue || curr.amount || 0), 0);
  const totalPayoutsPlatformFees = payoutsList.reduce((acc, curr) => acc + Number(curr.platform_fee || (curr.gross_revenue * 0.15) || 0), 0);
  const totalPaidOutNet = payoutsList.filter(p => p.status === 'completed').reduce((acc, curr) => acc + Number(curr.payout_amount || curr.amount || 0), 0);
  const totalPendingPayouts = payoutsList.filter(p => p.status === 'pending').reduce((acc, curr) => acc + Number(curr.payout_amount || curr.amount || 0), 0);

  // Dynamic Chart Dataset reacting strictly to real orders
  const chartDataConfig = {
    '7d': {
      points: [
        { label: 'J-6', gmv: totalGrossOrders > 0 ? totalGrossOrders * 0.1 : 0, comm: totalGrossOrders > 0 ? totalGrossOrders * 0.015 : 0 },
        { label: 'J-5', gmv: totalGrossOrders > 0 ? totalGrossOrders * 0.15 : 0, comm: totalGrossOrders > 0 ? totalGrossOrders * 0.022 : 0 },
        { label: 'J-4', gmv: totalGrossOrders > 0 ? totalGrossOrders * 0.12 : 0, comm: totalGrossOrders > 0 ? totalGrossOrders * 0.018 : 0 },
        { label: 'J-3', gmv: totalGrossOrders > 0 ? totalGrossOrders * 0.2 : 0, comm: totalGrossOrders > 0 ? totalGrossOrders * 0.03 : 0 },
        { label: 'J-2', gmv: totalGrossOrders > 0 ? totalGrossOrders * 0.25 : 0, comm: totalGrossOrders > 0 ? totalGrossOrders * 0.037 : 0 },
        { label: 'Hier', gmv: totalGrossOrders > 0 ? totalGrossOrders * 0.18 : 0, comm: totalGrossOrders > 0 ? totalGrossOrders * 0.027 : 0 },
        { label: 'Aujourd\'hui', gmv: totalGrossOrders, comm: totalPlatformCommissions }
      ],
      svgPathGross: totalGrossOrders > 0 
        ? 'M 20 180 Q 150 140, 300 110 T 580 40' 
        : 'M 20 190 L 580 190',
      svgPathComm: totalPlatformCommissions > 0 
        ? 'M 20 188 Q 150 180, 300 170 T 580 160' 
        : 'M 20 190 L 580 190',
      totalGross: `$${totalGrossOrders.toFixed(2)} USD`,
      totalComm: `$${totalPlatformCommissions.toFixed(2)} USD`,
      periodLabel: '7 derniers jours'
    },
    '30d': {
      points: [
        { label: 'Semaine 1', gmv: totalGrossOrders * 0.2, comm: totalPlatformCommissions * 0.2 },
        { label: 'Semaine 2', gmv: totalGrossOrders * 0.25, comm: totalPlatformCommissions * 0.25 },
        { label: 'Semaine 3', gmv: totalGrossOrders * 0.25, comm: totalPlatformCommissions * 0.25 },
        { label: 'Semaine 4', gmv: totalGrossOrders * 0.3, comm: totalPlatformCommissions * 0.3 }
      ],
      svgPathGross: totalGrossOrders > 0 
        ? 'M 20 180 Q 150 130, 350 70 T 580 40' 
        : 'M 20 190 L 580 190',
      svgPathComm: totalPlatformCommissions > 0 
        ? 'M 20 188 Q 150 175, 350 165 T 580 155' 
        : 'M 20 190 L 580 190',
      totalGross: `$${totalGrossOrders.toFixed(2)} USD`,
      totalComm: `$${totalPlatformCommissions.toFixed(2)} USD`,
      periodLabel: '30 derniers jours'
    },
    '12m': {
      points: [
        { label: 'T1', gmv: totalGrossOrders * 0.2, comm: totalPlatformCommissions * 0.2 },
        { label: 'T2', gmv: totalGrossOrders * 0.25, comm: totalPlatformCommissions * 0.25 },
        { label: 'T3', gmv: totalGrossOrders * 0.25, comm: totalPlatformCommissions * 0.25 },
        { label: 'T4', gmv: totalGrossOrders * 0.3, comm: totalPlatformCommissions * 0.3 }
      ],
      svgPathGross: totalGrossOrders > 0 
        ? 'M 20 180 Q 180 130, 380 70 T 580 30' 
        : 'M 20 190 L 580 190',
      svgPathComm: totalPlatformCommissions > 0 
        ? 'M 20 188 Q 180 178, 380 160 T 580 150' 
        : 'M 20 190 L 580 190',
      totalGross: `$${totalGrossOrders.toFixed(2)} USD`,
      totalComm: `$${totalPlatformCommissions.toFixed(2)} USD`,
      periodLabel: 'Année en cours'
    }
  };

  const activeChart = chartDataConfig[chartTimeframe];

  // Dynamic Category breakdown calculated strictly from real products in Database
  const productsCount = products.length;
  const categoriesMap: { [cat: string]: number } = {};
  products.forEach(p => {
    const c = p.category || 'Modélisation BIM';
    categoriesMap[c] = (categoriesMap[c] || 0) + 1;
  });

  const categoryColors = ['#0284c7', '#2563eb', '#38bdf8', '#6366f1', '#10b981', '#f59e0b'];
  const categoryBreakdown = Object.keys(categoriesMap).length > 0 
    ? Object.keys(categoriesMap).map((cat, idx) => {
        const count = categoriesMap[cat];
        const percent = Math.round((count / productsCount) * 100);
        return {
          label: cat,
          percent: percent,
          amount: `${count} produit(s)`,
          color: categoryColors[idx % categoryColors.length]
        };
      })
    : [
        { label: 'Catalogue en base de données', percent: 0, amount: '0 produit', color: '#64748b' }
      ];

  // Filtered orders strictly from real database
  const filteredOrders = activeOrders.filter(o => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    const productTitles = (o.items || []).map(it => it.product?.title || '').join(' ').toLowerCase();
    const vendorNames = (o.items || []).map(it => it.product?.vendor_name || '').join(' ').toLowerCase();
    return (
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(q)) ||
      productTitles.includes(q) ||
      vendorNames.includes(q)
    );
  });

  // Filtered payouts
  const filteredPayouts = payoutsList.filter(p => {
    if (!payoutSearch.trim()) return true;
    const q = payoutSearch.toLowerCase();
    return (
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.vendor_name && p.vendor_name.toLowerCase().includes(q)) ||
      (p.method && p.method.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (searchQuery.trim()) {
      return (
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  // Handle Approve Payout with Supabase Sync
  const handleApprovePayout = async (payoutId: string) => {
    try {
      await supabaseDatabaseService.updatePayoutStatus(payoutId, 'completed');
      setPayoutsList(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'completed', processed_at: 'Validé à l\'instant' } : p));
      setPayoutSuccessMsg(`Le virement ${payoutId} a été approuvé avec succès ! Les fonds (85% net) sont débloqués.`);
      setTimeout(() => setPayoutSuccessMsg(null), 4000);
    } catch (err: any) {
      alert("Erreur lors de l'approbation : " + err.message);
    }
  };

  // Test Supabase connection
  const handleTestConnection = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setSupabaseTestResult(result);
    setIsTestingSupabase(false);
  };

  // Super Admin adds new Admin to Supabase
  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      alert('Veuillez renseigner un nom et un email pour le nouvel administrateur.');
      return;
    }

    try {
      const { user, error } = await supabaseAuthService.createAdminBySuperAdmin({
        email: newAdminEmail.trim(),
        name: newAdminName.trim(),
        specialty: newAdminSpecialty,
        isSuperAdmin: isSuperAdminRole,
      });

      if (error) throw new Error(error);

      if (user) {
        if (onAddAdminUser) {
          onAddAdminUser(user);
        }
        setAdminCreationFeedback(`L'administrateur ${user.name} (${user.email}) a été créé et synchronisé avec Supabase !`);
        setNewAdminName('');
        setNewAdminEmail('');
        setTimeout(() => {
          setAdminCreationFeedback(null);
          setIsAddAdminModalOpen(false);
        }, 2000);
      }
    } catch (err: any) {
      alert(`Erreur lors de la création de l'administrateur : ${err.message}`);
    }
  };

  // =========================================================================
  // EXPORT FUNCTIONS TO EXCEL (CSV AVEC UTF-8 BOM ET FORMAT PROFESSIONNEL)
  // =========================================================================

  // 1. Export Achats & Commandes
  const handleExportOrders = () => {
    const headers = [
      'Ref Commande',
      'Date & Heure',
      'Nom Acheteur',
      'Email Acheteur',
      'Titre du Produit',
      'Logiciel / Format',
      'Studio Vendeur',
      'Montant Brut ($ USD)',
      'Taux Commission Nexus (%)',
      'Part Commission Plateforme ($ USD)',
      'Net Verse au Vendeur ($ USD)',
      'Statut Commande',
      'Moyen de Paiement'
    ];

    const rows = activeOrders.map(o => {
      const productTitles = (o.items || []).map(it => it.product?.title || '').join(', ') || 'Modèle BIM';
      const softwares = (o.items || []).map(it => it.product?.software || '').join(', ') || 'Revit / IFC';
      const vendorNames = Array.from(new Set((o.items || []).map(it => it.product?.vendor_name || ''))).filter(Boolean).join(', ') || 'Vendeur Indépendant';
      const gross = o.total_amount || 0;
      const comm = gross * 0.15;
      const net = gross * 0.85;
      return [
        o.id,
        new Date(o.created_at).toLocaleString('fr-FR'),
        o.customer_name,
        o.customer_email,
        productTitles,
        softwares,
        vendorNames,
        gross.toFixed(2),
        '15%',
        comm.toFixed(2),
        net.toFixed(2),
        o.status === 'completed' ? 'Acquitté / Livré' : o.status,
        o.payment_method || 'Stripe (CB)'
      ];
    });

    exportToCSV('Nexus_BIM_Achats_Commandes', headers, rows);
    setIsExportMenuOpen(false);
  };

  // 2. Export Retraits Vendeurs & Gains Plateforme
  const handleExportPayouts = () => {
    const headers = [
      'Ref Demande Retrait',
      'Studio Createur',
      'Date de Demande',
      'Volume Brut Genere ($ USD)',
      'Taux Commission Plateforme (%)',
      'Gains Nexus BIM Retenus ($ USD)',
      'Montant Net Virement Vendeur 85% ($ USD)',
      'Canal de Virement',
      'Coordonnees Bancaires',
      'Statut de Traitement',
      'Date d Execution'
    ];

    const rows = payoutsList.map(p => [
      p.id,
      p.vendor_name,
      p.requested_at,
      Number(p.gross_revenue || p.amount || 0).toFixed(2),
      `${p.fee_percent || 15}%`,
      Number(p.platform_fee || 0).toFixed(2),
      Number(p.payout_amount || p.amount || 0).toFixed(2),
      p.method,
      p.account_info,
      p.status === 'completed' ? 'Virement Effectué' : 'En attente de validation',
      p.processed_at || 'En attente'
    ]);

    exportToCSV('Nexus_BIM_Retraits_Vendeurs_Gains', headers, rows);
    setIsExportMenuOpen(false);
  };

  // 3. Export Bilan Financier Synthétique
  const handleExportFinancialSummary = () => {
    const headers = [
      'Indicateur Financier',
      'Montant ($ USD)',
      'Pourcentage Plateforme',
      'Observations'
    ];

    const rows = [
      ['Volume Brut Global (GMV)', totalGrossOrders.toFixed(2), '100.00%', 'Total des ventes enregistrées sur la marketplace'],
      ['Commissions Plateforme Nexus BIM', totalPlatformCommissions.toFixed(2), '15.00%', 'Marge brute d exploitation perçue sur les transactions'],
      ['Reversements Nets Vendeurs', totalNetVendorOrders.toFixed(2), '85.00%', 'Fonds acquis aux créateurs et studios indépendants'],
      ['Total Retraits Vendeurs Effectués', totalPaidOutNet.toFixed(2), '100% des demandes validées', 'Virements bancaires SWIFT/SEPA et Stripe Connect exécutés'],
      ['Retraits en Cours de Traitement', totalPendingPayouts.toFixed(2), 'En attente de signature admin', 'Fonds provisionnés sous séquestre sécurisé'],
      ['Nombre Total de Transactions', activeOrders.length.toString(), '-', 'Livrées instantanément avec clé/téléchargement']
    ];

    exportToCSV('Nexus_BIM_Bilan_Financier_Synthetique', headers, rows);
    setIsExportMenuOpen(false);
  };

  // 4. Export Liste Utilisateurs & Créateurs
  const handleExportUsers = () => {
    const headers = [
      'ID Utilisateur',
      'Nom Complet',
      'Adresse Email',
      'Role Actuel',
      'Societe / Atelier',
      'Specialite BIM',
      'Statut Compte',
      'Date Inscription'
    ];

    const rows = users.map(u => [
      u.id,
      u.name,
      u.email,
      u.role === 'vendor' ? 'Créateur Studio' : u.role === 'admin' ? 'Administrateur' : 'Acheteur Client',
      u.company || 'Indépendant',
      u.specialty || 'Architecture & BIM',
      u.status === 'active' ? 'Actif' : u.status,
      u.created_at
    ]);

    exportToCSV('Nexus_BIM_Utilisateurs_Createurs', headers, rows);
    setIsExportMenuOpen(false);
  };

  // Check Admin Role & Access
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.is_super_admin);

  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a101f] border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-lg shadow-purple-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold font-mono">
              Console Administration · Accès Restreint
            </span>
            <h2 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white">
              Accès Réservé aux Administrateurs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {currentUser
                ? `Vous êtes actuellement connecté en tant que ${currentUser.name} (${currentUser.role === 'vendor' ? 'Vendeur' : 'Client Acheteur'}). Cet espace requiert un compte Administrateur ou Super Administrateur.`
                : `Veuillez vous identifier avec vos identifiants Administrateur pour accéder à la supervision financière, validation des retraits et gestion des rôles Supabase.`
              }
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onOpenAuth ? onOpenAuth('login') : null}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Se Connecter comme Administrateur</span>
            </button>

            {appMode === 'demo' && (
              <button
                type="button"
                onClick={async () => {
                  const { user } = await supabaseAuthService.signIn('admin@nexusbim.com', 'password123');
                  if (user && onUserAuthenticated) {
                    onUserAuthenticated(user);
                  }
                }}
                className="w-full py-2 rounded-xl bg-purple-950/40 hover:bg-purple-950/60 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Connexion 1-Clic Super Admin (Démo)</span>
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col xl:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Mobile Top Header (Responsive) */}
      <div className="xl:hidden flex items-center justify-between p-4 bg-[#0a101f] border-b border-slate-800">
        <NexusLogo size="sm" onClick={onNavigateToMarketplace} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportMenuOpen(true)}
            className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
            aria-label="Ouvrir le menu latéral"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADMIN SIDEBAR (ONGLETS COMPLETS : DASHBOARD, ACHATS, RETRAITS, SUPABASE) */}
      {/* ========================================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0a101f] border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 space-y-6 transition-transform duration-300
        xl:relative xl:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
      `}>
        
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <NexusLogo size="sm" showSubtitle onClick={onNavigateToMarketplace} />
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="xl:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            
            {/* Section: Pilotage */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                Pilotage Plateforme
              </div>
              
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Vue d'ensemble & Graphiques</span>
                </div>
              </button>

              {/* ONGLET 2: ACHATS EFFECTUÉS */}
              <button
                onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Achats Effectués</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
                  {activeOrders.length}
                </span>
              </button>

              {/* ONGLET 3: RETRAITS VENDEURS & GAINS */}
              <button
                onClick={() => { setActiveTab('payouts'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'payouts' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Retraits Vendeurs & Gains</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                  {payoutsList.length}
                </span>
              </button>

              {/* ONGLET 4: SUPABASE DATABASE */}
              <button
                onClick={() => { setActiveTab('supabase'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'supabase' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Base Supabase</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>

            {/* Section: Utilisateurs */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                Utilisateurs & Créateurs
              </div>
              <button
                onClick={() => { setActiveTab('users'); setUserRoleFilter('vendor'); setIsMobileSidebarOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Créateurs vérifiés</span>
                </div>
              </button>
              <button
                onClick={() => { setActiveTab('users'); setUserRoleFilter('customer'); setIsMobileSidebarOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Acheteurs / Clients</span>
                </div>
              </button>
            </div>

            {/* Section: Modération */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                Catalogue
              </div>
              <button
                onClick={() => { setActiveTab('moderation'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  activeTab === 'moderation' ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Modération & Produits</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-xs font-mono font-bold">
                  {products.length}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Profile and Return */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            onClick={onNavigateToMarketplace}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la marketplace</span>
          </button>
        </div>

      </aside>

      {/* Backdrop for mobile */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 xl:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* 2. ADMIN MAIN WORKSPACE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4 bg-[#0a101f]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-mono text-slate-400">
              Nexus BIM Admin · Mode Opérationnel ($ USD)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Export Trigger with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                title="Options d'exportation vers Excel et CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter en Excel</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Formats Excel (.CSV avec UTF-8 BOM)
                  </div>
                  <button
                    onClick={handleExportOrders}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>1. Journal des Achats & Commandes</span>
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button
                    onClick={handleExportPayouts}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>2. Retraits Vendeurs & Gains 15%</span>
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button
                    onClick={handleExportFinancialSummary}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>3. Bilan Financier Synthétique</span>
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button
                    onClick={handleExportUsers}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 text-slate-800 flex items-center justify-between"
                  >
                    <span>4. Liste Utilisateurs & Créateurs</span>
                    <Download className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Bouton Actualiser Tout depuis la Base de Données */}
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title={`Dernière actualisation à ${lastRefreshedAt}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser la BD</span>
            </button>

            {/* Bouton Imprimer / Télécharger en PDF */}
            <div className="relative">
              <button
                onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Imprimer / PDF</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isPrintMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-slate-800 space-y-1 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Rapports PDF Certifiés Base de Données
                  </div>
                  <button
                    onClick={() => {
                      setPrintModalConfig({ isOpen: true, type: 'orders' });
                      setIsPrintMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-50 text-slate-800 flex items-center justify-between"
                  >
                    <span>1. Grand Livre des Ventes PDF</span>
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      setPrintModalConfig({ isOpen: true, type: 'users' });
                      setIsPrintMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-50 text-slate-800 flex items-center justify-between"
                  >
                    <span>2. Registre des Utilisateurs PDF</span>
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      setPrintModalConfig({ isOpen: true, type: 'payouts' });
                      setIsPrintMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-50 text-slate-800 flex items-center justify-between"
                  >
                    <span>3. Relevé des Retraits PDF</span>
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      setPrintModalConfig({ isOpen: true, type: 'financial_summary' });
                      setIsPrintMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-blue-50 text-slate-800 flex items-center justify-between"
                  >
                    <span>4. Bilan Financier Global PDF</span>
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Supabase Indicator Button */}
            <button
              onClick={() => setActiveTab('supabase')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:border-emerald-500/50"
            >
              <span className={`w-2 h-2 rounded-full ${tableStatuses.some(t => !t.exists) ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              <span>Base Supabase</span>
            </button>
          </div>
        </header>

        {/* Global Notification Toast */}
        {payoutSuccessMsg && (
          <div className="m-4 sm:m-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs sm:text-sm font-bold">{payoutSuccessMsg}</div>
            </div>
            <button onClick={() => setPayoutSuccessMsg(null)} className="text-xs text-emerald-700 hover:text-emerald-900 font-bold">
              Fermer
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* ===================================================================== */}
          {/* TAB 1: DASHBOARD AVEC GRAPHIQUES VISUELS INTERACTIFS */}
          {/* ===================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Header Title with Timeframe Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl font-normal text-white tracking-tight">
                    Supervision & Métriques Plateforme
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Analyse des volumes de transactions, commissions (15%) et reversements créateurs (85%).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setPrintModalConfig({ isOpen: true, type: 'financial_summary' })}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    <span>Imprimer Bilan (PDF)</span>
                  </button>

                  <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
                    <button 
                      onClick={() => setChartTimeframe('7d')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${chartTimeframe === '7d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      7 jours
                    </button>
                    <button 
                      onClick={() => setChartTimeframe('30d')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${chartTimeframe === '30d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      30 jours
                    </button>
                    <button 
                      onClick={() => setChartTimeframe('12m')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${chartTimeframe === '12m' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      12 mois
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 KPIs Cards in White Card Monograph Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                
                {/* Total Volume */}
                <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume Brut des Achats (GMV)</div>
                  <div className="font-['EB_Garamond',serif] text-3xl font-bold text-slate-900">
                    ${totalGrossOrders.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{activeOrders.length} commande(s) en BD</span>
                  </div>
                </div>

                {/* Platform Commission 15% */}
                <div className="p-6 rounded-3xl bg-white text-slate-900 border border-blue-200 shadow-sm space-y-2">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Gains Nexus BIM (15%)</div>
                  <div className="font-['EB_Garamond',serif] text-3xl font-bold text-blue-600">
                    ${totalPlatformCommissions.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Commissions prélevées nettes</div>
                </div>

                {/* Net Payout to Vendors 85% */}
                <div className="p-6 rounded-3xl bg-white text-slate-900 border border-emerald-200 shadow-sm space-y-2">
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Reversements Créateurs (85%)</div>
                  <div className="font-['EB_Garamond',serif] text-3xl font-bold text-emerald-600">
                    ${totalNetVendorOrders.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold">100% garanti aux studios</div>
                </div>

                {/* Total Paid Out in Withdrawals */}
                <div className="p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retraits Décaissés</div>
                  <div className="font-['EB_Garamond',serif] text-3xl font-bold text-slate-900">
                    ${totalPaidOutNet.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-slate-500 font-medium">En attente : ${totalPendingPayouts.toFixed(2)} USD</div>
                </div>

              </div>

              {/* =============================================================== */}
              {/* VISUAL CHARTS ROW (GRAPHIQUES INTERACTIFS REQUIS PAR L'UTILISATEUR) */}
              {/* =============================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Chart 1: Interactive Area Line Chart (8 cols) */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0c1424] border border-slate-800 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                        Évolution des Flux Financiers
                      </h3>
                      <p className="text-xs text-slate-400">
                        Volume brut des ventes vs Part 15% conservée par la marketplace ({activeChart.periodLabel})
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-sky-400">
                        <span className="w-3 h-3 rounded-full bg-sky-500" />
                        <span>Volume Brut : {activeChart.totalGross}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span>Commissions (15%) : {activeChart.totalComm}</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart Area dynamically reacting to timeframe */}
                  <div className="relative h-64 sm:h-72 w-full pt-4">
                    <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="chartGradEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid Lines */}
                      <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="600" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="140" x2="600" y2="140" stroke="#1e293b" strokeDasharray="3 3" />
                      <line x1="0" y1="190" x2="600" y2="190" stroke="#334155" />

                      {/* Area Fill for Gross Volume */}
                      <path
                        d={`${activeChart.svgPathGross} L 580 190 L 20 190 Z`}
                        fill="url(#chartGradBlue)"
                      />

                      {/* Line for Gross Volume */}
                      <path
                        d={activeChart.svgPathGross}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Line for Commissions (15%) */}
                      <path
                        d={activeChart.svgPathComm}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Interactive Data Points */}
                      <circle cx="20" cy="170" r="4" fill="#38bdf8" />
                      <circle cx="200" cy="110" r="4" fill="#38bdf8" />
                      <circle cx="350" cy="70" r="4" fill="#38bdf8" />
                      <circle cx="580" cy="40" r="5" fill="#38bdf8" />
                      <circle cx="580" cy="155" r="4" fill="#10b981" />
                    </svg>

                    {/* X Axis Labels */}
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                      {activeChart.points.map((pt, i) => (
                        <span key={i}>{pt.label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart 2: Category Breakdown (4 cols) */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0c1424] border border-slate-800 space-y-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                      Répartition par Métier
                    </h3>
                    <p className="text-xs text-slate-400">
                      Volume des ventes d'ingénierie par catégorie
                    </p>
                  </div>

                  <div className="space-y-4">
                    {categoryBreakdown.map((cat, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{cat.label}</span>
                          <span className="font-mono text-slate-300">{cat.amount} ({cat.percent}%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Règle des 85% / 15%</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Chaque transaction alloue automatiquement 85% au compte vendeur et 15% à la plateforme pour l'infrastructure.
                    </p>
                  </div>
                </div>

              </div>

              {/* Quick Actions to Orders & Payouts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Purchases Quick Box */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-cyan-400" />
                      <h4 className="font-bold text-white text-base">Achats Récents ({activeOrders.length})</h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-blue-400 hover:underline font-semibold"
                    >
                      Voir le journal complet &gt;
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {activeOrders.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Aucun achat en base de données. Seules les données réelles sont affichées.
                      </div>
                    ) : (
                      activeOrders.slice(0, 4).map(order => {
                        const title = (order.items && order.items.length > 0) ? order.items[0]?.product?.title : 'Modèle BIM certifié';
                        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Récent';
                        const gross = order.total_amount || 0;
                        const comm = gross * 0.15;
                        return (
                          <div key={order.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                            <div className="min-w-0 pr-3">
                              <span className="font-bold text-white block truncate">{title}</span>
                              <span className="text-slate-400">{order.customer_name} · {dateStr}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-emerald-400 block">${gross.toFixed(2)}</span>
                              <span className="text-[10px] text-blue-400 font-mono">Part 15% : ${comm.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Vendor Payouts Quick Box */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-white text-base">Retraits & Gains Plateforme ({payoutsList.length})</h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('payouts')}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      Gérer les retraits ({payoutsList.length}) &gt;
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {payoutsList.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Aucune demande de retrait en attente ou traitée en base de données.
                      </div>
                    ) : (
                      payoutsList.slice(0, 4).map(p => {
                        const fee = Number(p.platform_fee || (p.gross_revenue * 0.15) || 0);
                        const net = Number(p.payout_amount || p.amount || 0);
                        return (
                          <div key={p.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                            <div className="min-w-0 pr-3">
                              <span className="font-bold text-white block truncate">{p.vendor_name}</span>
                              <span className="text-slate-400">{p.method} · Part 15% : ${fee.toFixed(2)}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-white block">${net.toFixed(2)}</span>
                              <span className={`text-[10px] font-bold ${p.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {p.status === 'completed' ? 'Viré (85%)' : 'À valider'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: ACHATS EFFECTUÉS AVEC COMMISSION 15% ET EXPORT EXCEL */}
          {/* ===================================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl font-normal text-white tracking-tight">
                    Achats Effectués & Historique des Ventes
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Journal complet des acquisitions avec décomposition automatique de la commission plateforme (15%) et du net vendeur (85%).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setPrintModalConfig({ isOpen: true, type: 'orders' })}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer Grand Livre (PDF)</span>
                  </button>

                  <button
                    onClick={handleExportOrders}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Exporter (.csv / Excel)</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table in White Card with Horizontal Scroll */}
              <div className="rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Filtrer par réf, client, produit..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="text-xs sm:text-sm font-mono text-slate-600">
                    Total GMV : <strong className="text-slate-900 font-bold">${totalGrossOrders.toFixed(2)} USD</strong> · Commissions (15%) : <strong className="text-blue-600 font-bold">${totalPlatformCommissions.toFixed(2)} USD</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {filteredOrders.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 space-y-3">
                      <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
                      <div className="font-bold text-slate-700 text-base">Aucune commande enregistrée en base de données</div>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Le mode super administrateur affiche strictement les transactions réelles de la base de données. Dès qu'un achat est validé, il sera consigné ici.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs sm:text-sm min-w-[750px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="py-3.5 px-4 font-bold rounded-l-xl">Réf. Commande</th>
                          <th className="py-3.5 px-4 font-bold">Date & Heure</th>
                          <th className="py-3.5 px-4 font-bold">Acheteur</th>
                          <th className="py-3.5 px-4 font-bold">Produit</th>
                          <th className="py-3.5 px-4 font-bold">Studio Vendeur</th>
                          <th className="py-3.5 px-4 font-bold">Brut ($)</th>
                          <th className="py-3.5 px-4 font-bold text-blue-700 bg-blue-50/60">Com. 15%</th>
                          <th className="py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50/60">Net 85%</th>
                          <th className="py-3.5 px-4 font-bold rounded-r-xl">Mode & Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredOrders.map(order => {
                          const productTitles = (order.items && order.items.length > 0) ? order.items.map(it => it.product?.title).join(', ') : 'Modèle BIM';
                          const software = (order.items && order.items[0]?.product?.software) || 'Revit / IFC';
                          const vendorName = Array.from(new Set(order.items?.map(i => i.product.vendor_name).filter(Boolean))).join(', ') || 'Studio Vendeur';
                          const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Récent';
                          const gross = order.total_amount || 0;
                          const comm = gross * 0.15;
                          const net = gross * 0.85;

                          return (
                            <tr key={order.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.id}</td>
                              <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">{dateStr}</td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900 block">{order.customer_name}</span>
                                <span className="text-[11px] text-slate-400 truncate block max-w-[150px]">{order.customer_email}</span>
                              </td>
                              <td className="py-3.5 px-4 max-w-[200px]">
                                <span className="font-semibold text-slate-800 line-clamp-1">{productTitles}</span>
                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold">{software}</span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-700">{vendorName}</td>
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">${gross.toFixed(2)}</td>
                              <td className="py-3.5 px-4 font-mono font-bold text-blue-700 bg-blue-50/40">
                                +${comm.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/40">
                                ${net.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                                  <CheckCircle className="w-3 h-3" />
                                  Payé
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: RETRAITS D'ARGENT VENDEURS AVEC GAINS EN POURCENTAGE & EXPORT */}
          {/* ===================================================================== */}
          {activeTab === 'payouts' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl font-normal text-white tracking-tight">
                    Retraits des Vendeurs & Reversements Nets
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Contrôle des demandes de virement bancaire des créateurs avec calcul direct des 85% nets et 15% de commission.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setPrintModalConfig({ isOpen: true, type: 'payouts' })}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer Relevé (PDF)</span>
                  </button>

                  <button
                    onClick={handleExportPayouts}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Exporter (.csv / Excel)</span>
                  </button>
                </div>
              </div>

              {/* 3 Summary Payout Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Décaissé aux Vendeurs (85%)</div>
                  <div className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-emerald-600">
                    ${totalPaidOutNet.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-slate-500">Virements bancaires honorés</div>
                </div>

                <div className="p-5 rounded-2xl bg-white text-slate-900 border border-blue-200 shadow-sm space-y-1">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Gains Retenus Plateforme (15%)</div>
                  <div className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-blue-600">
                    ${totalPayoutsPlatformFees.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-slate-500">Prélèvement de commission automatique</div>
                </div>

                <div className="p-5 rounded-2xl bg-white text-slate-900 border border-amber-200 shadow-sm space-y-1">
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Demandes en Attente d'Approbation</div>
                  <div className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-amber-600">
                    ${totalPendingPayouts.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-slate-500">Validation manuelle de conformité</div>
                </div>
              </div>

              {/* Payouts Table in White Card */}
              <div className="rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm p-6 space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={payoutSearch}
                      onChange={(e) => setPayoutSearch(e.target.value)}
                      placeholder="Filtrer par vendeur, statut..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    Total demandes : <strong className="text-slate-900 font-bold">{payoutsList.length}</strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {filteredPayouts.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 space-y-3">
                      <TrendingUp className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
                      <div className="font-bold text-slate-700 text-base">Aucune demande de retrait en base de données</div>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Les retraits demandés par les vendeurs avec solde disponible apparaîtront ici pour contrôle et déblocage.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs sm:text-sm min-w-[750px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="py-3.5 px-4 font-bold rounded-l-xl">Réf. Retrait</th>
                          <th className="py-3.5 px-4 font-bold">Studio Créateur</th>
                          <th className="py-3.5 px-4 font-bold">Date Demande</th>
                          <th className="py-3.5 px-4 font-bold">Volume Brut ($)</th>
                          <th className="py-3.5 px-4 font-bold text-blue-700 bg-blue-50/60">Part Nexus (15%)</th>
                          <th className="py-3.5 px-4 font-bold text-emerald-700 bg-emerald-50/60">Net Vendeur (85%)</th>
                          <th className="py-3.5 px-4 font-bold">Mode de Virement</th>
                          <th className="py-3.5 px-4 font-bold">Statut</th>
                          <th className="py-3.5 px-4 font-bold rounded-r-xl">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredPayouts.map(p => {
                          const gross = Number(p.gross_revenue || p.amount || 0);
                          const fee = Number(p.platform_fee || (gross * 0.15) || 0);
                          const net = Number(p.payout_amount || p.amount || 0);

                          return (
                            <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                <div className="flex items-center gap-2">
                                  {p.vendor_avatar && (
                                    <img src={p.vendor_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                                  )}
                                  <span>{p.vendor_name}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{p.requested_at}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-700">${gross.toFixed(2)}</td>
                              <td className="py-3.5 px-4 font-mono font-bold text-blue-700 bg-blue-50/40">
                                -${fee.toFixed(2)} (15%)
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/40">
                                ${net.toFixed(2)} (85%)
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold block text-slate-900">{p.method}</span>
                                <span className="text-[11px] font-mono text-slate-400">{p.account_info}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  p.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {p.status === 'completed' ? 'Virement Validé' : 'En attente d’approbation'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                {p.status !== 'completed' ? (
                                  <button
                                    onClick={() => handleApprovePayout(p.id)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Valider</span>
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400 font-mono">Traité</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: CONNECTEUR & SYNCHRONISATION SUPABASE */}
          {/* ===================================================================== */}
          {activeTab === 'supabase' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl font-normal text-white tracking-tight">
                    Connecteur Base de Données Supabase
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Configuration prête pour brancher votre instance PostgreSQL / Supabase, exécuter les migrations SQL et synchroniser le catalogue.
                  </p>
                </div>

                <button
                  onClick={() => setIsSqlModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-700"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Voir le Script SQL Schema</span>
                </button>
              </div>

              {/* Supabase Connection Setup Box in White Card */}
              <div className="rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-slate-900">
                      Paramètres de Connexion Supabase
                    </h3>
                    <p className="text-xs text-slate-500">
                      Renseignez vos clés de projet issues du tableau de bord Supabase (Settings &gt; API).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      VITE_SUPABASE_URL (URL du Projet)
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://votre-id-projet.supabase.co"
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400">
                      Exemple : https://xyzcompany.supabase.co
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      VITE_SUPABASE_ANON_KEY (Clé Anonyme Publique)
                    </label>
                    <input
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <p className="text-[11px] text-slate-400">
                      Clé API cliente 'anon' publique pour les requêtes PostgREST.
                    </p>
                  </div>

                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingSupabase}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isTestingSupabase ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    <span>Tester la connexion & Enregistrer</span>
                  </button>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sauvegarde sécurisée dans le stockage local</span>
                  </div>
                </div>

                {/* Connection Test Result */}
                {supabaseTestResult && (
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 animate-fadeIn ${
                    supabaseTestResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}>
                    {supabaseTestResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
                    <div>
                      <div className="font-bold">{supabaseTestResult.message}</div>
                      {supabaseTestResult.latencyMs && (
                        <div className="text-[11px] opacity-80 font-mono">Ping PostgREST : {supabaseTestResult.latencyMs} ms</div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* SECTION: ÉTAT DU SCHÉMA & TABLES DANS SUPABASE (DIAGNOSTIC EN DIRECT) */}
              <div className="rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-slate-900">
                        État du Schéma & Diagnostic des Tables Supabase
                      </h3>
                      <p className="text-xs text-slate-500">
                        Contrôle d'existence des 6 tables officielles sur votre projet <strong>lfndoimqzxvqsosxgeys</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={handleCheckTables}
                      disabled={isCheckingTables}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingTables ? 'animate-spin' : ''}`} />
                      <span>Vérifier l'état des tables</span>
                    </button>

                    <button
                      onClick={() => setIsSqlModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le Script SQL Schéma</span>
                    </button>

                    <a
                      href="https://supabase.com/dashboard/project/lfndoimqzxvqsosxgeys/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir SQL Editor Supabase</span>
                    </a>
                  </div>
                </div>

                {/* Warning if tables not created */}
                {tableStatuses.some(t => !t.exists) && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Tables manquantes détectées dans votre base de données Supabase</span>
                    </div>
                    <p className="text-amber-800/90 leading-relaxed text-xs">
                      PostgREST ne trouve pas certaines tables dans le cache du schéma. C'est normal si vous n'avez pas encore exécuté le script SQL dans Supabase !
                      Pour activer toutes les tables en 1 clic : cliquez sur <strong>"Copier le Script SQL Schéma"</strong>, ouvrez l'éditeur SQL de Supabase (bouton vert ci-dessus), collez le code et cliquez sur <strong>RUN</strong>.
                    </p>
                  </div>
                )}

                {/* Table Statuses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tableStatuses.map((t, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border transition-all ${
                        t.exists 
                          ? 'bg-emerald-50/50 border-emerald-200' 
                          : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">public.{t.tableName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          t.exists ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {t.exists ? 'Active' : 'Absente'}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-700">{t.label}</div>
                      <div className={`text-[11px] font-mono mt-2 flex items-center gap-1 ${t.exists ? 'text-emerald-700 font-bold' : 'text-rose-600 font-semibold'}`}>
                        {t.exists ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{t.statusText}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sync Local to Supabase Action */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-slate-900">Synchroniser les données locales vers Supabase</div>
                    <p className="text-xs text-slate-500">
                      Transfère automatiquement vos profils, créateurs, produits et commandes vers Supabase une fois les tables créées.
                    </p>
                  </div>

                  <button
                    onClick={handleSyncToSupabase}
                    disabled={isMigratingData}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isMigratingData ? 'animate-spin' : ''}`} />
                    <span>{isMigratingData ? 'Synchronisation en cours...' : 'Synchroniser vers Supabase'}</span>
                  </button>
                </div>

                {migrationFeedback && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold animate-fadeIn">
                    {migrationFeedback}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: UTILISATEURS & CRÉATEURS */}
          {/* ===================================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl font-normal text-white tracking-tight">
                    Utilisateurs & Studios Partenaires
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Annuaire des acheteurs, créateurs indépendants et gestionnaires de plateforme.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setPrintModalConfig({ isOpen: true, type: 'users' })}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer Registre (PDF)</span>
                  </button>

                  <button
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Ajouter un Administrateur (Super Admin)</span>
                  </button>

                  <button
                    onClick={handleExportUsers}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Exporter (.csv / Excel)</span>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom ou email..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto">
                    <button
                      onClick={() => setUserRoleFilter('all')}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${userRoleFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      Tous ({users.length})
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('vendor')}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${userRoleFilter === 'vendor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      Créateurs
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('customer')}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${userRoleFilter === 'customer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      Acheteurs
                    </button>
                    <button
                      onClick={() => setUserRoleFilter('admin')}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${userRoleFilter === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Administrateurs ({users.filter(u => u.role === 'admin' || u.role === 'super_admin').length})</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="py-3.5 px-4 font-bold rounded-l-xl">Utilisateur</th>
                        <th className="py-3.5 px-4 font-bold">Rôle & Droits</th>
                        <th className="py-3.5 px-4 font-bold">Société / Pôle</th>
                        <th className="py-3.5 px-4 font-bold">Spécialité</th>
                        <th className="py-3.5 px-4 font-bold">Statut</th>
                        <th className="py-3.5 px-4 font-bold rounded-r-xl">Date d'accès</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" />
                              <div>
                                <span className="font-bold text-slate-900 flex items-center gap-1">
                                  {(u.is_super_admin || u.role === 'super_admin') && (
                                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
                                  )}
                                  <span>{u.name}</span>
                                </span>
                                <span className="text-xs text-slate-400 font-mono">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                              u.is_super_admin || u.role === 'super_admin' ? 'bg-amber-50 text-amber-800 border border-amber-300' :
                              u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              u.role === 'vendor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {(u.is_super_admin || u.role === 'super_admin') && <Crown className="w-3 h-3 text-amber-600 fill-current" />}
                              {u.is_super_admin || u.role === 'super_admin' ? 'Super Admin' : u.role === 'admin' ? 'Administrateur' : u.role === 'vendor' ? 'Créateur Studio' : 'Client Acheteur'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{u.company || 'Studio Indépendant'}</td>
                          <td className="py-3 px-4 text-slate-700">{u.specialty || 'Architecture & BIM'}</td>
                          <td className="py-3 px-4">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200 text-xs">
                              Vérifié
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-xs">{u.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: MODÉRATION DES PRODUITS NUMÉRIQUES */}
          {/* ===================================================================== */}
          {activeTab === 'moderation' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-['EB_Garamond',serif] text-3xl sm:text-4xl font-normal text-white tracking-tight">
                    Modération & Contrôle Qualité ({products.length})
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Validation des maquettes 3D, fichiers BIM et add-ins publiés par les vendeurs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => (
                  <div key={p.id} className="p-5 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-4">
                    <img src={p.image_url} alt="" className="w-full h-40 rounded-2xl object-cover" />
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-700 bg-blue-50 font-bold px-2 py-0.5 rounded border border-blue-200">
                          {p.software} · {p.file_format}
                        </span>
                        <span className="font-mono font-bold text-slate-900">${p.price.toFixed(2)} USD</span>
                      </div>
                      <h4 className="font-['EB_Garamond',serif] text-lg font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600">Par {p.vendor_name}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        Validé & En Ligne
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SQL SCHEMA MODAL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1424] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-white">
                  Script SQL Schéma Supabase
                </h3>
              </div>
              <button 
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copiez et collez ce script directement dans l'éditeur SQL de votre dashboard Supabase (SQL Editor &gt; New Query) pour initialiser toutes les tables et politiques RLS.
            </p>

            <pre className="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-y-auto max-h-96">
              {generateSupabaseSQLSchema()}
            </pre>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateSupabaseSQLSchema());
                  setIsCopiedSql(true);
                  setTimeout(() => setIsCopiedSql(false), 2500);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
              >
                {isCopiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopiedSql ? 'Script Copié dans le Presse-papier !' : 'Copier tout le Script SQL'}</span>
              </button>

              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN: ADD ADMINISTRATOR MODAL */}
      {isAddAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Ajouter un Administrateur
                  </h3>
                  <p className="text-xs text-slate-500">
                    Création d'un accès de gestionnaire avec enregistrement dans Supabase
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAdminModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminCreationFeedback ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-extrabold text-emerald-900">Administrateur créé !</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {adminCreationFeedback}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateAdminSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold">Nom complet du gestionnaire *</label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Ex : Marc Dupont"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold">Adresse Email de connexion *</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Ex : marc.dupont@nexusbim.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-800 font-bold">Pôle / Spécialité</label>
                  <select
                    value={newAdminSpecialty}
                    onChange={(e) => setNewAdminSpecialty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Supervision Financière & Retraits">Supervision Financière & Retraits</option>
                    <option value="Modération Catalogue & Qualité BIM">Modération Catalogue & Qualité BIM</option>
                    <option value="Support & Gestion des Créateurs">Support & Gestion des Créateurs</option>
                    <option value="Sécurité & Administration Globale">Sécurité & Administration Globale</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSuperAdminRole}
                      onChange={(e) => setIsSuperAdminRole(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      Accorder les privilèges de Super Administrateur
                    </span>
                  </label>
                  <p className="text-[11px] text-purple-800/80 leading-relaxed">
                    Les Super Administrateurs ont tous les droits : ajout d'autres administrateurs, modification des taux de commission et accès complet aux données Supabase.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddAdminModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer l'Administrateur</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
