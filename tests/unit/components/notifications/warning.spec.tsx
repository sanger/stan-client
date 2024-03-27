import { render, screen, cleanup } from '@testing-library/react';
import Warning from '../../../../src/components/notifications/Warning';
import { ClientError } from 'graphql-request';
import '@testing-library/jest-dom';
import { GraphQLFormattedError } from 'graphql';

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
          },
          locations: undefined,
          path: undefined,
          nodes: undefined,
          source: undefined,
          positions: undefined,
          originalError: undefined,
          toJSON: function (): GraphQLFormattedError {
            return {
              message: this.message
            };
          },
          [Symbol.toStringTag]: '',
          name: ''
        }
      ]
    },
    {
      query: ''
    }
  )
};

describe('Warning.ts', () => {
  it('displays the warning message, errors and problems passed in', () => {
    render(<Warning {...warningProps} />);
    // Shows the message
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    // Shows the error message
    expect(screen.getByText('The operation could not be validated.')).toBeInTheDocument();
    // Shows the problems
    expect(screen.getByText('There is a problem')).toBeInTheDocument();
    expect(screen.getByText('and another problem')).toBeInTheDocument();
  });

  it('Propagates the passed in classes', () => {
    const extraClasses = 'font-bold';
    render(<Warning {...warningProps} className={extraClasses} />);
    expect(screen.getByTestId('warning')).toHaveClass('font-bold');
  });
});
