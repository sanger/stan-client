import React from 'react';
import IconButton from '../buttons/IconButton';

export type PagerProps = {
  /**
   * The current page
   */
  currentPage: number;

  /**
   * How many pages does the pager have
   */
  numberOfPages: number;

  /**
   * Should the page down button be disabled
   */
  pageDownDisabled: boolean;

  /**
   * Callback for clicking on the page down button
   */
  onPageDownClick: VoidFunction;

  /**
   * Should the page up button be disabled
   */
  pageUpDisabled: boolean;

  /**
   * Callback for clicking on the page down button
   */
  onPageUpClick: VoidFunction;
};

/**
 * A pager shows how many pages are available, and allows navigation between those pages.
 *
 * Works well with the {@link usePager} hook.
 */
function Pager({
  currentPage,
  numberOfPages,
  pageDownDisabled,
  pageUpDisabled,
  onPageDownClick,
  onPageUpClick
}: PagerProps) {
  return (
    <div className="flex flex-row items-center gap-6 text-sm text-gray-700">
      <IconButton disabled={pageDownDisabled} onClick={onPageDownClick}>
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </IconButton>
      <div>
        <span className="font-medium">{currentPage}</span> of <span className="font-medium">{numberOfPages}</span>
      </div>
      <IconButton disabled={pageUpDisabled} onClick={onPageUpClick}>
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </IconButton>
    </div>
  );
}

export default Pager;
