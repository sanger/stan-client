import { describe } from '@jest/globals';
import '@testing-library/jest-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Confirm from '../../../../src/pages/sectioning/Confirm';
import { uniqueId } from 'lodash';
import { enableMapSet } from 'immer';
import labwareFactory from '../../../../src/lib/factories/labwareFactory';
import * as reactDom from 'react-router-dom';
import { createMemoryRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

jest.mock('../../../../src/components/WorkNumberSelect', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onConfirmed }) => {
      return (
        <select data-testid="workNumber">
          <option value="SGP1008">SGP1008</option>
          <option value="SGP1009">SGP1009</option>
        </select>
      );
    })
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useLoaderData: jest.fn().mockReturnValue({
    comments: [],
    slotRegions: []
  }),
  useNavigate: jest.fn().mockImplementation(() => ({
    navigate: jest.fn()
  }))
}));

describe('Render Confirm Component', () => {
  beforeEach(() => {
    enableMapSet();
  });
  describe('when no state is specified', () => {
    beforeEach(() => {
      jest.spyOn(reactDom, 'useLocation').mockImplementation(() => {
        return {
          key: uniqueId(),
          pathname: '/sectioning/confirm',
          search: '',
          hash: '',
          state: null
        };
      });
      renderConfirm();
    });
    it('loads all the page fields correctly', () => {
      expectInitSectioningConfirmPage();
    });
    describe('After confirming some labware(s)', () => {
      beforeEach(() => {
        jest.mock('../../../../src/components/sectioningConfirm/SectioningConfirm', () => {
          return {
            __esModule: true,
            default: jest.fn(({ onConfirmed }) => {
              return <button onClick={() => onConfirmed([labwareFactory.build({ id: 1 })])}>Mock Confirm</button>;
            })
          };
        });
      });

      it('reloads to Sectioning - Plan page when Reset Form button is clicked', () => {
        waitFor(async () => {
          await userEvent.click(screen.getByRole('button', { name: 'Reset Form' }));
          expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sectioning - Plan');
          expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
        });
      });
    });
  });
  describe('when a state is specified', () => {
    beforeEach(() => {
      jest.spyOn(reactDom, 'useLocation').mockImplementation(() => {
        return {
          key: uniqueId(),
          pathname: '/sectioning/confirm',
          search: '',
          hash: '',
          state: {
            plans: [
              {
                planData: mockedPlanData()
              }
            ]
          }
        };
      });
      renderConfirm();
    });
    it('loads Sectioning Confirming page with the planed section(s) correctly', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sectioning - Confirmation');
      expect(screen.getAllByText('SGP Number').length).toBeGreaterThan(0);
      expect(screen.getByText('Find Plans')).toBeVisible();
      expect(screen.queryByText('Section Numbering')).toBeVisible();
      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).toBeVisible();
      expect(saveButton).toBeDisabled();
    });
    describe('After confirming some labware(s)', () => {
      beforeEach(() => {
        jest.mock('../../../../src/components/sectioningConfirm/SectioningConfirm', () => {
          return {
            __esModule: true,
            default: jest.fn(({ onConfirmed }) => {
              return <button onClick={() => onConfirmed([labwareFactory.build({ id: 1 })])}>Mock Confirm</button>;
            })
          };
        });
      });
      it('reloads to the sectioning - Confirm page when Reset Form button is clicked', () => {
        waitFor(async () => {
          await userEvent.click(screen.getByRole('button', { name: 'Reset Form' }));
          expectInitSectioningConfirmPage();
        });
      });
    });
  });
  describe('After confirming some labware(s)', () => {
    beforeEach(() => {
      jest.mock('../../../../src/components/sectioningConfirm/SectioningConfirm', () => {
        return {
          __esModule: true,
          default: jest.fn(({ onConfirmed }) => {
            return <button onClick={() => onConfirmed([labwareFactory.build({ id: 1 })])}>Mock Confirm</button>;
          })
        };
      });
      renderConfirm();
    });

    it('loads the page with Operation complete', () => {
      waitFor(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Mock Confirm' }));
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sectioning - Confirmation');
        expect(screen.getByText('Operation Complete')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Reset Form' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Store' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Return Home' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Print Labels' })).toBeEnabled();
      });
    });
    it('navigate to Home page when Return Home button is clicked', () => {
      waitFor(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Mock Confirm' }));
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Return Home');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('STAN');
      });
    });
    it('navigate to Store page when Store button is clicked', () => {
      waitFor(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Mock Confirm' }));
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Store');
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Store');
      });
    });
  });
});

const expectInitSectioningConfirmPage = () => {
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sectioning - Confirmation');
  expect(screen.getByText('SGP Number')).toBeVisible();
  expect(screen.getByText('Find Plans')).toBeVisible();
  expect(screen.queryByText('Source Labware')).not.toBeInTheDocument();
  expect(screen.queryByText('Section Numbering')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
};
const renderConfirm = () => {
  const router = createMemoryRouter(
    [
      {
        path: '/sectioning/confirm',
        element: <Confirm />
      }
    ],
    {
      initialEntries: ['/sectioning/confirm']
    }
  );
  render(<RouterProvider router={router} />);
};

const mockedPlanData = () => {
  const sourceLabware = labwareFactory.build({ id: 1 });
  const destinationLabware = labwareFactory.build({ id: 2 });
  return {
    sources: [sourceLabware],
    destination: destinationLabware,
    plan: {
      operationType: {
        __typename: 'OperationType',
        name: 'Section'
      },
      planActions: [
        {
          __typename: 'PlanAction',
          source: {
            __typename: 'Slot',
            address: 'A1',
            samples: [
              {
                __typename: 'Sample',
                id: sourceLabware.slots[0].samples[0].id
              }
            ],
            labwareId: sourceLabware.id
          },
          destination: {
            __typename: 'Slot',
            labwareId: destinationLabware.id,
            address: 'A1'
          },
          sample: {
            __typename: 'Sample',
            id: sourceLabware.slots[0].samples[0].id
          }
        }
      ]
    }
  };
};
