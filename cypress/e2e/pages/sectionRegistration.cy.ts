import { http, HttpResponse } from 'msw';

describe('Section Registration Page', () => {
  describe('Initial display', () => {
    before(() => {
      cy.visit('/admin/section_registration');
    });
    it('display options to register manually and from file', () => {
      cy.findByText('Register manually').should('be.visible');
      cy.findByText('Register from file').should('be.visible');
    });
  });
  describe('File Registration', () => {
    it('should display an error when uploading a file with no sections', () => {
      cy.findByTestId('upload-btn').should('be.disabled');
    });
    context('On file upload success', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            http.post('/register/section', () => {
              return HttpResponse.json({
                barcodes: ['STAN-3111', 'STAN-3112'],
                status: 200
              });
            })
          );
        });
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
      });
      it('shows the created labware', () => {
        cy.findAllByText('STAN-3111').should('have.length.greaterThan', 0);
        cy.findAllByText('STAN-3112').should('have.length.greaterThan', 0);
      });
    });
    context('On file upload failure', () => {
      before(() => {
        cy.visit('/admin/section_registration');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            http.post('/register/section', () => {
              return HttpResponse.json({ problems: 'Error 1, Error 2' }, { status: 500 });
            })
          );
        });
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
      });

      it('should display an error', () => {
        cy.findByText('Error 1').should('be.visible');
        cy.findByText('Error 2').should('be.visible');
      });
    });
  });
});
