import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe } from '@jest/globals';
import { MultiSelect } from '../../../../src/components/multiSelect/MultiSelect';

afterEach(() => {
  cleanup();
});
const options = ['Option 1', 'Option 2', 'Option 3'].map((option) => {
  return {
    label: option,
    key: option,
    value: option
  };
});
describe('MultiSelect.tsx', () => {
  describe('Multiple Selection component', () => {
    describe('OnMount', () => {
      it('displays multiple select component with options by default', async () => {
        act(() => {
          render(<MultiSelect options={options} data-testid={'select'} />);
        });
        const select = (await screen.findByTestId('select')) as HTMLSelectElement;
        // Shows the select component
        expect(select).toBeInTheDocument();
        //Shows an empty value
        expect(select).toHaveValue('');

        //Expect the select has got all options including empty string
        expect(select.options.length).toEqual(4);

        //Expect the select option to have the correct options
        expect(select.options[0].value).toEqual('');
        expect(select.options[1].value).toEqual('Option 1');
        expect(select.options[2].value).toEqual('Option 2');
        expect(select.options[3].value).toEqual('Option 3');
      });
    });

    describe('onSelection', () => {
      it('selects multiple options', async () => {
        act(() => {
          render(<MultiSelect multiple={true} options={options} data-testid={'select'} />);
        });

        //Select multiple values
        const select = (await screen.findByTestId('select')) as HTMLSelectElement;
        fireEvent.change(screen.getByTestId('select'), { target: { value: 'Option 1' } });
        fireEvent.change(screen.getByTestId('select'), { target: { value: 'Option 2' } });

        //Expect to display all selected options as disabled
        expect(select.options[1].disabled).toBeTruthy();
        expect(select.options[2].disabled).toBeTruthy();
      });
      it('displays selected multiple options', async () => {
        act(() => {
          render(<MultiSelect options={options} data-testid={'select'} />);
        });
        const select = (await screen.findByTestId('select')) as HTMLSelectElement;

        fireEvent.change(select, { target: { value: 'Option 1' } });
        fireEvent.change(select, { target: { value: 'Option 2' } });

        //Expect to display the selected options as labels on top
        const captions = await screen.findAllByTestId('caption');
        expect(captions).toHaveLength(2);
      });
      it('displays close button to remove selections ', async () => {
        act(() => {
          render(<MultiSelect options={options} data-testid={'select'} />);
        });
        const select = (await screen.findByTestId('select')) as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'Option 1' } });
        expect(screen.getByTestId('removeButton')).toBeInTheDocument();
      });
      it('removes selection when close button is clicked ', async () => {
        act(() => {
          render(<MultiSelect options={options} data-testid={'select'} />);
        });
        const select = (await screen.findByTestId('select')) as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'Option 1' } });
        const closeButton = screen.getByTestId('removeButton') as HTMLButtonElement;
        await closeButton.click();

        //Removes the selection
        expect(select).toHaveValue('');
        const caption = screen.queryByTestId('caption');
        expect(caption).not.toBeInTheDocument();
        expect(select.options[1].disabled).toBeFalsy();
      });
    });
  });

  describe('Single Selection component', () => {
    describe('OnMount', () => {
      it('displays select component with options', async () => {
        act(() => {
          render(<MultiSelect multiple={false} options={options} data-testid={'select'} />);
        });
        const select = (await screen.findByTestId('select')) as HTMLSelectElement;
        // Shows the select component
        expect(select).toBeInTheDocument();
        //Shows an empty value
        expect(select).toHaveValue('');

        //Expect the select has got all options including empty string
        expect(select.options.length).toEqual(4);

        //Expect the select option to have the correct options
        expect(select.options[0].value).toEqual('');
        expect(select.options[1].value).toEqual('Option 1');
        expect(select.options[2].value).toEqual('Option 2');
        expect(select.options[3].value).toEqual('Option 3');
      });
      it('only selects single option', async () => {
        act(() => {
          render(<MultiSelect multiple={false} options={options} data-testid={'select'} />);
        });
        const select = (await screen.findByTestId('select')) as HTMLSelectElement;
        fireEvent.change(select, { target: { value: 'Option 1' } });
        fireEvent.change(select, { target: { value: 'Option 2' } });
        //Expect to display only one selected option
        expect(select.options[2].selected).toBeTruthy();
        expect(select.options[1].selected).toBeFalsy();

        const caption = screen.queryByTestId('caption');
        expect(caption).not.toBeInTheDocument();
      });
    });
  });
});
