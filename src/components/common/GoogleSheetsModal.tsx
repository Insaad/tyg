import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link2,
  TableProperties,
  Database,
  ArrowRight,
  Copy,
  Download,
} from 'lucide-react';
import { generateDemoProductsCsv } from '../../services/googleSheets';

export const GoogleSheetsModal: React.FC = () => {
  const {
    isGoogleSheetsOpen,
    closeGoogleSheetsModal,
    googleUser,
    isGoogleConnecting,
    spreadsheetId,
    spreadsheetUrl,
    isSyncingSheets,
    sheetsError,
    lastSyncedAt,
    handleGoogleSignIn,
    handleGoogleLogout,
    handleCreateCatalogSheet,
    handleSyncFromSheets,
    handleConnectExistingSheet,
    products,
  } = useShop();

  const [inputUrl, setInputUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [csvCopied, setCsvCopied] = useState(false);

  if (!isGoogleSheetsOpen) return null;

  const handleSubmitConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    handleConnectExistingSheet(inputUrl.trim());
  };

  const handleCopyDemoCsv = () => {
    const csv = generateDemoProductsCsv();
    navigator.clipboard.writeText(csv);
    setCsvCopied(true);
    setTimeout(() => setCsvCopied(false), 2500);
  };

  const copyUrl = () => {
    if (spreadsheetUrl) {
      navigator.clipboard.writeText(spreadsheetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E0D8CB] max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-6 border-b border-[#ECE6DE] bg-gradient-to-r from-[#FAF8F5] to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="text-xl font-display font-medium text-[#1A1816]"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  Admin Google Sheets Catalog
                </h3>
                <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold bg-amber-100 text-amber-800 rounded-sm">
                  PRIVATE ADMIN PORTAL
                </span>
              </div>
              <p className="text-xs text-[#706456]">
                Hidden from public visitors. Modify titles, categories, descriptions, images, and prices in your "catalog" sheet.
              </p>
            </div>
          </div>

          <button
            onClick={closeGoogleSheetsModal}
            className="p-2 text-[#706456] hover:text-[#1A1816] hover:bg-[#FAF8F5] transition-colors rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Error notification */}
          {sheetsError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 leading-relaxed">{sheetsError}</div>
            </div>
          )}

          {/* 1. Zero-Login Sync Status Banner */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-bold text-emerald-900">
                  AUTOMATED SYNC · NO SIGN-IN REQUIRED
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                The website syncs directly with your Google Sheet whenever the page loads. Customers and visitors do not need any login or account.
              </p>
            </div>
            <button
              onClick={handleSyncFromSheets}
              disabled={isSyncingSheets}
              className="px-4 py-2 bg-[#1A1816] hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shrink-0 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheets ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          {/* 2. Connected Spreadsheet Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#9E7B3B] font-semibold">
                CONNECTED GOOGLE SHEET
              </span>
              <span className="text-[11px] text-[#706456]">
                ID: {spreadsheetId || '1efyKfJMggRsC_8vcdpiCCRdI4mMxykEuRJIOUk3iPck'}
              </span>
            </div>

            <div className="p-4 bg-white border border-[#E0D8CB] space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#1A1816] block truncate">
                    Hardcoded Catalog Sheet
                  </span>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId || '1efyKfJMggRsC_8vcdpiCCRdI4mMxykEuRJIOUk3iPck'}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#9E7B3B] hover:underline flex items-center gap-1 font-mono mt-0.5 truncate"
                  >
                    <span>https://docs.google.com/spreadsheets/d/{spreadsheetId || '1efyKfJMggRsC_8vcdpiCCRdI4mMxykEuRJIOUk3iPck'}/edit</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId || '1efyKfJMggRsC_8vcdpiCCRdI4mMxykEuRJIOUk3iPck'}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-[#ECE6DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#706456]">
                <span>Last updated: {lastSyncedAt ? `${lastSyncedAt}` : 'On Page Load'}</span>
                <span>Active Store Products: <strong className="text-[#1A1816]">{products.length}</strong></span>
              </div>
            </div>

            {/* Crucial Sharing Step Callout */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Required 1-Time Setup in Google Sheets:</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                To allow the website to read your products without requiring sign-in or authorization:
              </p>
              <ol className="text-xs text-amber-900 list-decimal pl-5 space-y-1">
                <li>Open your Google Sheet (click <strong>"Open in Sheets"</strong> above).</li>
                <li>Click the green <strong>Share</strong> button at the top-right corner.</li>
                <li>Under <strong>General access</strong>, change <strong>"Restricted"</strong> to <strong>"Anyone with the link"</strong> (Viewer).</li>
                <li>That's all! Your live website will automatically fetch your sheet data on every visit.</li>
              </ol>
            </div>
          </div>

            {/* Quick Demo Data Copy Box */}
            <div className="p-3 bg-white border border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#1A1816] block">Need the Demo Products for your Google Sheet?</span>
                <span className="text-[#706456] text-[11px]">Copy the complete demo products CSV table and paste it directly into cell A1 of your Google Sheet.</span>
              </div>
              <button
                type="button"
                onClick={handleCopyDemoCsv}
                className="px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-white border border-[#D5CDBC] hover:border-[#1A1816] text-[#1A1816] font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5 text-[#9E7B3B]" />
                <span>{csvCopied ? 'Copied to Clipboard!' : 'Copy Demo CSV Data'}</span>
              </button>
            </div>

          {/* 3. Instructions & Columns Guide */}
          <div className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1816] uppercase tracking-wider">
              <TableProperties className="w-4 h-4 text-[#9E7B3B]" />
              <span>What You Can Change in Google Sheets:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-[#52483D]">
              <div className="p-2 bg-white border border-[#E8E2D8]">
                <strong className="text-[#1A1816] block">title / name</strong>
                <span className="text-[11px] text-[#706456]">Bridal dress headline</span>
              </div>
              <div className="p-2 bg-white border border-[#E8E2D8]">
                <strong className="text-[#1A1816] block">price & original_price</strong>
                <span className="text-[11px] text-[#706456]">PKR numbers (e.g. 450000)</span>
              </div>
              <div className="p-2 bg-white border border-[#E8E2D8]">
                <strong className="text-[#1A1816] block">category</strong>
                <span className="text-[11px] text-[#706456]">nikah, barat, mehndi, walima...</span>
              </div>
              <div className="p-2 bg-white border border-[#E8E2D8]">
                <strong className="text-[#1A1816] block">image & secondary_image</strong>
                <span className="text-[11px] text-[#706456]">Any public photo URL</span>
              </div>
              <div className="p-2 bg-white border border-[#E8E2D8]">
                <strong className="text-[#1A1816] block">fabric & embroidery</strong>
                <span className="text-[11px] text-[#706456]">Kathan silk, zardozi, tilla</span>
              </div>
              <div className="p-2 bg-white border border-[#E8E2D8]">
                <strong className="text-[#1A1816] block">featured & bestseller</strong>
                <span className="text-[11px] text-[#706456]">Set TRUE or FALSE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#ECE6DE] flex items-center justify-between text-xs text-[#706456]">
          <span>Any edit made in Google Sheets appears instantly when you click Sync.</span>
          <button
            onClick={closeGoogleSheetsModal}
            className="px-5 py-2 bg-[#1A1816] hover:bg-[#9E7B3B] text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
