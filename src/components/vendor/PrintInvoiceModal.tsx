import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Package,
  Users,
  BarChart3,
  Calendar,
  Layers,
  FileCode,
  Tag
} from 'lucide-react';
import { Order, VendorStoreSettings, UserProfile, PayoutTransaction, Product } from '../../types/database';

export interface PrintClientData {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  products: string[];
}

export interface PrintStatsData {
  grossSales: number;
  netEarnings: number;
  orderCount: number;
  avgOrder: number;
  productsCount: number;
  softwareBreakdown?: { name: string; count: number; sales: number }[];
  categoryBreakdown?: { name: string; count: number; sales: number }[];
}

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'sale' | 'all_sales' | 'payout' | 'stats' | 'products_catalog' | 'clients';
  order?: Order | null;
  orders?: Order[];
  products?: Product[];
  clientsData?: PrintClientData[];
  payout?: PayoutTransaction | null;
  storeSettings: VendorStoreSettings;
  currentUser: UserProfile | null;
  statsData?: PrintStatsData;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  onClose,
  type,
  order,
  orders = [],
  products = [],
  clientsData = [],
  payout,
  storeSettings,
  currentUser,
  statsData,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const houseName = currentUser?.company || storeSettings.store_name || 'Atelier BIM Vendeur';
  const housePhone = currentUser?.phone || storeSettings.phone || '';
  const houseWhatsapp = currentUser?.whatsapp || storeSettings.whatsapp || '';
  const houseAddress = currentUser?.address || storeSettings.address || 'Plateforme Nexus BIM';
  const houseEmail = currentUser?.contact_email || storeSettings.contact_email || currentUser?.email || 'contact@nexusbim.app';
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Group products by category for catalog print
  const productsByCategory = React.useMemo(() => {
    const map = new Map<string, Product[]>();
    products.forEach(p => {
      const cat = p.category || 'Autres';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(p);
    });
    return Array.from(map.entries());
  }, [products]);

  return (
    <div className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="print-modal-card w-full max-w-5xl max-h-[92vh] bg-white text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header (Hidden during browser print) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800 text-sm sm:text-base">
              {type === 'sale' && 'Aperçu Facture / Bordereau de Vente PDF'}
              {type === 'all_sales' && 'Grand Livre des Ventes & Recettes PDF'}
              {type === 'payout' && 'Reçu Officiel de Virement / Retrait PDF'}
              {type === 'stats' && 'Rapport d\'Activité & Statistiques PDF'}
              {type === 'products_catalog' && 'Catalogue Officiel des Produits par Catégorie PDF'}
              {type === 'clients' && 'Répertoire des Clients Acheteurs PDF'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / Télécharger en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="printable-area p-6 sm:p-10 space-y-8 overflow-y-auto bg-white text-slate-900 leading-normal">
          
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {storeSettings.logo_url && !storeSettings.logo_url.startsWith('data:') ? (
                  <img
                    src={storeSettings.logo_url}
                    alt={houseName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    {houseName.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{houseName}</h1>
                  <p className="text-xs text-slate-500 font-medium">Boutique & Atelier Professionnel Certifié Nexus BIM</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{houseAddress}</span>
                </div>
                {housePhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tél: {housePhone}</span>
                  </div>
                )}
                {houseWhatsapp && (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp: {houseWhatsapp}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email: {houseEmail}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono uppercase">
                {type === 'sale' && 'FACTURE DE VENTE'}
                {type === 'all_sales' && 'REGISTRE DES VENTES'}
                {type === 'payout' && 'REÇU DE RETRAIT'}
                {type === 'stats' && 'RAPPORT FINANCIER & STATISTIQUES'}
                {type === 'products_catalog' && 'CATALOGUE PRODUITS OFFICIEL'}
                {type === 'clients' && 'RÉPERTOIRE CLIENTS OFFICIEL'}
              </span>
              <div className="text-xs text-slate-500 pt-2 font-medium">Date d'édition :</div>
              <div className="text-sm font-bold text-slate-800 font-mono">{currentDate}</div>
              <div className="text-xs text-slate-400">Devise officielle : <strong>USD ($)</strong></div>
            </div>
          </div>

          {/* 1. FACTURE POUR UNE VENTE UNIQUE */}
          {type === 'sale' && order && (
            <div className="space-y-6">
              {/* Customer & Payment Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Client Acheteur</span>
                  <div className="text-base font-bold text-slate-900">{order.customer_name}</div>
                  <div className="text-slate-600 font-mono text-xs">{order.customer_email}</div>
                  <div className="text-slate-500 text-xs">Compte client vérifié sur la marketplace</div>
                </div>

                <div className="space-y-1.5 sm:text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Informations de Paiement</span>
                  <div className="font-mono text-xs text-slate-700">Réf. Commande : <strong>{order.id}</strong></div>
                  <div className="text-xs text-slate-600">Mode : <strong>{order.payment_method || 'Carte Bancaire / Stripe'}</strong></div>
                  <div className="text-xs font-bold text-emerald-600 flex sm:justify-end items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Statut : Payée & Livrée
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                    <th className="py-3 px-4 font-bold">Produit / Ressource Numérique</th>
                    <th className="py-3 px-4 font-bold">Logiciel</th>
                    <th className="py-3 px-4 font-bold text-center">Quantité</th>
                    <th className="py-3 px-4 font-bold text-right">Prix ($ USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.product.title}
                        <div className="text-[11px] text-slate-500 font-mono">{item.product.file_format} · {item.product.category}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{item.product.software}</td>
                      <td className="py-3.5 px-4 text-center font-mono">1</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">${item.price.toFixed(2)} USD</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-4">
                <div className="w-72 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>Montant Brut payé par l'acheteur :</span>
                    <span className="font-mono font-bold">${order.total_amount.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                    <span>Commission plateforme (15%) :</span>
                    <span className="font-mono text-slate-600">-${(order.total_amount * 0.15).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-800 text-sm sm:text-base font-bold text-slate-900">
                    <span>Net perçu par l'Atelier (85%) :</span>
                    <span className="font-mono text-emerald-700">${(order.total_amount * 0.85).toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. GRAND LIVRE DES VENTES */}
          {type === 'all_sales' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Registre Chronologique des Transactions</h3>
                <span className="text-xs font-bold text-slate-500 font-mono">{orders.length} transaction(s) enregistrée(s)</span>
              </div>

              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                    <th className="py-3 px-3 font-bold">Réf. Commande</th>
                    <th className="py-3 px-3 font-bold">Date</th>
                    <th className="py-3 px-3 font-bold">Client</th>
                    <th className="py-3 px-3 font-bold">Produits</th>
                    <th className="py-3 px-3 font-bold text-right">Brut ($)</th>
                    <th className="py-3 px-3 font-bold text-right text-emerald-700">Net Vendeur (85%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Aucune vente enregistrée à ce jour dans la base de données.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => {
                      const totalBrut = ord.total_amount || 0;
                      const totalNet = totalBrut * 0.85;
                      return (
                        <tr key={ord.id}>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{ord.id.slice(0, 10)}</td>
                          <td className="py-3 px-3 text-slate-600">{new Date(ord.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{ord.customer_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{ord.customer_email}</div>
                          </td>
                          <td className="py-3 px-3 max-w-xs truncate text-slate-700">
                            {ord.items.map(i => i.product.title).join(', ')}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 text-right">${totalBrut.toFixed(2)}</td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-right">${totalNet.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. REÇU DE RETRAIT / PAIEMENT */}
          {type === 'payout' && payout && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-sm">
              <h3 className="text-lg font-bold text-slate-900">Confirmation de Virement Bancaire</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>Identifiant Transaction : <strong className="font-mono">{payout.id}</strong></div>
                <div>Statut : <strong className="text-emerald-700">Exécuté / Payé</strong></div>
                <div>Méthode de virement : <strong>{payout.method}</strong></div>
                <div>Compte bénéficiaire : <strong className="font-mono">{payout.account_info}</strong></div>
                <div className="col-span-2 text-xl font-bold font-mono text-emerald-700 pt-2 border-t border-slate-200">
                  Montant Net Versé : ${payout.amount.toFixed(2)} USD
                </div>
              </div>
            </div>
          )}

          {/* 4. RAPPORT STATISTIQUES ENRICHI (Corrigé et complet) */}
          {type === 'stats' && statsData && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Bilan d'Activité & Performance Commerciale</h3>
                <p className="text-xs text-slate-500">
                  Rapport consolidé des ventes et métriques de l'atelier <strong>{houseName}</strong>.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Chiffre d'Affaires Brut</div>
                  <div className="text-2xl font-black font-mono text-slate-900 pt-1">${statsData.grossSales.toFixed(2)} USD</div>
                  <div className="text-[11px] text-slate-500">{statsData.orderCount} transaction(s)</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Revenus Nets Vendeur (85%)</div>
                  <div className="text-2xl font-black font-mono text-emerald-700 pt-1">${statsData.netEarnings.toFixed(2)} USD</div>
                  <div className="text-[11px] text-emerald-700">Disponible au retrait</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Panier Moyen</div>
                  <div className="text-2xl font-black font-mono text-slate-900 pt-1">${statsData.avgOrder.toFixed(2)} USD</div>
                  <div className="text-[11px] text-slate-500">Par commande client</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Catalogue Actif</div>
                  <div className="text-2xl font-black font-mono text-slate-900 pt-1">{statsData.productsCount}</div>
                  <div className="text-[11px] text-slate-500">Modèles & ressources en ligne</div>
                </div>
              </div>

              {/* Breakdown tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>Répartition des produits par Logiciel</span>
                  </h4>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="py-1.5">Logiciel</th>
                        <th className="py-1.5 text-right">Nombre</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {['Revit', 'Archicad', 'AutoCAD', 'SketchUp', 'Rhino', 'Blender', 'Multi-logiciels'].map(soft => {
                        const cnt = products.filter(p => p.software === soft).length;
                        if (cnt === 0) return null;
                        return (
                          <tr key={soft}>
                            <td className="py-2 font-medium text-slate-800">{soft}</td>
                            <td className="py-2 text-right font-mono font-bold text-blue-600">{cnt}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Répartition par Catégorie de ressource</span>
                  </h4>
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold">
                        <th className="py-1.5">Catégorie</th>
                        <th className="py-1.5 text-right">Nombre</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productsByCategory.map(([cat, list]) => (
                        <tr key={cat}>
                          <td className="py-2 font-medium text-slate-800">{cat}</td>
                          <td className="py-2 text-right font-mono font-bold text-blue-600">{list.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. CATALOGUE DES PRODUITS CLASSÉ PAR CATÉGORIE (Nouveau Requis) */}
          {type === 'products_catalog' && (
            <div className="space-y-8">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">Catalogue Complet des Ressources Numériques</h3>
                  <p className="text-xs text-slate-500">
                    Inventaire exhaustif des modèles 3D, plans de construction, familles BIM et logiciels classés par catégorie.
                  </p>
                </div>
                <div className="text-xs font-mono font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                  Total : {products.length} ressource(s)
                </div>
              </div>

              {products.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  Aucun produit enregistré dans votre catalogue pour le moment.
                </div>
              ) : (
                productsByCategory.map(([catName, prods]) => (
                  <div key={catName} className="space-y-3 border-t-2 border-slate-200 pt-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-extrabold text-blue-900 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <span>{catName}</span>
                      </h4>
                      <span className="text-xs font-bold text-slate-500 font-mono">{prods.length} référence(s)</span>
                    </div>

                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                          <th className="py-2.5 px-3 font-bold">Réf / Titre</th>
                          <th className="py-2.5 px-3 font-bold">Logiciel / Format</th>
                          <th className="py-2.5 px-3 font-bold">Spécifications</th>
                          <th className="py-2.5 px-3 font-bold">Taille</th>
                          <th className="py-2.5 px-3 font-bold">Statut</th>
                          <th className="py-2.5 px-3 font-bold text-right">Prix ($ USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {prods.map(p => (
                          <tr key={p.id}>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{p.title}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">{p.description}</div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-blue-800">
                              {p.software} ({p.file_format})
                            </td>
                            <td className="py-3 px-3 text-slate-600 text-[11px]">
                              {p.version_compatibility || p.license_type || 'Usage pro'}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-500">{p.file_size}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {p.status === 'published' ? 'Publié' : 'Brouillon'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-900 text-right">
                              ${p.price.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 6. LISTE DES CLIENTS ACHETEURS (Nouveau Requis) */}
          {type === 'clients' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">Répertoire des Clients Acheteurs</h3>
                  <p className="text-xs text-slate-500">
                    Clients ayant passé commande auprès de l'atelier <strong>{houseName}</strong>.
                  </p>
                </div>
                <div className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  {clientsData.length} client(s) actif(s)
                </div>
              </div>

              {clientsData.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  Aucun client acheteur enregistré pour le moment.
                </div>
              ) : (
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                      <th className="py-3 px-3 font-bold">Client / Raison Sociale</th>
                      <th className="py-3 px-3 font-bold">Email</th>
                      <th className="py-3 px-3 font-bold text-center">Commandes</th>
                      <th className="py-3 px-3 font-bold">Produits Commandés</th>
                      <th className="py-3 px-3 font-bold">Dernier Achat</th>
                      <th className="py-3 px-3 font-bold text-right text-emerald-700">Total Dépensé ($ USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {clientsData.map(client => (
                      <tr key={client.email}>
                        <td className="py-3.5 px-3 font-bold text-slate-900">{client.name}</td>
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-600">{client.email}</td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">{client.ordersCount}</td>
                        <td className="py-3.5 px-3 text-slate-700 text-xs max-w-xs truncate">
                          {client.products.join(', ')}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 text-xs">
                          {client.lastOrderDate ? new Date(client.lastOrderDate).toLocaleDateString('fr-FR') : 'Récent'}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-700 text-right text-sm">
                          ${client.totalSpent.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Signature & Legal Footer */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Plateforme officielle Nexus BIM Marketplace.</p>
              <p>Document généré électroniquement sous le contrôle de l'Atelier {houseName}.</p>
              <p className="text-[11px] text-slate-400">Toutes les transactions sont exprimées en Dollars Américains ($ USD).</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800">Cachet & Signature Électronique</div>
              <div className="h-10 border-b border-dashed border-slate-300 w-48 mt-1 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                Nexus BIM Auth Verified
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
