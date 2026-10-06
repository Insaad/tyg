/**
 * Admin configuration for Google Sheets Catalog management.
 * Kept private so normal visitors/customers never see Google Sheets buttons in the UI.
 */
export const ADMIN_CONFIG = {
  /**
   * If you have created a spreadsheet named 'catalog', you can paste its
   * Spreadsheet ID here (e.g. '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms').
   * If left blank, it uses the sheet connected in the Admin Panel or local catalog.
   */
  catalogSpreadsheetId: '',

  /**
   * Secret URL parameter to access the admin Google Sheets panel.
   * Example: visiting https://your-website.com/?admin=true or https://your-website.com/#admin
   */
  adminSecretKey: 'admin',

  /**
   * Admin PIN for opening the modal from the subtle footer lock icon.
   * Default: 'ashrafi2026'
   */
  adminPin: 'ashrafi2026',
};
