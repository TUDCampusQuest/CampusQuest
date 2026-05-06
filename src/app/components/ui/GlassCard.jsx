'use client';
// Reusable frosted-glass card with a purple top border, used as a base surface for sheets and modals.
export default function GlassCard({
  children, className = '', onClick, style = {}
}) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 20,
        boxShadow: 'var(--card-shadow)',
        borderTop: '2px solid var(--accent-purple)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
