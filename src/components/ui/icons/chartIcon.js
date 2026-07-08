// components/ui/icons/chartIcon.jsx
export default function ChartIcon({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect x="3" y="13" width="4.5" height="8" rx="1.5" fill="currentColor" />
      <rect x="10" y="4" width="4.5" height="17" rx="1.5" fill="currentColor" />
      <rect x="17" y="16" width="4.5" height="5" rx="1.5" fill="currentColor" />
    </svg>
  );
}