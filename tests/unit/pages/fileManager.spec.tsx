import React from 'react';
import { render, fireEvent, screen, act, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe } from '@jest/globals';
import FileManager from '../../../src/pages/FileManager';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { WorkStatus } from '../../../src/types/sdk';
import { findUploadedFiles } from '../../../src/lib/services/fileService';
import {
  selectSGPNumber,
  uncheck,
  workNumberNumOptionsShouldBe,
  workNumberNumOptionsShouldBeMoreThan
} from '../generic/utilities';

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.resetAllMocks();
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom')
}));

const useLoaderDataMock = jest.fn().mockReturnValue([
  {
    workNumber: 'SGP1008',
    workRequester: 'user1',
    project: 'Project 1',
    status: WorkStatus.Active
  }
]);

const navigateMock = jest.fn();
require('react-router-dom').useLoaderData = useLoaderDataMock;
require('react-router-dom').useLocation = jest.fn();
require('react-router-dom').useNavigate = jest.fn().mockImplementation(() => ({
  navigate: navigateMock
}));

jest.mock('../../../src/lib/services/fileService', () => ({
  findUploadedFiles: jest.fn(() =>
    Promise.resolve([
      {
        name: 'possimus in quae',
        created: '14/11/2022',
        url: '/possimus in quae',
        work: {
          workNumber: 'SGP1008'
        }
      }
    ])
  )
}));

function expectFileManagerPageDefaultState() {
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('File Manager');
  expect(screen.queryByText('Upload file')).not.toBeInTheDocument();
  expect(screen.queryByText('Files')).not.toBeInTheDocument();
}

function expectFileManagerPageWithUploadState() {
  expect(screen.queryByText('Upload file')).toBeVisible();
  expect(screen.getByText('Files')).toBeVisible();
  expect(screen.getByTestId('file-input')).toBeEnabled();
  expect(screen.getByTestId('upload-btn')).toBeDisabled();
}
describe('On load', () => {
  describe('loads the file manager page correctly when no query param are specified', () => {
    beforeEach(() => {
      require('react-router-dom').useLocation.mockImplementation(() => {
        return {
          pathname: () => './file_manager',
          search: ''
        };
      });
    });
    it('loads all the page fields correctly', () => {
      act(() => {
        renderFileManagerComponent();
      });
      expectFileManagerPageDefaultState();
    });
  });
  describe('on visiting page with an active work number as a query parameter', () => {
    beforeEach(() => {
      require('react-router-dom').useLocation.mockImplementation(() => {
        return {
          pathname: () => './file_manager',
          search: 'workNumber=SGP1008'
        };
      });
      renderFileManagerComponent();
    });
    it('loads all the page fields correctly', () => {
      expectFileManagerPageWithUploadState();
    });
    it('should select SGP1008 in select box', () => {
      expect(screen.getByTestId('workNumber')).toHaveTextContent('SGP1008');
    });
    it('should check active checkBox', () => {
      expect(screen.getByTestId('active')).toBeChecked();
    });

    it('enables upload button after selecting a file', () => {
      act(() => {
        const file = new File(['sample'], 'image1.png', {
          type: 'image/png'
        });
        fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
      });
      expect(screen.getByTestId('upload-btn')).toBeEnabled();
    });
    it('should display a table with files uploaded for the selected SGP Numbers', async () => {
      act(() => {
        (findUploadedFiles as jest.MockedFunction<typeof findUploadedFiles>).mockResolvedValue([
          {
            name: 'possimus in quae',
            created: '14/11/2022',
            url: '/possimus in quae',
            work: {
              workNumber: 'SGP1008'
            }
          }
        ]);
      });
      await waitFor(() => {
        const filesTable = screen.getByRole('table');
        expect(filesTable).toBeVisible();
        expect(filesTable.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('on visiting page with an inactive work number as a query parameter', () => {
    beforeEach(() => {
      require('react-router-dom').useLocation.mockImplementation(() => {
        return {
          pathname: () => './file_manager',
          search: 'workNumber=SGP1001'
        };
      });
      require('react-router-dom').useLoaderData = jest.fn().mockReturnValue([
        {
          workNumber: 'SGP1001',
          workRequester: 'user1',
          project: 'Project 1',
          status: WorkStatus.Paused
        }
      ]);
      renderFileManagerComponent();
    });

    it('loads all the page fields correctly', () => {
      expectFileManagerPageWithUploadState();
    });
    it('should uncheck active checkBox', () => {
      expect(screen.getByTestId('active')).not.toBeChecked();
    });
    it('should select SGP1001 in select box', () => {
      expect(screen.getByTestId('workNumber')).toHaveTextContent('SGP1001');
    });
  });
  describe('on visiting page with multiple work numbers as a query parameter', () => {
    beforeEach(() => {
      require('react-router-dom').useLocation.mockImplementation(() => {
        return {
          pathname: () => './file_manager',
          search: 'workNumber=SGP1001&workNumber=SGP1008'
        };
      });
      require('react-router-dom').useLoaderData = jest.fn().mockReturnValue([
        {
          workNumber: 'SGP1001',
          workRequester: 'user1',
          project: 'Project 1',
          status: WorkStatus.Paused
        },
        {
          workNumber: 'SGP1008',
          workRequester: 'user1',
          project: 'Project 1',
          status: WorkStatus.Active
        }
      ]);
      renderFileManagerComponent();
    });

    it('loads all the page fields correctly', () => {
      expectFileManagerPageWithUploadState();
    });
    it('should uncheck active checkBox', () => {
      expect(screen.getByTestId('active')).not.toBeChecked();
    });
    it('should select SGP1001 and SGP1008 in work number select box', () => {
      expect(screen.getByTestId('workNumber')).toHaveTextContent('SGP1001');
      expect(screen.getByTestId('workNumber')).toHaveTextContent('SGP1008');
    });
  });

  describe('on visiting page with invalid work number as a query parameter', () => {
    beforeEach(() => {
      require('react-router-dom').useLocation.mockImplementation(() => {
        return {
          pathname: () => './file_manager',
          search: 'workNumber=Blah'
        };
      });
      renderFileManagerComponent();
    });
    it('loads the page as no query param is sepecied', () => {
      expectFileManagerPageDefaultState();
    });
    it('loads the work number select box with no option selected', () => {
      expect(screen.getByTestId('workNumber')).toHaveTextContent('');
    });
  });
});

describe('SGP number selection', () => {
  describe('on selecting active SGP Number with files uploaded', () => {
    it('should display the url with selected work number', async () => {
      require('react-router-dom').useLocation.mockImplementation(() => {
        return {
          pathname: () => './file_manager',
          search: ''
        };
      });
      require('react-router-dom').useNavigate.mockImplementation(() => navigateMock);
      renderFileManagerComponent();
      await waitFor(async () => {
        await selectSGPNumber('SGP1008');
        expect(navigateMock).toHaveBeenCalledWith('/file_manager?workNumber=SGP1008');
      });
    });
  });
});

describe('Upload', () => {
  beforeAll(() => {
    require('react-router-dom').useLocation.mockImplementation(() => {
      return {
        pathname: () => './file_manager',
        search: 'workNumber=SGP1008'
      };
    });
  });
  describe('on Upload success', () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ data: 'Upload successful' }),
          ok: true
        })
      );
      renderFileManagerComponent();
      uploadFile();
    });
    it('should display upload success message', async () => {
      await waitFor(() => {
        expect(screen.getByText('file.txt uploaded successfully.')).toBeVisible();
      });
    });
    it('should remove file description to the upload box', async () => {
      await waitForElementToBeRemoved(() => screen.getByText('file.txt'));
    });
  });

  describe('on Upload failure', () => {
    it('should display upload failure message', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: 'java.io.IOException: Error message here.' })
        })
      );

      act(() => {
        renderFileManagerComponent();
        uploadFile();
      });
      await waitFor(() => {
        expect(screen.getByTestId('error-div')).toBeVisible();
        expect(screen.getByTestId('error-div')).toHaveTextContent('Error:java.io.IOException: Error message here.');
      });
    });
  });
  describe('when uploading a file which already exists', () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ data: 'Upload successful' }),
          ok: true
        })
      );
      (findUploadedFiles as jest.MockedFunction<typeof findUploadedFiles>).mockResolvedValue([
        {
          name: 'file.txt',
          created: '14/11/2022',
          url: '/file.txt',
          work: {
            workNumber: 'SGP1008'
          }
        }
      ]);
      renderFileManagerComponent();
      uploadFile();
    });
    it('should display a warning message', async () => {
      await waitFor(() => {
        expect(screen.getByText('File already exists')).toBeVisible();
      });
    });

    describe('Pressing Cancel button', () => {
      it('should not display success message', async () => {
        await waitFor(() => {
          expect(screen.getByText('File already exists')).toBeVisible();
          fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
          expect(screen.queryByText('file.txt uploaded successfully.')).not.toBeInTheDocument();
        });
      });
    });
    describe('Pressing Continue button', () => {
      it('should  display success message', async () => {
        await waitFor(() => {
          expect(screen.getByText('File already exists')).toBeVisible();
          fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
          expect(screen.queryByText('file.txt uploaded successfully.')).not.toBeInTheDocument();
        });
      });
    });
  });
});
describe('File viewer', () => {
  describe('On load with an existing work number', () => {
    it('initialises the page', () => {
      act(() => {
        require('react-router-dom').useLocation.mockImplementation(() => {
          return {
            pathname: () => './file_viewer',
            search: 'workNumber=SGP1008'
          };
        });
        renderFileManagerComponent(false);
      });
      expect(screen.queryByText('Upload file')).not.toBeInTheDocument();
      expect(screen.queryByText('Files')).toBeVisible();
    });
  });
  describe('On load for a non-existing SGP', () => {
    it('should display warning', () => {
      act(() => {
        require('react-router-dom').useLocation.mockImplementation(() => {
          return {
            pathname: () => './file_viewer',
            search: 'workNumber=Blah'
          };
        });
        renderFileManagerComponent(false);
      });
      expect(screen.queryByText('SGP Number(s) does not exist.')).toBeVisible();
      expect(screen.queryByText('Files')).not.toBeInTheDocument();
    });
  });
});
describe('Active checkbox', () => {
  beforeEach(() => {
    require('react-router-dom').useLocation.mockImplementation(() => {
      return {
        pathname: () => './file_manager',
        search: 'workNumber=SGP1008'
      };
    });
    require('react-router-dom').useLoaderData = jest.fn().mockReturnValue([
      {
        workNumber: 'SGP1008',
        workRequester: 'user1',
        project: 'Project 1',
        status: WorkStatus.Active
      }
    ]);
    renderFileManagerComponent();
  });
  describe('when active checkbox is selected', () => {
    it('should display a single option', async () => {
      await workNumberNumOptionsShouldBe(2);
    });
  });
  describe('when active checkbox is unselected', () => {
    act(() => {
      uncheck();
    });
    it('should display more options', () => {
      workNumberNumOptionsShouldBeMoreThan(2);
    });
  });
});
const renderFileManagerComponent = (showUpload = true) => {
  return render(
    <BrowserRouter>
      <FileManager showUpload={showUpload} />
    </BrowserRouter>
  );
};

const selectFile = async () => {
  const file = new File(['sample'], 'file.txt', {
    type: 'text/plain'
  });
  await waitFor(() => {
    fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
  });
};

const uploadFile = async () => {
  await selectFile();
  expect(screen.getByTestId('upload-btn')).toBeEnabled();
  await userEvent.click(screen.getByTestId('upload-btn'));
};
