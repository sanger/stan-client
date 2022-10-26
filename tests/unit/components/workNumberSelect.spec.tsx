import { render, screen, cleanup, act } from '@testing-library/react';
import { describe } from '@jest/globals';
import WorkNumberSelect from '../../../src/components/WorkNumberSelect';
import userEvent from '@testing-library/user-event';
import { FindWorkInfoQuery } from '../../../src/types/sdk';

afterEach(() => {
  cleanup();
});

// Mocking FindWorkInfo
jest.mock('../../../src/lib/sdk', () => ({
  stanCore: {
    FindWorkInfo: jest.fn().mockImplementationOnce(() => {
      return new Promise<FindWorkInfoQuery>((resolve) => {
        resolve({
          works: [
            {
              workNumber: 'WORK_1',
              project: {
                __typename: 'Project',
                name: 'Project 1'
              },
              workRequester: {
                __typename: 'ReleaseRecipient',
                username: 'User 1'
              }
            },
            {
              workNumber: 'WORK_2',
              project: {
                __typename: 'Project',
                name: 'Project 2'
              },
              workRequester: {
                __typename: 'ReleaseRecipient',
                username: 'User 2'
              }
            },
            {
              workNumber: 'WORK_3',
              project: {
                __typename: 'Project',
                name: 'Project 3'
              },
              workRequester: {
                __typename: 'ReleaseRecipient',
                username: 'User 3'
              }
            }
          ]
        });
      });
    })
  }
}));

describe('WorkNumberSelect.tsx', () => {
  describe('OnMount', () => {
    it('displays select component with work numbers', () => {
      act(() => {
        render(<WorkNumberSelect label={'Work Number'} />);
      });

      const workNumberSelect = screen.getByTestId('workNumber');
      // Shows the select component
      expect(workNumberSelect).toBeInTheDocument();

      //Shows an empty value
      expect(workNumberSelect).toHaveValue('');
      expect(screen.getAllByRole('option').length).toBe(3);
    });
  });

  describe('onSelection', () => {
    it('displays selected work number', () => {
      render(<WorkNumberSelect label={'Work Number'} />);
      const workNumberSelect = screen.getByTestId('workNumber') as HTMLSelectElement;

      userEvent.selectOptions(
        // Find the select element,
        workNumberSelect,
        // Find and select the WORK_1 option
        screen.getByRole('option', { name: 'WORK_1', selected: true })
      );
      const selectedOptionElement = screen.getByRole('option', { name: 'WORK_1' }) as HTMLOptionElement;
      expect(selectedOptionElement.selected).toBe(true);
    });
  });
});
