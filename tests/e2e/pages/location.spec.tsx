import { describe } from '@jest/globals';
import { act, cleanup, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Location from '../../../src/pages/Location';
import userEvent from '@testing-library/user-event';
import { locationRepository } from '../../../src/mocks/repositories/locationRepository';
import { enableMapSet } from 'immer';
import React from 'react';
import '@testing-library/jest-dom';
import { LocationFieldsFragment } from '../../../src/types/sdk';
import { LocationFamily } from '../../../src/lib/machines/locations/locationMachineTypes';

jest.mock('../../../src/pages/location/ItemsGrid', () => {
  return {
    __esModule: true,
    default: jest.fn(() => {
      return <div>Item Grid</div>;
    })
  };
});
afterEach(() => {
  cleanup();
});

jest.mock('.../../../../src/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: jest.fn(() => true),
    userRoleIncludes: jest.fn(() => true)
  }))
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom')
}));

const locationFamily = (barcode: string, withChildren: boolean = false): LocationFamily => {
  return {
    parent: locationRepository.findByBarcode(barcode) as LocationFieldsFragment,
    children: withChildren
      ? ([locationRepository.findByBarcode('STO-014')] as Array<LocationFieldsFragment>)
      : ([] as Array<LocationFieldsFragment>)
  };
};

require('react-router-dom').useLoaderData = () => locationFamily('STO-024');

describe('Load location with no child ', () => {
  beforeAll(() => {
    enableMapSet();
  });
  beforeEach(() => {
    renderLocation('STO-024');
  });

  it('loads the page without clashing', () => {
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Store');
  });

  describe('Custom Names', () => {
    it('displays the custom name', () => {
      expect(screen.getByText('Box 3 in Rack 3 in Freezer 1 in Room 1234')).toBeVisible();
    });
  });

  describe('Displaying Properties', () => {
    it('displays the name', () => {
      expect(screen.getByText('Location 24')).toBeVisible();
    });
    it('displays the path', async () => {
      await waitFor(() => {
        expect(screen.getByText('Location 1 -> Location 2 -> Location 7 -> Location 24')).toBeVisible();
      });
    });

    it('displays the barcode', () => {
      expect(screen.getByText('STO-024')).toBeVisible();
    });

    it('displays the parent', () => {
      expect(screen.getByText('Rack 3 in Freezer 1 in Room 1234')).toBeVisible();
    });

    it('displays the size', () => {
      expect(screen.getByTestId('location-size')).toHaveTextContent('5 row(s) and 5 column(s)');
    });

    it('displays the number of stored items', () => {
      expect(screen.getByTestId('storedItemsCount')).toHaveTextContent('6');
    });

    it('displays the layout', () => {
      expect(screen.getByText('RightUp')).toBeVisible();
    });

    it('displays a section for Stored Items', () => {
      expect(screen.getByText('Stored Items')).toBeVisible();
    });
  });

  describe('Empty Location', () => {
    describe('when clicking the "Empty Location" button', () => {
      it('shows a confirmation modal', async () => {
        act(() => {
          userEvent.click(screen.getByRole('button', { name: 'Empty Location' }));
        });
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeVisible();
        });
      });
    });

    describe('When clicking the "Remove All Labware" button', () => {
      it('removes all labware from the Location', async () => {
        await userEvent.click(screen.getByRole('button', { name: /Empty Location/i }));
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeVisible();
        });
        await userEvent.click(screen.getByRole('button', { name: /Remove All Labware/i }));
        await waitFor(() => {
          expect(screen.getByText('Location emptied')).toBeVisible();
        });
      });
    });
  });
});
describe('Load location with a awaiting labware set in the session storage ', () => {
  beforeEach(() => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'awaitingLabwares') {
        return 'STAN-2111,tube,EXT_1,Donor_1,Lungs,Spatial_location 1,2a,STAN-3111,Slide,Ext_2,Donor_2,Kidney,Spatial_location 2,3,STAN-4111,Slide,EXT_3,Donor_3,Heart,Spatial_location 3,4,STAN-5111,Slide,Ext_4,Donor_4,Heart,Spatial_location 4,1';
      }
      return originalGetItem.call(localStorage, key);
    });
    enableMapSet();
    renderLocation('STO-024');
  });
  describe('when location opened with awaiting labware', () => {
    it('display the table with confirmed labware', async () => {
      expect(screen.getByText('Awaiting storage')).toBeInTheDocument();
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table.querySelectorAll('tbody tr')).toHaveLength(4);
    });
    it('store all button should be enabled', () => {
      expect(screen.getByRole('button', { name: /Store All/i })).toBeEnabled();
    });
  });

  describe('when storing all awaiting labware to location in one go', () => {
    it('should display the labware in boxes', async () => {
      act(() => {
        userEvent.click(screen.getByRole('button', { name: /Store All/i }));
      });
      await waitForElementToBeRemoved(() => screen.getByText('Awaiting storage'));
    });
  });
  describe('when storing one awaiting labware to location', () => {
    it('should display the added labware in box', async () => {
      act(() => {
        userEvent.click(screen.getByTestId('addIcon-STAN-3111'));
      });
      await waitFor(async () => {
        expect(screen.getByText('Barcode successfully stored')).toBeVisible();
      });
    });

    it('should only display the remaining labware in table', async () => {
      act(() => {
        userEvent.click(screen.getByTestId('addIcon-STAN-3111'));
      });

      await waitFor(async () => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        expect(table.querySelectorAll('tbody tr')).toHaveLength(3);
      });
    });
  });

  describe('when refreshing the page', () => {
    it('should display the updated list of awaiting labwares', async () => {
      act(() => {
        userEvent.click(screen.getByTestId('addIcon-STAN-3111'));
        userEvent.click(screen.getByText('Home'));
      });
      await waitFor(async () => {
        expect(screen.queryByText('STAN-3111')).not.toBeInTheDocument();
      });
    });
  });
  describe('when navigation to another page', () => {
    it('should display an alert', async () => {
      act(() => {
        userEvent.click(screen.getByTestId('addIcon-STAN-3111'));
        userEvent.click(screen.getByText('Home'));
      });
      await waitFor(async () => {
        expect(screen.getByText('You have unstored labware. Are you sure you want to leave?')).toBeVisible();
      });
    });
  });
});
describe('Load location with children ', () => {
  describe('Stored Items', () => {
    beforeEach(() => {
      require('react-router-dom').useLoaderData = jest.fn().mockReturnValue(locationFamily('STO-005', true));
      enableMapSet();
    });
    it("doesn't display a section for Stored Items", () => {
      act(() => {
        renderLocation('STO-005');
      });
      expect(screen.queryByText('Stored Items')).not.toBeInTheDocument();
    });
    it('display number of stored items', () => {
      act(() => {
        renderLocation('STO-005');
      });
      expect(screen.queryAllByTestId('storedItemsCount').length).toBeGreaterThan(0);
    });
  });
});

const renderLocation = (locationBarcode: string) => {
  const router = createMemoryRouter([{ path: '/locations/:locationBarcode', element: <Location /> }], {
    initialEntries: [`/locations/${locationBarcode}`]
  });
  render(<RouterProvider router={router} />);
};
