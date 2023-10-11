import React from 'react';

const ExternalIDFieldSearchInfo = () => {
  return (
    <div className={'flex flex-col whitespace-pre-wrap space-x-2 space-y-2'}>
      <p className={'font-medium'}>
        The external identifier field supports wildcard search using <code>*</code> anywhere in the search string.
        Additionally, it supports searching by multiple external names using comma-separated values.
      </p>
      <p className={'italic text-gray-600'}>
        E.g. to search for blocks with similar names{' '}
        <span className={'text-blue-600'}>
          <code>A16-UTR-0-FO-1</code>
        </span>{' '}
        and{' '}
        <span className={'text-blue-600'}>
          <code>A16-UTR-0-FO-2</code>
        </span>
        , you can use{' '}
        <span className={'text-blue-600'}>
          <code>A16-UTR-0-FO-*</code>
        </span>
        , or{' '}
        <span className={'text-blue-600'}>
          <code>A16*FO*</code>
        </span>
      </p>
      <p className={'italic text-gray-600'}>
        E.g. to search for blocks with multiple external names you can use{' '}
        <span className={'text-blue-600'}>
          <code>A16-UTR-0-FO-1</code>
        </span>
        ,
        <span className={'text-blue-600'}>
          <code>A16-UTR-0-FO-2</code>
        </span>
      </p>
    </div>
  );
};

export default ExternalIDFieldSearchInfo;
