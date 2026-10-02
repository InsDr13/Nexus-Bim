import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Box, 
  FileCode, 
  FileText, 
  Cpu, 
  Key, 
  Check, 
  Layers, 
  Sparkles,
  Video,
  Headphones,
  Link2,
  FolderArchive,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  Info,
  Calendar,
  ShieldAlert,
  FileCheck,
  Eye,
  Monitor,
  HardDrive,
  Hash,
  Globe,
  Lock,
  Compass,
  FileSpreadsheet,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Loader2
} from 'lucide-react';
import { Product, ProductType, ProductCategory, SoftwareName } from '../../types/database';
import { supabaseStorageService } from '../../services/supabase';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  initialProduct?: Product | null;
  vendorName?: string;
  vendorSlug?: string;
  vendorAvatar?: string;
  vendorId?: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  initialProduct = null,
  vendorName = 'StudioArch',
  vendorSlug = 'studioarch',
  vendorAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  vendorId = 'vendor-1',
}) => {
  const isEditing = Boolean(initialProduct);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productType, setProductType] = useState<ProductType>('construction_plan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [price, setPrice] = useState('49.00');
  const [category, setCategory] = useState<ProductCategory>('BIM & CAD');
  const [software, setSoftware] = useState<SoftwareName>('Revit');
  const [fileFormat, setFileFormat] = useState('.rvt / .ifc');
  const [fileSize, setFileSize] = useState('250 Mo');
  const [versionCompatibility, setVersionCompatibility] = useState('Revit 2022 - 2025');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/hero_bim_villa_1790765033156.jpg');

  // Dynamic Technical Metadata
  const [bimLod, setBimLod] = useState('LOD 350 (Coordination & Interfaces)');
  const [buildingTypology, setBuildingTypology] = useState('Villa / Résidentiel contemporain');
  const [ifcStandard, setIfcStandard] = useState('IFC 4 Design Transfer View');
  const [hasSchedules, setHasSchedules] = useState(true);
  const [hasProjectTemplate, setHasProjectTemplate] = useState(true);
  const [modeledFloors, setModeledFloors] = useState('RDC + 2 Étages + Toiture terrasse');
  const [unitSystem, setUnitSystem] = useState('Métrique (m / mm)');

  // 2. Objet 3D & Mobilier
  const [objectCategoryType, setObjectCategoryType] = useState('Famille paramétrique Revit (.rfa)');
  const [polycount, setPolycount] = useState('Mid Poly (45k polygones optimisés)');
  const [textureResolution, setTextureResolution] = useState('4K PBR (Albedo, Normal, Roughness, AO)');
  const [unwrappedUvs, setUnwrappedUvs] = useState(true);
  const [renderEngine, setRenderEngine] = useState('V-Ray, Enscape, Twinmotion, Cycles, Lumion');
  const [realDimensions, setRealDimensions] = useState('220 × 90 × 78 cm');

  // 3. Digital File (Archive ZIP)
  const [assetCount, setAssetCount] = useState('140+ éléments vectoriels & blocs');
  const [folderStructure, setFolderStructure] = useState('Arborescence classée par catégories');
  const [archiveFormats, setArchiveFormats] = useState('.DWG, .DXF, .AI, .PNG transparents, .PAT');
  const [hasReadme, setHasReadme] = useState(true);

  // 4. Dossier PDF
  const [pageCount, setPageCount] = useState('56 pages A3 / A4 vectorielles');
  const [engineeringNorm, setEngineeringNorm] = useState('Eurocodes 2, 3 & 8 / RE2020 / DTU');
  const [hasBonusCad, setHasBonusCad] = useState(true);

  // 5. Logiciel / Plugin
  const [devLanguage, setDevLanguage] = useState('C# .NET 8 / Revit API');
  const [targetOS, setTargetOS] = useState('Windows 10 / 11 64-bit');
  const [installMethod, setInstallMethod] = useState('Programme d\'installation automatique .MSI');

  // 6. Clé d'activation
  const [licenseDuration, setLicenseDuration] = useState('Licence annuelle (12 mois)');
  const [seatCount, setSeatCount] = useState('2 postes de travail');
  const [activationKeySample, setActivationKeySample] = useState('NEXUS-2025-XXXX-YYYY-PRO');

  // External links
  const [externalCourseLink, setExternalCourseLink] = useState('https://academy.nexusbim.com/courses/revit-mastery');
  const [calBookingLink, setCalBookingLink] = useState('https://cal.com/studioarch/session-bim');
  const [privateUrl, setPrivateUrl] = useState('https://drive.google.com/drive/folders/nexus-bim-pro-vault');

  // Sync state when initialProduct changes or modal opens
  useEffect(() => {
    if (initialProduct && isOpen) {
      setTitle(initialProduct.title);
      setDescription(initialProduct.description || '');
      setDetailedDescription(initialProduct.detailed_description || '');
      setPrice(initialProduct.price.toString());
      setCategory(initialProduct.category);
      setSoftware(initialProduct.software);
      setProductType(initialProduct.product_type);
      setFileFormat(initialProduct.file_format || '.rvt');
      setFileSize(initialProduct.file_size || '100 Mo');
      setVersionCompatibility(initialProduct.version_compatibility || 'Revit 2022 - 2025');
      setImageUrl(initialProduct.image_url || '/src/assets/images/hero_bim_villa_1790765033156.jpg');
    } else if (!initialProduct && isOpen) {
      // Reset form to defaults
      setTitle('');
      setDescription('');
      setDetailedDescription('');
      setPrice('49.00');
      setCategory('BIM & CAD');
      setSoftware('Revit');
      setProductType('construction_plan');
      setFileFormat('.rvt / .ifc');
      setFileSize('250 Mo');
      setVersionCompatibility('Revit 2022 - 2025');
      setImageUrl('/src/assets/images/hero_bim_villa_1790765033156.jpg');
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Handle direct file upload for product image via Supabase Storage
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Veuillez sélectionner une image de taille inférieure à 15 Mo.');
      return;
    }

    setIsUploadingImage(true);
    setUploadNotice(null);

    try {
      const res = await supabaseStorageService.uploadFile(file, 'product', vendorSlug || 'product');
      // On affecte l'URL publique Supabase (jamais de base64)
      setImageUrl(res.url);
      if (res.isLocalFallback) {
        setUploadNotice('Visuel configuré. Note : pour activer le stockage cloud direct, exécutez le script SQL dans votre console Supabase.');
      } else {
        setUploadNotice('Image téléversée avec succès dans Supabase Storage !');
      }
    } catch (err: any) {
      console.warn('Erreur téléversement produit:', err);
      // Fallback à une URL de ressource sécurisée en cas d'échec (jamais de base64)
      setImageUrl('/src/assets/images/hero_bim_villa_1790765033156.jpg');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Compose dynamic technical summary
    let techSummary = '';
    if (productType === 'construction_plan') {
      techSummary = `Niveau BIM : ${bimLod} | Typologie : ${buildingTypology} | Norme IFC : ${ifcStandard} | Gabarit : ${hasProjectTemplate ? 'Inclus (.rte)' : 'Non'} | Quantitatifs : ${hasSchedules ? 'Oui' : 'Non'} | Niveaux : ${modeledFloors} | Unités : ${unitSystem}`;
    } else if (productType === 'object_3d') {
      techSummary = `Type : ${objectCategoryType} | Maillage : ${polycount} | Textures PBR : ${textureResolution} | Moteurs : ${renderEngine} | Dépliage UV : ${unwrappedUvs ? 'Oui' : 'Non'} | Dimensions : ${realDimensions}`;
    } else if (productType === 'digital_file') {
      techSummary = `Volume : ${assetCount} | Arborescence : ${folderStructure} | Formats : ${archiveFormats} | Guide : ${hasReadme ? 'Inclus' : 'Non'}`;
    } else if (productType === 'pdf_document') {
      techSummary = `Pagination : ${pageCount} | Réglementation : ${engineeringNorm} | Sources DWG : ${hasBonusCad ? 'Incluses' : 'Non'}`;
    } else if (productType === 'software_plugin') {
      techSummary = `Technologie : ${devLanguage} | OS : ${targetOS} | Déploiement : ${installMethod}`;
    } else if (productType === 'activation_key') {
      techSummary = `Durée de licence : ${licenseDuration} | Postes autorisés : ${seatCount} | Format clé : ${activationKeySample}`;
    }

    const fullDescription = detailedDescription 
      ? `${detailedDescription}\n\n[Spécifications Techniques Approfondies]\n${techSummary}`
      : `${description}\n\n[Spécifications Techniques Approfondies]\n${techSummary}`;

    if (isEditing && initialProduct && onUpdateProduct) {
      const updatedProduct: Product = {
        ...initialProduct,
        title: title.trim(),
        description: description.trim(),
        detailed_description: fullDescription,
        price: parseFloat(price) || 0,
        category,
        software,
        product_type: productType,
        image_url: imageUrl,
        file_format: fileFormat,
        file_size: fileSize,
        version_compatibility: versionCompatibility,
        tags: [software, category, productType]
      };
      onUpdateProduct(updatedProduct);
      onClose();
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        vendor_id: vendorId,
        vendor_name: vendorName,
        vendor_slug: vendorSlug,
        vendor_avatar: vendorAvatar,
        vendor_rating: 5.0,
        title: title.trim(),
        description: description.trim(),
        detailed_description: fullDescription,
        price: parseFloat(price) || 0,
        category,
        software,
        product_type: productType,
        image_url: imageUrl,
        file_format: fileFormat,
        file_size: fileSize,
        version_compatibility: versionCompatibility,
        license_type: 'Usage professionnel',
        status: 'published',
        sales_count: 0,
        rating: 5.0,
        reviews_count: 0,
        download_url: 'https://nexusbim-storage.internal/files/' + title.toLowerCase().replace(/\s+/g, '-') + fileFormat.split(' ')[0],
        external_link: (productType === 'video_course' || productType === 'consulting_service' || productType === 'protected_link') 
          ? (productType === 'video_course' ? externalCourseLink : productType === 'consulting_service' ? calBookingLink : privateUrl)
          : undefined,
        sample_activation_key: productType === 'activation_key' ? activationKeySample : undefined,
        tags: [software, category, productType],
        created_at: new Date().toISOString().split('T')[0]
      };

      onAddProduct(newProd);
      onClose();
    }
  };

  const productTypesList: { id: ProductType; label: string; desc: string; icon: any }[] = [
    { id: 'construction_plan', label: 'Modèle BIM / Plan', desc: 'Maquette .rvt, .ifc, .pln, gabarit', icon: FileCode },
    { id: 'object_3d', label: 'Objet 3D / Famille', desc: 'Familles .rfa, mobilier .skp, .fbx', icon: Box },
    { id: 'digital_file', label: 'Archive ZIP (Pack)', desc: 'Packs de fichiers, textures PBR', icon: FolderArchive },
    { id: 'pdf_document', label: 'Dossier / Guide PDF', desc: 'Plans d\'exécution, notes calcul', icon: FileText },
    { id: 'software_plugin', label: 'Logiciel / Script', desc: 'Add-in Revit, script Dynamo/GH', icon: Cpu },
    { id: 'activation_key', label: 'Clé / Licence', desc: 'Licences logicielles, codes d\'accès', icon: Key },
    { id: 'video_course', label: 'Formation Vidéo', desc: 'Masterclass, cours chapitré HD', icon: Video },
    { id: 'consulting_service', label: 'Prestation / Audit', desc: 'Assistance BIM, audit sur-mesure', icon: Headphones },
    { id: 'protected_link', label: 'Lien Privé Cloud', desc: 'Accès Drive, Dropbox ou Notion', icon: Link2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div 
        className="relative w-full max-w-5xl bg-[#0b1222] border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden text-slate-100 max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Back & Close */}
        <div className="flex items-center justify-between px-4 sm:px-7 py-4 border-b border-slate-800 bg-[#080d19] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-white">
                  {isEditing ? `Modifier : ${initialProduct?.title}` : 'Ajouter un produit numérique'}
                </h2>
                {isEditing ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Édition
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
                    Nouveau
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">
                {isEditing 
                  ? 'Modifiez les informations, le prix, la photo de couverture et les caractéristiques techniques.' 
                  : 'Complétez les informations pour publier votre ressource numérique sur la marketplace.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-7 space-y-6 overflow-y-auto">
          
          {/* ========================================================================= */}
          {/* 1. PRODUCT TYPE SELECTOR */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider block">
                1. Type de ressource numérique
              </label>
              <span className="text-xs text-blue-400 font-medium">9 formats professionnels adaptés</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {productTypesList.map((t) => {
                const Icon = t.icon;
                const isSelected = productType === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setProductType(t.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/15 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/30'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-white">{t.label}</div>
                      <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-snug line-clamp-1">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. GENERAL INFORMATION (Card Blanche / Haute Lisibilité) */}
          {/* ========================================================================= */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                2. Informations commerciales & Fichiers
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-800">Titre officiel du produit *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Pack Villa Contemporaine R+1 (Revit 2024 + IFC + Familles Paramétriques)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm sm:text-base text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Catégorie principale</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="BIM & CAD">BIM & CAD</option>
                  <option value="3D Models">3D Models</option>
                  <option value="Ingénierie">Ingénierie</option>
                  <option value="Design">Design</option>
                  <option value="Logiciels & Scripts">Logiciels & Scripts</option>
                  <option value="Ressources">Ressources</option>
                  <option value="Formations">Formations</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Logiciel principal</label>
                <select
                  value={software}
                  onChange={(e) => setSoftware(e.target.value as SoftwareName)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="Revit">Revit</option>
                  <option value="Archicad">Archicad</option>
                  <option value="SketchUp">SketchUp</option>
                  <option value="AutoCAD">AutoCAD</option>
                  <option value="Rhino">Rhino</option>
                  <option value="Blender">Blender</option>
                  <option value="3ds Max">3ds Max</option>
                  <option value="Multi-logiciels">Multi-logiciels</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Prix public ($ USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-blue-600 font-bold text-base">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-14 py-3 text-sm sm:text-base text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="absolute right-4 top-3 text-slate-500 text-xs font-bold">USD</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Format du fichier principal</label>
                <input
                  type="text"
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value)}
                  placeholder=".rvt, .ifc, .pln, .dwg, .zip..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Taille estimée de l'archive</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="ex: 250 Mo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-800">Compatibilité logicielle</label>
                <input
                  type="text"
                  value={versionCompatibility}
                  onChange={(e) => setVersionCompatibility(e.target.value)}
                  placeholder="ex: Revit 2022 - 2025"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-bold text-slate-800">Description commerciale & Atouts clés *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez l'utilité, la qualité des modélisations, les couches IFC, et la valeur ajoutée pour l'acheteur..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. PHOTO DU PRODUIT : UPLOAD FICHIER DIRECT OU SÉLECTION */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider block">
                3. Photo / Couverture visuelle du produit
              </label>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Upload direct supporté
              </span>
            </div>

            {/* Upload Zone & Live Preview Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Preview image */}
              <div className="md:col-span-5 relative aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-lg group">
                <img 
                  src={imageUrl} 
                  alt="Aperçu du produit" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div className="text-xs text-white font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Visuel actif</span>
                  </div>
                </div>
              </div>

              {/* Upload controls */}
              <div className="md:col-span-7 space-y-3">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Uploader une image depuis votre appareil</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    PNG, JPG, WebP jusqu'à 10 Mo. Rendu 3D haute résolution ou capture de maquette recommandée.
                  </p>

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  {uploadNotice && (
                    <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{uploadNotice}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Upload Supabase en cours...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Parcourir mes fichiers...</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUrl('/src/assets/images/hero_bim_villa_1790765033156.jpg')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Réinitialiser au visuel par défaut
                    </button>
                  </div>
                </div>

                {/* Ou choisir parmi les visuels prédéfinis */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-semibold block">Ou choisir une photo prédéfinie :</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { url: '/src/assets/images/hero_bim_villa_1790765033156.jpg', label: 'Villa' },
                      { url: '/src/assets/images/bim_commercial_tower_1790765045061.jpg', label: 'Tour' },
                      { url: '/src/assets/images/product_furniture_chair_1790765057627.jpg', label: 'Mobilier' },
                      { url: '/src/assets/images/product_structural_truss_1790765068867.jpg', label: 'Structure' },
                    ].map((img, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImageUrl(img.url)}
                        className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          imageUrl === img.url ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/80 px-1 rounded text-white font-mono">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-[#080d19]/95 backdrop-blur-md pb-2">
            <span className="text-xs sm:text-sm text-slate-400">
              Vente directe en dollars américains (<strong>$ USD</strong>) avec reversement de 85% à votre atelier.
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEditing ? (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Enregistrer les modifications</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Publier le produit en ligne</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
