import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import FileUploader from '../../../../src/components/upload/FileUploader';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

async function simulateFileSelection() {
  const mockFile = new File(['Test'], 'Test.png', { type: 'image/png' });
  const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
  //Simulate input change event and wait until finish
  await waitFor(() => {
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
  });
}

describe('FileUploader.tsx', () => {
  it('renders select file button and upload button', () => {
    render(<FileUploader url={''} />);
    // Shows the component
    expect(screen.getByText('Select file...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Upload/i })).toBeDisabled();
    expect(screen.queryByTestId('file-description')).not.toBeInTheDocument();
  });

  it('selects input file', async () => {
    render(<FileUploader url={''} />);
    await simulateFileSelection();
    //Check the file is in list for input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    if (fileInput.files) {
      expect(fileInput.files.length).toBe(1);
      expect(fileInput.files[0].name).toBe('Test.png');
    }
  });

  it('renders file name on file selection', async () => {
    render(<FileUploader url={''} />);
    await simulateFileSelection();
    //Displays File description section
    expect(screen.queryByTestId('file-description')).toBeInTheDocument();
    //Displays the file icon and name
    expect(screen.getByTestId('fileIcon')).toBeVisible();
    expect(screen.getByText('Test.png')).toBeVisible();
    //Displays remove icon
    expect(screen.getByTestId('failIcon')).toBeVisible();
  });
  it('enables Upload button  on file selection', async () => {
    render(<FileUploader url={''} enableUpload={true} />);
    await simulateFileSelection();
    //Enables Upload button
    expect(screen.getByRole('button', { name: /Upload/i })).not.toBeDisabled();
  });
  it('removes file on remove button click', async () => {
    render(<FileUploader url={''} />);

    await simulateFileSelection();
    const elem = screen.getByTestId('failIcon');
    //Simulate input change event and wait until finish
    await waitFor(() => {
      fireEvent.click(elem);
    });

    //Removes the file icon and name
    expect(screen.queryByTestId('fileIcon')).not.toBeInTheDocument();
    expect(screen.queryByText('Test.png')).not.toBeInTheDocument();
  });
});
