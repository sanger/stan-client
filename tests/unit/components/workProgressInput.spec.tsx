import { render, screen, cleanup } from '@testing-library/react';
import { describe } from '@jest/globals';
import WorkProgressInput, {
  workProgressSearchSchema,
  WorkProgressSearchType
} from '../../../src/components/workProgress/WorkProgressInput';
import { ValidationError } from 'yup';
import { WorkStatus } from '../../../src/types/sdk';

afterEach(() => {
  cleanup();
});

// Mocking useLocation because the component tries to access its history
// Maybe worth considering creating a test router wrapper for future tests with dummy history
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn().mockImplementation(() => {
    return {
      pathname: () => './work_progress_summary'
    };
  })
}));

describe('WorkProgressInput.tsx', () => {
  describe('workProgressSearchSchema', () => {
    describe('searchType', () => {
      const schema = workProgressSearchSchema(['Work Type 1']);

      it('returns a validation error if search type is not provided', async () => {
        /* 
                    In this case we want to make sure schema.validate({}) throws an error
                    if we dont expect 1 assertion then the test can pass when there is no error
                    by successfully validating and exiting 
                */
        expect.assertions(1);
        try {
          await schema.validate({});
        } catch (e) {
          expect(e).toEqual(new ValidationError('searchType is a required field'));
        }
      });

      it('returns a validation error if search type is invalid', async () => {
        expect.assertions(1);
        try {
          await schema.validate({ searchType: 'invalid' });
        } catch (e) {
          expect(e).toEqual(
            new ValidationError(
              'searchType must be one of the following values: SGP/R&D Number, Work Type, Status, Program'
            )
          );
        }
      });

      it('returns a valid yup object given a valid searchType', async () => {
        expect(await schema.validate({ searchType: WorkProgressSearchType.WorkNumber })).toEqual({
          searchType: 'SGP/R&D Number'
        });
      });
    });

    describe('searchValues', () => {
      const schema = workProgressSearchSchema(['Work Type 1']);
      describe('workType', () => {
        it('returns a validation error if given workType is not declared in schema', async () => {
          expect.assertions(1);
          try {
            await schema.validate({
              searchType: WorkProgressSearchType.WorkType,
              searchValues: ['Work Type 2']
            });
          } catch (e) {
            expect(e).toEqual(new ValidationError('searchValues[0] must be one of the following values: Work Type 1'));
          }
        });

        it('returns a valid yup object when given workType is declared in schema', async () => {
          expect(
            await schema.validate({
              searchType: WorkProgressSearchType.WorkType,
              searchValues: ['Work Type 1']
            })
          ).toEqual({
            searchType: 'Work Type',
            searchValues: ['Work Type 1']
          });
        });
      });

      describe('status', () => {
        it('returns a validation error if given status is not a valid status', async () => {
          expect.assertions(1);
          try {
            await schema.validate({
              searchType: WorkProgressSearchType.Status,
              searchValues: ['Invalid']
            });
          } catch (e) {
            expect(e).toEqual(
              new ValidationError(
                'searchValues[0] must be one of the following values: unstarted, active, paused, completed, failed, withdrawn'
              )
            );
          }
        });

        it('returns a valid yup object when given workType is declared in schema', async () => {
          expect(
            await schema.validate({
              searchType: WorkProgressSearchType.Status,
              searchValues: [WorkStatus.Unstarted]
            })
          ).toEqual({
            searchType: 'Status',
            searchValues: ['unstarted']
          });
        });
      });
    });
  });

  describe('WorkProgressInput', () => {
    it('renders correctly given empty props', () => {
      const workProgressInputProps = {
        urlParams: {
          searchType: '',
          searchValues: []
        },
        workTypes: [],
        searchTypes: []
      };
      render(<WorkProgressInput {...workProgressInputProps} />);

      // Component header title
      expect(screen.getByTestId('heading')).toHaveTextContent('Search');
      // Search type selector
      const searchTypeSelector = screen.getByTestId('type') as HTMLInputElement;
      expect(searchTypeSelector).toBeInTheDocument();
      expect(searchTypeSelector.value).toEqual('');
      // Search type values
      const searchValues = screen.getByTestId('valueSelect') as HTMLSelectElement;
      expect(searchValues).toBeInTheDocument();
      expect(searchValues.value).toEqual('');
      // Search button
      expect(screen.getByRole('button')).toBeInTheDocument();
      // Search button should be disabled when there are no searchValues
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders the correct information given valid work type props', async () => {
      const workProgressInputProps = {
        urlParams: {
          searchType: WorkProgressSearchType.WorkType,
          searchValues: ['Work Type 1']
        },
        workTypes: ['Work Type 1'],
        searchTypes: [WorkProgressSearchType.Status, WorkProgressSearchType.WorkNumber, WorkProgressSearchType.WorkType]
      };
      render(<WorkProgressInput {...workProgressInputProps} />);

      const searchTypeSelector = screen.getByTestId('type') as HTMLInputElement;
      expect(searchTypeSelector.value).toEqual('Work Type');
      const searchValues = screen.getByTestId('valueSelect') as HTMLSelectElement;
      expect(searchValues.value).toEqual('Work Type 1');
      expect(searchValues.options.length).toEqual(1);
      expect(searchValues.options[0].value).toEqual('Work Type 1');

      expect(screen.getByRole('button')).toBeEnabled();
    });

    it('renders the correct information given work number props', async () => {
      const workProgressInputProps = {
        urlParams: {
          searchType: WorkProgressSearchType.WorkNumber,
          searchValues: ['SGP-1']
        },
        workTypes: ['Work Type 1'],
        searchTypes: [WorkProgressSearchType.Status, WorkProgressSearchType.WorkNumber, WorkProgressSearchType.WorkType]
      };
      render(<WorkProgressInput {...workProgressInputProps} />);

      const searchTypeSelector = screen.getByTestId('type') as HTMLInputElement;
      expect(searchTypeSelector.value).toEqual('SGP/R&D Number');
      const searchValues = screen.getByTestId('valueInput') as HTMLInputElement;
      expect(searchValues.value).toEqual('SGP-1');

      expect(screen.getByRole('button')).toBeEnabled();
    });

    it('renders the correct information given status props', async () => {
      const workProgressInputProps = {
        urlParams: {
          searchType: WorkProgressSearchType.Status,
          searchValues: ['unstarted']
        },
        workTypes: ['Work Type 1'],
        searchTypes: [WorkProgressSearchType.Status, WorkProgressSearchType.WorkNumber, WorkProgressSearchType.WorkType]
      };
      render(<WorkProgressInput {...workProgressInputProps} />);

      const searchTypeSelector = screen.getByTestId('type') as HTMLInputElement;
      expect(searchTypeSelector.value).toEqual('Status');
      const searchValues = screen.getByTestId('valueSelect') as HTMLInputElement;
      expect(searchValues.value).toEqual('unstarted');

      expect(screen.getByRole('button')).toBeEnabled();
    });
  });
});
