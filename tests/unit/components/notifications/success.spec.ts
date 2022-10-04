import { render, screen, cleanup } from '@testing-library/react';
import { describe, test } from '@jest/globals';
import Success from '../../../../src/components/notifications/Success';

afterEach(() => {
  cleanup();
});

describe('Success.ts', () => {
  test('displays the success message', () => {
    render(Success({ message: 'The operation was successful' }));
    // Shows the message
    expect(screen.getByText('The operation was successful')).toBeInTheDocument();
  });

  test('Propagates the passed in classes', () => {
    const extraClasses = 'font-bold';
    render(Success({ message: 'The operation was successful', className: extraClasses }));
    expect(screen.getByTestId('success')).toHaveClass('font-bold');
  });
});
