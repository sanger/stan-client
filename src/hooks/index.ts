import { RefObject, useEffect, useRef, useState } from "react";

/**
 * Hook to call a side effect after a given delay
 * @param {(...args: any[]) => void} fn The function to call
 * @param {number} delay The delay before calling the function
 */
export const useSetTimeout = (fn: (...args: any[]) => void, delay: number) => {
  useEffect(() => {
    let timer = setTimeout(() => {
      fn();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [fn, delay]);
};

/**
 * Hook that manages when an amount of time has passed
 * @param {number} minimumWait time in milliseconds
 * @returns {boolean} has the minimum wait time elapsed?
 */
export const useMinimumWait = (minimumWait: number) => {
  const [minimumWaitElapsed, setMinimumWaitElapsed] = useState<boolean>(false);
  useSetTimeout(() => setMinimumWaitElapsed(true), minimumWait);
  return minimumWaitElapsed;
};

/**
 * Hook that fires an event handler when user clicks outside any of the HTMLElement references provided.
 * @param handler Event handler
 * @param refs HTMLElement references to check if the click is inside of
 */
export function useOnClickOutside(
  handler: (event: Event) => void,
  ...refs: RefObject<HTMLElement>[]
) {
  useEffect(() => {
    const listener = (event: Event) => {
      const shouldRunHandler = !refs.some((ref) => {
        const el = ref?.current;
        // Do nothing if clicking ref's element or descendent elements
        return !el || el.contains((event?.target as Node) || null);
      });

      if (shouldRunHandler) {
        handler(event);
      }
    };

    document.addEventListener(`mousedown`, listener);
    document.addEventListener(`touchstart`, listener);

    return () => {
      document.removeEventListener(`mousedown`, listener);
      document.removeEventListener(`touchstart`, listener);
    };

    // Reload only if ref or handler changes
  }, [refs, handler]);
}

/**
 * Hook that will provide a ref and a function to scroll to that ref after render
 */
export function useScrollToRef() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldScrollToRef, setShouldScrollToRef] = useState(false);

  useEffect(() => {
    if (shouldScrollToRef) {
      ref.current?.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToRef(false);
    }
  }, [shouldScrollToRef]);

  function scrollToRef() {
    setShouldScrollToRef(true);
  }

  return [ref, scrollToRef] as const;
}
