import { http, HttpResponse } from 'msw';

describe('Block Registration Page', () => {
  beforeEach(() => {
    cy.msw().then(({ worker, graphql }) => {
      worker.use(
        http.post('/register/block', () => {
          return HttpResponse.json({ barcodes: ['STAN-3111', 'STAN-3112'] }, { status: 200 });
        })
      );
    });
  });
  describe('Initial display', () => {
    before(() => {
      cy.visit('/admin/registration');
    });
    it('display options to register manually and from file, and both options should be unchecked', () => {
      cy.get('[type="radio"][name="manual-registration-btn"]').should('be.visible').should('be.disabled');
      cy.get('[type="radio"][name="file-registration-btn"]').should('be.visible').should('not.be.checked');
    });
  });
  describe('File Registration', () => {
    it('should display upload file form', () => {
      cy.get('[type="radio"][name="file-registration-btn"]').check();
      cy.findByText('Select file...').should('be.visible');
    });
    it('upload btn should be disabled until the user selected a file', () => {
      cy.findByTestId('upload-btn').should('be.disabled');
    });
    it('shows the registered block', () => {
      cy.get('input[type=file]').selectFile(
        {
          contents: Cypress.Buffer.from('file contents'),
          fileName: 'file.xlsx',
          mimeType: 'text/plain',
          lastModified: Date.now()
        },
        { force: true }
      );
      cy.findByTestId('upload-btn').click();
      cy.findByText('STAN-3111').should('be.visible');
      cy.findByText('STAN-3112').should('be.visible');
    });

    context('On file upload failure', () => {
      before(() => {
        cy.visit('/admin/registration');
        cy.get('[type="radio"][name="file-registration-btn"]').check();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            http.post('/register/block', () => {
              return HttpResponse.json({ problems: 'Error Message' }, { status: 500 });
            })
          );
        });
        cy.get('input[type=file]').selectFile(
          {
            contents: Cypress.Buffer.from('file contents'),
            fileName: 'file2.xlsx',
            mimeType: 'text/plain',
            lastModified: Date.now()
          },
          { force: true }
        );
        cy.findByTestId('upload-btn').click();
      });
      it('should display an error', () => {
        cy.findByText('Error Message').should('be.visible');
      });
    });
    context('File contains existing external names', () => {
      context('should alert the user', () => {
        before(() => {
          uploadFileWithClashes();
        });
        it('displays the clashModal', () => {
          cy.findByText('External Name Already In Use').should('be.visible');
        });
      });
      context('On confirm', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              http.post('/register/block', () => {
                return HttpResponse.json({ barcodes: ['STAN-18418'] }, { status: 200 });
              })
            );
          });
          cy.findByRole('button', { name: 'Confirm' }).click({ force: true });
        });
        it('should show the registered block', () => {
          cy.findByText('Registration complete').should('be.visible');
        });
      });
      context('On cancel', () => {
        before(() => {
          uploadFileWithClashes();
          cy.findByRole('button', { name: 'Cancel' }).click({ force: true });
        });
        it('should not upload the file', () => {
          cy.findByTestId('upload-btn').should('be.enabled');
        });
      });
    });
  });
});

const uploadFileWithClashes = () => {
  cy.visit('/admin/registration');
  cy.get('[type="radio"][name="file-registration-btn"]').check();
  cy.msw().then(({ worker, graphql }) => {
    worker.use(
      http.post('/register/block', () => {
        return HttpResponse.json(
          {
            clashes: [
              {
                labware: [
                  {
                    labwareType: {
                      name: 'Proviasette'
                    },
                    barcode: 'STAN-18418'
                  }
                ],
                tissue: {
                  externalName: 'EXT17'
                }
              }
            ]
          },
          { status: 200 }
        );
      })
    );
  });
  cy.get('input[type=file]').selectFile(
    {
      contents: Cypress.Buffer.from('file contents'),
      fileName: 'file2.xlsx',
      mimeType: 'text/plain',
      lastModified: Date.now()
    },
    { force: true }
  );
  cy.findByTestId('upload-btn').click();
};
