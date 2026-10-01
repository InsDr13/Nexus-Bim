import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  testSupabaseConnection, 
  generateSupabaseSQLSchema, 
  getAppMode, 
  setAppMode 
} from '../../services/supabase';

interface SupabaseStatusBannerProps {
  appMode?: 'real' | 'demo';
  onModeChange?: (mode: 'real' | 'demo') => void;
  onOpenSqlModal?: () => void;
}

export const SupabaseStatusBanner: React.FC<SupabaseStatusBannerProps> = ({
  appMode: propAppMode,
  onModeChange,
  onOpenSqlModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  
  const currentMode = propAppMode || getAppMode();
  const config = getSupabaseConfig();

  const handleTestPing = async () => {
    setIsTesting(true);
    const res = await testSupabaseConnection(config.url, config.anonKey);
    setPingResult(res);
    setIsTesting(false);
  };

  const copySql = () => {
    navigator.clipboard.writeText(generateSupabaseSQLSchema());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleMode = (newMode: 'real' | 'demo') => {
    setAppMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  return (
    <div className={`border-b text-xs transition-colors duration-200 ${
      currentMode === 'real'
        ? 'bg-[#09101f] border-emerald-500/30'
        : 'bg-[#0f172a] border-blue-500/20'
    }`}>
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        
        {/* Status Indicator & Project ID */}
        <div className="flex items-center gap-3">
          {currentMode === 'real' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MODE RÉEL : Supabase Connecté</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>MODE DÉMO (Données d'exemple)</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 text-slate-300 font-mono text-[11px]">
            <span className="text-slate-500">Projet :</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              lfndoimqzxvqsosxgeys
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">PostgreSQL + Auth + Storage</span>
          </div>
        </div>

        {/* Right Controls: Mode Toggle & Details Drawer */}
        <div className="flex items-center gap-3">
          
          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => handleToggleMode('real')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                currentMode === 'real'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mode Réel
            </button>
            <button
              onClick={() => handleToggleMode('demo')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                currentMode === 'demo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mode Démo
            </button>
          </div>

          {/* Quick Ping Test */}
          <button
            onClick={handleTestPing}
            disabled={isTesting}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors"
            title="Tester la latence PostgREST avec le projet Supabase"
          >
            <Activity className={`w-3 h-3 ${isTesting ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{isTesting ? 'Test...' : pingResult?.latencyMs ? `${pingResult.latencyMs} ms` : 'Test Ping'}</span>
          </button>

          {/* Expand Details */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-slate-300 hover:text-white font-medium transition-colors text-xs"
          >
            <span>Détails BD</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Expanded Accordion Details */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-[#060a14] p-4 text-slate-300 animate-fadeIn">
          <div className="max-w-[1720px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Config details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Instance Supabase Active</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connecté directement à votre projet Supabase avec persistance PostgreSQL et gestion des rôles (Vendeur avec slug unique, Client, Super Admin).
              </p>
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 font-mono text-[11px] space-y-1.5">
                <div className="text-slate-400">URL : <span className="text-emerald-400">{config.url}</span></div>
                <div className="text-slate-400 truncate">Clé Publique : <span className="text-blue-300">{config.anonKey.slice(0, 24)}...</span></div>
                <div className="text-slate-400">Mode actuel : <span className={currentMode === 'real' ? 'text-emerald-400 font-bold' : 'text-blue-400 font-bold'}>{currentMode === 'real' ? 'Réel (Enregistrements BD actifs)' : 'Démo (Données d\'exemple)'}</span></div>
              </div>
            </div>

            {/* Column 2: Architecture Highlights */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Fonctionnalités Activées</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li><strong className="text-slate-200">Liens uniques Vendeur</strong> : Format <code className="text-blue-300 font-mono">vendeur/nom-unique</code>.</li>
                <li><strong className="text-slate-200">Création compte vendeur</strong> : Email, mot de passe, nom du studio et slug unique.</li>
                <li><strong className="text-slate-200">Inscription client au panier</strong> : Création de compte obligatoire avant paiement.</li>
                <li><strong className="text-slate-200">Super Admin</strong> : Ajout d'administrateurs avec gestion des droits dans Supabase.</li>
                <li><strong className="text-slate-200">Statistiques Vendeur</strong> : Ventes réelles, part créateur 85% et demandes de virement.</li>
              </ul>
            </div>

            {/* Column 3: SQL Script Generator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Schéma SQL PostgreSQL</span>
                </div>
                <button
                  onClick={copySql}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier SQL'}</span>
                </button>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Ce script crée les tables <code className="text-slate-300 font-mono">profiles</code>, <code className="text-slate-300 font-mono">products</code>, <code className="text-slate-300 font-mono">orders</code>, <code className="text-slate-300 font-mono">order_items</code>, <code className="text-slate-300 font-mono">payout_requests</code> avec RLS.
              </p>
              {onOpenSqlModal && (
                <button
                  onClick={onOpenSqlModal}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-blue-400 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Afficher l'intégralité du script SQL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
