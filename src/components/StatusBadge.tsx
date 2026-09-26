import { T } from '../theme';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'primary' | 'purple' | 'neutral';

const TONES: Record<BadgeTone, [string, string, string]> = {
  success: [T.success, T.successPale, T.successBorder],
  warning: [T.warning, T.warningPale, T.warningBorder],
  danger: [T.danger, T.dangerPale, T.dangerBorder],
  primary: [T.primary, T.primaryPale, T.primaryBorder],
  purple: [T.purple, T.purplePale, T.purpleBorder],
  neutral: [T.textMuted, T.surfaceMuted, T.border],
};

// The small pill-with-dot status badge used across Leave Management and
// Staff Location Assignment — pass whichever tone fits the status your
// screen has (present/late/absent, active/inactive, approved/pending, etc.)
export function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  const [dot, bg, border] = TONES[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '100px',
        fontSize: '0.72rem',
        fontWeight: 600,
        background: bg,
        color: dot,
        border: `1px solid ${border}`,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {label}
    </span>
  );
}
