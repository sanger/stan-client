import { FindFilesQuery, FindFilesQueryVariables } from '../../../src/types/sdk';
import { rest } from 'msw';

describe('FileManager', () => {
  describe('On load', () => {
    before(() => {
      cy.visit('/file_manager');
    });
    it('initialises the page', () => {
      cy.findByText('SGP Number').should('be.visible');
      cy.findByText('Upload file').should('be.visible');
      uploadButton().should('be.disabled');
      cy.findByText('Files').should('not.exist');
    });
    context('on visiting page with work number as a query parameter', () => {
      before(() => {
        cy.visit('/file_manager?workNumber=SGP1008');
      });
      it('should select SGP1008 in select box', () => {
        workNumber().should('have.value', 'SGP1008');
      });
      it('should display a table with files uploaded for the selected SGP Numbers', () => {
        cy.findByRole('table').should('exist');
        cy.findByRole('table').find('tr').should('have.length.above', 0);
      });
    });
  });
  describe('SGP number selection', () => {
    context('on selecting SGP Number with files uploaded', () => {
      before(() => {
        cy.visit('/file_manager');
        selectWorkNumber();
      });
      it('should display the url with selected work number', () => {
        cy.url().should('include', 'file_manager?workNumber=SGP1008');
      });
      it('should display a table with files uploaded for the selected SGP Numbers', () => {
        cy.findByRole('table').should('exist');
        cy.findByRole('table').find('tr').should('have.length.above', 0);
      });
    });
    context('on selecting SGP Number with no files uploaded', () => {
      before(() => {
        cy.visit('/file_manager');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindFilesQuery, FindFilesQueryVariables>('FindFiles', (req, res, ctx) => {
              return res.once(ctx.data({ listFiles: [] }));
            })
          );
        });
        selectWorkNumber();
      });
      it('should not display a table', () => {
        cy.findByRole('table').should('not.exist');
        cy.findByText('No files uploaded for SGP1008').should('be.visible');
      });
    });
  });
  describe('Upload button', () => {
    context('when work number is selected with no file selection', () => {
      before(() => {
        selectWorkNumber();
      });
      it('should display upload button as disabled', () => {
        uploadButton().should('be.disabled');
      });
    });
    context('when a file is selected with no work number', () => {
      before(() => {
        workNumber().select('');
        selectFile();
      });
      it('should display upload button as disabled', () => {
        cy.findByRole('button', { name: /Upload/i }).should('be.disabled');
      });
    });
    context('when both file and sgp number is selected', () => {
      before(() => {
        selectWorkNumber();
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
      it('should displau upload success message', () => {
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
        selectWorkNumber();
        selectFile();
        cy.wait(500);
        cy.findByTestId('upload-btn').click();
      });
      it('should display a warning message', () => {
        cy.findByText('File already exists').should('be.visible');
      });
    });
    context('Pressing Cancel button', () => {
      before(() => cy.findByRole('button', { name: /Cancel/i }).click());
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
        uploadButton().click();
        cy.findByRole('button', { name: /Continue/i }).click();
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
              return res(ctx.status(403));
            })
          );
        });
        selectWorkNumber();
        selectFile();
        uploadButton().click();
      });
      it('should displau upload failure message', () => {
        cy.findByTestId('error-div').should('exist');
      });
    });
  });
});

function workNumber() {
  return cy.findByTestId('select_workNumber');
}
function selectWorkNumber() {
  workNumber().select('SGP1008');
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
