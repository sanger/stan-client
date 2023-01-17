import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import Information from '../../../../src/components/notifications/Information';

afterEach(() => {
  cleanup();
});

describe('Information', () => {
  it('displays information icon', () => {
    render(<Information />);
    // Shows the message
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('displays given classes', () => {
    const extraClasses = 'font-bold';
    render(<Information className={extraClasses} />);
    expect(screen.getByTestId('info-div')).toHaveClass('font-bold');
  });

  it('displays information on hover and hides on leave', async () => {
    render(
      <Information>
        <div data-testid={'text'}>Displaying Text</div>{' '}
      </Information>
    );
    const infoIcon = screen.getByTestId('info-icon');
    fireEvent.mouseOver(infoIcon);

    await waitFor(() => screen.getByTestId('text'));
    expect(screen.getByTestId('text')).toBeInTheDocument();

    const text = screen.getByTestId('text');
    fireEvent.mouseLeave(text);
    expect(screen.queryByTestId('text')).not.toBeInTheDocument();
  });

  it('Close button', async () => {
    render(
      <Information>
        <div data-testid={'text'}>Displaying Text</div>{' '}
      </Information>
    );
    const infoIcon = screen.getByTestId('info-icon');
    fireEvent.mouseOver(infoIcon);

    await waitFor(() => screen.getByTestId('text'));
    expect(screen.getByTestId('text')).toBeInTheDocument();

    const failIcon = screen.getByTestId('failIcon');
    expect(failIcon).toBeInTheDocument();

    fireEvent.click(failIcon);
    expect(screen.queryByTestId('text')).not.toBeInTheDocument();
  });
});
