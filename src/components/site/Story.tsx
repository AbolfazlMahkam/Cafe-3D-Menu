"use client";

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { useI18n } from "@/lib/i18n/provider";
import type { BeatCopy } from "@/lib/i18n/types";

function SceneMarker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-sm tracking-[0.3em] text-accent">
        {index}
      </span>
      <span className="h-px w-8 bg-accent/50" />
      <span className="label">{label}</span>
    </div>
  );
}

function BeatBlock({
  index,
  label,
  title,
  body,
  align = "left",
  items,
}: {
  index: string;
  label: string;
  title: ReactNode;
  body: string;
  align?: "left" | "right";
  items?: string[];
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
      <div className="grid w-full gap-10 lg:grid-cols-2">
        <div className={align === "left" ? "lg:order-1" : "lg:order-2"}>
          <div className="max-w-md">
            <Reveal y={20}>
              <SceneMarker index={index} label={label} />
            </Reveal>
            <Reveal y={40} delay={0.06}>
              <h2 className="mt-6 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02] text-cream">
                {title}
              </h2>
            </Reveal>
            <Reveal y={30} delay={0.12}>
              <p className="mt-7 text-base leading-relaxed text-cream/65">
                {body}
              </p>
            </Reveal>
            {items && (
              <Reveal
                y={24}
                delay={0.18}
                stagger={0.08}
                className="mt-10 space-y-3"
              >
                {items.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="text-sm text-cream/70">{item}</span>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        </div>
        <div
          className={`hidden lg:block ${align === "left" ? "lg:order-2" : "lg:order-1"}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function MultiLine({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

export function Story() {
  const { messages } = useI18n();
  const hero = messages.story.hero;
  const beats = messages.story.beats;

  const sections: { id: string; key: keyof typeof beats }[] = [
    { id: "origin", key: "origin" },
    { id: "prep", key: "prep" },
    { id: "craft", key: "lock" },
    { id: "extract", key: "extract" },
    { id: "cup", key: "cup" },
  ];

  return (
    <div id="story" className="relative">
      <section
        id="top"
        className="relative flex min-h-[100svh] items-start pt-28 pb-16 sm:items-center sm:pt-24"
        aria-label={hero.introLabel}
      >
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <Reveal y={20}>
              <p className="label">{hero.brandLine}</p>
            </Reveal>
            <Reveal y={40} delay={0.08}>
              <h1 className="mt-6 font-display text-[clamp(3rem,9vw,7.2rem)] leading-[0.92] text-cream text-shadow-soft">
                <span className="block">{hero.title[0]}</span>
                <span className="block italic text-accent-soft">
                  {hero.title[1]}
                </span>
              </h1>
            </Reveal>
            <Reveal y={30} delay={0.16}>
              <p className="mt-8 max-w-md text-base leading-relaxed text-cream/65 sm:text-lg">
                {hero.lead}
              </p>
            </Reveal>
            <Reveal y={24} delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a href="#menu" className="btn-primary">
                  {hero.exploreMenu}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 rtl:-rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a href="#origin" className="btn-ghost">
                  {hero.theStory}
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex">
          <span className="label !text-cream/40">{hero.scroll}</span>
          <span className="relative h-12 w-px overflow-hidden bg-cream/15">
            <span className="absolute inset-x-0 top-0 h-4 animate-[scrollcue_2.4s_ease-in-out_infinite] bg-accent" />
          </span>
        </div>
      </section>

      {sections.map(({ id, key }) => {
        const beat: BeatCopy = beats[key];
        return (
          <section
            key={id}
            id={id}
            className="relative flex min-h-[100svh] items-start pt-28 pb-24 sm:items-center sm:py-24"
            aria-label={`${beat.index} — ${beat.label}`}
          >
            <BeatBlock
              index={beat.index}
              label={beat.label}
              align="left"
              title={<MultiLine lines={beat.title} />}
              body={beat.body}
              items={beat.items}
            />
          </section>
        );
      })}
    </div>
  );
}

export default Story;
