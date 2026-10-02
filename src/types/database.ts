/**
 * Types & Schema Definitions for Nexus BIM Marketplace
 * Conçu pour un mapping direct 1:1 avec les tables PostgreSQL / Supabase
 * Unité monétaire : USD ($)
 */

export type UserRole = 'admin' | 'vendor' | 'customer' | 'super_admin';

// Types de produits numériques inspirés de Chariow & adaptés au BIM / Ingénierie
export type ProductType = 
  | 'construction_plan' // Modèle BIM complet (.rvt, .ifc, .pln, .dwg)
  | 'object_3d'         // Objets 3D, mobilier, familles paramétriques (.rfa, .skp, .fbx)
  | 'digital_file'      // Fichier numérique / Pack d'archives ZIP / Gabarits
  | 'pdf_document'      // Document technique, détails d'exécution, e-book PDF
  | 'software_plugin'   // Logiciel, add-in Revit/Archicad, script Dynamo/Grasshopper
  | 'activation_key'    // Clé d'activation / Licence logicielle annuelle ou perpétuelle
  | 'video_course'      // Formation vidéo / Tutoriel complet avec ressources
  | 'consulting_service'// Service / Consultation d'assistance BIM ou modélisation sur-mesure
  | 'protected_link';   // Lien externe sécurisé / Accès Drive ou Notion privé

export type SoftwareName = 
  | 'Revit'
  | 'Archicad'
  | 'SketchUp'
  | 'AutoCAD'
  | 'Rhino'
  | 'Blender'
  | '3ds Max'
  | 'Multi-logiciels'
  | 'Autre';

export type ProductCategory = 
  | 'BIM & CAD'
  | '3D Models'
  | 'Ingénierie'
  | 'Design'
  | 'Logiciels & Scripts'
  | 'Ressources'
  | 'Formations'
  | 'Services';

export interface UserProfile {
  id: string;
  username?: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  company?: string;
  specialty?: string;
  bio?: string;
  store_slug?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  contact_email?: string;
  banner_url?: string;
  is_super_admin?: boolean;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_slug?: string;
  vendor_avatar: string;
  vendor_rating: number;
  title: string;
  description: string;
  detailed_description?: string;
  price: number;              // En USD ($)
  is_free?: boolean;
  category: ProductCategory;
  software: SoftwareName;
  product_type: ProductType;
  image_url: string;
  gallery?: string[];
  file_format: string;        // e.g. .rvt, .dwg, .pln, .pdf, .zip, .exe
  file_size: string;          // e.g. 250 Mo, 48.7 Mo
  version_compatibility?: string; // e.g. Revit 2022 - 2025
  language?: string;
  files_count?: number;
  license_type: 'Usage professionnel' | 'Usage personnel' | 'Multi-postes' | 'Illimité';
  status: 'published' | 'draft' | 'pending';
  sales_count: number;
  rating: number;
  reviews_count: number;
  lod_level?: string;
  download_url?: string;
  external_link?: string;
  sample_activation_key?: string;
  activation_key?: string;
  tags?: string[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  price: number;              // En USD ($)
  license_key?: string;
  download_url?: string;
  external_link?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;       // En USD ($)
  tax_amount: number;         // En USD ($)
  status: 'completed' | 'pending' | 'refunded';
  payment_method?: string;
  created_at: string;
  items: OrderItem[];
}

export interface Review {
  id: string;
  product_id: string;
  author_name: string;
  author_avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface VendorStoreSettings {
  vendor_id: string;
  store_name: string;
  tagline: string;
  bio: string;
  banner_url: string;
  logo_url: string;
  primary_color: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  contact_email?: string;
  website_url?: string;
  linkedin_url?: string;
  followers_count: number;
}

export interface PayoutTransaction {
  id: string;
  date: string;
  amount: number;             // En USD ($)
  method: 'Virement bancaire (SEPA/SWIFT)' | 'Stripe' | 'PayPal' | 'Wise';
  account_info: string;
  status: 'completed' | 'pending' | 'processing';
}
