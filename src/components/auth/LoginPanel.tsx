export default function LoginPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[oklch(0.22_0.06_239.15)] p-16">
      {/* background orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[oklch(0.71_0.15_239.15/0.15)]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-[oklch(0.71_0.15_239.15/0.08)]" />

      {/* logo */}
      <div className="relative z-10 font-serif text-3xl font-semibold tracking-tight text-white">
        Blue<span className="text-[oklch(0.71_0.15_239.15)]">Co</span>
      </div>

      {/* centre illustration + tagline */}
      <div className="relative z-10 flex flex-col gap-8">
        <svg
          viewBox="0 0 400 220"
          className="w-full max-w-sm"
          aria-hidden="true"
        >
          {/* ground */}
          <rect
            x="0"
            y="190"
            width="400"
            height="30"
            fill="oklch(0.18 0.04 239)"
          />

          {/* building 1 — tall */}
          <rect
            x="30"
            y="80"
            width="55"
            height="110"
            rx="3"
            fill="oklch(0.28 0.05 239)"
          />
          <rect
            x="38"
            y="90"
            width="10"
            height="12"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.7"
          />
          <rect
            x="55"
            y="90"
            width="10"
            height="12"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.4"
          />
          <rect
            x="38"
            y="110"
            width="10"
            height="12"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.9"
          />
          <rect
            x="55"
            y="110"
            width="10"
            height="12"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.5"
          />
          <rect
            x="38"
            y="130"
            width="10"
            height="12"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.3"
          />
          <rect
            x="55"
            y="130"
            width="10"
            height="12"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.8"
          />
          <rect
            x="38"
            y="150"
            width="10"
            height="12"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.6"
          />
          <rect
            x="55"
            y="150"
            width="10"
            height="12"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.4"
          />

          {/* building 2 — medium */}
          <rect
            x="100"
            y="110"
            width="48"
            height="80"
            rx="3"
            fill="oklch(0.25 0.05 239)"
          />
          <rect
            x="108"
            y="120"
            width="10"
            height="10"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.6"
          />
          <rect
            x="125"
            y="120"
            width="10"
            height="10"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.9"
          />
          <rect
            x="108"
            y="138"
            width="10"
            height="10"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.4"
          />
          <rect
            x="125"
            y="138"
            width="10"
            height="10"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.7"
          />
          <rect
            x="108"
            y="156"
            width="10"
            height="10"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.5"
          />
          <rect
            x="125"
            y="156"
            width="10"
            height="10"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.3"
          />

          {/* scaffold tower */}
          <line
            x1="230"
            y1="50"
            x2="230"
            y2="190"
            stroke="oklch(0.71 0.15 239.15)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="260"
            y1="50"
            x2="260"
            y2="190"
            stroke="oklch(0.71 0.15 239.15)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="225"
            y1="80"
            x2="265"
            y2="80"
            stroke="oklch(0.71 0.15 239.15)"
            strokeWidth="1.5"
          />
          <line
            x1="225"
            y1="110"
            x2="265"
            y2="110"
            stroke="oklch(0.71 0.15 239.15)"
            strokeWidth="1.5"
          />
          <line
            x1="225"
            y1="140"
            x2="265"
            y2="140"
            stroke="oklch(0.71 0.15 239.15)"
            strokeWidth="1.5"
          />
          <line
            x1="225"
            y1="170"
            x2="265"
            y2="170"
            stroke="oklch(0.71 0.15 239.15)"
            strokeWidth="1.5"
          />
          <line
            x1="230"
            y1="80"
            x2="260"
            y2="110"
            stroke="oklch(0.71 0.15 239.15 / 0.4)"
            strokeWidth="1"
          />
          <line
            x1="260"
            y1="80"
            x2="230"
            y2="110"
            stroke="oklch(0.71 0.15 239.15 / 0.4)"
            strokeWidth="1"
          />
          <line
            x1="230"
            y1="110"
            x2="260"
            y2="140"
            stroke="oklch(0.71 0.15 239.15 / 0.4)"
            strokeWidth="1"
          />
          <line
            x1="260"
            y1="110"
            x2="230"
            y2="140"
            stroke="oklch(0.71 0.15 239.15 / 0.4)"
            strokeWidth="1"
          />

          {/* platform at top of scaffold */}
          <rect
            x="218"
            y="46"
            width="54"
            height="8"
            rx="2"
            fill="oklch(0.50 0.10 239)"
          />

          {/* worker on scaffold */}
          <circle cx="244" cy="30" r="8" fill="oklch(0.75 0.08 40)" />
          <ellipse
            cx="244"
            cy="23"
            rx="9"
            ry="4"
            fill="oklch(0.71 0.15 239.15)"
          />
          <rect
            x="235"
            y="21"
            width="18"
            height="4"
            rx="1"
            fill="oklch(0.65 0.14 239)"
          />
          <rect
            x="238"
            y="38"
            width="12"
            height="14"
            rx="2"
            fill="oklch(0.35 0.06 239)"
          />
          <line
            x1="250"
            y1="42"
            x2="262"
            y2="38"
            stroke="oklch(0.75 0.08 40)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect
            x="260"
            y="32"
            width="4"
            height="14"
            rx="1"
            fill="oklch(0.55 0.10 239)"
          />

          {/* building 3 right — under construction */}
          <rect
            x="300"
            y="130"
            width="70"
            height="60"
            rx="3"
            fill="oklch(0.26 0.04 239)"
          />
          <rect
            x="300"
            y="118"
            width="70"
            height="14"
            rx="2"
            fill="oklch(0.35 0.06 239)"
          />
          <rect
            x="308"
            y="140"
            width="14"
            height="14"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.5"
          />
          <rect
            x="330"
            y="140"
            width="14"
            height="14"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.8"
          />
          <rect
            x="352"
            y="140"
            width="14"
            height="14"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.3"
          />
          <rect
            x="308"
            y="162"
            width="14"
            height="14"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.7"
          />
          <rect
            x="330"
            y="162"
            width="14"
            height="14"
            rx="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.4"
          />

          {/* crane */}
          <line
            x1="370"
            y1="30"
            x2="370"
            y2="130"
            stroke="oklch(0.55 0.10 239)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="310"
            y1="30"
            x2="390"
            y2="30"
            stroke="oklch(0.55 0.10 239)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="310"
            y1="30"
            x2="370"
            y2="60"
            stroke="oklch(0.55 0.10 239 / 0.5)"
            strokeWidth="1.5"
          />
          <line
            x1="370"
            y1="30"
            x2="330"
            y2="60"
            stroke="oklch(0.55 0.10 239 / 0.5)"
            strokeWidth="1.5"
          />
          <line
            x1="340"
            y1="30"
            x2="340"
            y2="80"
            stroke="oklch(0.71 0.15 239.15 / 0.8)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <rect
            x="333"
            y="78"
            width="14"
            height="10"
            rx="2"
            fill="oklch(0.50 0.10 239)"
          />

          {/* worker 2 — ground right */}
          <circle cx="290" cy="174" r="7" fill="oklch(0.72 0.08 30)" />
          <ellipse
            cx="290"
            cy="168"
            rx="8"
            ry="3.5"
            fill="oklch(0.65 0.18 80)"
          />
          <rect
            x="284"
            y="181"
            width="12"
            height="12"
            rx="2"
            fill="oklch(0.30 0.05 239)"
          />

          {/* worker 3 — ground left */}
          <circle cx="170" cy="176" r="7" fill="oklch(0.70 0.07 20)" />
          <ellipse
            cx="170"
            cy="170"
            rx="8"
            ry="3.5"
            fill="oklch(0.55 0.18 20)"
          />
          <rect
            x="164"
            y="183"
            width="12"
            height="10"
            rx="2"
            fill="oklch(0.28 0.05 239)"
          />
          <line
            x1="176"
            y1="186"
            x2="186"
            y2="180"
            stroke="oklch(0.70 0.07 20)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect
            x="184"
            y="175"
            width="3"
            height="10"
            rx="1"
            fill="oklch(0.60 0.10 239)"
          />

          {/* ambient dots */}
          <circle
            cx="200"
            cy="60"
            r="1.5"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.7"
          />
          <circle
            cx="280"
            cy="90"
            r="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.5"
          />
          <circle
            cx="90"
            cy="70"
            r="1.5"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.6"
          />
          <circle
            cx="380"
            cy="55"
            r="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.8"
          />
          <circle
            cx="155"
            cy="95"
            r="1"
            fill="oklch(0.71 0.15 239.15)"
            opacity="0.4"
          />
        </svg>

        {/* tagline */}
        <div>
          <p className="font-serif text-4xl font-light italic leading-tight tracking-tight text-white">
            Find skilled
            <br />
            <strong className="font-semibold not-italic">tradespeople</strong>
            <br />
            across Rwanda.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-[oklch(0.75_0.05_239)]">
            Electricians · Plumbers · Welders
            <br />
            Carpenters · HVAC Technicians
          </p>
        </div>
      </div>

      {/* footer caption */}
      <p className="relative z-10 text-xs text-[oklch(0.71_0.15_239.15/0.6)]">
        Trusted by 200+ employers in Rwanda.
      </p>
    </div>
  );
}
