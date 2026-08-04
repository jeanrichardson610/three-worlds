import { useEffect, useRef, type DependencyList } from "react";
import gsap from "gsap";

interface Options {
  selector?: string;
  y?: number;
  stagger?: number;
  duration?: number;
  delay?: number;
}

/**
 * Attach to a container ref; animates its direct children (or matching
 * selector) in with a staggered fade + rise whenever `deps` change.
 */
export function useGsapReveal<T extends HTMLElement>(
  deps: DependencyList,
  options: Options = {}
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = options.selector
      ? el.querySelectorAll(options.selector)
      : el.children;
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: options.y ?? 18 },
        {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.55,
          ease: "power3.out",
          stagger: options.stagger ?? 0.06,
          delay: options.delay ?? 0,
        }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
