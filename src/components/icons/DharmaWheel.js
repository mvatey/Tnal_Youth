// A lucide-style outline dharma wheel (Ashoka Chakra) -- lucide-react has
// no Buddhism symbol of its own, and every dharma-wheel icon available in
// react-icons (FaDharmachakra, LiaDharmachakraSolid) is a solid/filled
// glyph that visually clashes with the thin-stroke lucide icons used by
// every other summary card (Users, Landmark, Moon). Drawn to match their
// exact conventions: 24x24 viewBox, currentColor stroke, strokeWidth 2,
// round caps/joins, no fill.
export default function DharmaWheel({
  className = "",
  size = 24,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1.5" />
      <line x1="14" y1="12" x2="21" y2="12" />
      <line x1="10" y1="12" x2="3" y2="12" />
      <line x1="12" y1="10" x2="12" y2="3" />
      <line x1="12" y1="14" x2="12" y2="21" />
      <line x1="13.41" y1="13.41" x2="18.36" y2="18.36" />
      <line x1="10.59" y1="10.59" x2="5.64" y2="5.64" />
      <line x1="13.41" y1="10.59" x2="18.36" y2="5.64" />
      <line x1="10.59" y1="13.41" x2="5.64" y2="18.36" />
    </svg>
  );
}
