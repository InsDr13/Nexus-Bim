import React from 'react';
import { X, Printer, Download, CheckCircle2, Building2, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Order, VendorStoreSettings, UserProfile, PayoutTransaction } from '../../types/database';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'sale' | 'all_sales' | 'payout' | 'stats';
  order?: Order | null;
  orders?: Order[];
  payout?: PayoutTransaction | null;
  storeSettings: VendorStoreSettings;
  currentUser: UserProfile | null;
  statsData?: {
    grossSales: number;
    netEarnings: number;
    orderCount: number;
    avgOrder: number;
    productsCount: number;
  };
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  onClose,
  type,
  order,
  orders = [],
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white text-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
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
                {storeSettings.logo_url ? (
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
                {type === 'sale' ? 'FACTURE DE VENTE' : type === 'payout' ? 'REÇU DE RETRAIT' : 'RAPPORT OFFICIEL'}
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
                    <span>Frais Plateforme & Transaction (15%) :</span>
                    <span className="font-mono text-rose-600">-${(order.total_amount * 0.15).toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between py-2 text-base font-black text-slate-900 border-t-2 border-slate-900">
                    <span>Revenu Net Vendeur (85%) :</span>
                    <span className="font-mono text-emerald-700">${(order.total_amount * 0.85).toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. GRAND LIVRE DES VENTES */}
          {type === 'all_sales' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Historique complet des ventes de la Maison</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                    <th className="py-2.5 px-3 font-bold">Réf.</th>
                    <th className="py-2.5 px-3 font-bold">Client</th>
                    <th className="py-2.5 px-3 font-bold">Date</th>
                    <th className="py-2.5 px-3 font-bold">Produits</th>
                    <th className="py-2.5 px-3 font-bold text-right">Brut USD</th>
                    <th className="py-2.5 px-3 font-bold text-right text-emerald-700">Net Vendeur (85%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-2 px-3 font-mono font-bold">{ord.id.slice(0, 10)}</td>
                      <td className="py-2 px-3">{ord.customer_name}</td>
                      <td className="py-2 px-3 text-slate-500">{new Date(ord.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="py-2 px-3 truncate max-w-xs">{ord.items.map(i => i.product.title).join(', ')}</td>
                      <td className="py-2 px-3 text-right font-mono">${ord.total_amount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">${(ord.total_amount * 0.85).toFixed(2)}</td>
                    </tr>
                  ))}
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

          {/* 4. RAPPORT STATISTIQUES */}
          {type === 'stats' && statsData && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Bilan d'Activité & Performance Commerciale</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Ventes Brutes</div>
                  <div className="text-xl font-black font-mono text-slate-900">${statsData.grossSales.toFixed(2)} USD</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Revenus Nets</div>
                  <div className="text-xl font-black font-mono text-emerald-700">${statsData.netEarnings.toFixed(2)} USD</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Commandes</div>
                  <div className="text-xl font-black font-mono text-slate-900">{statsData.orderCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Catalogue</div>
                  <div className="text-xl font-black font-mono text-slate-900">{statsData.productsCount} produit(s)</div>
                </div>
              </div>
            </div>
          )}

          {/* Signature & Legal Footer */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Document généré électroniquement par Nexus BIM Marketplace.</p>
              <p>Valable comme justificatif commercial pour l'Atelier {houseName}.</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800">Cachet & Signature Électronique</div>
              <div className="h-10 border-b border-dashed border-slate-300 w-44 mt-1" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
