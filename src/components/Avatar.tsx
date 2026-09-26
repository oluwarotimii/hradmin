const avatarPalette = ['#1e40af', '#0369a1', '#059669', '#7c3aed', '#d97706', '#be185d', '#0891b2', '#0d9488'];

const initials = (name: string) =>
  name?.split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '??';

const avatarColor = (name: string) => avatarPalette[(name?.charCodeAt(0) || 0) % avatarPalette.length];

// The initials-circle avatar used across Leave Management, Staff Location
// Assignment, and All Staff — one canonical version instead of each screen
// re-implementing its own palette + sizing.
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size > 36 ? '10px' : '8px',
        background: avatarColor(name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: size > 36 ? '0.9rem' : '0.65rem',
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '0.02em',
      }}
    >
      {initials(name)}
    </div>
  );
}
