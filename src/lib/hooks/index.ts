import React, { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react';
import { GetPrintersQuery, LabwareFieldsFragment, Maybe, PrinterFieldsFragment } from '../../types/sdk';
import { PrintResultType } from '../../types/stan';

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
export function useOnClickOutside(handler: (event: Event) => void, ...refs: RefObject<HTMLElement>[]) {
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
      ref.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToRef(false);
    }
  }, [shouldScrollToRef]);

  function scrollToRef() {
    setShouldScrollToRef(true);
  }

  return [ref, scrollToRef] as const;
}

/**
 * Hook that uses an {@code IntersectionObserver} for watching when an element comes on screen.
 *
 * @param ref the HTML element to observe
 * @param options initialisation object for the {@code IntersectionObserver}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver}
 *
 * @usage
 * const ref = useRef<HTMLDivElement>(null);
 *
 * // isIntersecting will be true when the whole element is visible
 * const isIntersecting = useOnScreen(ref, { threshold: 1.0 });
 */
export function useOnScreen<E extends HTMLElement>(ref: React.RefObject<E>, options: IntersectionObserverInit) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    const current = ref.current;

    return () => {
      current && observer.unobserve(current);
    };
  }, [options, ref]);

  return isIntersecting;
}

/**
 * Hook for handling multiple print buttons on a page
 *
 * `handleOnPrint` is a handler for a printer that will set a successful print result
 * `handleOnPrintError` is a handler for a printer that will set an unsuccessful print result
 * `handleOnPrinterChange` ia a handler to set the current printer on user selection
 * `printResult` is a {@link PrintResultType}, based on the most recent print attempt
 * `currentPrinter` is the current printer
 *
 * @example
 * const {
 *   handleOnPrint,
 *   handleOnPrintError,
 *   handleOnPrinterChange,
 *   printResult,
 *   currentPrinter,
 * } = usePrinters();
 *
 */
export function usePrinters() {
  const [currentPrinter, setCurrentPrinter] = useState<Maybe<PrinterFieldsFragment>>(null);

  const [printResult, setPrintResult] = useState<Maybe<PrintResultType>>(null);

  const handleOnPrinterChange = React.useCallback(
    (printer: GetPrintersQuery['printers'][0]) => {
      setCurrentPrinter(printer);
      setPrintResult(null);
    },
    [setCurrentPrinter]
  );

  const handleOnPrint = React.useCallback(
    (printer: PrinterFieldsFragment, labwares: Array<LabwareFieldsFragment>, labelsPerBarcode: number) => {
      setPrintResult({ successful: true, labwares, printer, labelsPerBarcode });
    },
    [setPrintResult]
  );
  const handleOnPrintError = React.useCallback(
    (printer: PrinterFieldsFragment, labwares: Array<LabwareFieldsFragment>, labelsPerBarcode: number) => {
      setPrintResult({
        successful: false,
        labwares,
        printer,
        labelsPerBarcode
      });
    },
    [setPrintResult]
  );

  return {
    handleOnPrint,
    handleOnPrintError,
    handleOnPrinterChange,
    currentPrinter,
    printResult
  };
}

/**
 * Hook for tracking the previous value of state or props
 */
export function usePrevious<T>(value: T): MutableRefObject<T | undefined>['current'] {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * Hook for adding/removing a listener to confirm if a user wants to leave a page
 * if they're part way through an operation.
 *
 * @param initialShouldConfirm true if the operation has already started; false otherwise
 */
export function useConfirmLeave(initialShouldConfirm = false) {
  const [shouldConfirm, setShouldConfirm] = useState(initialShouldConfirm);

  useEffect(() => {
    /**
     * Note that the browser will probably show its own message, but weirdly you still have to
     * provide the returnValue property
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event}
     */
    const beforeunloadListener = (e: BeforeUnloadEvent) => {
      if (shouldConfirm) {
        e.preventDefault();
        return (e.returnValue = 'You have unsaved data. Are you sure you want to leave?');
      }
    };
    if (shouldConfirm) {
      window.addEventListener('beforeunload', beforeunloadListener);
    } else {
      window.removeEventListener('beforeunload', beforeunloadListener);
    }

    return () => window.removeEventListener('beforeunload', beforeunloadListener);
  }, [shouldConfirm]);

  return [shouldConfirm, setShouldConfirm] as const;
}

/**
 * Hook that detects clicks outside of the passed ref
 */
export function useComponentVisible(initialIsVisible: boolean) {
  const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible);
  const ref = useRef<HTMLDivElement>(null);

  const handleHideDropdown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsComponentVisible(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleHideDropdown, true);
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('keydown', handleHideDropdown, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  return { ref, isComponentVisible, setIsComponentVisible };
}
