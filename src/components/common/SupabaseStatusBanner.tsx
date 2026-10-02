import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  testSupabaseConnection, 
  generateSupabaseSQLSchema 
} from '../../services/supabase';

interface SupabaseStatusBannerProps {
  appMode?: 'real' | 'demo';
  onModeChange?: (mode: 'real' | 'demo') => void;
  onOpenSqlModal?: () => void;
}

export const SupabaseStatusBanner: React.FC<SupabaseStatusBannerProps> = ({
  onOpenSqlModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  
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

  return (
    <div className="border-b text-xs transition-colors duration-200 bg-[#09101f] border-emerald-500/30">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        
        {/* Status Indicator & Project ID */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MODE PRODUCTION : Supabase Connecté</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-300 font-mono text-[11px]">
            <span className="text-slate-500">Projet :</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
              lfndoimqzxvqsosxgeys
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">PostgreSQL + Auth + Storage</span>
          </div>
        </div>

        {/* Right Controls: Ping Test & SQL Migration */}
        <div className="flex items-center gap-3">
          {/* Quick Ping Test */}
          <button
            onClick={handleTestPing}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer text-[11px] font-medium"
            title="Tester la connexion en direct avec le cluster Supabase"
          >
            <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>{isTesting ? 'Test...' : 'Tester la Connectivité'}</span>
          </button>

          {/* Quick SQL modal or copy */}
          <button
            onClick={onOpenSqlModal ? onOpenSqlModal : copySql}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer text-[11px] font-bold"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Schéma & Migration SQL</span>
          </button>

          {/* Toggle Details Panel */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer text-[11px]"
          >
            <span>Détails Base</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Ping Result Notification Toast */}
      {pingResult && (
        <div className={`px-4 sm:px-6 py-1.5 text-center text-[11px] font-medium border-t transition-all ${
          pingResult.success 
            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
        }`}>
          {pingResult.message}
        </div>
      )}

      {/* Collapsible Details Drawer */}
      {isOpen && (
        <div className="bg-[#060a14] border-t border-slate-800/80 px-4 sm:px-6 py-4 animate-fadeIn">
          <div className="max-w-[1720px] mx-auto space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Box 1: Infos Projet */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Instance Supabase Active</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                  <div>URL: <span className="text-slate-200">{config.url}</span></div>
                  <div>Anon Key: <span className="text-slate-200">{config.anonKey.slice(0, 18)}...</span></div>
                  <div>Région: <span className="text-emerald-400 font-bold">AWS eu-central / Production</span></div>
                </div>
              </div>

              {/* Box 2: Architecture Multi-Vendeurs */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Architecture Multi-Vendeurs</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tables PostgreSQL avec isolation par rôle : <code>profiles</code>, <code>vendor_stores</code>, <code>products</code>, <code>orders</code>, <code>order_items</code> et <code>payout_requests</code>.
                </p>
              </div>

              {/* Box 3: Actions Rapides */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Migration SQL</span>
                  <a
                    href="https://supabase.com/dashboard/project/lfndoimqzxvqsosxgeys/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Dashboard Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copySql}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copié !' : 'Copier Script SQL'}</span>
                  </button>
                  {onOpenSqlModal && (
                    <button
                      onClick={onOpenSqlModal}
                      className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                    >
                      Voir Script
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
