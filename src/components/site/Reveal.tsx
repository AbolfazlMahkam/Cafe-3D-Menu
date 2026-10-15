"use client";

import {
  useLayoutEffect,
  useRef,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type TagComponent = ComponentType<
  HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }
>;

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: TagComponent;
  /** Vertical offset in px the element travels from. */
  y?: number;
  delay?: number;
  /** Stagger direct children instead of the wrapper. */
  stagger?: number;
  id?: string;
}

export function Reveal({
  children,
  className,
  as: Tag = "div" as unknown as TagComponent,
  y = 34,
  delay = 0,
  stagger,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const targets =
        stagger != null && el.children.length ? Array.from(el.children) : el;
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [y, delay, stagger]);

  return (
    <Tag ref={ref} className={className} id={id} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}

export default Reveal;
