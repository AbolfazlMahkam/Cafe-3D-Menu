"use client";

import { useLayoutEffect } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { scrollBus } from "@/lib/scroll";
import { inspect } from "@/components/three/inspect";

/**
 * Wires the document scroll to the shared 3D scroll bus and handles the
 * ambient pointer parallax. Mounted once per page.
 */
export function ScrollDirector() {
  useLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    scrollBus.page = 0;

    const onPointer = (e: PointerEvent) => {
      // Hold the parallax still while the user inspects an object, so the
      // camera does not drift under the drag.
      if (inspect.activeId) return;
      scrollBus.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollBus.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    if (reduced) {
      // Leave the bus at its resting hero values; the 3D layer renders a single
      // static composition and the DOM reveals content without scrubbing.
      scrollBus.story = 0;
      scrollBus.signature = 0;
      scrollBus.menuReveal = 0;
      return () => window.removeEventListener("pointermove", onPointer);
    }

    const ctx = gsap.context(() => {
      // Full-page ambient progress.
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              scrollBus.page = self.progress;
            },
          },
        },
      );

      // The 3D story: hero → origin → craft → signature.
      const story = document.querySelector<HTMLElement>("#story");
      if (story) {
        ScrollTrigger.create({
          trigger: story,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            scrollBus.story = self.progress;
          },
        });
      }

      // Signature drinks: the featured vessel takes the stage.
      const signature = document.querySelector<HTMLElement>("#signature");
      if (signature) {
        ScrollTrigger.create({
          trigger: signature,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            scrollBus.signature = self.progress;
          },
        });
      }

      // Menu reveal: 3D recedes as the menu rises.
      const menu = document.querySelector<HTMLElement>("#menu");
      if (menu) {
        ScrollTrigger.create({
          trigger: menu,
          start: "top bottom",
          end: "top 35%",
          scrub: true,
          onUpdate: (self) => {
            scrollBus.menuReveal = self.progress;
          },
        });
      }
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 600);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return null;
}

export default ScrollDirector;
