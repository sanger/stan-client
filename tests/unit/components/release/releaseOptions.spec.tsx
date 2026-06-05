import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import ReleaseOptions from '../../../../src/components/release/ReleaseOptions';
import React from 'react';

afterEach(() => {
  cleanup();
});
const navigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => navigateFunction
}));

describe('ReleaseOptions', () => {
  it('renders page with release options', async () => {
    act(() => {
      const router = createMemoryRouter([{ path: '/releaseOptions', element: <ReleaseOptions /> }], {
        initialEntries: ['/releaseOptions?id=123']
      });
      render(<RouterProvider router={router} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Release File Options')).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox').length).toBe(3);
      const optionLabels = ['Histology', 'Sample Processing', 'Xenium'];
      optionLabels.forEach((option, indx) => {
        expect(screen.getByText(option)).toBeInTheDocument();
        const optionCheckBox = screen.getAllByRole('checkbox')[indx];
        expect(optionCheckBox).not.toBeChecked();
      });
    });
  });
  it('On initial loading release options are selected based on query params', async () => {
    act(() => {
      const router = createMemoryRouter([{ path: '/releaseOptions', element: <ReleaseOptions /> }], {
        initialEntries: ['/releaseOptions?id=123&groups=histology,sample_processing&type=xlsx']
      });
      render(<RouterProvider router={router} />);
    });
    await waitFor(() => {
      // The first two checkboxes (Histology, Sample Processing) should be checked, the third (Xenium) should not
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // Histology
      expect(checkboxes[1]).toBeChecked(); // Sample Processing
      expect(checkboxes[2]).not.toBeChecked(); // Xenium
      expect(screen.getByTestId('excel-file')).toBeChecked();
    });
  });
  it('calls navigate function with updated url when user updates release file columns', async () => {
    const router = createMemoryRouter([{ path: '/releaseOptions', element: <ReleaseOptions /> }], {
      initialEntries: ['/releaseOptions?id=123']
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => {
      const option1 = screen.getAllByRole('checkbox')[0];
      fireEvent.click(option1);
    });
    expect(navigateFunction).toHaveBeenLastCalledWith('/releaseOptions?id=123&groups=histology&type=tsv', {
      replace: true
    });
  });
  it('calls navigate function with updated url when user updates release file type', async () => {
    const router = createMemoryRouter([{ path: '/releaseOptions', element: <ReleaseOptions /> }], {
      initialEntries: ['/releaseOptions?id=123&type=tsv']
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => {
      const option1 = screen.getByTestId('excel-file');
      fireEvent.click(option1);
    });
    expect(navigateFunction).toHaveBeenLastCalledWith('/releaseOptions?id=123&groups=&type=xlsx', { replace: true });
  });
  it('calls navigate function with updated url when user deselects release options', async () => {
    const router = createMemoryRouter([{ path: '/releaseOptions', element: <ReleaseOptions /> }], {
      initialEntries: ['/releaseOptions?id=123&groups=histology,sample_processing&type=xlsx']
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => {
      const option1 = screen.getAllByRole('checkbox')[0];
      fireEvent.click(option1);
    });
    expect(navigateFunction).toHaveBeenLastCalledWith('/releaseOptions?id=123&groups=sample_processing&type=xlsx', {
      replace: true
    });
  });
});
