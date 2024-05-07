import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';
import StainForm from '../../../../src/pages/staining/StainForm';
import { CommentFieldsFragment, GetStainInfoQuery, LabwareFlaggedFieldsFragment } from '../../../../src/types/sdk';
import { createFlaggedLabware } from '../../../../src/mocks/handlers/flagLabwareHandlers';
import commentRepository from '../../../../src/mocks/repositories/commentRepository';
import userEvent from '@testing-library/user-event';

type StainFormProps = {
  stainType: string;
  stainingInfo: GetStainInfoQuery;
  initialLabware: LabwareFlaggedFieldsFragment[];
  onLabwareChange: (labware: LabwareFlaggedFieldsFragment[]) => void;
  comments: CommentFieldsFragment[];
};

const stainingInfo = {
  stainTypes: [
    {
      name: 'H&E',
      measurementTypes: ['Haematoxylin', 'Blueing', 'Eosin']
    },
    {
      name: "Masson's Trichrome",
      measurementTypes: []
    },
    {
      name: 'RNAscope',
      measurementTypes: []
    },
    {
      name: 'IHC',
      measurementTypes: []
    }
  ]
};

const comments: CommentFieldsFragment[] = commentRepository
  .findAll()
  .filter((comment) => ['Haematoxylin', 'Blueing', 'Eosin'].includes(comment.category));

const stainHeFormProps: StainFormProps = {
  stainType: 'H&E',
  stainingInfo,
  initialLabware: [createFlaggedLabware('STAN-5111'), createFlaggedLabware('STAN-5131')],
  onLabwareChange: () => {},
  comments
};
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

afterAll(() => {
  jest.resetAllMocks();
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom')
}));

const navigateMock = jest.fn();
require('react-router-dom').useNavigate = jest.fn().mockImplementation(() => ({
  navigate: navigateMock
}));

describe('stainForm.spec.tsx', () => {
  describe('Stain type = H&E', () => {
    it('should render the component properly', async () => {
      const { container, getByTestId, getByRole, getByText } = render(<StainForm {...stainHeFormProps} />);
      await waitFor(() => {
        expect(getByTestId('workNumber')).toBeVisible();

        //labware scanner is enabled
        expect(getByTestId('input')).toBeEnabled();

        //loads with the prescanned labware
        expect(getByRole('table').querySelectorAll('tbody>tr')).toHaveLength(2);

        expect(getByText('Measurements')).toBeVisible();
        //Haematoxylin
        expect(getByTestId('timeMeasurements.0.minutes')).toBeVisible();
        expect(getByTestId('timeMeasurements.0.seconds')).toBeVisible();
        expect(getByTestId('Haematoxylin-comment')).toBeVisible();

        //Blueing
        expect(getByTestId('timeMeasurements.1.minutes')).toBeVisible();
        expect(getByTestId('timeMeasurements.1.seconds')).toBeVisible();
        expect(getByTestId('Blueing-comment')).toBeVisible();

        //Eosin
        expect(getByTestId('timeMeasurements.2.minutes')).toBeVisible();
        expect(getByTestId('timeMeasurements.2.seconds')).toBeVisible();
        expect(getByTestId('Eosin-comment')).toBeVisible();

        //Summary text is accordingly set
        expect(getByText('No SGP number selected.')).toBeVisible();
        expect(container).toHaveTextContent('2 piece(s) of labware will be stained using H&E.');
      });
    });

    describe('validation', () => {
      it('when the user clicks on Submit without filling the required fields', async () => {
        const { getByRole, getByText, getAllByText } = render(<StainForm {...stainHeFormProps} />);
        await waitFor(async () => {
          await userEvent.click(getByRole('button', { name: 'Submit' }));
          expect(getByText('SGP Number is a required field')).toBeVisible();
          expect(getAllByText('Duration must be greater than or equal to 1')).toHaveLength(3);
        });
      });
    });
  });
});
