import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import XeniumAnalyser from '../../../../src/pages/XeniumAnalyser';
import React from 'react';
import { scanLabware, selectOption, shouldDisplayValue } from '../../../generic/utilities';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
});

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => jest.fn()
}));
describe('Xenium analyser', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <XeniumAnalyser />
      </BrowserRouter>
    );
  });
  describe('Xenium Analyser page is loaded correctly', () => {
    it('renders page the page without clutching', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Xenium Analyser');
      expect(screen.getByTestId('input')).toBeVisible();
      expect(screen.queryByText('Analyser Details')).toBeNull();
    });
    describe('when a labware is scanned', () => {
      beforeEach(() => {
        scanLabware('STAN-011');
      });
      it('renders Analyser details sections', () => {
        waitFor(() => {
          expect(screen.getByText('Analyser Details')).toBeVisible();
          expect(screen.getByTestId('performed')).toBeVisible();
          expect(screen.getByTestId('runName')).toBeVisible();
          expect(screen.getByTestId('lotNumberA')).toBeVisible();
          expect(screen.getByTestId('lotNumberB')).toBeVisible();
          expect(screen.getByTestId('workNumberAll')).toBeVisible();
          expect(screen.getAllByRole('table')).toHaveLength(2);
          expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
        });
      });
      describe('when a SGP number is selected for all', () => {
        it('displays the select SGP number for all', () => {
          waitFor(async () => {
            await selectOption('workNumberAll', 'SGP1008');
            shouldDisplayValue('STAN-011-workNumber', 'SGP1008');
          });
        });
      });
      describe('Time', () => {
        it('should display the current date', () => {
          waitFor(async () => {
            expect(screen.getByTestId('performed')).toHaveTextContent(new Date().toISOString().split('T')[0]);
          });
        });
        describe('Entering no value', () => {
          it('should display an error message', () => {
            waitFor(async () => {
              await userEvent.clear(screen.getByTestId('performed'));
              expect(screen.getByText('Time is a required field')).toBeVisible();
            });
          });
        });
        describe('Entering a future date', () => {
          it('should display an error message', () => {
            waitFor(async () => {
              await userEvent.type(screen.getByTestId('performed'), '2075-01-01T10:00');
              expect(screen.getByText('Please select a date and time on or before current time')).toBeVisible();
            });
          });
        });
      });
      describe('Run Name', () => {
        it('should display an error message on blur when no value is entered', () => {
          waitFor(async () => {
            await userEvent.clear(screen.getByTestId('runName'));
            await userEvent.tab();
            expect(screen.getByText('Run Name is a required field')).toBeVisible();
          });
        });
        it('should display an error message when entered value is more than 255 characters', () => {
          waitFor(async () => {
            await userEvent.type(screen.getByTestId('runName'), new Array(257).join('a'));
            await userEvent.tab();
            expect(screen.getByText('Run name should be a string of maximum length 255')).toBeVisible();
          });
        });
      });
      describe('Decoding reagent lot number', () => {
        it('should display an error message on blur when no value is entered', () => {
          waitFor(async () => {
            await userEvent.clear(screen.getByTestId('lotNumberA'));
            await userEvent.tab();
            expect(screen.getByText('Decoding reagent lot number is a required field')).toBeVisible();
          });
        });
        it('should display an error message when entered value is more than 20 characters', () => {
          waitFor(async () => {
            await userEvent.type(screen.getByTestId('lotNumberA'), new Array(22).join('a'));
            await userEvent.tab();
            expect(
              screen.getByText('Decoding reagent lot number should be a string of up to 32 letters and numbers.')
            ).toBeVisible();
          });
        });
        it('should display an error message when entered value contains any characters other than letters and numbers', () => {
          waitFor(async () => {
            await userEvent.type(screen.getByTestId('lotNumberA'), 'a*456bh');
            await userEvent.tab();
            expect(
              screen.getByText('Decoding reagent lot number should be a string of letters and numbers.')
            ).toBeVisible();
          });
        });
      });
      describe('ROI', () => {
        it('should display an error message on blur when no value is entered', () => {
          waitFor(async () => {
            await userEvent.click(screen.getByTestId('STAN-011-0-roi'));
            await userEvent.tab();
            expect(screen.getByText('Region of interest is a required field')).toBeVisible();
          });
        });
        it('should display an error message when entered value is longer than 64 characters', () => {
          waitFor(async () => {
            await userEvent.type(screen.getByTestId('STAN-011-0-roi'), new Array(66).join('a'));
            await userEvent.tab();
            expect(screen.getByText('Region of interest field should be string of maximum length 64')).toBeVisible();
          });
        });
      });
      describe('Save button enabling', () => {
        it('should enable Save button when all fields are filled in ', () => {
          waitFor(async () => {
            await fillInTheForm();
            expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
          });
        });

        describe('when time field is empty', () => {
          it('should disable Save button', () => {
            waitFor(async () => {
              await userEvent.clear(screen.getByTestId('performed'));
              expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
            });
          });
        });
        describe('when SGP number is removed', () => {
          it('should disable Save button', () => {
            waitFor(async () => {
              await selectOption('STAN-011-workNumber', '');
              expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
            });
          });
        });
        describe('when Cassette position is removed', () => {
          it('should disable Save button', () => {
            waitFor(async () => {
              await selectOption('STAN-011-position', '');
              expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
            });
          });
        });
        describe('when roi  is removed', () => {
          it('should disable Save button', () => {
            waitFor(async () => {
              await userEvent.type(screen.getByTestId('STAN-011-0-roi'), '');
              expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
            });
          });
        });
      });
    });
  });
});

const fillInTheForm = async () => {
  await userEvent.type(screen.getByTestId('runName'), 'Run 123');
  await userEvent.type(screen.getByTestId('lotNumberA'), 'Lot123');
  await selectOption('STAN-3111-position', 'Left');
  for (let indx = 0; indx < 8; indx++) {
    await userEvent.type(screen.getByTestId(`STAN-3111-${indx}-roi`), '123456789');
  }
};
