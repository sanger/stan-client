import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import FileUploader from '../../../../src/components/upload/FileUploader';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

async function simulateFileSelection(isMultiple = false) {
  const mockFile1: File = new File(['Test'], 'Test.png', { type: 'image/png' });
  const mockFile2: File = new File(['Test2'], 'Test2.png', { type: 'image/png' });
  const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
  //Simulate input change event and wait until finish
  await waitFor(() => {
    fireEvent.change(fileInput, { target: { files: isMultiple ? [mockFile1, mockFile2] : [mockFile1] } });
  });
}

describe('FileUploader.tsx', () => {
  it('renders select file button and upload button', () => {
    render(<FileUploader url={''} />);
    // Shows the component
    expect(screen.getByText('Select file...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Upload/i })).toBeDisabled();
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

  it('selects only single if multiple files are not allowed', async () => {
    render(<FileUploader url={''} allowMultipleFiles={false} />);
    await simulateFileSelection();
    //Check the file is in list for input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    if (fileInput.files) {
      expect(fileInput.files.length).toBe(1);
      expect(fileInput.files[0].name).toBe('Test.png');
    }
    const file = new File(['Test2'], 'Test2.png', { type: 'image/png' });
    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    if (fileInput.files) {
      expect(fileInput.files.length).toBe(1);
      expect(fileInput.files[0].name).toBe('Test2.png');
    }
  });

  it('selects multiple files', async () => {
    render(<FileUploader url={''} allowMultipleFiles={true} />);
    await simulateFileSelection(true);
    //Check the file is in list for input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    if (fileInput.files) {
      expect(fileInput.files.length).toBe(2);
      expect(fileInput.files[0].name).toBe('Test.png');
      expect(fileInput.files[1].name).toBe('Test2.png');
    }
  });

  it('displays error when selecting same file when multiple file selection enabled ', async () => {
    render(<FileUploader url={''} allowMultipleFiles={true} />);
    await simulateFileSelection(true);
    //Check the file is in list for input
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['Test2'], 'Test2.png', { type: 'image/png' });
    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(screen.getByText('File already selected')).toBeVisible();
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
