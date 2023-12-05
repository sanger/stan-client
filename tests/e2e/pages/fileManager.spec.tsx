import React from 'react';
import { render, screen, act, waitFor, cleanup } from '@testing-library/react';
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
  visitAsEndUser,
  workNumberNumOptionsShouldBe,
  workNumberNumOptionsShouldBeMoreThan
} from '../../generic/utilities';
import workRepository from '../../../src/mocks/repositories/workRepository';

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
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

async function expectFileManagerPageDefaultState() {
  expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('File Manager');
  expect(screen.queryByText('Files')).not.toBeInTheDocument();
  expect(screen.queryByText('Upload file')).not.toBeInTheDocument();
}

async function expectFileManagerPageWithUploadState() {
  await Promise.all([
    screen.findByText('Upload file').then((element) => expect(element).toBeVisible()),
    screen.findByText('Files').then((element) => expect(element).toBeVisible()),
    screen.findByTestId('file-input').then((element) => expect(element).toBeEnabled()),
    screen.findByTestId('upload-btn').then((element) => expect(element).toBeDisabled())
  ]);
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
    it('loads all the page fields correctly', async () => {
      act(() => {
        renderFileManagerComponent();
      });
      await expectFileManagerPageDefaultState();
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
    });
    it('loads all the page fields correctly', async () => {
      act(() => {
        renderFileManagerComponent();
      });
      await expectFileManagerPageWithUploadState();
    });
    it('should select SGP1008 in select box', async () => {
      act(() => {
        renderFileManagerComponent();
      });
      expect(await screen.findByTestId('workNumber')).toHaveTextContent('SGP1008');
    });
    it('should check active checkBox', async () => {
      act(() => {
        renderFileManagerComponent();
      });
      expect(await screen.findByTestId('active')).toBeChecked();
    });
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
      renderFileManagerComponent();
    });
    await waitFor(() => {
      const filesTable = screen.getByRole('table');
      expect(filesTable).toBeVisible();
      expect(filesTable.querySelectorAll('tbody tr').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('enables upload button after selecting a file', async () => {
    act(() => {
      renderFileManagerComponent();
    });
    await screen.findByTestId('file-input').then(async (fileInput) => {
      expect(fileInput).toBeEnabled();
      await userEvent
        .upload(fileInput, new File(['sample content'], 'sample.txt', { type: 'text/plain' }))
        .then(async () => expect(await screen.findByTestId('upload-btn')).toBeEnabled());
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
    });

    it('loads all the page fields correctly', async () => {
      act(() => {
        renderFileManagerComponent();
      });
      await expectFileManagerPageWithUploadState();
    });
    it('should uncheck active checkBox', async () => {
      act(() => {
        renderFileManagerComponent();
      });
      expect(await screen.findByTestId('active')).not.toBeChecked();
    });
    it('should select SGP1001 in select box', async () => {
      act(() => {
        renderFileManagerComponent();
      });
      expect(await screen.findByTestId('workNumber')).toHaveTextContent('SGP1001');
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
        //renderFileManagerComponent();
      });

      it('loads all the page fields correctly', async () => {
        act(() => {
          renderFileManagerComponent();
        });
        await expectFileManagerPageWithUploadState();
      });
      it('should uncheck active checkBox', async () => {
        act(() => {
          renderFileManagerComponent();
        });
        expect(await screen.findByTestId('active')).not.toBeChecked();
      });
      it('should select SGP1001 and SGP1008 in work number select box', async () => {
        act(() => {
          renderFileManagerComponent();
        });
        await screen.findByTestId('workNumber').then((workNumber) => {
          expect(workNumber).toHaveTextContent('SGP1001');
          expect(workNumber).toHaveTextContent('SGP1008');
        });
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
      });
      it('loads the page as no query param is specified', async () => {
        act(() => {
          renderFileManagerComponent();
        });
        await expectFileManagerPageDefaultState();
      });
      it('loads the work number select box with no option selected', async () => {
        act(() => {
          renderFileManagerComponent();
        });
        expect(await screen.findByTestId('workNumber')).toHaveTextContent('');
      });
    });
  });

  describe('SGP number selection', () => {
    describe('on selecting active SGP Number with files uploaded', () => {
      beforeEach(() => {
        require('react-router-dom').useLocation.mockImplementation(() => {
          return {
            pathname: () => './file_manager',
            search: ''
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
        require('react-router-dom').useNavigate.mockImplementation(() => navigateMock);
      });
      it('should display the url with selected work number', async () => {
        act(() => {
          renderFileManagerComponent();
        });
        await waitFor(async () => {
          await selectSGPNumber('SGP1008');
          expect(navigateMock).toHaveBeenCalledWith('/file_manager?workNumber=SGP1008');
        });
      });
    });
    describe('on uploading files', () => {
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
      });
      describe('on Upload success', () => {
        beforeEach(() => {
          global.fetch = jest.fn().mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ message: '' })
            })
          );
        });
        it('should not display upload failure message', async () => {
          act(() => {
            renderFileManagerComponent();
          });
          await screen.findByTestId('file-input').then(async (fileInput) => {
            expect(fileInput).toBeEnabled();
            await userEvent.upload(fileInput, new File(['sample content1'], 'sample1.txt', { type: 'text/plain' }));
            await userEvent.upload(fileInput, new File(['sample content2'], 'sample2.txt', { type: 'text/plain' }));
            screen.findByTestId('upload-btn').then(async (uploadBtn) => {
              expect(uploadBtn).toBeEnabled();
              userEvent.click(uploadBtn).then(async () => {
                expect(screen.queryByTestId('error-div')).not.toBeInTheDocument();
                expect(screen.queryByTestId('sample1.txt-0')).not.toBeInTheDocument();
                expect(screen.queryByTestId('sample2.txt-1')).not.toBeInTheDocument();
              });
            });
          });
        });
      });
      describe('on Upload failure', () => {
        beforeEach(() => {
          global.fetch = jest.fn().mockImplementationOnce(() =>
            Promise.resolve({
              ok: false,
              status: 500,
              json: () => Promise.resolve({ message: 'java.io.IOException: Error message here.' })
            })
          );
        });
        it('should display upload failure message', async () => {
          act(() => {
            renderFileManagerComponent();
          });
          await screen.findByTestId('file-input').then(async (fileInput) => {
            expect(fileInput).toBeEnabled();
            await userEvent
              .upload(fileInput, new File(['sample content'], 'sample.txt', { type: 'text/plain' }))
              .then(async () => {
                await screen.findByTestId('upload-btn').then(async (uploadBtn) => {
                  expect(uploadBtn).toBeEnabled();
                  await userEvent.click(uploadBtn).then(async () => {
                    await screen.findByTestId('error-div').then(async (errorDiv) => {
                      expect(errorDiv).toBeVisible();
                      expect(errorDiv).toHaveTextContent('Error:java.io.IOException: Error message here.');
                    });
                  });
                });
              });
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
        });
        it('should display a warning message', async () => {
          act(() => {
            renderFileManagerComponent();
          });
          await screen.findByTestId('file-input').then(async (fileInput) => {
            expect(fileInput).toBeEnabled();
            await userEvent
              .upload(fileInput, new File(['sample content'], 'file.txt', { type: 'text/plain' }))
              .then(async () => {
                await screen.findByTestId('upload-btn').then(async (uploadBtn) => {
                  expect(uploadBtn).toBeEnabled();
                  await userEvent.click(uploadBtn).then(async () => {
                    await screen.findByText('File already exists').then(async (errorDiv) => {
                      expect(errorDiv).toBeVisible();
                    });
                  });
                });
              });
          });
        });
        describe('Pressing Cancel button', () => {
          it('should not display success message', async () => {
            act(() => {
              renderFileManagerComponent();
            });
            await screen.findByTestId('file-input').then(async (fileInput) => {
              expect(fileInput).toBeEnabled();
              await userEvent
                .upload(fileInput, new File(['sample content'], 'file.txt', { type: 'text/plain' }))
                .then(async () => {
                  await screen.findByTestId('upload-btn').then(async (uploadBtn) => {
                    expect(uploadBtn).toBeEnabled();
                    await userEvent.click(uploadBtn).then(async () => {
                      await screen.findByRole('button', { name: /Cancel/i }).then(async (cancelBtn) => {
                        await userEvent.click(cancelBtn).then(async () => {
                          expect(screen.queryByText('file.txt uploaded successfully.')).not.toBeInTheDocument();
                        });
                      });
                    });
                  });
                });
            });
          });
        });
        describe('Pressing Continue button', () => {
          it('should  display success message', async () => {
            act(() => {
              renderFileManagerComponent();
            });
            await screen.findByTestId('file-input').then(async (fileInput) => {
              expect(fileInput).toBeEnabled();
              await userEvent
                .upload(fileInput, new File(['sample content'], 'file.txt', { type: 'text/plain' }))
                .then(async () => {
                  expect(await screen.findByTestId('upload-btn')).toBeEnabled();
                  userEvent.click(screen.getByTestId('upload-btn')).then(async () => {
                    expect(screen.getByText('File already exists')).toBeVisible();
                    userEvent.click(screen.getByRole('button', { name: /Continue/i })).then(async () => {
                      expect(await screen.findByTestId('file.txt uploaded successfully.')).toBeVisible();
                    });
                  });
                });
            });
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
  describe('when visiting the page as an end user', () => {
    beforeEach(() => {
      visitAsEndUser();
      const work = workRepository.findAll()[0];
      jest.mock('../../../src/lib/sdk', () => ({
        stanCore: {
          FindWorksCreatedByQuery: jest.fn().mockResolvedValue({
            worksCreatedBy: [
              { ...work, workNumber: 'SGP_123' },
              { ...work, workNumber: 'SGP_456' }
            ]
          })
        }
      }));
      require('react-router-dom').useLocation.mockImplementation(() => {
        return {
          pathname: () => './file_manager'
        };
      });
      renderFileManagerComponent();
    });
    it('should display a couple option', async () => {
      await workNumberNumOptionsShouldBe(3);
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
