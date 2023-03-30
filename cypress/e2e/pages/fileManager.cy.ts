import { FindFilesQuery, FindFilesQueryVariables } from '../../../src/types/sdk';
import { rest } from 'msw';
import {
  selectSGPNumber,
  shouldDisplaySelectedValue,
  shouldOptionsHaveLength,
  shouldOptionsHaveLengthAbove
} from '../shared/customReactSelect.cy';

describe('FileManager', () => {
  describe('On load', () => {
    before(() => {
      cy.visit('/file_manager');
    });
    it('initialises the page', () => {
      cy.findByText('SGP Number').should('be.visible');
      cy.findByText('Upload file').should('not.exist');
      cy.findByText('Files').should('not.exist');
    });
    context('on visiting page with an active work number as a query parameter', () => {
      before(() => {
        cy.visit('/file_manager?workNumber=SGP1008');
      });
      it('should select SGP1008 in select box', () => {
        workNumberShouldBe('SGP1008');
        // workNumber().should('have.value', 'SGP1008');
      });
      it('initialises page', () => {
        cy.findByText('Upload file').should('exist');
        cy.findByText('Files').should('exist');
        cy.findByTestId('active').should('be.visible').should('be.checked');
        uploadButton().should('be.disabled');
      });
      it('should  enable file selection button', () => {
        cy.get('input[type=file]').should('be.enabled');
        cy.findByText('Please select an SGP Number to enable file selection').should('not.exist');
      });
      it('should display a table with files uploaded for the selected SGP Numbers', () => {
        cy.findByRole('table').should('exist');
        cy.findByRole('table').find('tr').should('have.length.above', 0);
      });
    });
    context('on visiting page with an inactive work number as a query parameter', () => {
      before(() => {
        cy.visit('/file_manager?workNumber=SGP1001');
      });
      it('initialises page', () => {
        cy.findByText('Upload file').should('exist');
        cy.findByText('Files').should('exist');
      });
      it('should select SGP1001 in select box', () => {
        workNumberShouldBe('SGP1001');
      });
    });
    context('on visiting page with multiple work numbers as a query parameter', () => {
      before(() => {
        cy.visit('/file_manager?workNumber=SGP1002&workNumber=SGP1008');
      });
      it('initialises page', () => {
        cy.findByText('Upload file').should('exist');
        cy.findByText('Files').should('exist');
      });
      it('should select SGP1001 in select box', () => {
        workNumberShouldBe('SGP1002');
        workNumberShouldBe('SGP1008');
      });
    });
  });

  describe('Active checkbox', () => {
    before(() => {
      cy.visit('/file_manager');
    });
    context('when active checkbox is selected', () => {
      it('should display a single option', () => {
        workNumberNumOptionsShouldBe(2);
      });
    });
    context('when active checkbox is not selected', () => {
      before(() => {
        cy.findByTestId('active').uncheck();
      });
      it('should display more options', () => {
        workNumberNumOptionsShouldBeMoreThan(2);
      });
    });
  });

  describe('SGP number selection', () => {
    before(() => {
      cy.visit('/file_manager');
    });

    context('on selecting active SGP Number with files uploaded', () => {
      before(() => {
        selectSGPNumber('SGP1008');
      });
      it('should display the url with selected work number', () => {
        cy.url().should('include', 'file_manager?workNumber=SGP1008');
      });
      it('initializes page for active work number', () => {
        cy.findByText('Upload file').should('be.visible');
        cy.findByTestId('active').should('be.visible').should('be.checked');
        cy.findByTestId('file-input').should('be.enabled');
      });
      it('should display a table with files uploaded for the selected SGP Numbers', () => {
        cy.findByRole('table').should('exist');
        cy.findByRole('table').find('tr').should('have.length.above', 0);
      });
    });
    context('on selecting multiple SGP Number with files uploaded', () => {
      before(() => {
        cy.findByTestId('active').uncheck();
        selectSGPNumber('SGP1008');
        selectSGPNumber('SGP1006');
      });
      it('should display the url with selected work number', () => {
        cy.url().should('include', 'file_manager?workNumber=SGP1008&workNumber=SGP1006');
      });
      it('initializes page for active work number', () => {
        cy.findByText('Upload file').should('be.visible');
        cy.findByTestId('active').should('be.visible').should('not.be.checked');
        cy.findByTestId('file-input').should('be.enabled');
      });
      it('should display a table with files uploaded for all selected SGP Numbers', () => {
        cy.findByRole('table').should('exist');
        cy.findByRole('table').find('tr').should('have.length.above', 0);
        cy.findByRole('table').contains('td', 'SGP1008');
        cy.findByRole('table').contains('td', 'SGP1006');
      });
    });
    context('on selecting inactive SGP Number with files uploaded', () => {
      before(() => {
        cy.visit('/file_manager');
        cy.findByTestId('active').uncheck();
        selectSGPNumber('SGP1002');
      });
      it('should display the url with selected work number', () => {
        cy.url().should('include', 'file_manager?workNumber=SGP1002');
      });
      it('initializes page for inactive work number', () => {
        cy.findByText('Upload file').should('exist');
        cy.findByText('Files').should('exist');
      });
      it('should display a table with files uploaded for the selected SGP Numbers', () => {
        cy.findByRole('table').should('exist');
        cy.findByRole('table').find('tr').should('have.length.above', 0);
      });
    });
    context('on selecting active SGP Number with no files uploaded', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindFilesQuery, FindFilesQueryVariables>('FindFiles', (req, res, ctx) => {
              return res.once(ctx.data({ listFiles: [] }));
            })
          );
        });
        cy.visit('/file_manager');
        selectSGPNumber('SGP1008');
      });
      it('initializes page for active work number', () => {
        cy.findByText('Upload file').should('exist');
        cy.findByText('Files').should('exist');
      });
      it('should not display a table', () => {
        cy.findByRole('table').should('not.exist');
        cy.findByText('No files uploaded for SGP1008').should('be.visible');
      });
    });
    context('on selecting inactive SGP Number with no files uploaded', () => {
      before(() => {
        cy.visit('/file_manager');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindFilesQuery, FindFilesQueryVariables>('FindFiles', (req, res, ctx) => {
              return res.once(ctx.data({ listFiles: [] }));
            })
          );
        });
        cy.findByTestId('active').uncheck();
        selectSGPNumber('SGP1002');
      });
      it('initializes page for inactive work number', () => {
        cy.findByText('Upload file').should('exist');
        cy.findByText('Files').should('exist');
      });
      it('should not display a table', () => {
        cy.findByRole('table').should('not.exist');
        cy.findByText('No files uploaded for SGP1002').should('be.visible');
      });
    });
    context('on removing SGP Number selection', () => {
      before(() => {
        cy.visit('/file_manager');
      });
      it('should  not display upload file section or files section', () => {
        cy.findByText('Upload file').should('not.exist');
        cy.findByText('Files').should('not.exist');
      });
    });
  });

  describe('Upload button', () => {
    context('when work number is selected with no file selection', () => {
      before(() => {
        selectSGPNumber('SGP1008');
      });
      it('should display upload button as disabled', () => {
        uploadButton().should('be.disabled');
      });
    });
    context('when no work number is selected', () => {
      before(() => {
        cy.visit('/file_manager');
        selectSGPNumber('');
      });
      it('should not display upload or files section', () => {
        cy.findByText('Upload file').should('not.exist');
        cy.findByText('Files').should('not.exist');
      });
    });
    context('when both file and multiple sgp numbers are selected', () => {
      before(() => {
        selectSGPNumber('SGP1006');
        cy.findByTestId('active').uncheck();
        selectSGPNumber('SGP1008');
        selectFile();
      });
      it('should display upload button as enabled', () => {
        uploadButton().should('be.enabled');
      });
    });
  });

  describe('Upload', () => {
    context('on Upload success', () => {
      before(() => {
        selectFile();
        uploadButton().click();
      });
      it('should display upload success message', () => {
        cy.findByText('file.txt uploaded succesfully.').should('be.visible');
      });
      it('should remove the selected file for upload', () => {
        it('should remove the selected file for upload', () => {
          cy.findByTestId('file-description').within((elem) => {
            cy.wrap(elem).should('not.contain.text', 'file.txt');
          });
        });
      });
    });
    context('when uploading a file which already exists', () => {
      before(() => {
        cy.visit('/file_manager');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindFilesQuery, FindFilesQueryVariables>('FindFiles', (req, res, ctx) => {
              return res(
                ctx.data({
                  listFiles: [
                    {
                      name: 'file.txt',
                      url: '',
                      work: { workNumber: 'SGP1008' },
                      created: Date.now().toString()
                    }
                  ]
                })
              );
            })
          );
        });
        selectSGPNumber('SGP1008');
        selectFile();
        cy.wait(500);
        cy.findByTestId('upload-btn').click({ force: true });
      });
      it('should display a warning message', () => {
        cy.findByText('File already exists').should('be.visible');
      });
    });
    context('Pressing Cancel button', () => {
      before(() => cy.findByRole('button', { name: /Cancel/i }).click({ force: true }));
      it('should not display success message', () => {
        cy.findByText('file.txt uploaded succesfully.').should('not.exist');
      });
      it('should still display the selected file for upload', () => {
        cy.findByTestId('file-description').within((elem) => {
          cy.wrap(elem).should('contain.text', 'file.txt');
        });
      });
    });
    context('Pressing Continue button', () => {
      before(() => {
        uploadButton().click({ force: true });
        cy.findByRole('button', { name: /Continue/i }).click({ force: true });
      });
      it('should  display success message', () => {
        cy.findByText('file.txt uploaded succesfully.').should('be.visible');
      });
    });
    context('on Upload failure', () => {
      before(() => {
        cy.visit('/file_manager');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            rest.post('/files', (req, res, ctx) => {
              return res(
                ctx.status(500),
                ctx.json({
                  response: {
                    message: 'Error'
                  }
                })
              );
            })
          );
        });
        selectSGPNumber('SGP1008');
        selectFile();
        uploadButton().should('be.visible').click({ force: true });
      });
      it('should display upload failure message', () => {
        cy.findByText('Error:').should('exist');
      });
    });
  });
  describe('File viewer', () => {
    context('On load', () => {
      before(() => {
        cy.visitAsAdmin('file_viewer/?workNumber=SGP1001');
      });
      it('initialises the page', () => {
        cy.findByText('Upload file').should('not.exist');
        cy.findByText('Files').should('exist');
      });
    });
    context('On load for a non-existing SGP', () => {
      before(() => {
        cy.visitAsAdmin('file_viewer/?workNumber=SGP9999');
      });
      it('should display warning', () => {
        cy.findByText("SGP Number 'SGP9999' does not exist.").should('be.visible');
        cy.findByText('Files').should('not.exist');
      });
    });
  });
});

function workNumberShouldBe(workNumberStr: string) {
  shouldDisplaySelectedValue('workNumber', workNumberStr);
}

function workNumberNumOptionsShouldBe(length: number) {
  shouldOptionsHaveLength('workNumber', length);
}

function workNumberNumOptionsShouldBeMoreThan(length: number) {
  shouldOptionsHaveLengthAbove('workNumber', length);
}

function selectFile() {
  cy.get('input[type=file]').selectFile(
    {
      contents: Cypress.Buffer.from('file contents'),
      fileName: 'file.txt',
      mimeType: 'text/plain',
      lastModified: Date.now()
    },
    { force: true }
  );
}
function uploadButton() {
  return cy.findByTestId('upload-btn');
}
