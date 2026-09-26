// Shared color tokens for admin screens that style via inline `style={{}}`
// instead of the design-system.css classes. This was previously copy-pasted
// as a local `const T = {...}` in 13+ files with identical values — kept as
// one export so a palette tweak doesn't need touching every screen.
export const T = {
  primary:       '#1e40af',
  primaryLight:  '#3b82f6',
  primaryPale:   '#eff6ff',
  primaryBorder: '#bfdbfe',
  success:       '#059669',
  successPale:   '#ecfdf5',
  successBorder: '#a7f3d0',
  warning:       '#d97706',
  warningPale:   '#fffbeb',
  warningBorder: '#fde68a',
  danger:        '#dc2626',
  dangerPale:    '#fef2f2',
  dangerBorder:  '#fecaca',
  purple:        '#7c3aed',
  purplePale:    '#f5f3ff',
  purpleBorder:  '#ddd6fe',
  surface:       '#ffffff',
  surfaceAlt:    '#f8fafc',
  surfaceMuted:  '#f1f5f9',
  border:        '#e2e8f0',
  borderStrong:  '#cbd5e1',
  text:          '#0f172a',
  textSub:       '#475569',
  textMuted:     '#94a3b8',
} as const;

// Accent palette per department — richer, more distinct
export const DEPT_ACCENTS = [
  { dot: '#3b82f6', pale: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },   // blue
  { dot: '#059669', pale: '#ecfdf5', border: '#a7f3d0', text: '#065f46' },   // green
  { dot: '#d97706', pale: '#fffbeb', border: '#fde68a', text: '#92400e' },   // amber
  { dot: '#7c3aed', pale: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95' },   // purple
  { dot: '#db2777', pale: '#fdf2f8', border: '#fbcfe8', text: '#831843' },   // pink
  { dot: '#0891b2', pale: '#ecfeff', border: '#a5f3fc', text: '#164e63' },   // cyan
  { dot: '#0d9488', pale: '#f0fdfa', border: '#99f6e4', text: '#134e4a' },   // teal
  { dot: '#ea580c', pale: '#fff7ed', border: '#fed7aa', text: '#7c2d12' },   // orange
];

export const getDeptAccent = (dept: string) => {
  if (!dept || dept === 'N/A') return DEPT_ACCENTS[0];
  let h = 0;
  for (let i = 0; i < dept.length; i++) { h = ((h << 5) - h) + dept.charCodeAt(i); h = h & h; }
  return DEPT_ACCENTS[Math.abs(h) % DEPT_ACCENTS.length];
};
