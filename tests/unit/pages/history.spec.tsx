import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistoryUrlParams } from '../../../src/pages/History';
import History from '../../../src/components/history/History';

afterEach(() => {
  cleanup();
});

describe('History', () => {
  it('displays error when called with no url params', async () => {
    const props: HistoryUrlParams = {};
    act(() => {
      render(<History {...props} />);
    });
    expect(screen.getByText('History')).toBeVisible();
  });
});
