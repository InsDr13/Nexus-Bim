import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  Clock, 
  CheckCircle2, 
  KeyRound, 
  ArrowRight, 
  ShoppingBag, 
  Lock, 
  ArrowLeft,
  Check,
  User,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Product, Order, UserProfile } from '../../types/database';
import { supabaseAuthService, supabaseDatabaseService } from '../../services/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCompleted: (order: Order) => void;
  currentUser?: UserProfile | null;
  onUserAuthenticated?: (user: UserProfile) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  onOrderCompleted,
  currentUser = null,
  onUserAuthenticated,
}) => {
  const [step, setStep] = useState<'cart' | 'auth' | 'payment' | 'confirmation'>('cart');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [expiry, setExpiry] = useState('11/28');
  const [cvc, setCvc] = useState('742');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.10; // 10% tax in USD
  const total = subtotal + tax;

  // Handler for Checkout trigger: requires client account first!
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setStep('auth');
    } else {
      setStep('payment');
    }
  };

  // Handler for Customer Auth inside Drawer
  const handleCustomerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (!authEmail.trim() || !authEmail.includes('@')) {
          throw new Error('Veuillez saisir une adresse email valide.');
        }
        if (!authPassword || authPassword.length < 4) {
          throw new Error('Le mot de passe doit comporter au moins 4 caractères.');
        }
        if (authPassword !== authConfirmPassword) {
          throw new Error('Les deux mots de passe ne correspondent pas.');
        }

        const { user, error } = await supabaseAuthService.signUpCustomer({
          email: authEmail.trim(),
          password: authPassword,
          name: authName.trim() || authEmail.split('@')[0]
        });
        if (error) throw new Error(error);
        if (user) {
          if (onUserAuthenticated) onUserAuthenticated(user);
          setStep('payment');
        }
      } else {
        const { user, error } = await supabaseAuthService.signIn(authEmail.trim(), authPassword);
        if (error) throw new Error(error);
        if (user) {
          if (onUserAuthenticated) onUserAuthenticated(user);
          setStep('payment');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Échec de connexion ou d\'inscription client.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    const buyerName = currentUser?.name || authName || 'Thomas L.';
    const buyerEmail = currentUser?.email || authEmail || 'thomas.leroy@architectes-paris.com';
    const buyerId = currentUser?.id || 'cust-direct';

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: buyerId,
      customer_name: buyerName,
      customer_email: buyerEmail,
      total_amount: total,
      tax_amount: tax,
      status: 'completed',
      created_at: new Date().toISOString().split('T')[0],
      items: cartItems.map((prod, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        order_id: `ord-new`,
        product_id: prod.id,
        product: prod,
        price: prod.price,
        download_url: prod.download_url || 'https://nexusbim-storage.internal/files/download.zip',
        external_link: prod.external_link,
        license_key: prod.sample_activation_key || prod.activation_key || (prod.product_type === 'activation_key' ? `NEXUS-KEY-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined)
      }))
    };

    // Save to real database / Supabase
    try {
      await supabaseDatabaseService.createOrder(newOrder);
    } catch (e) {}

    setTimeout(() => {
      setLastOrder(newOrder);
      onOrderCompleted(newOrder);
      onClearCart();
      setIsProcessing(false);
      setStep('confirmation');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg sm:max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Stepper & Back */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-[#090e1a] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={step === 'cart' ? onClose : () => setStep('cart')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{step === 'cart' ? 'Fermer' : 'Retour'}</span>
              </button>
              <div className="h-4 w-px bg-slate-800" />
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <span>
                  {step === 'cart' && `Mon Panier (${cartItems.length})`}
                  {step === 'auth' && 'Compte Client Requis'}
                  {step === 'payment' && 'Paiement Sécurisé'}
                  {step === 'confirmation' && 'Commande Confirmée !'}
                </span>
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-1">
            <span className={step === 'cart' ? 'text-blue-400 font-bold' : 'text-slate-500'}>1. Panier</span>
            <span className="text-slate-700">──</span>
            <span className={step === 'auth' ? 'text-blue-400 font-bold' : currentUser ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              2. Compte Client {currentUser ? '✓' : ''}
            </span>
            <span className="text-slate-700">──</span>
            <span className={step === 'payment' ? 'text-blue-400 font-bold' : 'text-slate-500'}>3. Paiement</span>
            <span className="text-slate-700">──</span>
            <span className={step === 'confirmation' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>4. Clés & Fichiers</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 flex-1 space-y-6">
          
          {/* STEP 1: CART ITEMS */}
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Votre panier est vide</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Explorez les modèles Revit, familles 3D et add-ins du catalogue.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                  >
                    Explorer la marketplace
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Cart items list in White Cards */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 flex items-center justify-between gap-3.5 shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-blue-700">{item.software}</span>
                              <span>·</span>
                              <span>{item.file_size}</span>
                            </div>
                            <div className="text-sm font-black text-slate-900 font-mono mt-1">
                              ${item.price.toFixed(2)} USD
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                          title="Supprimer du panier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary card in White */}
                  <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-3 text-xs sm:text-sm shadow-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Sous-total articles :</span>
                      <span className="font-mono font-bold text-slate-900">${subtotal.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>TVA / Taxes applicables (10%) :</span>
                      <span className="font-mono font-bold text-slate-900">${tax.toFixed(2)} USD</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-base text-slate-900">
                      <span>Total à payer :</span>
                      <span className="font-mono text-blue-600 text-lg sm:text-xl">${total.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] hover:brightness-105 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
                  >
                    <span>Passer la commande</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* STEP 1.5: MANDATORY CUSTOMER ACCOUNT CREATION BEFORE PAYMENT */}
          {step === 'auth' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
              <div>
                <span className="text-[11px] font-mono text-blue-700 font-bold uppercase tracking-wider block">
                  Étape requise avant le paiement
                </span>
                <h3 className="font-['EB_Garamond',serif] text-2xl font-bold text-slate-900 leading-snug">
                  Création ou Connexion à votre Compte Client
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Votre compte acheteur permet d'associer votre licence, de générer vos factures conformes et de vous garantir l'accès permanent aux téléchargements.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${authMode === 'signup' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Nouveau Client (Inscription)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-lg transition-colors ${authMode === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'}`}
                >
                  J'ai déjà un compte (Connexion)
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleCustomerAuth} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nom Complet / Raison Sociale</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Ex : Thomas Leroy Architecte"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Adresse Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="thomas@agence.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-bold text-slate-700">Mot de Passe</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">Confirmer le Mot de Passe</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {isAuthLoading ? (
                    <span>Enregistrement du compte...</span>
                  ) : (
                    <>
                      <span>{authMode === 'signup' ? 'Valider mon compte & Continuer vers le paiement' : 'Se connecter & Continuer'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: PAYMENT FORM IN USD */}
          {step === 'payment' && (
            <div className="space-y-5">
              
              {/* Client Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Compte client actif : {currentUser?.name || authName || 'Thomas L.'}</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700">{currentUser?.email || authEmail}</span>
              </div>

              {/* Order Recap */}
              <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-2.5 text-xs sm:text-sm shadow-sm">
                <div className="font-extrabold text-slate-900 mb-2">Récapitulatif de commande</div>
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-slate-600">
                    <span className="truncate max-w-[260px]">{item.title}</span>
                    <span className="font-mono font-bold text-slate-900">${item.price.toFixed(2)} USD</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-3 flex justify-between font-extrabold text-slate-900 text-base">
                  <span>Total en $ USD</span>
                  <span className="font-mono text-blue-600 text-lg">${total.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Payment Card Form in White Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900">Carte bancaire (Stripe)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SSL 256-bit</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">Numéro de carte</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 font-bold text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Expiration</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 font-bold text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">CVC</label>
                      <input
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 font-bold text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#0284c7] hover:brightness-105 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Émission des clés et facturation...</span>
                    </span>
                  ) : (
                    <span>Payer ${total.toFixed(2)} USD</span>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: ORDER CONFIRMED */}
          {step === 'confirmation' && lastOrder && (
            <div className="space-y-6 text-center py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-['EB_Garamond',serif] text-2xl sm:text-3xl font-bold text-white">
                  Paiement Réussi & Accès Débloqué !
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1">
                  Commande <strong className="text-white font-mono">{lastOrder.id}</strong> validée et enregistrée.
                </p>
              </div>

              {/* Items Acquired with Immediate Keys & Downloads */}
              <div className="space-y-3 text-left">
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-2.5 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.product.title}</h4>
                        <span className="text-[11px] text-slate-500">{item.product.vendor_name} · {item.product.file_format}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Payé
                      </span>
                    </div>

                    {item.license_key && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-bold text-slate-800">{item.license_key}</span>
                        </div>
                        <span className="text-[10px] text-blue-700 font-sans font-bold">Licence Activée</span>
                      </div>
                    )}

                    <div className="pt-1">
                      <a
                        href={item.download_url || '#'}
                        download
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger le fichier</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition-colors"
                >
                  Terminer & Accéder à mes achats
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
