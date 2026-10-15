"use client";

import { useId } from "react";
import type { ArtTone } from "@/lib/products";

interface Tone {
  plate: [string, string];
  ceramic: [string, string];
  liquid: string;
  liquidHi: string;
  detail: string;
}

const TONES: Record<ArtTone, Tone> = {
  espresso: {
    plate: ["#241a13", "#120c08"],
    ceramic: ["#efe2cd", "#c9b596"],
    liquid: "#3a2113",
    liquidHi: "#7a4a24",
    detail: "#c08a4e",
  },
  americano: {
    plate: ["#241a13", "#120c08"],
    ceramic: ["#efe2cd", "#c9b596"],
    liquid: "#2a190f",
    liquidHi: "#8a5a2e",
    detail: "#a9764a",
  },
  cappuccino: {
    plate: ["#241a13", "#120c08"],
    ceramic: ["#efe2cd", "#c9b596"],
    liquid: "#d3a86e",
    liquidHi: "#f0dcbe",
    detail: "#8a5a34",
  },
  latte: {
    plate: ["#241a13", "#120c08"],
    ceramic: ["#efe2cd", "#c9b596"],
    liquid: "#e0c39a",
    liquidHi: "#f6e8cf",
    detail: "#b5773f",
  },
  mocha: {
    plate: ["#241a13", "#120c08"],
    ceramic: ["#efe2cd", "#c9b596"],
    liquid: "#8a5a37",
    liquidHi: "#e6c9a0",
    detail: "#3a2114",
  },
  coldbrew: {
    plate: ["#241a13", "#120c08"],
    ceramic: ["#d9cbb4", "#9c8a70"],
    liquid: "#2a1a10",
    liquidHi: "#8a5c2e",
    detail: "#c9d8dd",
  },
  icedlatte: {
    plate: ["#241a13", "#120c08"],
    ceramic: ["#d9cbb4", "#9c8a70"],
    liquid: "#e2cca8",
    liquidHi: "#6b4423",
    detail: "#c9d8dd",
  },
  croissant: {
    plate: ["#2a1f16", "#140d08"],
    ceramic: ["#e9dcc4", "#bda887"],
    liquid: "#c98b3f",
    liquidHi: "#eec489",
    detail: "#7d4f1f",
  },
  almondcroissant: {
    plate: ["#2a1f16", "#140d08"],
    ceramic: ["#e9dcc4", "#bda887"],
    liquid: "#cf9448",
    liquidHi: "#f0d19a",
    detail: "#e8c98a",
  },
  tiramisu: {
    plate: ["#2a1f16", "#140d08"],
    ceramic: ["#e9dcc4", "#bda887"],
    liquid: "#3a2416",
    liquidHi: "#d9c19a",
    detail: "#f0e4cf",
  },
  brownie: {
    plate: ["#2a1f16", "#140d08"],
    ceramic: ["#e9dcc4", "#bda887"],
    liquid: "#2b1a12",
    liquidHi: "#5c3a24",
    detail: "#e8d9c6",
  },
  cheesecake: {
    plate: ["#2a1f16", "#140d08"],
    ceramic: ["#e9dcc4", "#bda887"],
    liquid: "#d8b073",
    liquidHi: "#f0d6a6",
    detail: "#6b4321",
  },
};

function Backdrop({
  plate,
  uid,
}: {
  plate: [string, string];
  uid: string;
}) {
  return (
    <>
      <rect width="200" height="200" fill={plate[1]} />
      <rect width="200" height="200" fill={`url(#bg-${uid})`} />
      <circle cx="100" cy="100" r="86" fill={`url(#glow-${uid})`} />
      <ellipse cx="100" cy="176" rx="62" ry="9" fill="#000" opacity="0.35" />
    </>
  );
}

function CupBody({ tone, uid, large }: { tone: Tone; uid: string; large?: boolean }) {
  const outerR = large ? 72 : 68;
  const liquidR = large ? 60 : 56;
  return (
    <>
      <circle cx="100" cy="100" r={outerR} fill={`url(#ceramic-${uid})`} />
      <circle
        cx="100"
        cy="100"
        r={outerR}
        fill="none"
        stroke="#000"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="100"
        r={outerR - 6}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <circle cx="100" cy="100" r={liquidR} fill={tone.liquid} />
      <circle
        cx="100"
        cy="100"
        r={liquidR}
        fill="none"
        stroke={tone.liquidHi}
        strokeOpacity="0.55"
        strokeWidth="2"
      />
    </>
  );
}

function LatteArt({ tone }: { tone: Tone }) {
  return (
    <g fill={tone.detail} opacity="0.92">
      <path d="M100 54c11 15 20 24 20 35a20 20 0 0 1-40 0c0-11 9-20 20-35Z" />
      <path
        d="M100 92c8 0 15 6 15 14s-7 14-15 14-15-6-15-14 7-14 15-14Z"
        opacity="0.5"
      />
    </g>
  );
}

function CocoaDust({ uid }: { uid: string }) {
  return (
    <g fill="#3a2416" opacity="0.55">
      {Array.from({ length: 26 }).map((_, i) => {
        const a = (i / 26) * Math.PI * 2;
        const r = 18 + ((i * 37) % 34);
        return (
          <circle
            key={i}
            cx={100 + Math.cos(a) * r}
            cy={100 + Math.sin(a) * r}
            r={i % 3 === 0 ? 1.8 : 1.1}
          />
        );
      })}
      <circle cx="100" cy="100" r="54" fill={`url(#vignette-${uid})`} />
    </g>
  );
}

function MochaSwirl({ tone }: { tone: Tone }) {
  return (
    <g>
      <circle cx="100" cy="100" r="40" fill={tone.detail} opacity="0.9" />
      <path
        d="M100 68c18 0 32 14 32 32s-14 32-32 32-32-14-32-32"
        fill="none"
        stroke={tone.liquidHi}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M100 84c10 0 18 7 18 16s-8 16-18 16-18-7-18-16"
        fill="none"
        stroke={tone.liquidHi}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  );
}

function ColdGlass({ tone, iced }: { tone: Tone; iced?: boolean }) {
  return (
    <>
      <circle cx="100" cy="100" r="64" fill="#cfe0e6" fillOpacity="0.14" />
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="none"
        stroke="#eaf2f5"
        strokeOpacity="0.4"
        strokeWidth="2"
      />
      {/* liquid */}
      {iced ? (
        <g>
          <circle cx="100" cy="100" r="56" fill={tone.liquid} />
          <path d="M50 100a50 50 0 0 0 100 0Z" fill={tone.liquidHi} opacity="0.85" />
        </g>
      ) : (
        <circle cx="100" cy="100" r="56" fill={tone.liquid} />
      )}
      {/* ice cubes */}
      <g fill="#eaf4f8" fillOpacity="0.45" stroke="#ffffff" strokeOpacity="0.35">
        <rect x="74" y="72" width="30" height="30" rx="6" transform="rotate(-12 89 87)" />
        <rect x="104" y="88" width="28" height="28" rx="6" transform="rotate(16 118 102)" />
        <rect x="78" y="106" width="30" height="30" rx="6" transform="rotate(6 93 121)" />
        <rect x="108" y="62" width="24" height="24" rx="5" transform="rotate(28 120 74)" />
      </g>
      <circle cx="100" cy="100" r="56" fill="none" stroke={tone.liquidHi} strokeOpacity="0.3" strokeWidth="1.5" />
    </>
  );
}

function Croissant({ tone, almond }: { tone: Tone; almond?: boolean }) {
  return (
    <g>
      <path
        d="M44 116c6-30 30-52 56-52s50 22 56 52c-14 8-30 6-40-4-6-6-10-8-16-8s-10 2-16 8c-10 10-26 12-40 4Z"
        fill={`url(#pastry-${tone.liquid.slice(1)})`}
      />
      <path
        d="M62 112c4-20 20-34 38-34s34 14 38 34"
        fill="none"
        stroke={tone.detail}
        strokeWidth="2.5"
        opacity="0.6"
      />
      {Array.from({ length: 6 }).map((_, i) => {
        const x = 66 + i * 14;
        return (
          <path
            key={i}
            d={`M${x} 74c-3 12-3 24 0 34`}
            stroke={tone.detail}
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
        );
      })}
      {almond && (
        <g fill={tone.detail} opacity="0.9">
          <ellipse cx="84" cy="98" rx="6" ry="3" transform="rotate(-20 84 98)" />
          <ellipse cx="116" cy="102" rx="7" ry="3.4" transform="rotate(18 116 102)" />
          <ellipse cx="100" cy="116" rx="6" ry="3" transform="rotate(4 100 116)" />
          <circle cx="70" cy="150" r="1.4" />
          <circle cx="132" cy="146" r="1.4" />
        </g>
      )}
    </g>
  );
}

function Tiramisu({ tone }: { tone: Tone }) {
  return (
    <g>
      <rect x="54" y="72" width="92" height="76" rx="6" fill="#c9b48f" />
      <rect x="54" y="72" width="92" height="26" rx="6" fill={tone.liquid} />
      <rect x="58" y="108" width="84" height="10" fill={tone.detail} opacity="0.8" />
      <rect x="58" y="126" width="84" height="10" fill="#8a6b45" opacity="0.7" />
      <g fill="#2a1a12" opacity="0.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={62 + ((i * 23) % 80)} cy={78 + ((i * 7) % 16)} r="1.2" />
        ))}
      </g>
    </g>
  );
}

function Brownie({ tone }: { tone: Tone }) {
  return (
    <g>
      <rect x="56" y="74" width="88" height="72" rx="5" fill={tone.liquid} />
      <rect x="56" y="74" width="88" height="72" rx="5" fill="none" stroke={tone.liquidHi} strokeOpacity="0.5" />
      <path d="M60 92h80M60 112h80M80 74v72M112 74v72" stroke={tone.liquidHi} strokeOpacity="0.25" strokeWidth="1.5" />
      <g fill={tone.detail} opacity="0.28">
        <circle cx="72" cy="86" r="1.6" />
        <circle cx="128" cy="130" r="1.6" />
        <circle cx="100" cy="100" r="1.4" />
      </g>
    </g>
  );
}

function Cheesecake({ tone }: { tone: Tone }) {
  return (
    <g>
      <ellipse cx="100" cy="120" rx="46" ry="34" fill={tone.liquid} />
      <ellipse cx="100" cy="120" rx="46" ry="34" fill="none" stroke={tone.detail} strokeOpacity="0.4" />
      <ellipse cx="100" cy="104" rx="46" ry="30" fill={tone.detail} />
      <ellipse cx="100" cy="104" rx="46" ry="30" fill="none" stroke="#1c120b" strokeOpacity="0.4" />
      <g fill="#93b06a" opacity="0.75">
        <circle cx="82" cy="100" r="1.8" />
        <circle cx="96" cy="92" r="1.6" />
        <circle cx="112" cy="98" r="1.8" />
        <circle cx="102" cy="112" r="1.5" />
      </g>
    </g>
  );
}

export function ProductArt({
  art,
  className,
  title,
}: {
  art: ArtTone;
  className?: string;
  title?: string;
}) {
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, "");
  const tone = TONES[art];
  const isBakery = [
    "croissant",
    "almondcroissant",
    "tiramisu",
    "brownie",
    "cheesecake",
  ].includes(art);

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={title ? `${title} illustration` : "Product illustration"}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#2a2017" />
          <stop offset="60%" stopColor="#170f0a" />
          <stop offset="100%" stopColor="#0b0b0b" />
        </radialGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="34%" r="55%">
          <stop offset="0%" stopColor="#b77a45" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#b77a45" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ceramic-${uid}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={tone.ceramic[0]} />
          <stop offset="100%" stopColor={tone.ceramic[1]} />
        </radialGradient>
        <radialGradient id={`vignette-${uid}`} cx="50%" cy="45%" r="60%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id={`pastry-${tone.liquid.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone.liquidHi} />
          <stop offset="100%" stopColor={tone.liquid} />
        </linearGradient>
      </defs>

      <Backdrop plate={tone.plate} uid={uid} />

      {isBakery ? (
        <>
          <circle cx="100" cy="118" r="62" fill={`url(#ceramic-${uid})`} />
          <circle
            cx="100"
            cy="118"
            r="62"
            fill="none"
            stroke="#000"
            strokeOpacity="0.15"
          />
          <circle cx="100" cy="118" r="52" fill="none" stroke="#fff" strokeOpacity="0.18" />
          {art === "croissant" && <Croissant tone={tone} />}
          {art === "almondcroissant" && <Croissant tone={tone} almond />}
          {art === "tiramisu" && <Tiramisu tone={tone} />}
          {art === "brownie" && <Brownie tone={tone} />}
          {art === "cheesecake" && <Cheesecake tone={tone} />}
        </>
      ) : art === "coldbrew" || art === "icedlatte" ? (
        <ColdGlass tone={tone} iced={art === "icedlatte"} />
      ) : (
        <>
          <CupBody tone={tone} uid={uid} large={art === "latte" || art === "mocha"} />
          {art === "cappuccino" && (
            <>
              <circle cx="100" cy="100" r="50" fill={tone.liquidHi} opacity="0.9" />
              <CocoaDust uid={uid} />
            </>
          )}
          {art === "latte" && <LatteArt tone={tone} />}
          {art === "mocha" && <MochaSwirl tone={tone} />}
          {art === "espresso" && (
            <ellipse cx="100" cy="100" rx="44" ry="40" fill={tone.detail} opacity="0.55" />
          )}
          {art === "americano" && (
            <circle
              cx="100"
              cy="100"
              r="44"
              fill="none"
              stroke={tone.detail}
              strokeWidth="3"
              opacity="0.45"
            />
          )}
        </>
      )}
    </svg>
  );
}

export default ProductArt;
