import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DoubleScrollbarProps {
  children: React.ReactNode;
}
const TopScrollingBar: React.FC<DoubleScrollbarProps> = ({ children }) => {
  const [width, setWidth] = useState<string>('auto');
  const outerDivRef = useRef<HTMLDivElement | null>(null);
  const childrenWrapperRef = useRef<HTMLDivElement | null>(null);

  const getChildWrapperWidth = useCallback(() => {
    const table = childrenWrapperRef.current?.getElementsByTagName('table')[0];
    return table ? table.scrollWidth + 'px' : null;
  }, []);

  const setInnerDivWidth = useCallback(() => {
    const newWidth = getChildWrapperWidth();
    if (newWidth !== null && newWidth !== width) {
      setWidth(newWidth);
    }
  }, [getChildWrapperWidth, width]);

  useEffect(() => {
    setInnerDivWidth();

    const topScrollBarDiv = outerDivRef.current;
    const tableWrapper: HTMLDivElement | null | undefined =
      childrenWrapperRef.current?.querySelector('[datatype="table-wrapper"]');

    if (!tableWrapper || !topScrollBarDiv) return;
    const onTableWrapperScroll = () => {
      tableWrapper.scrollLeft = topScrollBarDiv.scrollLeft;
    };
    topScrollBarDiv.addEventListener('scroll', onTableWrapperScroll);
    const onTopBarScroll = () => {
      topScrollBarDiv.scrollLeft = tableWrapper.scrollLeft;
    };
    tableWrapper.addEventListener('scroll', onTopBarScroll);

    window.addEventListener('resize', setInnerDivWidth);

    return () => {
      tableWrapper.removeEventListener('scroll', onTopBarScroll);
      topScrollBarDiv.removeEventListener('scroll', onTableWrapperScroll);
      window.removeEventListener('resize', setInnerDivWidth);
    };
  }, [width, setWidth, getChildWrapperWidth, setInnerDivWidth]);
  return (
    <div>
      <div ref={outerDivRef} className="overflow-x-auto overflow-y-hidden">
        <div className="pt-0" style={{ width }}>
          &nbsp;
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-hidden" ref={childrenWrapperRef}>
        {children}
      </div>
    </div>
  );
};

export default TopScrollingBar;
