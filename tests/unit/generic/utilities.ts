import { queryByAttribute, screen, within, getByRole, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserRole } from '../../../src/types/sdk';

export const getById = queryByAttribute.bind(null, 'id');

export const workNumberNumOptionsShouldBe = async (length: number) => {
  await optionsShouldHaveLength('workNumber', length);
};
const optionsShouldHaveLength = async (dataTestId: string, length: number) => {
  getCustomSelectOptions(dataTestId).then((options) => {
    expect(options).toHaveLength(length);
  });
};

const getCustomSelectOptions = async (dataTestId: string) => {
  const user = userEvent.setup();
  const wrapperDiv = screen.getByTestId(dataTestId);

  const { getByRole, queryAllByRole } = within(wrapperDiv);

  const combobox = getByRole('combobox');

  await user.click(combobox);
  return queryAllByRole('option');
};

export const workNumberNumOptionsShouldBeMoreThan = async (length: number) => {
  await optionsLengthShouldBeMoreThan('workNumber', length);
};
const optionsLengthShouldBeMoreThan = async (dataTestId: string, length: number) => {
  getCustomSelectOptions(dataTestId).then((options) => {
    expect(options.length).toBeGreaterThan(length);
  });
};

export const selectSGPNumber = async (optionValue: string) => {
  await selectOption('workNumber', optionValue);
};

export const selectOption = async (dataTestId: string, optionValue: string) => {
  const selectDiv = screen.getAllByTestId(dataTestId)[0];
  const input = within(selectDiv).getByRole('combobox', { hidden: true });
  expect(input).toBeInTheDocument();
  await userEvent.type(input, '{arrowDown}');
  const option = screen.getAllByText(optionValue)[0];
  expect(option).toBeInTheDocument();
  await userEvent.click(option);
};

export const uncheck = async () => {
  const checkbox = screen.queryByRole('checkbox') as HTMLInputElement;
  if (checkbox && checkbox.checked) {
    await userEvent.click(checkbox);
  }
};

export const check = async () => {
  const checkbox = screen.queryByRole('checkbox') as HTMLInputElement;
  if (checkbox && !checkbox.checked) {
    await userEvent.click(checkbox);
  }
};

export const scanLabware = async (labwareBarcode: string) => {
  const labwareInput = screen.getByTestId('input');
  await userEvent.type(labwareInput, labwareBarcode);
  await userEvent.type(labwareInput, '{enter}');
};

export const visitAsEndUser = () => {
  jest.mock('../../../src/lib/sdk', () => ({
    stanCore: {
      CurrentUser: jest.fn().mockResolvedValue({
        user: {
          __typename: 'User',
          username: 'user1',
          role: UserRole.Enduser
        }
      })
    }
  }));
};
