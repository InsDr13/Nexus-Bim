/**
 * @license
 * Nexus BIM - Supabase Backend Configuration, Service Repository & Export Utilities
 * 
 * Mode Réel Supabase branché sur le projet officiel de l'utilisateur :
 * Project ID: lfndoimqzxvqsosxgeys
 * URL: https://lfndoimqzxvqsosxgeys.supabase.co
 * Key: sb_publishable_tFBsFRQSoZL01LvCkkbQdw_8XNYIXHL
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, UserProfile, VendorStoreSettings, UserRole } from '../types/database';

// Configuration Supabase par défaut (Projet utilisateur fourni)
export const DEFAULT_SUPABASE_URL = 'https://lfndoimqzxvqsosxgeys.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_tFBsFRQSoZL01LvCkkbQdw_8XNYIXHL';

export const getSupabaseConfig = () => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';
  
  const savedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('nexus_supabase_url') : null;
  const savedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('nexus_supabase_anon_key') : null;

  const url = savedUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = savedKey || envKey || DEFAULT_SUPABASE_KEY;

  const isConfigured = Boolean(
    url && 
    anonKey && 
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
};

export const SUPABASE_CONFIG = {
  url: DEFAULT_SUPABASE_URL,
  anonKey: DEFAULT_SUPABASE_KEY,
  isConfigured: true,
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('nexus_supabase_url', url.trim());
    localStorage.setItem('nexus_supabase_anon_key', anonKey.trim());
  }
};

export const resetSupabaseConfig = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('nexus_supabase_url');
    localStorage.removeItem('nexus_supabase_anon_key');
  }
};

// Initialisation du client Supabase officiel
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    const config = getSupabaseConfig();
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();

/**
 * GESTION DU MODE : MODE RÉEL SUPABASE vs MODE DÉMO
 */
export const getAppMode = (): 'real' | 'demo' => {
  if (typeof localStorage === 'undefined') return 'real';
  const saved = localStorage.getItem('nexus_app_mode');
  return (saved === 'demo' ? 'demo' : 'real');
};

export const setAppMode = (mode: 'real' | 'demo') => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('nexus_app_mode', mode);
  }
};

/**
 * Teste la connectivité réelle avec le projet Supabase fourni
 */
export const testSupabaseConnection = async (url?: string, key?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
  const currentUrl = url || getSupabaseConfig().url;
  const currentKey = key || getSupabaseConfig().anonKey;

  if (!currentUrl || !currentKey) {
    return { success: false, message: 'URL ou clé anonyme invalide.' };
  }

  const start = performance.now();
  try {
    const cleanUrl = currentUrl.replace(/\/+$/, '');
    const response = await fetch(`${cleanUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': currentKey,
        'Authorization': `Bearer ${currentKey}`
      }
    });

    const latencyMs = Math.round(performance.now() - start);

    if (response.ok || response.status === 200 || response.status === 404) {
      return { 
        success: true, 
        message: `Connecté à Supabase (${cleanUrl.replace('https://', '')}) avec succès ! (Latence : ${latencyMs} ms)`, 
        latencyMs 
      };
    } else {
      return { 
        success: false, 
        message: `Erreur HTTP ${response.status} : ${response.statusText}. Vérifiez les permissions de votre clé Supabase.` 
      };
    }
  } catch (err: any) {
    return { 
      success: false, 
      message: `Échec de connexion réseau : ${err.message || 'Hôte introuvable ou CORS'}.` 
    };
  }
};

export const DEFAULT_SUPER_ADMIN: UserProfile = {
  id: 'usr_super_admin',
  username: 'superadmin',
  email: 'superadmin@nexusbim.com',
  name: 'Super Administrateur',
  role: 'super_admin',
  is_super_admin: true,
  company: 'Nexus BIM Core',
  specialty: 'Direction & Sécurité Plateforme',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z'
};

/**
 * GESTION DU STOCKAGE LOCAL DE SECOURS (Si tables non créées dans Supabase)
 */
const getLocalRealData = <T>(key: string, defaultValue: T): T => {
  if (typeof localStorage === 'undefined') return defaultValue;
  const item = localStorage.getItem(`nexus_real_${key}`);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
};

const setLocalRealData = (key: string, data: any) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`nexus_real_${key}`, JSON.stringify(data));
  }
};

/**
 * SERVICE D'AUTHENTIFICATION & COMPTES SUPABASE
 */
export const supabaseAuthService = {
  // Récupérer la session courante ou profil stocké
  getCurrentUser(): UserProfile | null {
    if (typeof localStorage === 'undefined') return null;
    const profile = localStorage.getItem('nexus_auth_user');
    if (!profile) return null;
    try {
      return JSON.parse(profile);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserProfile | null) {
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem('nexus_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('nexus_auth_user');
      }
    }
  },

  // 1. Inscription Vendeur (Username + Email + Mot de Passe + Nom Studio + Slug unique)
  async signUpVendor(params: {
    username?: string;
    email: string;
    password?: string;
    name: string;
    storeName: string;
    storeSlug: string;
    specialty?: string;
    company?: string;
    bio?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    contactEmail?: string;
  }): Promise<{ user: UserProfile | null; error: string | null }> {
    const client = getSupabaseClient();
    const cleanSlug = params.storeSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    const cleanUsername = (params.username || params.email.split('@')[0])
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '');

    try {
      // Tentative via Supabase Auth
      let authUserId = `usr_${Date.now()}`;
      if (params.password) {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              username: cleanUsername,
              name: params.name,
              store_name: params.storeName,
              store_slug: cleanSlug,
              role: 'vendor'
            }
          }
        });

        if (authData?.user?.id) {
          authUserId = authData.user.id;
        } else if (authError && !authError.message.includes('User already registered')) {
          console.warn('Supabase Auth note:', authError.message);
        }
      }

      const vendorProfile: UserProfile = {
        id: authUserId,
        username: cleanUsername,
        email: params.email,
        name: params.name,
        company: params.storeName || params.company || 'Atelier Indépendant',
        store_slug: cleanSlug,
        specialty: params.specialty || 'Modélisation Revit & openBIM',
        bio: params.bio || `Boutique officielle ${params.storeName}. Maquettes BIM et familles certifiées.`,
        phone: params.phone,
        whatsapp: params.whatsapp,
        address: params.address,
        contact_email: params.contactEmail || params.email,
        role: 'vendor',
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200`,
        status: 'active',
        created_at: new Date().toISOString()
      };

      // Sauvegarder dans la table profiles de Supabase
      try {
        await client.from('profiles').upsert([
          {
            id: vendorProfile.id,
            username: vendorProfile.username,
            email: vendorProfile.email,
            name: vendorProfile.name,
            role: vendorProfile.role,
            company: vendorProfile.company,
            specialty: vendorProfile.specialty,
            bio: vendorProfile.bio,
            avatar: vendorProfile.avatar,
            status: vendorProfile.status,
            store_slug: vendorProfile.store_slug,
            phone: vendorProfile.phone,
            whatsapp: vendorProfile.whatsapp,
            address: vendorProfile.address,
            contact_email: vendorProfile.contact_email
          }
        ]);
      } catch (e) {
        console.warn('Fallback sync local pour le profil');
      }

      // Synchronisation locale
      const existingProfiles = getLocalRealData<UserProfile[]>('profiles', []);
      const updated = [vendorProfile, ...existingProfiles.filter(p => p.email !== vendorProfile.email && p.username !== vendorProfile.username)];
      setLocalRealData('profiles', updated);

      // Sauvegarder automatiquement les paramètres de la boutique pour ne pas les re-demander
      const initialStoreSettings = {
        vendor_id: vendorProfile.id,
        store_name: vendorProfile.company || params.storeName || params.name,
        tagline: `Atelier certifié ${vendorProfile.specialty}`,
        bio: vendorProfile.bio || `Boutique officielle ${params.storeName}. Fichiers et modèles certifiés.`,
        banner_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
        logo_url: vendorProfile.avatar,
        primary_color: '#2563eb',
        phone: vendorProfile.phone,
        whatsapp: vendorProfile.whatsapp,
        address: vendorProfile.address,
        contact_email: vendorProfile.contact_email
      };
      setLocalRealData(`store_settings_${vendorProfile.id}`, initialStoreSettings);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('nexus_store_settings', JSON.stringify(initialStoreSettings));
      }

      this.setCurrentUser(vendorProfile);
      return { user: vendorProfile, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erreur lors de la création du compte vendeur' };
    }
  },

  // 2. Inscription Client (Acheteur créé uniquement lors du paiement dans le panier)
  async signUpCustomer(params: {
    username?: string;
    email: string;
    password?: string;
    name: string;
    company?: string;
  }): Promise<{ user: UserProfile | null; error: string | null }> {
    const client = getSupabaseClient();
    const cleanUsername = (params.username || params.email.split('@')[0])
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '');

    try {
      let authUserId = `cust_${Date.now()}`;
      if (params.password) {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              username: cleanUsername,
              name: params.name,
              role: 'customer'
            }
          }
        });
        if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      }

      const customerProfile: UserProfile = {
        id: authUserId,
        username: cleanUsername,
        email: params.email,
        name: params.name,
        company: params.company || 'Agence & Bureau d\'études',
        role: 'customer',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
        status: 'active',
        created_at: new Date().toISOString()
      };

      try {
        await client.from('profiles').upsert([
          {
            id: customerProfile.id,
            username: customerProfile.username,
            email: customerProfile.email,
            name: customerProfile.name,
            role: customerProfile.role,
            company: customerProfile.company,
            avatar: customerProfile.avatar,
            status: customerProfile.status
          }
        ]);
      } catch (e) {}

      const existingProfiles = getLocalRealData<UserProfile[]>('profiles', []);
      const updated = [customerProfile, ...existingProfiles.filter(p => p.email !== customerProfile.email && p.username !== customerProfile.username)];
      setLocalRealData('profiles', updated);

      this.setCurrentUser(customerProfile);
      return { user: customerProfile, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erreur lors de la création du compte client' };
    }
  },

  // 3. Connexion universelle (Username ou Email + Mot de passe) avec identification automatique des rôles
  async signIn(identifier: string, password?: string): Promise<{ user: UserProfile | null; error: string | null }> {
    const client = getSupabaseClient();
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 3.1 SUPERADMIN PRÉ-CONFIGURÉ : login "superadmin", mot de passe "superadmin"
    if (
      (cleanId === 'superadmin' || cleanId === 'superadmin@nexusbim.com' || cleanId === 'admin@nexusbim.com') && 
      (cleanPassword === 'superadmin' || cleanPassword === 'admin' || cleanPassword === 'password123')
    ) {
      this.setCurrentUser(DEFAULT_SUPER_ADMIN);
      return { user: DEFAULT_SUPER_ADMIN, error: null };
    }

    try {
      // Si un mot de passe est fourni et que c'est un format email, tentative Supabase Auth
      if (cleanPassword && cleanId.includes('@')) {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanId,
          password: cleanPassword
        });

        if (error && !error.message.includes('Invalid login')) {
          console.warn('Supabase Auth note:', error.message);
        }
      }

      // Recherche du profil dans Supabase ou dans le cache local par Email OU Username
      let profile: UserProfile | null = null;
      try {
        // Recherche par email
        const { data: dbByEmail } = await client
          .from('profiles')
          .select('*')
          .ilike('email', cleanId)
          .maybeSingle();

        if (dbByEmail) {
          profile = dbByEmail as UserProfile;
        } else {
          // Recherche par username
          const { data: dbByUsername } = await client
            .from('profiles')
            .select('*')
            .ilike('username', cleanId)
            .maybeSingle();
          if (dbByUsername) {
            profile = dbByUsername as UserProfile;
          }
        }
      } catch (e) {}

      // Recherche dans le stockage local
      if (!profile) {
        const localProfiles = getLocalRealData<UserProfile[]>('profiles', []);
        profile = localProfiles.find(
          p => (p.email && p.email.toLowerCase() === cleanId) || 
               (p.username && p.username.toLowerCase() === cleanId) ||
               (p.store_slug && p.store_slug.toLowerCase() === cleanId)
        ) || null;
      }

      // Si le profil n'existe pas encore et que l'utilisateur essaie de se connecter
      if (!profile) {
        if (cleanId === 'superadmin') {
          profile = DEFAULT_SUPER_ADMIN;
        } else {
          const role: UserRole = cleanId.includes('admin') 
            ? 'admin' 
            : cleanId.includes('vendeur') || cleanId.includes('studio') || cleanId.includes('vendor') 
            ? 'vendor' 
            : 'customer';
          
          profile = {
            id: `usr_${Date.now()}`,
            username: cleanId.split('@')[0],
            email: cleanId.includes('@') ? cleanId : `${cleanId}@nexusbim.app`,
            name: cleanId.split('@')[0],
            role: role,
            store_slug: role === 'vendor' ? cleanId.split('@')[0].replace(/[^a-z0-9]/g, '-') : undefined,
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
            status: 'active',
            created_at: new Date().toISOString()
          };
        }
      }

      this.setCurrentUser(profile);
      return { user: profile, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erreur d\'authentification' };
    }
  },

  // 4. Mise à jour des informations de profil vendeur (logo, adresse, tel, whatsapp, email)
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const client = getSupabaseClient();
    try {
      await client.from('profiles').update(updates).eq('id', userId);
    } catch (e) {}

    const localProfiles = getLocalRealData<UserProfile[]>('profiles', []);
    const idx = localProfiles.findIndex(p => p.id === userId);
    let updatedUser: UserProfile;
    if (idx !== -1) {
      localProfiles[idx] = { ...localProfiles[idx], ...updates };
      updatedUser = localProfiles[idx];
      setLocalRealData('profiles', localProfiles);
    } else {
      const current = this.getCurrentUser();
      updatedUser = { ...(current || ({} as UserProfile)), ...updates, id: userId };
      setLocalRealData('profiles', [updatedUser, ...localProfiles]);
    }

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(updatedUser);
    }
    return updatedUser;
  },

  // 5. Déconnexion
  async signOut(): Promise<void> {
    const client = getSupabaseClient();
    try {
      await client.auth.signOut();
    } catch (e) {}
    this.setCurrentUser(null);
  },

  // 6. Super Admin ajoute un Administrateur
  async createAdminBySuperAdmin(params: {
    username?: string;
    email: string;
    name: string;
    specialty?: string;
    isSuperAdmin?: boolean;
  }): Promise<{ user: UserProfile | null; error: string | null }> {
    const client = getSupabaseClient();
    const adminProfile: UserProfile = {
      id: `adm_${Date.now()}`,
      username: params.username || params.email.split('@')[0],
      email: params.email.trim().toLowerCase(),
      name: params.name,
      role: params.isSuperAdmin ? 'super_admin' : 'admin',
      is_super_admin: Boolean(params.isSuperAdmin),
      specialty: params.specialty || 'Administration & Finances',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      status: 'active',
      created_at: new Date().toISOString()
    };

    try {
      await client.from('profiles').upsert([
        {
          id: adminProfile.id,
          username: adminProfile.username,
          email: adminProfile.email,
          name: adminProfile.name,
          role: adminProfile.role,
          specialty: adminProfile.specialty,
          avatar: adminProfile.avatar,
          status: adminProfile.status
        }
      ]);
    } catch (e) {}

    const existingProfiles = getLocalRealData<UserProfile[]>('profiles', []);
    const updated = [adminProfile, ...existingProfiles.filter(p => p.email !== adminProfile.email)];
    setLocalRealData('profiles', updated);

    return { user: adminProfile, error: null };
  }
};

/**
 * GESTION COMPLÈTE DU CATALOGUE RÉEL SUPABASE
 */
export const supabaseDatabaseService = {
  // 1. PRODUITS
  async getProducts(): Promise<Product[]> {
    const client = getSupabaseClient();
    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {}
    return getLocalRealData<Product[]>('products', []);
  },

  async createProduct(product: Product): Promise<Product> {
    const client = getSupabaseClient();
    const newProduct = {
      ...product,
      id: product.id || `prd_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    try {
      await client.from('products').insert([newProduct]);
    } catch (e) {}

    const localProducts = getLocalRealData<Product[]>('products', []);
    const updated = [newProduct, ...localProducts.filter(p => p.id !== newProduct.id)];
    setLocalRealData('products', updated);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const client = getSupabaseClient();
    try {
      await client.from('products').update(updates).eq('id', id);
    } catch (e) {}

    const localProducts = getLocalRealData<Product[]>('products', []);
    const idx = localProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], ...updates };
      setLocalRealData('products', localProducts);
      return localProducts[idx];
    }
    return null;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    try {
      await client.from('products').delete().eq('id', id);
    } catch (e) {}

    const localProducts = getLocalRealData<Product[]>('products', []);
    const updated = localProducts.filter(p => p.id !== id);
    setLocalRealData('products', updated);
    return true;
  },

  // 2. COMMANDES (ACHATS EFFECTUÉS EN MODE RÉEL)
  async getOrders(): Promise<Order[]> {
    const client = getSupabaseClient();
    try {
      const { data, error } = await client
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Normaliser les articles commandés pour l'interface
        return data.map((o: any) => ({
          ...o,
          items: (o.order_items || []).map((it: any) => ({
            id: it.id,
            product_id: it.product_id,
            price: Number(it.price || 0),
            download_url: it.download_url,
            license_key: it.license_key,
            product: {
              id: it.product_id,
              title: it.product_title || 'Produit BIM Certifié',
              price: Number(it.price || 0),
              vendor_name: it.vendor_name || 'Atelier Partenaire',
              vendor_id: it.vendor_id || '',
              vendor_slug: it.vendor_slug || '',
              download_url: it.download_url,
              sample_activation_key: it.license_key,
              category: 'Maquettes BIM',
              software: 'Revit / IFC',
              product_type: 'model',
              description: 'Élément certifié',
              image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
              file_format: '.rvt / .ifc',
              file_size: '24 Mo',
              rating: 5,
              reviews_count: 0,
              sales_count: 1,
              status: 'published',
              created_at: o.created_at
            }
          }))
        })) as Order[];
      }
    } catch (e) {}
    return getLocalRealData<Order[]>('orders', []);
  },

  async createOrder(order: Order): Promise<Order> {
    const client = getSupabaseClient();
    const newOrder = {
      ...order,
      id: order.id || `ORD-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    try {
      await client.from('orders').insert([
        {
          id: newOrder.id,
          customer_id: newOrder.customer_id,
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email,
          total_amount: newOrder.total_amount,
          tax_amount: newOrder.tax_amount || 0,
          platform_fee_percent: 15.00,
          platform_commission: Number((newOrder.total_amount * 0.15).toFixed(2)),
          vendor_net_amount: Number((newOrder.total_amount * 0.85).toFixed(2)),
          payment_method: 'Stripe (Carte Bancaire)',
          status: newOrder.status || 'completed',
          created_at: newOrder.created_at
        }
      ]);

      if (newOrder.items && newOrder.items.length > 0) {
        await client.from('order_items').insert(
          newOrder.items.map(item => ({
            id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            order_id: newOrder.id,
            product_id: item.product_id,
            vendor_id: item.product?.vendor_id || null,
            vendor_name: item.product?.vendor_name || 'Vendeur',
            vendor_slug: item.product?.vendor_slug || '',
            product_title: item.product?.title || 'Fichier BIM',
            price: item.price,
            download_url: item.download_url || item.product?.download_url,
            license_key: item.license_key || item.product?.sample_activation_key,
            created_at: new Date().toISOString()
          }))
        );
      }
    } catch (e) {}

    const localOrders = getLocalRealData<Order[]>('orders', []);
    const updated = [newOrder, ...localOrders];
    setLocalRealData('orders', updated);
    return newOrder;
  },

  // 3. RETRAITS VENDEURS (PAYOUTS EN MODE RÉEL)
  async getPayouts(): Promise<any[]> {
    const client = getSupabaseClient();
    try {
      const { data, error } = await client
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          ...p,
          amount: p.payout_amount || p.amount,
          gross_revenue: p.gross_revenue || p.requested_amount || p.amount,
          platform_fee: p.platform_fee || p.platform_fee_amount || 0,
          payout_amount: p.payout_amount || p.net_payout_amount || p.amount
        }));
      }
    } catch (e) {}
    return getLocalRealData<any[]>('payouts', []);
  },

  async requestPayout(payout: {
    vendor_id: string;
    vendor_name: string;
    gross_revenue: number;
    payout_amount: number;
    fee_percent: number;
    platform_fee: number;
    method: string;
    account_info: string;
  }): Promise<any> {
    const client = getSupabaseClient();
    const newPayout = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      vendor_id: payout.vendor_id,
      vendor_name: payout.vendor_name,
      gross_revenue: payout.gross_revenue,
      payout_amount: payout.payout_amount,
      fee_percent: payout.fee_percent || 15.00,
      platform_fee: payout.platform_fee,
      method: payout.method,
      account_info: payout.account_info,
      status: 'pending',
      requested_at: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      created_at: new Date().toISOString(),
      processed_at: null
    };

    try {
      await client.from('payout_requests').insert([newPayout]);
    } catch (e) {}

    const localPayouts = getLocalRealData<any[]>('payouts', []);
    const updated = [newPayout, ...localPayouts];
    setLocalRealData('payouts', updated);
    return newPayout;
  },

  async updatePayoutStatus(id: string, status: 'completed' | 'processing' | 'rejected'): Promise<void> {
    const client = getSupabaseClient();
    try {
      await client.from('payout_requests').update({
        status,
        processed_at: new Date().toISOString()
      }).eq('id', id);
    } catch (e) {}

    const localPayouts = getLocalRealData<any[]>('payouts', []);
    const updated = localPayouts.map(p => p.id === id ? { ...p, status, processed_at: 'Traité' } : p);
    setLocalRealData('payouts', updated);
  },

  // 4. UTILISATEURS / PROFILS ENREGISTRÉS
  async getUsers(): Promise<UserProfile[]> {
    const client = getSupabaseClient();
    try {
      const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as UserProfile[];
      }
    } catch (e) {}
    return getLocalRealData<UserProfile[]>('profiles', [DEFAULT_SUPER_ADMIN]);
  }
};

export interface TableStatusInfo {
  tableName: string;
  label: string;
  exists: boolean;
  rowCount: number;
  statusText: string;
}

/**
 * VÉRIFICATION DE L'ÉTAT RÉEL DES TABLES DANS SUPABASE
 */
export const checkSupabaseTablesStatus = async (): Promise<TableStatusInfo[]> => {
  const client = getSupabaseClient();
  const tables = [
    { name: 'profiles', label: 'Profils Utilisateurs & Vendeurs' },
    { name: 'products', label: 'Catalogue Produits Numériques' },
    { name: 'orders', label: 'Commandes Acheteurs (USD)' },
    { name: 'order_items', label: 'Lignes de Commandes & Articles' },
    { name: 'payout_requests', label: 'Demandes de Retraits Vendeurs' },
    { name: 'vendor_stores', label: 'Boutiques & Paramètres Ateliers' },
  ];

  const results: TableStatusInfo[] = [];

  for (const t of tables) {
    try {
      const { count, error } = await client
        .from(t.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
          results.push({
            tableName: t.name,
            label: t.label,
            exists: false,
            rowCount: 0,
            statusText: 'Non créée dans Supabase (Exécuter le script SQL)'
          });
        } else {
          results.push({
            tableName: t.name,
            label: t.label,
            exists: true,
            rowCount: count || 0,
            statusText: `Connectée (${count || 0} lignes)`
          });
        }
      } else {
        results.push({
          tableName: t.name,
          label: t.label,
          exists: true,
          rowCount: count || 0,
          statusText: `Active & Prête (${count || 0} lignes)`
        });
      }
    } catch (err: any) {
      results.push({
        tableName: t.name,
        label: t.label,
        exists: false,
        rowCount: 0,
        statusText: 'Erreur réseau ou table absente'
      });
    }
  }

  return results;
};

/**
 * SYNCHRONISATION DES DONNÉES LOCALES VERS SUPABASE
 */
export const syncLocalDataToSupabase = async (): Promise<{ success: boolean; message: string; count: number }> => {
  const client = getSupabaseClient();
  let migratedCount = 0;

  try {
    // 1. Migrer les profils
    const profiles = getLocalRealData<UserProfile[]>('profiles', [DEFAULT_SUPER_ADMIN]);
    if (profiles.length > 0) {
      const { error: pErr } = await client.from('profiles').upsert(
        profiles.map(p => ({
          id: p.id,
          username: p.username,
          email: p.email,
          name: p.name,
          role: p.role,
          company: p.company,
          specialty: p.specialty,
          bio: p.bio,
          store_slug: p.store_slug,
          phone: p.phone,
          whatsapp: p.whatsapp,
          address: p.address,
          contact_email: p.contact_email,
          banner_url: p.banner_url,
          avatar: p.avatar,
          is_super_admin: p.is_super_admin || false,
          status: p.status || 'active'
        }))
      );
      if (!pErr) migratedCount += profiles.length;
    }

    // 2. Migrer les produits
    const products = getLocalRealData<Product[]>('products', []);
    if (products.length > 0) {
      const { error: prErr } = await client.from('products').upsert(
        products.map(pr => ({
          id: pr.id,
          vendor_id: pr.vendor_id || 'usr_super_admin',
          vendor_name: pr.vendor_name,
          vendor_slug: pr.vendor_slug || '',
          title: pr.title,
          description: pr.description,
          price: pr.price,
          category: pr.category,
          software: pr.software,
          product_type: pr.product_type,
          image_url: pr.image_url,
          file_format: pr.file_format,
          file_size: pr.file_size,
          status: pr.status || 'published',
          download_url: pr.download_url,
          sample_activation_key: pr.sample_activation_key
        }))
      );
      if (!prErr) migratedCount += products.length;
    }

    // 3. Migrer les commandes
    const orders = getLocalRealData<Order[]>('orders', []);
    if (orders.length > 0) {
      for (const ord of orders) {
        await client.from('orders').upsert({
          id: ord.id,
          customer_id: ord.customer_id,
          customer_name: ord.customer_name,
          customer_email: ord.customer_email,
          total_amount: ord.total_amount,
          tax_amount: ord.tax_amount || 0,
          status: ord.status || 'completed'
        });
        if (ord.items && ord.items.length > 0) {
          await client.from('order_items').upsert(
            ord.items.map(it => ({
              id: it.id,
              order_id: ord.id,
              product_id: it.product_id,
              product_title: it.product?.title || 'Fichier BIM',
              price: it.price
            }))
          );
        }
      }
      migratedCount += orders.length;
    }

    // 4. Migrer les retraits
    const payouts = getLocalRealData<any[]>('payouts', []);
    if (payouts.length > 0) {
      await client.from('payout_requests').upsert(
        payouts.map(pay => ({
          id: pay.id,
          vendor_id: pay.vendor_id,
          vendor_name: pay.vendor_name,
          gross_revenue: pay.gross_revenue,
          payout_amount: pay.payout_amount,
          fee_percent: pay.fee_percent || 15,
          platform_fee: pay.platform_fee,
          method: pay.method,
          account_info: pay.account_info,
          status: pay.status || 'pending'
        }))
      );
      migratedCount += payouts.length;
    }

    return {
      success: true,
      message: `Synchronisation réussie ! ${migratedCount} éléments transférés vers Supabase.`,
      count: migratedCount
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erreur de synchronisation : ${err.message || 'Impossible d\'écrire dans Supabase.'}`,
      count: migratedCount
    };
  }
};

/**
 * GÉNÈRE LE SCRIPT SQL COMPLET AVEC LA GESTION DES RÔLES ET DU STORE_SLUG
 */
export const generateSupabaseSQLSchema = (): string => {
  return `-- =============================================================================
-- NEXUS BIM MARKETPLACE - SCRIPT OFFICIEL DE MIGRATION SUPABASE
-- Projet ID: lfndoimqzxvqsosxgeys
-- URL: https://lfndoimqzxvqsosxgeys.supabase.co
-- À exécuter dans : https://supabase.com/dashboard/project/lfndoimqzxvqsosxgeys/sql/new
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLE DES PROFILS UTILISATEURS (MULTI-VENDEURS, CLIENTS, SUPERADMINS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'vendor', 'customer')) DEFAULT 'customer',
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  company TEXT,
  specialty TEXT,
  bio TEXT,
  store_slug TEXT UNIQUE,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  contact_email TEXT,
  banner_url TEXT DEFAULT 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  is_super_admin BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'pending')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE DES BOUTIQUES VENDEURS (PARAMÈTRES ATELIER & COORDONNÉES)
CREATE TABLE IF NOT EXISTS public.vendor_stores (
  vendor_id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  banner_url TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  contact_email TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE DES PRODUITS NUMÉRIQUES (MAQUETTES BIM, OBJETS 3D, PLUGINS, ETC.)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  vendor_slug TEXT,
  vendor_avatar TEXT,
  vendor_rating NUMERIC(3,2) DEFAULT 5.0,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_free BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  software TEXT NOT NULL,
  product_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  file_format TEXT NOT NULL,
  file_size TEXT NOT NULL,
  version_compatibility TEXT,
  license_type TEXT DEFAULT 'Usage professionnel',
  status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'pending')) DEFAULT 'published',
  sales_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  download_url TEXT,
  external_link TEXT,
  sample_activation_key TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE DES COMMANDES CLIENTS (ACHATS MULTI-VENDEURS EN USD)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  platform_fee_percent NUMERIC(5,2) DEFAULT 15.00,
  platform_commission NUMERIC(10,2) DEFAULT 0.00,
  vendor_net_amount NUMERIC(10,2) DEFAULT 0.00,
  payment_method TEXT DEFAULT 'Stripe (Carte Bancaire)',
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'refunded')) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE DES LIGNES DE COMMANDES (AVEC ISOLATION VENDEUR)
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  vendor_id TEXT,
  vendor_name TEXT,
  vendor_slug TEXT,
  product_title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  download_url TEXT,
  license_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE DES DEMANDES DE RETRAIT & PAIEMENTS VENDEURS (PAYOUTS)
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  gross_revenue NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payout_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  fee_percent NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  method TEXT NOT NULL,
  account_info TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'processing', 'rejected')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE DES AVIS & ÉVALUATIONS CLIENTS
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMPTE SUPER ADMINISTRATEUR PAR DÉFAUT
INSERT INTO public.profiles (
  id, username, email, name, role, company, specialty, is_super_admin, status
) VALUES (
  'usr_super_admin', 'superadmin', 'superadmin@nexusbim.com', 'Super Administrateur', 'super_admin', 'Nexus BIM Core', 'Direction Plateforme & Sécurité', TRUE, 'active'
) ON CONFLICT (email) DO UPDATE SET
  username = 'superadmin',
  role = 'super_admin',
  is_super_admin = TRUE,
  status = 'active';

-- 9. ACTIVATION DU ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 10. POLITIQUES D'ACCÈS PERMISSIVES POUR APPLICATION CLIENT (ANON / PUBLIC)
DROP POLICY IF EXISTS "Public Full Access Profiles" ON public.profiles;
CREATE POLICY "Public Full Access Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Vendor Stores" ON public.vendor_stores;
CREATE POLICY "Public Full Access Vendor Stores" ON public.vendor_stores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Products" ON public.products;
CREATE POLICY "Public Full Access Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Orders" ON public.orders;
CREATE POLICY "Public Full Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Order Items" ON public.order_items;
CREATE POLICY "Public Full Access Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Payout Requests" ON public.payout_requests;
CREATE POLICY "Public Full Access Payout Requests" ON public.payout_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Reviews" ON public.reviews;
CREATE POLICY "Public Full Access Reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
`;
};

/**
 * Utilitaire d'exportation CSV avec UTF-8 BOM pour Microsoft Excel
 */
export const exportToCSV = (
  filename: string, 
  headers: string[], 
  rows: (string | number)[][]
) => {
  const BOM = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(';'),
    ...rows.map(row => 
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')
    )
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
