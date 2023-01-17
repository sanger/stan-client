import React from 'react';

const ExternalFieldSearchInfo = () => {
  return (
    <>
      <p className={'font-medium'}>
        External identifier' field supports wildcard search using * which can be used anywhere in the search string, or
        in multiple places.
      </p>
      <p className={'italic text-gray-600'}>
        E.g To search for multiple blocks from same donor{' '}
        <span className={'text-blue-600'}> A16-UTR-0-FO-1, A16-UTR-0-FO-2, and A16-UTR-0-FO-3 ,</span> use a wildcard
        search: <span className={'text-blue-600'}> A16-UTR-0-FO-* or *-ADR-*-FFPE*</span>
      </p>
    </>
  );
};

export default ExternalFieldSearchInfo;
