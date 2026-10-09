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
import {
  generateDemoProductsCsv,
  generateDemoCategoriesCsv,
  generateDemoProductsTSV,
  generateDemoCategoriesTSV,
} from '../../services/googleSheets';

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
    handleExportToConnectedSheet,
    handleSyncFromSheets,
    handleConnectExistingSheet,
    products,
    categories,
  } = useShop();

  const [inputUrl, setInputUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [csvCopied, setCsvCopied] = useState(false);
  const [csvCatCopied, setCsvCatCopied] = useState(false);
  const [formulaCopied, setFormulaCopied] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isGoogleSheetsOpen) return null;

  const handleSubmitConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    handleConnectExistingSheet(inputUrl.trim());
  };

  const handleCopyTsvProducts = () => {
    const tsv = generateDemoProductsTSV();
    navigator.clipboard.writeText(tsv);
    setCsvCopied(true);
    setTimeout(() => setCsvCopied(false), 3000);
  };

  const handleCopyTsvCategories = () => {
    const tsv = generateDemoCategoriesTSV();
    navigator.clipboard.writeText(tsv);
    setCsvCatCopied(true);
    setTimeout(() => setCsvCatCopied(false), 3000);
  };

  const handleCopyImportFormula = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const formula = `=IMPORTDATA("${origin}/catalog_products.csv")`;
    navigator.clipboard.writeText(formula);
    setFormulaCopied(true);
    setTimeout(() => setFormulaCopied(false), 3000);
  };

  const handleCopyCategoriesCsv = () => {
    const csv = generateDemoCategoriesCsv();
    navigator.clipboard.writeText(csv);
    setCsvCatCopied(true);
    setTimeout(() => setCsvCatCopied(false), 2500);
  };

  const handleDownloadProductsCsv = () => {
    const csv = generateDemoProductsCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalog_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCategoriesCsv = () => {
    const csv = generateDemoCategoriesCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalog_categories.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePushAllToSheet = async () => {
    setExportSuccess(false);
    try {
      const target = inputUrl.trim() || undefined;
      await handleExportToConnectedSheet(target);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 9000);
    } catch {
      // sheetsError handles it
    }
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

          {/* 1. Primary Action: Push All Products & Headers to Google Sheet */}
          <div className="p-5 bg-gradient-to-br from-[#FAF8F5] via-white to-emerald-50/50 border-2 border-emerald-600/30 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D8] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1816]">
                    Push All Products &amp; Collections to Your Google Sheet
                  </h4>
                </div>
                <p className="text-xs text-[#706456] mt-0.5">
                  Source: <strong>https://haseensofficial.com/</strong> · Auto-creates header row 1 if missing · Pushes subcategories, primary, secondary, 3rd, 4th &amp; all gallery images.
                </p>
              </div>
              <span className="px-2 py-1 text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 rounded-xs self-start sm:self-auto shrink-0">
                Auto-Header Enabled
              </span>
            </div>

            {/* Target Google Sheet URL Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1A1816]">
                <span>Target Google Sheet URL or ID:</span>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#9E7B3B] hover:underline flex items-center gap-1 font-normal"
                >
                  <span>+ Open blank sheet at sheets.new</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` : "Paste your Google Sheet link or ID here..."}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#D5CDBC] focus:border-emerald-600 focus:outline-hidden text-[#1A1816] font-mono shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleCreateCatalogSheet}
                  disabled={isSyncingSheets}
                  className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#D5CDBC] hover:border-[#1A1816] text-[#1A1816] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Creates a new 'catalog' spreadsheet in your Google Drive pre-filled with all products and categories"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#9E7B3B]" />
                  <span>Create in Drive</span>
                </button>
              </div>
              <span className="text-[11px] text-[#706456] block">
                {spreadsheetId ? (
                  <>Active connected sheet: <strong className="text-[#1A1816] font-mono">{spreadsheetId}</strong>. You can paste a new link above to push to a different sheet.</>
                ) : (
                  <>Paste your Google Sheet URL above and click the button below to push all products into it.</>
                )}
              </span>
            </div>

            {/* Big Action Push Button */}
            <button
              type="button"
              onClick={handlePushAllToSheet}
              disabled={isSyncingSheets}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>
                {isSyncingSheets
                  ? 'Creating Headers & Writing 200 Products...'
                  : '⚡ PUSH ALL PRODUCTS & HEADERS TO MY SHEET'}
              </span>
            </button>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#5C5144] pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Auto-creates missing headers (23 columns for products)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Primary, secondary, 3rd, 4th &amp; full gallery images</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Categories, subcategories &amp; sub-subcategories</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Creates both 'Products' &amp; 'Categories' tabs</span>
              </div>
            </div>

            {/* Success Banner */}
            {exportSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-bold">Successfully Added to Your Google Sheet!</strong>
                    <span className="text-emerald-800">
                      Created headers and pushed all 200 products with subcategories &amp; all images + 14 categories into your sheet tabs ('Products' &amp; 'Categories').
                    </span>
                  </div>
                </div>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId || '1efyKfJMggRsC_8vcdpiCCRdI4mMxykEuRJIOUk3iPck'}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 shadow-2xs transition-colors"
                >
                  <span>Open in Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* 2. Guaranteed 1-Click Clipboard Copy (Works 100% on any browser without sign-in) */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E0D8CB] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9E7B3B]" />
                <span className="text-xs font-bold text-[#1A1816]">
                  1-Click Direct Copy with Headers (Works 100% on Any Browser)
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#9E7B3B]">Zero Sign-In</span>
            </div>
            <p className="text-[11px] text-[#706456]">
              Click copy below, open your Google Sheet, click cell <strong>A1</strong>, and press <strong>Ctrl+V</strong> (or <strong>Cmd+V</strong>). All headers, columns, photos, and prices paste instantly!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyTsvProducts}
                className="p-2.5 bg-white hover:bg-emerald-50 border border-[#D5CDBC] hover:border-emerald-600 text-[#1A1816] text-xs font-semibold transition-colors flex items-center justify-between shadow-2xs text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="block font-semibold">Copy 200 Products + Headers</span>
                    <span className="text-[10px] text-[#706456] font-normal">Ready for Cell A1 (23 columns)</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold shrink-0">{csvCopied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTsvCategories}
                className="p-2.5 bg-white hover:bg-emerald-50 border border-[#D5CDBC] hover:border-emerald-600 text-[#1A1816] text-xs font-semibold transition-colors flex items-center justify-between shadow-2xs text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <div>
                    <span className="block font-semibold">Copy 14 Categories + Headers</span>
                    <span className="text-[10px] text-[#706456] font-normal">Ready for 'Categories' tab Cell A1</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold shrink-0">{csvCatCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 3. Zero-Login Sync Status Banner */}
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

          {/* 4. Connected Spreadsheet Card */}
          <div className="space-y-4">
            <div className="p-4 bg-white border border-[#E0D8CB] space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-[#1A1816] block truncate">
                    Active Connected Spreadsheet
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

          {/* 5. Additional Import Methods (CSV & Formula) */}
          <div className="p-4 bg-white border border-[#E8E2D8] space-y-3 shadow-2xs">
            {/* Method 2: Download & Import */}
            <div className="p-3 bg-white border border-[#E0D8CB] space-y-2">
              <span className="text-xs font-semibold text-[#1A1816] block">
                Download CSV Files (In Google Sheets: File &gt; Import &gt; Upload)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadProductsCsv}
                  className="p-2 bg-[#FAF8F5] hover:bg-white border border-[#D5CDBC] hover:border-[#1A1816] text-[#1A1816] text-xs font-semibold transition-colors flex items-center justify-between shadow-2xs text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Download catalog_products.csv</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold shrink-0">200 items</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCategoriesCsv}
                  className="p-2 bg-[#FAF8F5] hover:bg-white border border-[#D5CDBC] hover:border-[#1A1816] text-[#1A1816] text-xs font-semibold transition-colors flex items-center justify-between shadow-2xs text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Download catalog_categories.csv</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold shrink-0">14 themes</span>
                </button>
              </div>
            </div>

            {/* Method 3: Formula in Google Sheets */}
            <div className="p-3 bg-white border border-[#E0D8CB] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A1816]">
                  Live Auto-Fill Formula for Google Sheets
                </span>
                <button
                  type="button"
                  onClick={handleCopyImportFormula}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{formulaCopied ? 'Formula Copied!' : 'Copy Formula'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#706456]">
                Paste this into cell <strong>A1</strong> of your Google Sheet to let Google automatically pull all 200 products:
              </p>
              <div className="p-2 bg-[#FAF8F5] border border-[#E8E2D8] font-mono text-[11px] text-[#1A1816] select-all truncate">
                =IMPORTDATA("{typeof window !== 'undefined' ? window.location.origin : ''}/catalog_products.csv")
              </div>
            </div>
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
