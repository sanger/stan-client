import { describe } from '@jest/globals';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Location from '../../../../src/pages/Location';
import userEvent from '@testing-library/user-event';
import { locationRepository } from '../../../../src/mocks/repositories/locationRepository';
import { locationResponse } from '../../../../src/mocks/handlers/locationHandlers';
import { enableMapSet } from 'immer';
import React from 'react';
jest.mock('../../../../src/pages/location/ItemsGrid', () => {
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
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useLoaderData: () => locationResponse(locationRepository.findByBarcode('STO-024')!)
}));

const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
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

    describe('when I click and edit the custom name', () => {
      it('updates it', () => {
        waitFor(async () => {
          const textBox = screen.getByText('Box 3 in Rack 3 in Freezer 1 in Room 1234');
          await userEvent.click(textBox);
          const input: HTMLInputElement = screen.getByDisplayValue('Box 3 in Rack 3 in Freezer 1 in Room 1234');
          expect(input).toBeInTheDocument();
          await userEvent.clear(input);
          await userEvent.type(input, 'Freezer McCool');
          await userEvent.type(input, '{enter}');
          expect(screen.getByText('Freezer McCool')).toBeVisible();
        });
      });
    });
  });

  describe('Displaying Properties', () => {
    it('displays the name', () => {
      expect(screen.getByText('Location 24')).toBeVisible();
    });
    it('displays the path', () => {
      waitFor(() => {
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
      it('shows a confirmation modal', () => {
        waitFor(async () => {
          await userEvent.click(screen.getByRole('button', { name: /Empty Location/i }));
          expect(screen.getByRole('dialog')).toBeVisible();
        });
      });
    });

    describe('When clicking the "Remove All Labware" button', () => {
      it('removes all labware from the Location', () => {
        waitFor(async () => {
          await userEvent.click(screen.getByRole('button', { name: /Empty Location/i }));
          expect(screen.getByRole('dialog')).toBeVisible();
          await userEvent.click(screen.getByRole('button', { name: /Remove All Labware/i }));
          expect(screen.getByText('Location emptied')).toBeVisible();
          expect(screen.getByTestId('storedItemsCount')).toHaveTextContent('0');
        });
      });
    });
  });

  describe('when awaiting labwares are in session storage', () => {
    beforeEach(() => {
      Storage.prototype.getItem = jest.fn(
        () =>
          'STAN-2111,tube,EXT_1,Donor_1,Lungs,Spatial_location 1,2a,STAN-3111,Slide,Ext_2,Donor_2,Kidney,Spatial_location 2,3,STAN-4111,Slide,EXT_3,Donor_3,Heart,Spatial_location 3,4,STAN-5111,Slide,Ext_4,Donor_4,Heart,Spatial_location 4,1'
      );
    });
    describe('when location opened with awaiting labware', () => {
      it('display the table with confirmed labware', () => {
        waitFor(() => {
          expect(screen.getByText('Awaiting storage')).toBeVisible();
          const labwareTable = screen.getByRole('table');
          expect(labwareTable).toBeVisible();
          expect(labwareTable).toHaveTextContent('STAN-2111');
          expect(labwareTable).toHaveTextContent('STAN-3111');
        });
      });
      it('store all button should be enabled', () => {
        expect(screen.getByRole('button', { name: /Store All/i })).toBeEnabled();
      });
    });

    describe('when storing all awaiting labware to location in one go', () => {
      it('should display the labware in boxes', () => {
        waitFor(async () => {
          await userEvent.click(screen.getByRole('button', { name: /Store All/i }));
          expect(screen.getByText('STAN-2111')).toBeVisible();
          expect(screen.getByText('STAN-3111')).toBeVisible();
          expect(screen.queryByRole('table')).not.toBeInTheDocument();
        });
      });
    });
    describe('when storing one awaiting labware to location', () => {
      it('should display the added labware in box', () => {
        waitFor(async () => {
          await userEvent.click(screen.getByTestId('addIcon-STAN-3111'));
          expect(screen.getByText('STAN-3111')).toBeVisible();
        });
      });
      it('should only display the remaining labware in table', () => {
        waitFor(async () => {
          await userEvent.click(screen.getByTestId('addIcon-STAN-3111'));
          const labwareTable = screen.getByRole('table');
          expect(labwareTable).toBeVisible();
          expect(labwareTable).toHaveTextContent('STAN-2111');
        });
      });
    });
    describe('when performing browser operations', () => {
      describe('when navigating to a previous location or another page', () => {
        it('should display the updated list of awaiting labwares', () => {
          waitFor(async () => {
            await userOperations();
            renderLocation('STO-002');
            expect(screen.getByText('STAN-2111')).toBeVisible();
            expect(screen.getByText('STAN-4111')).toBeVisible();
            expect(screen.queryByText('STAN-3111')).not.toBeInTheDocument();
          });
        });
      });

      describe('when refreshing the page', () => {
        it('should display the updated list of awaiting labwares', () => {
          waitFor(async () => {
            await userOperations();
            renderLocation('STO-024');
            expect(screen.getByText('STAN-2111')).toBeVisible();
            expect(screen.getByText('STAN-4111')).toBeVisible();
            expect(screen.queryByText('STAN-3111')).not.toBeInTheDocument();
          });
        });
      });
      describe('when navigation to another page', () => {
        it('should display an alert', () => {
          waitFor(async () => {
            await userOperations();
            await userEvent.click(screen.getByText('Home'));
            expect(alertSpy).toHaveBeenCalledWith(
              'You have labwares that are not stored. Are you sure you want to leave?'
            );
          });
        });
      });
    });
  });
});
describe('Load location with children ', () => {
  describe('Stored Items', () => {
    beforeEach(() => {
      require('react-router-dom').useLoaderData = jest.fn().mockImplementation(() => {
        locationResponse(locationRepository.findByBarcode('STO-005')!);
      });
      enableMapSet();
      renderLocation('STO-005');
    });
    it("doesn't display a section for Stored Items", () => {
      expect(screen.queryByText('Stored Items')).not.toBeInTheDocument();
    });
  });
});

const renderLocation = (locationBarcode: string) => {
  const router = createMemoryRouter([{ path: '/locations/:locationBarcode', element: <Location /> }], {
    initialEntries: [`/locations/${locationBarcode}`]
  });
  render(<RouterProvider router={router} />);
};

const userOperations = async () => {
  await userEvent.click(screen.getByText('Rack 1 in Freezer 1 in Room 1234'));
  await userEvent.click(screen.getByText('Box 1 in Rack 1 in Freezer 1 in Room 1234'));
  await userEvent.click(screen.getByTestId('addIcon-STAN-3111'));
};
