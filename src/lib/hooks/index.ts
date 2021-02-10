import React, { RefObject, useEffect, useRef, useState } from "react";
import { MachinePresentationModel } from "../presentationModels/machinePresentationModel";
import { EventObject, Interpreter, State, StateMachine } from "xstate";
import { useMachine } from "@xstate/react";
import { Typestate } from "xstate/lib/types";
import { GetPrintersQuery, Maybe } from "../../types/graphql";
import { PrintableLabware, PrintResultType } from "../../types/stan";

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

/**
 * Starts interpreting a machine and connects it to a {@link MachinePresentationModel}
 * @param machine a state machine
 * @param initPresentationModel a function that returns a new {@link MachinePresentationModel}
 */
export function usePresentationModel<
  E extends MachinePresentationModel<
    TContext,
    TStateSchema,
    TEvent,
    TTypestate
  >,
  TContext,
  TStateSchema,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = { value: any; context: TContext }
>(
  machine: StateMachine<TContext, TStateSchema, TEvent, TTypestate>,
  initPresentationModel: (
    current: State<TContext, TEvent, TStateSchema, TTypestate>,
    service: Interpreter<TContext, TStateSchema, TEvent, TTypestate>
  ) => E
) {
  // eslint-disable-next-line
  const [current, _, service] = useMachine(machine);
  const [model, setModel] = useState(() =>
    initPresentationModel(current, service)
  );

  // Whenever the current state changes, set state of the presentation model
  useEffect(() => {
    setModel(model.setState(current));
  }, [model, current]);

  return model;
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
  const [currentPrinter, setCurrentPrinter] = useState<
    Maybe<GetPrintersQuery["printers"][number]>
  >(null);

  const [printResult, setPrintResult] = useState<Maybe<PrintResultType>>(null);

  const handleOnPrinterChange = React.useCallback(
    (printer: GetPrintersQuery["printers"][0]) => {
      setCurrentPrinter(printer);
      setPrintResult(null);
    },
    [setCurrentPrinter]
  );

  const handleOnPrint = React.useCallback(
    (
      printer: GetPrintersQuery["printers"][0],
      labwares: Array<PrintableLabware>
    ) => {
      setPrintResult({ successful: true, labwares, printer });
    },
    [setPrintResult]
  );
  const handleOnPrintError = React.useCallback(
    (
      printer: GetPrintersQuery["printers"][0],
      labwares: Array<PrintableLabware>
    ) => {
      setPrintResult({ successful: false, labwares, printer });
    },
    [setPrintResult]
  );

  return {
    handleOnPrint,
    handleOnPrintError,
    handleOnPrinterChange,
    currentPrinter,
    printResult,
  };
}
