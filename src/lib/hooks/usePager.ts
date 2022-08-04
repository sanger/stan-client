import { PagerProps } from "../../components/pagination/Pager";
import { useCallback, useReducer } from "react";

export type UsePagerProps = {
  initialCurrentPage: number;
  initialNumberOfPages: number;
};

export type UsePagerReturnProps = {
  setCurrentPage: (page: number) => void;
  setNumberOfPages: (numberOfPages: number) => void;
  goToLastPage: VoidFunction;
} & PagerProps;

type PagerState = {
  currentPage: number;
  numberOfPages: number;
};

type PagerAction =
  | { type: "SET_CURRENT_PAGE"; currentPage: number }
  | { type: "SET_NUMBER_OF_PAGES"; numberOfPages: number }
  | { type: "GO_TO_LAST_PAGE" }
  | { type: "PAGE_UP" }
  | { type: "PAGE_DOWN" };

function pagerReducer(state: PagerState, action: PagerAction): PagerState {
  let currentPage: number;
  let numberOfPages: number;

  switch (action.type) {
    case "PAGE_UP":
      if (state.currentPage < state.numberOfPages) {
        return { ...state, currentPage: state.currentPage + 1 };
      } else {
        return state;
      }
    case "PAGE_DOWN":
      if (state.currentPage > 1) {
        return { ...state, currentPage: state.currentPage - 1 };
      } else {
        return state;
      }
    case "GO_TO_LAST_PAGE":
      return { ...state, currentPage: state.numberOfPages };
    case "SET_NUMBER_OF_PAGES":
      numberOfPages = action.numberOfPages;
      if (numberOfPages < 0) {
        numberOfPages = 0;
      }

      currentPage = state.currentPage;

      if (currentPage > numberOfPages) {
        currentPage = numberOfPages;

        // Current page may have previously been set to 0 when there were 0 pages
      } else if (currentPage === 0) {
        currentPage = 1;
      }
      return { ...state, numberOfPages, currentPage };
    case "SET_CURRENT_PAGE":
      currentPage = action.currentPage;
      if (currentPage < 1) {
        currentPage = 1;
      } else if (currentPage > state.numberOfPages) {
        currentPage = state.numberOfPages;
      }
      return { ...state, currentPage };
  }
  return state;
}

/**
 * Hook for controlling pagination.
 *
 * Plays nicely with the {@link Pager} component.
 */
export function usePager({
  initialCurrentPage,
  initialNumberOfPages,
}: UsePagerProps): UsePagerReturnProps {
  const [state, dispatch] = useReducer(pagerReducer, {
    currentPage: initialCurrentPage,
    numberOfPages: initialNumberOfPages,
  });

  const setNumberOfPages = useCallback(
    (numberOfPages: number) =>
      dispatch({ type: "SET_NUMBER_OF_PAGES", numberOfPages }),
    [dispatch]
  );
  const goToLastPage = useCallback(
    () => dispatch({ type: "GO_TO_LAST_PAGE" }),
    [dispatch]
  );
  const onPageUpClick = useCallback(
    () => dispatch({ type: "PAGE_UP" }),
    [dispatch]
  );
  const onPageDownClick = useCallback(
    () => dispatch({ type: "PAGE_DOWN" }),
    [dispatch]
  );
  const setCurrentPage = useCallback(
    (currentPage: number) =>
      dispatch({ type: "SET_CURRENT_PAGE", currentPage }),
    [dispatch]
  );

  return {
    ...state,
    setCurrentPage,
    setNumberOfPages,
    goToLastPage,
    onPageUpClick,
    onPageDownClick,
    pageUpDisabled: state.currentPage === state.numberOfPages,
    pageDownDisabled: state.currentPage === 1,
  };
}
