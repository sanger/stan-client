import React, { useEffect, useState } from "react";
import IconButton from "../buttons/IconButton";

interface PagerProps {
  /**
   * How many pages does the pager have
   */
  numberOfPages: number;

  /**
   * Where should be pager start? Defaults to 1 if not supplied.
   * @default 1
   */
  startingPage?: number;

  /**
   * Callback that gets called each time the page changes
   * @param page the new page number
   */
  onPageChange?: (page: number) => void;
}

const Pager: React.FC<PagerProps> = ({
  numberOfPages,
  startingPage = 1,
  onPageChange,
}) => {
  const [page, setPage] = useState(() => {
    return startingPage < 1
      ? 1
      : startingPage > numberOfPages
      ? numberOfPages
      : startingPage;
  });

  useEffect(() => onPageChange?.(page), [page, onPageChange]);

  useEffect(() => {
    if (page > numberOfPages && numberOfPages !== 0) {
      setPage(numberOfPages);
    }
  }, [page, numberOfPages]);

  const onPageDownClick = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const onPageUpClick = () => {
    if (page < numberOfPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-row items-center gap-6 text-sm text-gray-700">
      <IconButton disabled={page === 1} onClick={onPageDownClick}>
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
        <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{numberOfPages}</span>
      </div>
      <IconButton disabled={page === numberOfPages} onClick={onPageUpClick}>
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
};

export default Pager;
