export function LotusMark({ size = 28, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M24 5c-6 7-6 17 0 25 6-8 6-18 0-25Z" />
      <path d="M24 30c-7-1-13-6-15-14 6 0 11 3 13 7" />
      <path d="M24 30c7-1 13-6 15-14-6 0-11 3-13 7" />
      <path d="M24 34c-9 0-16-4-19-10M24 34c9 0 16-4 19-10" />
      <path d="M14 41h20" />
    </svg>
  );
}
export default function Logo({ stacked = false, className = '' }) {
  return (
    <span className={`logo ${stacked ? 'logo--stacked' : ''} ${className}`} aria-label="LUMIÈRE Fine Jewellery">
      <LotusMark size={stacked ? 44 : 26} className="logo__mark" />
      <span className="logo__word">LUMIÈRE</span>
    </span>
  );
}
