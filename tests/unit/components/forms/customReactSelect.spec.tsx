import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { describe } from '@jest/globals';
import CustomReactSelect from '../../../../src/components/forms/CustomReactSelect';
import { getById } from '../../generic/utilities';
import * as Formik from 'formik';
afterEach(() => {
  cleanup();
});

const renderFormikSelect = (props: any) => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext');
  const getFieldMetaMock = () => {
    return {
      value: 'testValue',
      initialTouched: true,
      touched: false
    };
  };
  useFormikContextMock.mockReturnValue({
    getFieldMeta: getFieldMetaMock
  } as unknown as any);
  return render(<CustomReactSelect {...props} id={'custom-react-select'} />);
};

const renderNormalSelect = (props: any) => {
  return render(<CustomReactSelect {...props} id={'custom-react-select'} />);
};
const mockedOptions = [
  { label: 'Option 1', value: 'option-1' },
  { label: 'Option 2', value: 'option-2' },
  { label: 'Option 3', value: 'option-3' },
  { label: 'Option 4', value: 'option-4' }
];

const testSelectOptions = async (nameStr?: string) => {
  const onChange = jest.fn();

  const customSelectProps = {
    options: mockedOptions,
    label: 'Test label',
    placeholder: 'Select options...',
    name: nameStr ?? undefined,
    handleChange: () => {
      onChange();
    }
  };
  await act(async () => {
    if (nameStr) {
      renderFormikSelect(customSelectProps);
    } else {
      renderNormalSelect(customSelectProps);
    }
  });

  // Opens the dropdown options list
  const input = screen.getByRole('combobox');
  expect(input).toBeInTheDocument();
  fireEvent.keyDown(input, { keyCode: 40 });

  //Selects the dropdown option and close the dropdown options list
  const option = screen.getByText('Option 1');
  expect(option).toBeInTheDocument();
  fireEvent.click(option);

  //Check the selected value
  expect(screen.getByTestId('select-div')).toHaveTextContent('Option 1');

  //Check callback function
  expect(onChange).toHaveBeenCalled();
};

const testBlur = (nameStr?: string) => {
  const onBlur = jest.fn();

  const customSelectProps = {
    options: mockedOptions,
    label: 'Test label',
    placeholder: 'Select options...',
    name: nameStr ?? undefined,
    handleBlur: () => {
      onBlur();
    }
  };
  act(() => {
    if (nameStr) {
      renderFormikSelect(customSelectProps);
    } else {
      renderNormalSelect(customSelectProps);
    }
  });

  // Opens the dropdown options list
  const input = screen.getByRole('combobox');
  expect(input).toBeInTheDocument();

  //Remove focus from select
  fireEvent.keyDown(input, { keyCode: 40 });
  fireEvent.blur(input);

  //Check callback function
  if (nameStr) {
    expect(onBlur).toHaveBeenCalled();
  } else {
    expect(onBlur).not.toHaveBeenCalled();
  }
};

const testFilterOptions = (nameStr?: string) => {
  const customSelectProps = {
    options: [
      { label: 'Orange', value: 'orange' },
      { label: 'Apple', value: 'apple' },
      { label: 'Kiwi', value: 'kiwi' }
    ],
    label: 'Test label',
    placeholder: 'Select options...',
    name: nameStr ?? undefined
  };
  nameStr ? renderFormikSelect(customSelectProps) : renderNormalSelect(customSelectProps);
  // Opens the dropdown options list
  const input = screen.getByRole('combobox');
  expect(input).toBeInTheDocument();
  fireEvent.change(input, { target: { value: 'a' } });
  //Display filtered option list which has letter 'a'
  const option1 = screen.getByText('Apple');
  expect(option1).toBeInTheDocument();
  const option2 = screen.queryByText('Orange');
  expect(option2).toBeInTheDocument();
  const option3 = screen.queryByText('Kiwi');
  expect(option3).not.toBeInTheDocument();
};

describe('CustomReactSelect.tsx', () => {
  describe('Normal select', () => {
    it('renders correctly given empty options as props', () => {
      const customSelectProps = {
        options: []
      };
      const dom = renderNormalSelect(customSelectProps);
      //Renders normal select box
      const selectComp = getById(dom.container, 'custom-react-select');
      expect(selectComp).toBeInTheDocument();
    });

    it('should select options', () => {
      testSelectOptions();
    });

    it('should invoke callback on blur', () => {
      testBlur();
    });
    it('should filter options based on text entered', () => {
      testFilterOptions();
    });
  });
  describe('In Formik context', () => {
    it('renders correctly in formik context', () => {
      const customSelectProps = {
        options: [],
        name: 'form'
      };
      const dom = renderFormikSelect(customSelectProps);
      //Renders formik select box wrapper
      expect(screen.getByTestId('form_select-div')).toBeInTheDocument();

      //Renders select
      const selectComp = getById(dom.container, 'custom-react-select');
      expect(selectComp).toBeInTheDocument();
    });
    it('should select options', () => {
      testSelectOptions('form');
    });
    it('should filter options based on text entered', () => {
      testFilterOptions('form');
    });
  });
});
