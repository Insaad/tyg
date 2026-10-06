/**
 * Resolves static asset URLs relative to Vite's base path.
 * Guarantees correct asset loading whether deployed to domain root,
 * subpath (e.g. GitHub Pages https://<user>.github.io/<repo>/), or preview environments.
 */
export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.replace(/^\.?\//, '');
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${cleanPath}`;
};
