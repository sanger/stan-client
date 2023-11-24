import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableText from '../../../src/components/EditableText';
import '@testing-library/jest-dom';

jest.mock('../../../src/components/icons/EditIcon', () => () => <div>EditIcon Mock</div>);

describe('EditableText', () => {
  const mockOnChange = jest.fn().mockResolvedValue('Edited Text');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders default text and EditIcon', () => {
    render(
      <EditableText onChange={mockOnChange} defaultValue="Default Text">
        Default Text
      </EditableText>
    );

    expect(screen.getByText('Default Text')).toBeInTheDocument();
    expect(screen.getByText('EditIcon Mock')).toBeInTheDocument();
  });

  it('switches to editing mode when clicked', async () => {
    render(
      <EditableText onChange={mockOnChange} defaultValue="Default Text">
        Default Text
      </EditableText>
    );
    act(() => {
      userEvent.click(screen.getByText('Default Text'));
    });

    await screen.findByTestId('editable-text').then((input) => {
      expect(input).toBeVisible();
      expect(input).toHaveValue('Default Text');
    });
  });

  it('calls onChange and switches back to view mode when edited', async () => {
    render(
      <EditableText onChange={mockOnChange} defaultValue="Default Text">
        Default Text
      </EditableText>
    );

    act(() => {
      userEvent.click(screen.getByText('Default Text')).then(async () => {
        await screen.findByTestId('editable-text');
        const input = screen.getByTestId('editable-text');
        await userEvent.clear(input);
        await userEvent.type(input, 'Edited Text');
        await userEvent.tab();
      });
    });
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('Edited Text');
      expect(screen.getByText('Edited Text')).toBeVisible();
    });
  });

  it('ignores edit if text has not changed', async () => {
    render(
      <EditableText onChange={mockOnChange} defaultValue="Default Text">
        Default Text
      </EditableText>
    );

    act(() => {
      userEvent.click(screen.getByText('Default Text')).then(async () => {
        await screen.findByTestId('editable-text');
        await userEvent.tab();
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Default Text')).toBeVisible();
      expect(mockOnChange).not.toHaveBeenCalled();
      expect(screen.queryByTestId('editable-text')).not.toBeInTheDocument();
    });
  });

  it('handles errors during onChange', async () => {
    mockOnChange.mockRejectedValueOnce(new Error('Update failed'));

    jest.spyOn(console, 'error').mockImplementation(() => {
      // Do nothing, to stop cluttering the test output
    });

    render(
      <EditableText onChange={mockOnChange} defaultValue="Default Text">
        Default Text
      </EditableText>
    );

    act(() => {
      userEvent.click(screen.getByText('Default Text')).then(async () => {
        await screen.findByTestId('editable-text');
        const input = screen.getByTestId('editable-text');
        await userEvent.clear(input);
        await userEvent.type(input, 'Edited Text');
        await userEvent.tab();
      });
    });
    await waitFor(() => {
      expect(screen.getByText('Default Text')).toBeVisible();
      expect(mockOnChange).toHaveBeenCalledWith('Edited Text');
      expect(screen.queryByTestId('editable-text')).not.toBeInTheDocument();
    });
  });
});
