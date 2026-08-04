import { useEffect, useRef, type DependencyList } from "react";
import gsap from "gsap";

/**
 * Animates a numeric span's textContent from 0 to `value` using GSAP,
 * formatting with `format` on every tick.
 */
export function useCountUp(
  value: number,
  format: (n: number) => string,
  deps: DependencyList = []
) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        if (el) el.textContent = format(obj.val);
      },
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ...deps]);

  return ref;
}
