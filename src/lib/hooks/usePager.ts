import { createModel } from "xstate/lib/model";
import { PagerProps } from "../../components/pagination/Pager";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { useMachine } from "@xstate/react";
import { useMemo } from "react";

export type UsePagerProps = {
  initialCurrentPage: number;
  initialNumberOfPages: number;
};

export type UsePagerReturnProps = {
  setCurrentPage: (page: number) => void;
  setNumberOfPages: (numberOfPages: number) => void;
  goToLastPage: VoidFunction;
} & PagerProps;

/**
 * Hook for controller pagination.
 *
 * Plays nicely with the {@link Pager} component.
 */
export function usePager({
  initialCurrentPage,
  initialNumberOfPages,
}: UsePagerProps): UsePagerReturnProps {
  const pagerModel = useMemo(() => {
    return createModel(
      {
        currentPage: initialCurrentPage,
        numberOfPages: initialNumberOfPages,
      },
      {
        events: {
          setCurrentPage: (currentPage: number) => ({ currentPage }),
          setNumberOfPages: (numberOfPages: number) => ({ numberOfPages }),
          pageUp: () => ({}),
          pageDown: () => ({}),
          goToLastPage: () => ({}),
        },
      }
    );
  }, [initialCurrentPage, initialNumberOfPages]);

  const [current, send] = useMachine(() =>
    createMachine<typeof pagerModel>({
      context: pagerModel.initialContext,
      initial: "paging",
      states: {
        paging: {
          on: {
            setCurrentPage: {
              actions: assign((ctx, e) => (ctx.currentPage = e.currentPage)),
            },
            setNumberOfPages: {
              actions: assign(
                (ctx, e) => (ctx.numberOfPages = e.numberOfPages)
              ),
            },
            pageUp: {
              actions: assign((ctx) => {
                if (ctx.currentPage < ctx.numberOfPages) {
                  ctx.currentPage += 1;
                }
              }),
            },
            pageDown: {
              actions: assign((ctx) => {
                if (ctx.currentPage > 1) {
                  ctx.currentPage -= 1;
                }
              }),
            },
            goToLastPage: {
              actions: assign((ctx) => {
                ctx.currentPage = ctx.numberOfPages;
              }),
            },
          },
        },
      },
    })
  );

  const { currentPage, numberOfPages } = current.context;

  const callbacks = useMemo(() => {
    return {
      onPageUpClick: () => send(pagerModel.events.pageUp()),
      onPageDownClick: () => send(pagerModel.events.pageDown()),
      setNumberOfPages: (numberOfPages: number) =>
        send(pagerModel.events.setNumberOfPages(numberOfPages)),
      setCurrentPage: (newCurrentPage: number) =>
        send(pagerModel.events.setCurrentPage(newCurrentPage)),
      goToLastPage: () => send(pagerModel.events.goToLastPage()),
    };
  }, [send, pagerModel]);

  return {
    currentPage,
    numberOfPages,
    pageDownDisabled: currentPage === 1,
    pageUpDisabled: currentPage === numberOfPages,
    ...callbacks,
  };
}
