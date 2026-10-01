import React, { useState } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import { Product, ProductType, ProductCategory, SoftwareName } from '../../types/database';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  vendorName?: string;
  vendorSlug?: string;
  vendorAvatar?: string;
  vendorId?: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  vendorName = 'StudioArch',
  vendorSlug = 'studioarch',
  vendorAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  vendorId = 'vendor-1',
}) => {
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

  // =========================================================================
  // DYNAMIC TECHNICAL METADATA FOR ALL 9 PRODUCT TYPES
  // =========================================================================

  // 1. Modèle BIM / Plan d'architecture & structure
  const [bimLod, setBimLod] = useState('LOD 350 (Coordination & Interfaces)');
  const [buildingTypology, setBuildingTypology] = useState('Villa / Résidentiel contemporain');
  const [ifcStandard, setIfcStandard] = useState('IFC 4 Design Transfer View');
  const [hasSchedules, setHasSchedules] = useState(true);
  const [hasProjectTemplate, setHasProjectTemplate] = useState(true);
  const [modeledFloors, setModeledFloors] = useState('RDC + 2 Étages + Toiture terrasse');
  const [unitSystem, setUnitSystem] = useState('Métrique (m / mm)');

  // 2. Objet 3D & Mobilier & Famille paramétrique
  const [objectCategoryType, setObjectCategoryType] = useState('Famille paramétrique Revit (.rfa)');
  const [polycount, setPolycount] = useState('Mid Poly (45k polygones optimisés)');
  const [textureResolution, setTextureResolution] = useState('4K PBR (Albedo, Normal, Roughness, AO)');
  const [unwrappedUvs, setUnwrappedUvs] = useState(true);
  const [renderEngine, setRenderEngine] = useState('V-Ray, Enscape, Twinmotion, Cycles, Lumion');
  const [isParametric, setIsParametric] = useState(true);
  const [realDimensions, setRealDimensions] = useState('220 × 90 × 78 cm');
  const [finishVariants, setFinishVariants] = useState('4 variantes de matériaux pré-configurées');

  // 3. Digital File (Archive numérique ZIP)
  const [assetCount, setAssetCount] = useState('140+ éléments vectoriels & blocs');
  const [folderStructure, setFolderStructure] = useState('Arborescence classée par catégories');
  const [archiveFormats, setArchiveFormats] = useState('.DWG, .DXF, .AI, .PNG transparents, .PAT');
  const [hasReadme, setHasReadme] = useState(true);
  const [uncompressedSize, setUncompressedSize] = useState('1.2 Go décompressé');
  const [packVersion, setPackVersion] = useState('v2.5 Édition Pro 2025');

  // 4. Dossier / E-book / Rapport d'ingénierie PDF
  const [pageCount, setPageCount] = useState('56 pages A3 / A4 vectorielles');
  const [engineeringNorm, setEngineeringNorm] = useState('Eurocodes 2, 3 & 8 / RE2020 / DTU');
  const [hasBonusCad, setHasBonusCad] = useState(true);
  const [docTypology, setDocTypology] = useState('Plans d\'exécution détaillés & carnets de détails');
  const [vectorQuality, setVectorQuality] = useState('Vectoriel natif 300+ DPI (Zoom sans perte)');
  const [hasBookmarks, setHasBookmarks] = useState(true);

  // 5. Logiciel / Add-in / Plugin & Scripts
  const [devLanguage, setDevLanguage] = useState('C# .NET 8 / Revit API');
  const [targetOS, setTargetOS] = useState('Windows 10 / 11 64-bit');
  const [installMethod, setInstallMethod] = useState('Programme d\'installation automatique .MSI');
  const [includesSourceCode, setIncludesSourceCode] = useState(false);
  const [supportUpdates, setSupportUpdates] = useState('12 mois de mises à jour gratuites');
  const [minApiVersion, setMinApiVersion] = useState('Revit API 2022.1 ou plus récent');

  // 6. Clé d'activation & Licence logicielle
  const [licenseDuration, setLicenseDuration] = useState('Licence annuelle (12 mois)');
  const [seatCount, setSeatCount] = useState('2 postes de travail');
  const [activationKeySample, setActivationKeySample] = useState('NEXUS-2025-XXXX-YYYY-PRO');
  const [activationMode, setActivationMode] = useState('Validation automatique en ligne (Serveur API)');
  const [canTransferSeat, setCanTransferSeat] = useState(true);

  // 7. Formation Vidéo / Masterclass
  const [courseDuration, setCourseDuration] = useState('16h 45min (42 leçons HD chapitrées)');
  const [targetLevel, setTargetLevel] = useState('Intermédiaire à Avancé');
  const [includesExerciseFiles, setIncludesExerciseFiles] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(true);
  const [hasPrivateDiscord, setHasPrivateDiscord] = useState(true);
  const [externalCourseLink, setExternalCourseLink] = useState('https://academy.nexusbim.com/courses/revit-mastery');

  // 8. Consultation / Prestation & Audit BIM
  const [sessionDuration, setSessionDuration] = useState('2 heures en visio privée individuelle');
  const [visioPlatform, setVisioPlatform] = useState('Google Meet ou Microsoft Teams');
  const [calBookingLink, setCalBookingLink] = useState('https://cal.com/studioarch/session-bim');
  const [postSessionDeliverable, setPostSessionDeliverable] = useState('Rapport d\'audit PDF sous 48h + Enregistrement vidéo');
  const [bookingDelay, setBookingDelay] = useState('Prise de rdv possible sous 48h ouvrées');

  // 9. Lien Privé Sécurisé
  const [cloudPlatform, setCloudPlatform] = useState('Google Drive Entreprise (Espace sécurisé)');
  const [accessSecurity, setAccessSecurity] = useState('Mot de passe crypté remis à l\'acheteur');
  const [accessExpiry, setAccessExpiry] = useState('Accès permanent garanti à vie');
  const [privateUrl, setPrivateUrl] = useState('https://drive.google.com/drive/folders/nexus-bim-pro-vault');
  const [updateFrequency, setUpdateFrequency] = useState('Mises à jour mensuelles continues');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Compose dynamic technical summary
    let techSummary = '';
    if (productType === 'construction_plan') {
      techSummary = `Niveau BIM : ${bimLod} | Typologie : ${buildingTypology} | Norme IFC : ${ifcStandard} | Gabarit : ${hasProjectTemplate ? 'Inclus (.rte)' : 'Non'} | Quantitatifs : ${hasSchedules ? 'Oui' : 'Non'} | Niveaux : ${modeledFloors} | Unités : ${unitSystem}`;
    } else if (productType === 'object_3d') {
      techSummary = `Type : ${objectCategoryType} | Maillage : ${polycount} | Textures PBR : ${textureResolution} | Moteurs : ${renderEngine} | Dépliage UV : ${unwrappedUvs ? 'Oui' : 'Non'} | Dimensions : ${realDimensions} | Variantes : ${finishVariants}`;
    } else if (productType === 'digital_file') {
      techSummary = `Volume : ${assetCount} | Arborescence : ${folderStructure} | Formats : ${archiveFormats} | Guide d'installation : ${hasReadme ? 'Inclus' : 'Non'} | Décompressé : ${uncompressedSize} | Version : ${packVersion}`;
    } else if (productType === 'pdf_document') {
      techSummary = `Pagination : ${pageCount} | Réglementation : ${engineeringNorm} | Typologie : ${docTypology} | Sources CAO DWG : ${hasBonusCad ? 'Incluses' : 'Non'} | Qualité : ${vectorQuality} | Signets PDF : ${hasBookmarks ? 'Oui' : 'Non'}`;
    } else if (productType === 'software_plugin') {
      techSummary = `Technologie : ${devLanguage} | OS : ${targetOS} | Déploiement : ${installMethod} | API minimale : ${minApiVersion} | Code source : ${includesSourceCode ? 'Inclus (MIT)' : 'Fermé'} | Support : ${supportUpdates}`;
    } else if (productType === 'activation_key') {
      techSummary = `Durée de licence : ${licenseDuration} | Postes autorisés : ${seatCount} | Activation : ${activationMode} | Format de clé : ${activationKeySample} | Transférable : ${canTransferSeat ? 'Oui' : 'Non'}`;
    } else if (productType === 'video_course') {
      techSummary = `Volume cours : ${courseDuration} | Niveau conseillé : ${targetLevel} | Fichiers exercices : ${includesExerciseFiles ? 'Inclus' : 'Non'} | Certificat nominatif : ${hasCertificate ? 'Oui' : 'Non'} | Salon Q&A : ${hasPrivateDiscord ? 'Accès inclus' : 'Non'}`;
    } else if (productType === 'consulting_service') {
      techSummary = `Format : ${sessionDuration} via ${visioPlatform} | Réservation : ${calBookingLink} | Livrable : ${postSessionDeliverable} | Disponibilité : ${bookingDelay}`;
    } else if (productType === 'protected_link') {
      techSummary = `Hébergement : ${cloudPlatform} | Sécurisation : ${accessSecurity} | Validité : ${accessExpiry} | Fréquence de MAJ : ${updateFrequency}`;
    }

    const fullDescription = detailedDescription 
      ? `${detailedDescription}\n\n[Spécifications Techniques Approfondies]\n${techSummary}`
      : `${description}\n\n[Spécifications Techniques Approfondies]\n${techSummary}`;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      vendor_id: vendorId,
      vendor_name: vendorName,
      vendor_slug: vendorSlug,
      vendor_avatar: vendorAvatar,
      vendor_rating: 5.0,
      title,
      description,
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
      tags: [software, category, productType, bimLod.split(' ')[0]],
      created_at: new Date().toISOString().split('T')[0]
    };

    onAddProduct(newProd);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Back & Close */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#090e1a] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white">
                Ajouter un produit numérique
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Complétez les informations pour publier votre ressource sur la marketplace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-7 space-y-6">
          
          {/* ========================================================================= */}
          {/* 1. PRODUCT TYPE SELECTOR (FOND BLANC LUMINEUX & COMPACT CHARIOW STYLE) */}
          {/* ========================================================================= */}
          <div className="rounded-2xl sm:rounded-3xl bg-white text-slate-900 p-4 sm:p-6 shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
              <label className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>1. Type de produit numérique</span>
                <span className="text-xs text-blue-600 font-bold lowercase">(sélectionnez un format)</span>
              </label>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" /> 9 formats configurables
              </span>
            </div>
            
            {/* Compact grid layout with bright white background and clean borders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {productTypesList.map((t) => {
                const Icon = t.icon;
                const isSelected = productType === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setProductType(t.id);
                      if (t.id === 'construction_plan') { setFileFormat('.rvt / .ifc'); setCategory('BIM & CAD'); setFileSize('250 Mo'); }
                      else if (t.id === 'object_3d') { setFileFormat('.rfa / .skp / .fbx'); setCategory('3D Models'); setFileSize('45 Mo'); }
                      else if (t.id === 'digital_file') { setFileFormat('.zip (Archive)'); setCategory('Ressources'); setFileSize('350 Mo'); }
                      else if (t.id === 'pdf_document') { setFileFormat('.pdf + .dwg'); setCategory('Ingénierie'); setFileSize('85 Mo'); }
                      else if (t.id === 'software_plugin') { setFileFormat('.msi / .dll'); setCategory('Logiciels & Scripts'); setFileSize('28 Mo'); }
                      else if (t.id === 'activation_key') { setFileFormat('Clé numérique sécurisée'); setCategory('Logiciels & Scripts'); setFileSize('1 Ko'); }
                      else if (t.id === 'video_course') { setFileFormat('Streaming HD + Fichiers .zip'); setCategory('Formations'); setFileSize('14 Go'); }
                      else if (t.id === 'consulting_service') { setFileFormat('Séance visio + Rapport PDF'); setCategory('Services'); setFileSize('Service sur-mesure'); }
                      else if (t.id === 'protected_link') { setFileFormat('Accès cloud sécurisé'); setCategory('Ressources'); setFileSize('Accès externe'); }
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/90 text-blue-950 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-blue-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {t.label}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className={`text-[11px] sm:text-xs leading-snug mt-0.5 truncate ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-500'}`}>
                        {t.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. DYNAMIC INFORMATIONS BLOCK (FOND BLANC ÉLÉGANT & HAUTE LISIBILITÉ) */}
          {/* ========================================================================= */}
          <div className="rounded-2xl sm:rounded-3xl bg-white text-slate-900 p-4 sm:p-6 shadow-sm border border-slate-200 space-y-5">
            
            {/* Header of dynamic block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    2. Spécifications techniques adaptées : {productTypesList.find(t => t.id === productType)?.label}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Renseignez les champs adaptés au format sélectionné.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 w-fit shrink-0">
                Format : {productType.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* A. Modèle BIM / Plan */}
            {productType === 'construction_plan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Niveau de Détail (LOD) *</label>
                  <select
                    value={bimLod}
                    onChange={(e) => setBimLod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="LOD 200 (Schématique)">LOD 200 (Schématique / Éléments génériques)</option>
                    <option value="LOD 300 (Conception détaillée)">LOD 300 (Conception détaillée & Matériaux)</option>
                    <option value="LOD 350 (Coordination & Interfaces)">LOD 350 (Coordination & Interfaces)</option>
                    <option value="LOD 400 (Exécution & Fabrication)">LOD 400 (Exécution & Fabrication)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Typologie d'ouvrage *</label>
                  <input
                    type="text"
                    value={buildingTypology}
                    onChange={(e) => setBuildingTypology(e.target.value)}
                    placeholder="ex: Immeuble R+5, Villa de luxe, Hôpital"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Norme IFC</label>
                  <select
                    value={ifcStandard}
                    onChange={(e) => setIfcStandard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="IFC 4 Design Transfer View">IFC 4 (Design Transfer View)</option>
                    <option value="IFC 2x3 Coordination View 2.0">IFC 2x3 (Coordination View 2.0)</option>
                    <option value="IFC 4.3 (Infrastructures)">IFC 4.3 (Ouvrages d'art & VRD)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Gabarit RTE (.rte)</label>
                  <select
                    value={hasProjectTemplate ? 'yes' : 'no'}
                    onChange={(e) => setHasProjectTemplate(e.target.value === 'yes')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="yes">Gabarit complet inclus (Cartouches + Vues)</option>
                    <option value="no">Maquette seule</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Nomenclatures & Métrés</label>
                  <select
                    value={hasSchedules ? 'yes' : 'no'}
                    onChange={(e) => setHasSchedules(e.target.value === 'yes')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="yes">Surfaces & métrés prêts pour export Excel</option>
                    <option value="no">Sans tableaux de quantitatifs</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Niveaux modélisés</label>
                  <input
                    type="text"
                    value={modeledFloors}
                    onChange={(e) => setModeledFloors(e.target.value)}
                    placeholder="ex: Sous-sol + RDC + 2 Étages"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            {/* B. Objet 3D & Mobilier & Famille paramétrique */}
            {productType === 'object_3d' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Type de géométrie</label>
                  <select
                    value={objectCategoryType}
                    onChange={(e) => setObjectCategoryType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Famille paramétrique Revit (.rfa)">Famille paramétrique Revit (.rfa)</option>
                    <option value="Mobilier SketchUp (.skp)">Mobilier SketchUp (.skp)</option>
                    <option value="Modèle 3D universel (.fbx / .blend)">Modèle universel (.fbx / .blend)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Densité de maillage</label>
                  <select
                    value={polycount}
                    onChange={(e) => setPolycount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Low Poly (< 15k)">Low Poly (&lt; 15k polygones)</option>
                    <option value="Mid Poly (45k polygones)">Mid Poly (45k quads propres)</option>
                    <option value="High Poly (> 150k)">High Poly (&gt; 150k détails fins)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Résolution Textures PBR</label>
                  <select
                    value={textureResolution}
                    onChange={(e) => setTextureResolution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="4K PBR (Albedo, Normal, Roughness, AO)">4K PBR Complètes</option>
                    <option value="2K (Optimisé agencement)">2K Standard optimisé</option>
                    <option value="8K Ultra-détaillée">8K Ultra-détaillée</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Dépliage UV</label>
                  <select
                    value={unwrappedUvs ? 'yes' : 'no'}
                    onChange={(e) => setUnwrappedUvs(e.target.value === 'yes')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="yes">Unwrapped UVs sans chevauchement</option>
                    <option value="no">Mapping automatique</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Moteurs de rendu</label>
                  <input
                    type="text"
                    value={renderEngine}
                    onChange={(e) => setRenderEngine(e.target.value)}
                    placeholder="V-Ray, Enscape, Twinmotion, Cycles"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Dimensions (L × P × H)</label>
                  <input
                    type="text"
                    value={realDimensions}
                    onChange={(e) => setRealDimensions(e.target.value)}
                    placeholder="ex: 220 × 90 × 78 cm"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            {/* C. Archive Numérique (ZIP) */}
            {productType === 'digital_file' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Volume d'éléments</label>
                  <input
                    type="text"
                    value={assetCount}
                    onChange={(e) => setAssetCount(e.target.value)}
                    placeholder="ex: 140+ éléments vectoriels"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Formats inclus</label>
                  <input
                    type="text"
                    value={archiveFormats}
                    onChange={(e) => setArchiveFormats(e.target.value)}
                    placeholder="ex: .DWG, .DXF, .AI, .PAT, .IES"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Guide / Notice</label>
                  <select
                    value={hasReadme ? 'yes' : 'no'}
                    onChange={(e) => setHasReadme(e.target.value === 'yes')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="yes">Notice PDF illustrée incluse</option>
                    <option value="no">Sans notice d'utilisation</option>
                  </select>
                </div>
              </div>
            )}

            {/* D. Dossier PDF */}
            {productType === 'pdf_document' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Nombre de pages & Format</label>
                  <input
                    type="text"
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    placeholder="ex: 56 pages A3 / A4 vectorielles"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Réglementation & Normes</label>
                  <input
                    type="text"
                    value={engineeringNorm}
                    onChange={(e) => setEngineeringNorm(e.target.value)}
                    placeholder="ex: Eurocodes 2, 3, 8 / RE2020 / DTU"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Fichiers AutoCAD DWG bonus</label>
                  <select
                    value={hasBonusCad ? 'yes' : 'no'}
                    onChange={(e) => setHasBonusCad(e.target.value === 'yes')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="yes">Sources DWG/DXF éditables fournies</option>
                    <option value="no">PDF seul protégé</option>
                  </select>
                </div>
              </div>
            )}

            {/* E. Logiciel & Script */}
            {productType === 'software_plugin' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Technologie & Langage</label>
                  <input
                    type="text"
                    value={devLanguage}
                    onChange={(e) => setDevLanguage(e.target.value)}
                    placeholder="ex: C# .NET 8 / Revit API, Dynamo"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Système supporté</label>
                  <input
                    type="text"
                    value={targetOS}
                    onChange={(e) => setTargetOS(e.target.value)}
                    placeholder="Windows 10 / 11 64-bit"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Code source ouvert</label>
                  <select
                    value={includesSourceCode ? 'yes' : 'no'}
                    onChange={(e) => setIncludesSourceCode(e.target.value === 'yes')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="no">Fermé (Binaire DLL/MSI)</option>
                    <option value="yes">Code source complet fourni (MIT)</option>
                  </select>
                </div>
              </div>
            )}

            {/* F. Clé d'activation & Licence */}
            {productType === 'activation_key' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Validité de la licence</label>
                  <select
                    value={licenseDuration}
                    onChange={(e) => setLicenseDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Licence annuelle (12 mois)">Licence annuelle (12 mois)</option>
                    <option value="Licence perpétuelle (À vie)">Licence perpétuelle (À vie)</option>
                    <option value="Licence d'essai Pro (90 jours)">Licence d'essai Pro (90 jours)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Postes simultanés</label>
                  <input
                    type="text"
                    value={seatCount}
                    onChange={(e) => setSeatCount(e.target.value)}
                    placeholder="ex: 2 postes"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Modèle de clé</label>
                  <input
                    type="text"
                    value={activationKeySample}
                    onChange={(e) => setActivationKeySample(e.target.value)}
                    placeholder="NEXUS-2025-XXXX-YYYY"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            {/* G. Formation Vidéo */}
            {productType === 'video_course' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Volume vidéo total</label>
                  <input
                    type="text"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    placeholder="ex: 16h 45min (42 leçons)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Fichiers d'exercices</label>
                  <select
                    value={includesExerciseFiles ? 'yes' : 'no'}
                    onChange={(e) => setIncludesExerciseFiles(e.target.value === 'yes')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="yes">Gabarits et maquettes fournis</option>
                    <option value="no">Vidéos seules</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Lien e-learning privé</label>
                  <input
                    type="url"
                    value={externalCourseLink}
                    onChange={(e) => setExternalCourseLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            {/* H. Consultation & Audit BIM */}
            {productType === 'consulting_service' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Durée de séance</label>
                  <input
                    type="text"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    placeholder="ex: 2 heures en visio"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Plateforme visio</label>
                  <input
                    type="text"
                    value={visioPlatform}
                    onChange={(e) => setVisioPlatform(e.target.value)}
                    placeholder="Google Meet, Zoom, Teams"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Lien Calendly / Cal.com</label>
                  <input
                    type="url"
                    value={calBookingLink}
                    onChange={(e) => setCalBookingLink(e.target.value)}
                    placeholder="https://cal.com/..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            {/* I. Lien Privé Sécurisé */}
            {productType === 'protected_link' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Plateforme cloud</label>
                  <input
                    type="text"
                    value={cloudPlatform}
                    onChange={(e) => setCloudPlatform(e.target.value)}
                    placeholder="Google Drive, Dropbox, Notion"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Validité</label>
                  <input
                    type="text"
                    value={accessExpiry}
                    onChange={(e) => setAccessExpiry(e.target.value)}
                    placeholder="Permanent garanti à vie"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">URL privée protégée</label>
                  <input
                    type="url"
                    value={privateUrl}
                    onChange={(e) => setPrivateUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

          </div>

          {/* ========================================================================= */}
          {/* 3. GENERAL INFORMATIONS & PRICING IN USD (FOND BLANC POUR LISIBILITÉ) */}
          {/* ========================================================================= */}
          <div className="rounded-2xl sm:rounded-3xl bg-white text-slate-900 p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                3. Informations générales, Logiciel et Prix ($ USD)
              </h3>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Prêt pour publication
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs sm:text-sm font-bold text-slate-800">Titre commercial du produit *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Pack Villa Contemporaine R+1 (Revit 2024 + IFC + Familles)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800">Catégorie principale</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
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

              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800">Logiciel principal</label>
                <select
                  value={software}
                  onChange={(e) => setSoftware(e.target.value as SoftwareName)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
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

              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800">Prix en $ USD *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-blue-600 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-14 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-500 text-xs font-semibold">USD</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800">Format d'export</label>
                <input
                  type="text"
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value)}
                  placeholder=".rvt, .ifc, .pln, .dwg..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800">Taille estimée</label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="ex: 250 Mo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800">Version compatible</label>
                <input
                  type="text"
                  value={versionCompatibility}
                  onChange={(e) => setVersionCompatibility(e.target.value)}
                  placeholder="ex: Revit 2022 - 2025"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs sm:text-sm font-bold text-slate-800">Description générale</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez l'utilité, les atouts clés pour un professionnel et les résultats attendus..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. IMAGE VISUAL SELECTOR */}
          {/* ========================================================================= */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider block">
              4. Image de couverture du produit
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { url: '/src/assets/images/hero_bim_villa_1790765033156.jpg', label: 'Villa Contemporaine' },
                { url: '/src/assets/images/bim_commercial_tower_1790765045061.jpg', label: 'Tour Commerciale' },
                { url: '/src/assets/images/product_furniture_chair_1790765057627.jpg', label: 'Mobilier & Design' },
                { url: '/src/assets/images/product_structural_truss_1790765068867.jpg', label: 'Pont Treillis Acier' },
              ].map((img, i) => (
                <div
                  key={i}
                  onClick={() => setImageUrl(img.url)}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer group transition-all ${
                    imageUrl === img.url ? 'border-blue-500 ring-2 ring-blue-500/40 scale-[1.02] shadow-md' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-[10px] sm:text-[11px] bg-black/85 px-1.5 py-0.5 rounded text-white font-medium">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-slate-900/95 backdrop-blur-md pb-1">
            <span className="text-xs text-slate-400">
              Produit mis en vente en dollars américains (<strong>$ USD</strong>).
            </span>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Publier le produit</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
