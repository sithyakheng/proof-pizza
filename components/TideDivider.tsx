type TideDividerProps = {
  flip?: boolean;
  from: string;
  to: string;
};

// Signature element: a hand-drawn tideline representing the shoreline at Kep Beach,
// used consistently between sections instead of hard rules or gradients.
export default function TideDivider({ flip = false, from, to }: TideDividerProps) {
  return (
    <div
      className={`relative w-full h-16 md:h-24 ${flip ? "rotate-180" : ""}`}
      style={{ background: from }}
      aria-hidden="true"
    >
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,64 C150,110 300,20 450,58 C600,96 750,24 900,54 C1000,74 1100,40 1200,58 L1200,120 L0,120 Z"
          fill={to}
        />
      </svg>
    </div>
  );
}
