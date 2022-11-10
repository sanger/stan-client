import { act, cleanup, render, screen } from '@testing-library/react';
import { describe } from '@jest/globals';
import WorkNumberSelect from '../../../src/components/WorkNumberSelect';
import { FindWorkInfoQuery } from '../../../src/types/sdk';
import { Formik } from 'formik';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
});

jest.mock('../../../src/lib/sdk', () => ({
  stanCore: {
    FindWorkInfo: jest.fn().mockImplementation(() => {
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
  describe('Normal Select component', () => {
    describe('OnMount', () => {
      it('displays select component with work numbers', async () => {
        act(() => {
          render(<WorkNumberSelect label={'Work Number'} />);
        });
        const workNumberSelect = (await screen.findByTestId('select_workNumber')) as HTMLSelectElement;
        // Shows the select component
        expect(workNumberSelect).toBeInTheDocument();
        //Shows an empty value
        expect(workNumberSelect).toHaveValue('');

        //Expect the select has got all options including empty string
        expect(workNumberSelect.options.length).toEqual(4);

        //Expect the select option to have the correct work numbers
        expect(workNumberSelect.options[0].value).toEqual('');
        expect(workNumberSelect.options[1].value).toEqual('WORK_1');
        expect(workNumberSelect.options[2].value).toEqual('WORK_2');
        expect(workNumberSelect.options[3].value).toEqual('WORK_3');
      });
      describe('onSelection', () => {
        it('displays selected work number', async () => {
          act(() => {
            render(<WorkNumberSelect label={'Work Number'} />);
          });
          const workNumberSelect = (await screen.findByTestId('select_workNumber')) as HTMLSelectElement;

          workNumberSelect.options[1].selected = true;
          //Expect to display the selected Work Number
          expect(workNumberSelect.value).toBe('WORK_1');
        });
        it('displays error message when no work number selected on blur', async () => {
          act(() => {
            render(<WorkNumberSelect label={'Work Number'} />);
          });
          //Expect to display the error message
          const workNumberSelect = (await screen.findByTestId('select_workNumber')) as HTMLSelectElement;

          await userEvent.selectOptions(workNumberSelect, ['']);
          workNumberSelect.blur();
          expect(screen.getByText('SGP number is required')).toBeInTheDocument();
        });
      });
    });
  });
  describe('Formik Select component', () => {
    const FormikProps = {
      onSubmit: () => {},
      initialValues: {}
    };
    describe('On Mount', () => {
      it('displays formik select component with work numbers', async () => {
        act(() => {
          render(
            <Formik {...FormikProps}>
              <WorkNumberSelect name={'name'} label={'Work Number'} />
            </Formik>
          );
        });
        const workNumberSelect = (await screen.findByTestId('workNumber')) as HTMLSelectElement;

        // Shows the select component
        expect(workNumberSelect).toBeInTheDocument();

        //Shows an empty value
        expect(workNumberSelect).toHaveValue('');

        //Expect the select has got all options including empty string
        expect(workNumberSelect.options.length).toEqual(4);

        //Expect the select option to have the correct work numbers
        expect(workNumberSelect.options[0].value).toEqual('');
        expect(workNumberSelect.options[1].value).toEqual('WORK_1');
        expect(workNumberSelect.options[2].value).toEqual('WORK_2');
        expect(workNumberSelect.options[3].value).toEqual('WORK_3');
      });
    });
    describe('onSelection', () => {
      it('displays selected work number', async () => {
        act(() => {
          render(
            <Formik {...FormikProps}>
              <WorkNumberSelect name={'name'} label={'Work Number'} />
            </Formik>
          );
        });
        const workNumberSelect = (await screen.findByTestId('workNumber')) as HTMLSelectElement;
        await userEvent.selectOptions(workNumberSelect, ['WORK_1']);
        workNumberSelect.options[1].selected = true;

        //Expect to display the selected Work Number
        expect(workNumberSelect.value).toBe('WORK_1');

        //Expect to display the work Requestor for the selected Work Number
        const userText = await screen.findByText('User 1');
        expect(userText).toBeInTheDocument();
        expect(userText).toHaveClass('px-2 rounded-full font-semibold text-sm bg-sp text-gray-100');

        //Expect to display the project for the selected Work Number
        const projectText = await screen.findByText('Project 1');
        expect(projectText).toBeInTheDocument();
        expect(projectText).toHaveClass('px-2 rounded-full font-semibold text-sm bg-sp text-gray-100');
      });
    });
  });
});