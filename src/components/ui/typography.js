// components/ui/Typography.jsx
export function H1({ children, className = "" }) {
  return <h1 className={`text-h1 font-bold text-text-primary ${className}`}>{children}</h1>;
}
export function H2({ children, className = "" }) {
  return <h2 className={`text-h2 font-bold text-text-primary ${className}`}>{children}</h2>;
}
export function H3({ children, className = "" }) {
  return <h3 className={`text-h3 font-semibold text-text-primary ${className}`}>{children}</h3>;
}
export function BodyLarge({ children, className = "" }) {
  return <p className={`text-body-lg text-text-secondary ${className}`}>{children}</p>;
}
export function BodySmall({ children, className = "" }) {
  return <p className={`text-body-sm text-text-secondary ${className}`}>{children}</p>;
}
export function Caption({ children, className = "" }) {
  return <span className={`text-body-caption text-text-mute ${className}`}>{children}</span>;
}