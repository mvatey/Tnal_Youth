export default function SelectArrow() {
  return (
    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 7L10 12L15 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}