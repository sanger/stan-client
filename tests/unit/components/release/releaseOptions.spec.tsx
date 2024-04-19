import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ReleaseOptions from '../../../../src/components/release/ReleaseOptions';

afterEach(() => {
  cleanup();
});
const navigateFunction = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useLoaderData: () => [
    { displayName: 'Option 1', queryParamName: 'option_1' },
    { displayName: 'Option 2', queryParamName: 'option_2' },
    { displayName: 'Option 3', queryParamName: 'option_3' }
  ],
  useNavigate: () => navigateFunction
}));
describe('ReleaseOptions', () => {
  it('renders page with release options', () => {
    const router = createMemoryRouter([{ path: '/releaseOptions', element: <ReleaseOptions /> }], {
      initialEntries: ['/releaseOptions?id=123']
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByText('Release File Options')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox').length).toBe(3);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    ['Option 1', 'Option 2', 'Option 3'].forEach((option, indx) => {
      expect(screen.getByText(option)).toBeInTheDocument();
      const optionCheckBox = screen.getAllByRole('checkbox')[indx];
      expect(optionCheckBox).not.toBeChecked();
    });
  });
  it('On initial loading release options are selected based on query params', () => {
    const router = createMemoryRouter([{ path: '/releaseOptions', element: <ReleaseOptions /> }], {
      initialEntries: ['/releaseOptions?id=123&groups=option_1,option_2&type=xlsx']
    });
    render(<RouterProvider router={router} />);
    ['Option 1', 'Option 2'].forEach((option, indx) => {
      const optionCheckBox = screen.getAllByRole('checkbox')[indx];
      expect(optionCheckBox).toBeChecked();
    });
    const option3 = screen.getAllByRole('checkbox')[2];
    expect(option3).not.toBeChecked();

    expect(screen.getByTestId('excel-file')).toBeChecked();
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
    expect(navigateFunction).toHaveBeenLastCalledWith('/releaseOptions?id=123&groups=option_1&type=tsv', { replace: true });
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
      initialEntries: ['/releaseOptions?id=123&groups=option_1,option_2&type=xlsx']
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => {
      const option1 = screen.getAllByRole('checkbox')[0];
      fireEvent.click(option1);
    });
    expect(navigateFunction).toHaveBeenLastCalledWith('/releaseOptions?id=123&groups=option_2&type=xlsx', { replace: true });
  });
});
