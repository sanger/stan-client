import { render, screen, cleanup } from '@testing-library/react';
import { describe, test } from '@jest/globals';
import Warning from '../../../../src/components/notifications/Warning';
import { ClientError } from 'graphql-request';

afterEach(() => {
  cleanup();
});

// Maybe worth moving ClientError to a factory or something
// As I imagine it will be useful
const warningProps = {
  message: 'Warning message',
  error: new ClientError(
    {
      status: 500,
      errors: [
        {
          message: 'Exception while fetching data : The operation could not be validated.',
          extensions: {
            problems: ['There is a problem', 'and another problem']
          }
        }
      ]
    },
    {
      query: ''
    }
  )
};

describe('Warning.ts', () => {
  test('displays the warning message, errors and problems passed in', () => {
    render(Warning(warningProps));
    // Shows the message
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    // Shows the error message
    expect(screen.getByText('The operation could not be validated.')).toBeInTheDocument();
    // Shows the problems
    expect(screen.getByText('There is a problem')).toBeInTheDocument();
    expect(screen.getByText('and another problem')).toBeInTheDocument();
  });

  test('Propagates the passed in classes', () => {
    const extraClasses = 'font-bold';
    render(Warning({ ...warningProps, className: extraClasses }));
    expect(screen.getByTestId('warning')).toHaveClass('font-bold');
  });
});
