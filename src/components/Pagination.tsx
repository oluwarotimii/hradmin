import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { T } from '../theme';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

// Shared, compact pagination bar used across every list/table screen — page
// numbers, prev/next, and (when onPageSizeChange is passed) a page-size
// selector so admins working through long staff/attendance lists can jump to
// showing more rows at once instead of clicking through many small pages.
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = 'items',
}: PaginationProps) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const pageNumbers = (() => {
    const count = Math.min(5, totalPages);
    return Array.from({ length: count }, (_, i) => {
      if (totalPages <= 5) return i + 1;
      if (currentPage <= 3) return i + 1;
      if (currentPage >= totalPages - 2) return totalPages - 4 + i;
      return currentPage - 2 + i;
    });
  })();

  const arrowBtnStyle = (disabled: boolean): CSSProperties => ({
    width: '1.9rem',
    height: '1.9rem',
    borderRadius: '7px',
    border: `1px solid ${T.border}`,
    background: T.surface,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.12s',
  });

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.625rem',
        background: T.surfaceAlt,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontSize: '0.76rem', color: T.textMuted }}>
          {totalItems === 0 ? (
            `No ${itemLabel}`
          ) : (
            <>
              Showing <strong style={{ color: T.text }}>{startIndex + 1}</strong>
              –<strong style={{ color: T.text }}>{endIndex}</strong> of{' '}
              <strong style={{ color: T.text }}>{totalItems}</strong> {itemLabel}
            </>
          )}
        </p>

        {onPageSizeChange && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: T.textMuted }}>
            Show
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: '6px',
                background: T.surface,
                color: T.text,
                fontSize: '0.76rem',
                padding: '0.2rem 0.4rem',
                cursor: 'pointer',
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            className="page-btn"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={arrowBtnStyle(currentPage === 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} color={T.textSub} />
          </button>

          {pageNumbers.map((pageNum) => {
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                className={!isActive ? 'page-btn' : ''}
                onClick={() => onPageChange(pageNum)}
                style={{
                  width: '1.9rem',
                  height: '1.9rem',
                  borderRadius: '7px',
                  border: isActive ? 'none' : `1px solid ${T.border}`,
                  background: isActive ? T.primary : T.surface,
                  color: isActive ? '#fff' : T.textSub,
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.12s',
                  boxShadow: isActive ? '0 1px 4px rgba(30,64,175,0.25)' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span style={{ color: T.textMuted, fontSize: '0.78rem', padding: '0 0.2rem' }}>…</span>
          )}

          <button
            className="page-btn"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            style={arrowBtnStyle(currentPage >= totalPages)}
            aria-label="Next page"
          >
            <ChevronRight size={14} color={T.textSub} />
          </button>
        </div>
      )}
    </div>
  );
}
