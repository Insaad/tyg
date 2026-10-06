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
} from 'lucide-react';

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

  if (!isGoogleSheetsOpen) return null;

  const handleSubmitConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    handleConnectExistingSheet(inputUrl.trim());
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

          {/* 1. Google Account Connection Card */}
          <div className="p-4 bg-[#FAF8F5] border border-[#ECE6DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#9E7B3B] font-semibold block mb-0.5">
                STEP 1 · GOOGLE ACCOUNT
              </span>
              {googleUser ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-[#1A1816]">
                    Connected as {googleUser.displayName || googleUser.email}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#52483D]">
                  Sign in with your Google account to grant access to Google Sheets & Google Drive.
                </p>
              )}
            </div>

            {googleUser ? (
              <button
                onClick={handleGoogleLogout}
                className="px-3.5 py-1.5 text-xs text-[#706456] hover:text-[#1A1816] hover:bg-white border border-[#E0D8CB] transition-colors self-start sm:self-auto"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleConnecting}
                className="gsi-material-button px-4 py-2 bg-white border border-[#D5CDBC] hover:border-[#1A1816] shadow-2xs hover:shadow-xs transition-all flex items-center gap-2.5 text-xs font-semibold text-[#1A1816] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isGoogleConnecting ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>

          {/* 2. Connected Spreadsheet Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#9E7B3B] font-semibold">
                STEP 2 · SPREADSHEET (NAMED "CATALOG")
              </span>
              {spreadsheetId && (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected ({products.length} Products Live)
                </span>
              )}
            </div>

            {spreadsheetId ? (
              <div className="p-4 bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-emerald-900 block truncate">
                      Spreadsheet: catalog
                    </span>
                    <span className="text-[11px] text-[#706456] block truncate">
                      ID: {spreadsheetId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <span>Open in Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={copyUrl}
                      className="px-2.5 py-1.5 bg-white border border-emerald-300 text-emerald-800 text-xs hover:bg-emerald-50 transition-colors"
                    >
                      {copied ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-[#5C5144]">
                    Last synced: {lastSyncedAt ? `${lastSyncedAt}` : 'Never'}
                  </span>
                  <button
                    onClick={handleSyncFromSheets}
                    disabled={isSyncingSheets}
                    className="px-4 py-2 bg-[#1A1816] hover:bg-[#9E7B3B] text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSheets ? 'Syncing...' : 'Sync Catalog to Website'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A: Create pre-populated 'catalog' sheet */}
                <div className="p-4 bg-white border border-[#E0D8CB] hover:border-[#9E7B3B] transition-all flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 text-[#9E7B3B] mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Create New "catalog" Sheet
                      </span>
                    </div>
                    <p className="text-xs text-[#52483D] leading-relaxed mb-4">
                      Creates a Google Spreadsheet named <strong>catalog</strong> in your Google Drive with all {products.length} demo bridal outfits, prices, descriptions, and high-resolution images pre-filled.
                    </p>
                  </div>
                  <button
                    onClick={handleCreateCatalogSheet}
                    disabled={isSyncingSheets || isGoogleConnecting}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isSyncingSheets ? 'Creating & Populating...' : 'Create "catalog" Sheet'}</span>
                  </button>
                </div>

                {/* Option B: Connect existing sheet */}
                <div className="p-4 bg-white border border-[#E0D8CB] hover:border-[#9E7B3B] transition-all flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2 text-[#1A1816] mb-2">
                      <Link2 className="w-4 h-4 text-[#9E7B3B]" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Connect Existing Sheet
                      </span>
                    </div>
                    <p className="text-xs text-[#52483D] leading-relaxed mb-3">
                      Already have your "catalog" sheet created? Paste the Google Sheet URL or ID below to link it.
                    </p>
                    <form onSubmit={handleSubmitConnect} className="space-y-2">
                      <input
                        type="text"
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#D5CDBC] text-xs text-[#1A1816] focus:outline-none focus:border-[#9E7B3B]"
                      />
                      <button
                        type="submit"
                        disabled={isSyncingSheets || !inputUrl.trim()}
                        className="w-full py-2 bg-[#1A1816] hover:bg-[#9E7B3B] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <span>Connect & Sync</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
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
