import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe } from '@jest/globals';
import WorkNumberSelect from '../../../src/components/WorkNumberSelect';
import { FindWorkInfoQuery, GetAllWorkInfoQuery, WorkStatus } from '../../../src/types/sdk';
import { Formik } from 'formik';

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
    }),
    GetAllWorkInfo: jest.fn().mockImplementation(() => {
      return new Promise<GetAllWorkInfoQuery>((resolve) => {
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
              },
              status: WorkStatus.Active
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
              },
              status: WorkStatus.Failed
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
              },
              status: WorkStatus.Active
            }
          ]
        });
      });
    })
  }
}));

const invokeSelect = () => {
  const input = screen.getByRole('combobox');
  expect(input).toBeInTheDocument();
  fireEvent.keyDown(input, { keyCode: 40 });
};

const selectOption = (optionText: string) => {
  invokeSelect();
  const option = screen.getByText(optionText);
  expect(option).toBeInTheDocument();
  fireEvent.click(option);
};
describe('WorkNumberSelect.tsx', () => {
  describe('Normal Select component', () => {
    describe('OnMount', () => {
      it('displays select component with work numbers', async () => {
        await act(async () => {
          render(<WorkNumberSelect label={'Work Number'} />);
        });

        const workNumberSelect = screen.getByTestId('workNumber');
        // Shows the select component
        expect(workNumberSelect).toBeInTheDocument();

        invokeSelect();
        //Expect the select has got all options
        expect(screen.getByTestId('workNumber')).toHaveTextContent('WORK_2');
        expect(screen.getByTestId('workNumber')).toHaveTextContent('WORK_1');
      });
      it('displays select component with all work numbers', async () => {
        await act(async () => {
          render(<WorkNumberSelect label={'Work Number'} workNumberType={'ALL'} />);
        });
        const workNumberSelect = screen.getByTestId('workNumber');
        // Shows the select component
        expect(workNumberSelect).toBeInTheDocument();

        invokeSelect();
        //Expect the select has got all options
        expect(screen.getByTestId('workNumber')).toHaveTextContent('WORK_2');
        expect(screen.getByTestId('workNumber')).toHaveTextContent('WORK_3');
        expect(screen.getByTestId('workNumber')).toHaveTextContent('WORK_1');
      });
      it('displays select component with only failed work numbers', async () => {
        await act(async () => {
          render(<WorkNumberSelect label={'Work Number'} workNumberType={WorkStatus.Failed} />);
        });
        invokeSelect();
        //Expect the select has got only failed work number
        expect(screen.getByTestId('workNumber')).toHaveTextContent('WORK_3');
        expect(screen.getByTestId('workNumber')).not.toHaveTextContent('WORK_1');
      });
      describe('onSelection', () => {
        it('displays error message when no work number selected on blur', async () => {
          await act(async () => {
            render(<WorkNumberSelect label={'Work Number'} />);
          });
          const input = screen.getByRole('combobox');
          fireEvent.blur(input);
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
        await act(async () => {
          render(
            <Formik {...FormikProps}>
              <WorkNumberSelect name={'name'} label={'Work Number'} />
            </Formik>
          );
        });
        const workNumberSelect = screen.getByTestId('workNumber');
        // Shows the select component
        expect(workNumberSelect).toBeInTheDocument();
        invokeSelect();
        //Expect the select has got all options
        expect(screen.getByTestId('workNumber')).toHaveTextContent('WORK_2');
        expect(screen.getByTestId('workNumber')).toHaveTextContent('WORK_1');
      });
    });
    describe('onSelection', () => {
      it('displays selected work number', async () => {
        await act(async () => {
          render(
            <Formik {...FormikProps}>
              <WorkNumberSelect name={'name'} label={'Work Number'} />
            </Formik>
          );
        });
        selectOption('WORK_2');
        //Expect to display the work Requestor for the selected Work Number
        const userText = await screen.findByText('User 2');
        expect(userText).toBeInTheDocument();
        expect(userText).toHaveClass('px-2 rounded-full font-semibold text-sm bg-sp text-gray-100');

        //Expect to display the project for the selected Work Number
        const projectText = await screen.findByText('Project 2');
        expect(projectText).toBeInTheDocument();
        expect(projectText).toHaveClass('px-2 rounded-full font-semibold text-sm bg-sp text-gray-100');
      });
    });
  });
});
