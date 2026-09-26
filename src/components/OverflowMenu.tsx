import type { ElementType } from 'react';
import { MoreVertical, ChevronDown } from 'lucide-react';
import { T } from '../theme';

interface OverflowMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  items: { label: string; icon: ElementType; onClick: () => void; danger?: boolean }[];
  align?: 'left' | 'right';
  /** When set, renders a labeled "label ▾" trigger instead of a bare "⋮" icon —
   * use this for toolbar-level menus that should read as an obvious, discoverable
   * button rather than a per-row icon-only affordance. */
  label?: string;
}

// A trigger that reveals secondary actions on demand — used to keep toolbars
// and table rows from showing every possible button at once.
export function OverflowMenu({ open, onToggle, onClose, items, align = 'right', label }: OverflowMenuProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {label ? (
        <button
          className="btn btn-outline"
          onClick={onToggle}
          style={{ background: open ? T.surfaceAlt : undefined }}
        >
          {label}
          <ChevronDown size={14} style={{ marginLeft: '0.35rem', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>
      ) : (
        <button
          onClick={onToggle}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.9rem', height: '1.9rem', border: `1px solid ${T.border}`, borderRadius: '7px', background: open ? T.surfaceAlt : T.surface, color: T.textSub, cursor: 'pointer' }}
        >
          <MoreVertical size={14} />
        </button>
      )}
      {open && (
        <>
          <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 0.3rem)', left: align === 'left' ? 0 : undefined, right: align === 'right' ? 0 : undefined, minWidth: '10.5rem', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '9px', boxShadow: '0 8px 24px rgba(15,23,42,.14)', overflow: 'hidden', zIndex: 41 }}>
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => { item.onClick(); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.55rem 0.8rem', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'inherit', color: item.danger ? T.danger : T.textSub, textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget.style.background = item.danger ? T.dangerPale : T.surfaceAlt)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <item.icon size={13} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
