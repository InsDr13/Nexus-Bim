import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Building2, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { Order, Product, UserProfile } from '../../types/database';

interface PrintAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'orders' | 'users' | 'payouts' | 'financial_summary';
  orders: Order[];
  users: UserProfile[];
  products: Product[];
  payouts: any[];
}

export const PrintAdminModal: React.FC<PrintAdminModalProps> = ({
  isOpen,
  onClose,
  type,
  orders,
  users,
  products,
  payouts,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalGross = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalPlatformCut = totalGross * 0.15;
  const totalVendorNet = totalGross * 0.85;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800 text-sm sm:text-base">
              {type === 'orders' && 'Grand Livre des Commandes & Transactions Plateforme PDF'}
              {type === 'users' && 'Registre Officiel des Utilisateurs & Vendeurs PDF'}
              {type === 'payouts' && 'État des Demandes de Retrait & Reversements Vendeurs PDF'}
              {type === 'financial_summary' && 'Bilan Financier Global Plateforme Nexus BIM PDF'}
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
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                  N
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">NEXUS BIM</h1>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Administration Générale & Supervision Centrale</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 pt-2">
                Données certifiées extraites directement de la Base de Données Supabase (Projet: lfndoimqzxvqsosxgeys).
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold font-mono uppercase">
                RAPPORT SUPER ADMINISTRATEUR
              </span>
              <div className="text-xs text-slate-500 pt-2 font-medium">Date d'extraction :</div>
              <div className="text-sm font-bold text-slate-800 font-mono">{currentDate}</div>
              <div className="text-xs text-slate-400">Devise : <strong>USD ($)</strong></div>
            </div>
          </div>

          {/* 1. GRAND LIVRE DES COMMANDES */}
          {type === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Grand Livre des Commandes Enregistrées ({orders.length})</h3>
                <span className="text-xs font-mono font-bold text-slate-700">Volume brut total : ${totalGross.toFixed(2)} USD</span>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-sm">
                  Aucune commande enregistrée dans la base de données.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                      <th className="py-2.5 px-3 font-bold">Réf. Commande</th>
                      <th className="py-2.5 px-3 font-bold">Client</th>
                      <th className="py-2.5 px-3 font-bold">Maison / Vendeur</th>
                      <th className="py-2.5 px-3 font-bold">Date</th>
                      <th className="py-2.5 px-3 font-bold">Articles & Produits</th>
                      <th className="py-2.5 px-3 font-bold">Paiement</th>
                      <th className="py-2.5 px-3 font-bold text-right">Brut ($)</th>
                      <th className="py-2.5 px-3 font-bold text-right text-blue-700">Commission 15%</th>
                      <th className="py-2.5 px-3 font-bold text-right text-emerald-700">Net Vendeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.map((ord) => {
                      const vendorNames = Array.from(new Set(ord.items?.map(i => i.product.vendor_name).filter(Boolean)));
                      const vendorLabel = vendorNames.length > 0 ? vendorNames.join(', ') : 'Vendeur Indépendant';
                      return (
                        <tr key={ord.id}>
                          <td className="py-2.5 px-3 font-mono font-bold">{ord.id.slice(0, 10)}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{ord.customer_name}</div>
                            <div className="text-[11px] text-slate-500">{ord.customer_email}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-800">{vendorLabel}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {new Date(ord.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="font-medium text-slate-900 truncate">
                              {ord.items?.map(i => i.product.title).join(', ') || 'Modèle BIM numérique'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {ord.items?.length || 1} article(s) livrés
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            {ord.payment_method || 'Stripe (CB)'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">${ord.total_amount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-bold">${(ord.total_amount * 0.15).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">${(ord.total_amount * 0.85).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 2. REGISTRE DES UTILISATEURS */}
          {type === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Registre des Utilisateurs & Vendeurs ({users.length})</h3>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {users.filter(u => u.role === 'vendor').length} Vendeurs · {users.filter(u => u.role === 'customer').length} Clients
                </span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                    <th className="py-2.5 px-3 font-bold">Nom / Maison</th>
                    <th className="py-2.5 px-3 font-bold">Email</th>
                    <th className="py-2.5 px-3 font-bold">Rôle</th>
                    <th className="py-2.5 px-3 font-bold">Spécialité / Atelier</th>
                    <th className="py-2.5 px-3 font-bold">Contact (Tél / WhatsApp)</th>
                    <th className="py-2.5 px-3 font-bold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {u.company || u.name}
                        {u.username && <span className="block text-[11px] font-mono text-slate-500 font-normal">@{u.username}</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                      <td className="py-2.5 px-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono ${
                          u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                          u.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                          u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{u.specialty || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {u.whatsapp ? `WA: ${u.whatsapp}` : u.phone || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-emerald-700 font-bold">{u.status || 'Actif'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. BILAN FINANCIER GLOBAL */}
          {type === 'financial_summary' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900">Synthèse Financière Plateforme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">Volume d'affaires brut</div>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">${totalGross.toFixed(2)} USD</div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="text-xs text-blue-700 font-bold uppercase">Commissions Nexus (15%)</div>
                  <div className="text-2xl font-black font-mono text-blue-800 mt-1">${totalPlatformCut.toFixed(2)} USD</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs text-emerald-700 font-bold uppercase">Net Vendeurs (85%)</div>
                  <div className="text-2xl font-black font-mono text-emerald-800 mt-1">${totalVendorNet.toFixed(2)} USD</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">Commandes traitées</div>
                  <div className="text-2xl font-black font-mono text-slate-900 mt-1">{orders.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. RELEVÉ DES RETRAITS */}
          {type === 'payouts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Relevé des Retraits & Payouts ({payouts.length})</h3>
              </div>

              {payouts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-sm">
                  Aucune demande de retrait enregistrée dans la base de données.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                      <th className="py-2.5 px-3 font-bold">Réf.</th>
                      <th className="py-2.5 px-3 font-bold">Maison / Vendeur</th>
                      <th className="py-2.5 px-3 font-bold">Date Demande</th>
                      <th className="py-2.5 px-3 font-bold">Méthode & Coordonnées</th>
                      <th className="py-2.5 px-3 font-bold text-right">Brut Demandé ($)</th>
                      <th className="py-2.5 px-3 font-bold text-right text-blue-700">Frais Nexus 15%</th>
                      <th className="py-2.5 px-3 font-bold text-right text-emerald-700">Net Reversé 85%</th>
                      <th className="py-2.5 px-3 font-bold">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payouts.map((p, idx) => {
                      const gross = Number(p.gross_revenue || p.amount || 0);
                      const net = Number(p.payout_amount || p.amount || 0);
                      const fee = Number(p.platform_fee || (gross * 0.15));
                      return (
                        <tr key={p.id || idx}>
                          <td className="py-2.5 px-3 font-mono font-bold">{p.id}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{p.vendor_name}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            {p.requested_at || new Date().toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{p.method}</div>
                            <div className="font-mono text-[10px] text-slate-500">{p.account_info}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">${gross.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-bold">${fee.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">${net.toFixed(2)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              p.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {p.status === 'completed' ? 'Payé' : p.status === 'processing' ? 'En cours' : 'En attente'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Nexus BIM Marketplace — Architecture Multi-Vendeurs & Supervision Globale.</p>
              <p>Document officiel certifié conforme à l'état de la base de données.</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800">Direction Générale Superadmin</div>
              <div className="h-10 border-b border-dashed border-slate-300 w-44 mt-1" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
