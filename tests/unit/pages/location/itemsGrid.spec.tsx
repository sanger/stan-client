import { act, cleanup, getAllByRole, render, screen } from '@testing-library/react';
import ItemsGrid from '../../../../src/pages/location/ItemsGrid';
import { LocationParentContext, LocationParentContextType } from '../../../../src/pages/Location';
import React from 'react';
import { createLabware } from '../../../../src/mocks/handlers/labwareHandlers';

afterEach(() => {
  cleanup();
});

const mocklocationParentContextValue: LocationParentContextType = {
  location: {
    barcode: 'STO-001',
    stored: [
      {
        barcode: 'STAN-3111'
      },
      {
        barcode: 'STAN-3112'
      }
    ],
    size: {
      numRows: 2,
      numColumns: 2
    },
    children: []
  },
  addressToItemMap: new Map([
    ['A1', { barcode: 'STAN-3111' }],
    ['A2', { barcode: 'STAN-3112' }]
  ]),
  locationAddresses: new Map([
    ['A1', 1],
    ['A2', 2]
  ]),
  storeBarcode: () => {},
  unstoreBarcode: () => {},
  selectedAddress: 'A1',
  setSelectedAddress: () => {},
  labwareBarcodeToAddressMap: new Map([
    ['STAN-3111', 'A1'],
    ['STAN-3112', 'A2']
  ]),
  storeBarcodes: () => {}
};

jest.mock('.../../../../src/lib/helpers/locationHelper.ts', () => ({
  ...jest.requireActual('.../../../../src/lib/helpers/locationHelper.ts'),
  addressToLocationAddress: jest.fn().mockImplementation(() => {
    return new Map([
      ['STAN-3111', 1],
      ['STAN-3112', 2]
    ]);
  })
}));
jest.mock('"../../../../src/lib/services/locationService', () => ({
  setLocationCustomName: jest.fn(),
  getLabwareInLocation: jest.fn()
}));

jest.mock('../../../../src/lib/sdk', () => ({
  ...jest.requireActual('../../../../src/lib/sdk'),
  GetSuggestedWorkForLabware: jest.fn().mockImplementation(() => {
    return {
      suggestedWorkForLabware: {
        suggestedWorks: {
          barcode: 'STAN-3111',
          workNumber: 'SGP8'
        }
      }
    };
  })
}));
jest.mock('.../../../../src/context/AuthContext', () => ({
  ...jest.requireActual('.../../../../src/context/AuthContext'),
  useAuth: jest.fn().mockImplementation(() => {
    return {
      isAuthenticated: jest.fn().mockImplementation(() => {
        return true;
      }),
      userRoleIncludes: jest.fn().mockImplementation(() => {
        return true;
      })
    };
  })
}));

jest.mock('.../../../../src/context/AuthContext', () => ({
  ...jest.requireActual('.../../../../src/context/AuthContext'),
  useAuth: jest.fn().mockImplementation(() => {
    return {
      isAuthenticated: jest.fn().mockImplementation(() => {
        return true;
      }),
      userRoleIncludes: jest.fn().mockImplementation(() => {
        return true;
      })
    };
  })
}));

describe('ItemsGrid', () => {
  beforeEach(() => {
    React.useMemo = jest.fn().mockReturnValue(createLabware('STAN-3111'));
    React.useState = jest.fn().mockReturnValue([[{ barcode: 'STAN-3111', workNumber: 'SGP8' }], jest.fn()]);
  });
  it('it should display table for selected address', async () => {
    act(() => {
      render(
        <LocationParentContext.Provider value={mocklocationParentContextValue}>
          <ItemsGrid />
        </LocationParentContext.Provider>
      );
    });
    const divElement = await screen.getByTestId('selectedAddress');
    expect(divElement).toBeInTheDocument();

    const tableElement = await screen.getByTestId('labware-table');
    expect(tableElement).toBeInTheDocument();

    const headerElements = tableElement.querySelectorAll('th');
    expect(headerElements).toHaveLength(8);

    const headerTitles = [
      'Address',
      'Barcode',
      'Work Number',
      'External Identifier',
      'Donor',
      'Spatial Location',
      'Replicate'
    ];
    headerElements.forEach((elem, indx) => {
      if (indx < headerTitles.length) {
        expect(elem).toHaveTextContent(headerTitles[indx]);
      }
    });

    const rowElements = getAllByRole(tableElement, 'row');
    expect(rowElements).toHaveLength(2);

    const columnElements = rowElements[1].querySelectorAll('td');
    expect(columnElements).toHaveLength(7);

    expect(columnElements[0]).toHaveTextContent('A1');
    expect(columnElements[1]).toHaveTextContent('STAN-3111');
    expect(columnElements[2]).toHaveTextContent('SGP8');
  });
});
