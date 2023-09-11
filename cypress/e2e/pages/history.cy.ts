import {
  FindHistoryForLabwareBarcodeQuery,
  FindHistoryForLabwareBarcodeQueryVariables,
  FindHistoryForWorkNumberQuery,
  FindHistoryForWorkNumberQueryVariables
} from '../../../src/types/sdk';
import { buildHistory } from '../../../src/mocks/handlers/historyHandlers';
import { shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
describe('History Page', () => {
  context('when I visit the page with no URL params', () => {
    before(() => cy.visit('/history'));

    it('does not perform a history search', () => {
      cy.findByTestId('history').should('not.exist');
    });
  });

  context('when I visit the page with bad URL params', () => {
    before(() => cy.visit('/history?bad=params&no=search'));

    it('does not use the params to fill in the form', () => {
      cy.get("input[name='barcode']").invoke('val').should('eq', '');
      cy.get("input[name='externalName']").invoke('val').should('eq', '');
      cy.get("input[name='donorName']").invoke('val').should('eq', '');
    });

    it('does not perform a history search', () => {
      cy.findByTestId('history').should('not.exist');
    });
  });

  describe('By Labware Barcode', () => {
    context('when I visit the page with good URL params', () => {
      before(() => cy.visit('/history?barcode=STAN-1001'));

      it('uses the params to fill in the form', () => {
        cy.get("input[name='barcode']").invoke('val').should('eq', 'STAN-1001');
      });

      it('performs a history search', () => {
        cy.findByTestId('history').should('exist');
        cy.contains('History for barcode STAN-1001');
      });

      it('hightlights the searched barcode in the table', () => {
        cy.findByTestId('history').should('exist');
        // Non-searched barcode should not be highlighted yellow
        cy.findAllByRole('table')
          .eq(1)
          .find('tr')
          .contains('td', 'STAN-1002')
          .find('a')
          .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
        cy.findAllByRole('table').eq(1).find('tr').contains('td', 'STAN-1001').should('exist');
        // Searched barcode should be highlighted yellow
        cy.findAllByRole('table')
          .eq(1)
          .find('tr')
          .contains('td', 'STAN-1001')
          .find('a')
          .should('have.css', 'background-color', 'rgb(246, 224, 94)');
      });
      it('displays uploaded files section', () => {
        cy.findByText('Files Uploaded').should('be.visible');
      });
    });
  });

  describe('By multiple search fields', () => {
    before(() => {
      cy.visit('/history?barcode=STAN-10001F&donorName=DNR123&workNumber=SGP1008&externalName=EXT123');
    });
    it('uses the params to fill in the form', () => {
      cy.get("input[name='barcode']").invoke('val').should('eq', 'STAN-10001F');
      cy.get("input[name='donorName']").invoke('val').should('eq', 'DNR123');
      cy.get("input[name='externalName']").invoke('val').should('eq', 'EXT123');
      shouldDisplaySelectedValue('workNumber', 'SGP1008');
    });
    it('performs a history search', () => {
      cy.findByTestId('history').should('exist');
      cy.contains('History for barcode STAN-10001F, donorName DNR123, externalName EXT123, workNumber SGP1008');
    });
    it('displays uploaded files section', () => {
      cy.findByText('Files Uploaded').should('be.visible');
    });
  });

  describe('By Sample ID', () => {
    context('when I visit the page with good URL params', () => {
      before(() => cy.visit('/history?sampleId=10'));

      it('does performs a history search', () => {
        cy.findByTestId('history').should('exist');
        cy.contains('History for sampleId 10');
      });
      it('displays uploaded files section', () => {
        cy.findByText('Files Uploaded').should('be.visible');
      });
    });
  });

  describe('By External ID', () => {
    context('when I visit the page with good URL params', () => {
      before(() => cy.visit('/history?externalName=EXT123'));

      it('uses the params to fill in the form', () => {
        cy.get("input[name='externalName']").invoke('val').should('eq', 'EXT123');
      });

      it('does performs a history search', () => {
        cy.findByTestId('history').should('exist');
        cy.contains('History for externalName EXT123');
      });
      it('displays uploaded files section', () => {
        cy.findByText('Files Uploaded').should('be.visible');
      });
    });
  });

  describe('By Donor Name', () => {
    context('when I visit the page with good URL params', () => {
      before(() => cy.visit('/history?donorName=DNR123'));

      it('uses the params to fill in the form', () => {
        cy.get("input[name='donorName']").invoke('val').should('eq', 'DNR123');
      });

      it('does performs a history search', () => {
        cy.findByTestId('history').should('exist');
        cy.contains('History for donorName DNR123');
      });
      it('displays uploaded files section', () => {
        cy.findByText('Files Uploaded').should('be.visible');
      });
    });
  });

  describe('By Work Number', () => {
    context('when I visit the page with good URL params', () => {
      before(() => cy.visit('/history?workNumber=SGP1008'));

      it('uses the params to fill in the form', () => {
        shouldDisplaySelectedValue('workNumber', 'SGP1008');
      });

      it('does performs a history search', () => {
        cy.findByTestId('history').should('exist');
        cy.contains('History for workNumber SGP1008');
      });
      it('displays uploaded files section', () => {
        cy.findByText('Files Uploaded').should('be.visible');
      });
    });

    context('When an active SGP number is searched', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindHistoryForWorkNumberQuery, FindHistoryForWorkNumberQueryVariables>(
              'FindHistoryForWorkNumber',
              (req, res, ctx) => {
                return res(
                  ctx.data({
                    __typename: 'Query',
                    historyForWorkNumber: buildHistory('SGP1008')
                  })
                );
              }
            )
          );
        });
      });
      context(' when clicking on uploaded files link for authenticated users', () => {
        before(() => {
          cy.visit('/history?workNumber=SGP1008');
          cy.contains('Files for SGP1008').click();
        });
        it('goes to file manager page for SGP1008', () => {
          cy.url().should('be.equal', 'http://localhost:3000/file_manager?workNumber=SGP1008');
          cy.findByText('Upload file').should('exist');
          cy.findByText('Files').should('exist');
        });
      });
      context('for non-authenticated users', () => {
        before(() => {
          cy.visitAsGuest('/history?workNumber=SGP1008');
          cy.contains('Files for SGP1008').click();
        });
        it('goes to file viewer page for SGP123', () => {
          cy.url().should('be.equal', 'http://localhost:3000/file_viewer?workNumber=SGP1008');
          cy.findByText('Upload file').should('not.exist');
          cy.findByText('Files').should('exist');
        });
      });
    });
    context('When an inactive SGP number is searched', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindHistoryForWorkNumberQuery, FindHistoryForWorkNumberQueryVariables>(
              'FindHistoryForWorkNumber',
              (req, res, ctx) => {
                return res(
                  ctx.data({
                    __typename: 'Query',
                    historyForWorkNumber: buildHistory('SGP1001')
                  })
                );
              }
            )
          );
        });
        cy.visit('/history?workNumber=SGP1008');
      });
      context(' when clicking on uploaded files link for authenticated users', () => {
        before(() => {
          cy.contains('Files for SGP1008').click();
        });
        it('goes to file manager page for SGP1001', () => {
          cy.url().should('be.equal', 'http://localhost:3000/file_manager?workNumber=SGP1008');
          cy.findByText('Upload file').should('exist');
          cy.findByText('Files').should('exist');
        });
      });
      context('for non-authenticated users', () => {
        before(() => {
          cy.visitAsGuest('/history?workNumber=SGP1008');
          cy.contains('Files for SGP1008').click();
        });
        it('goes to file viewer page for SGP1008', () => {
          cy.url().should('be.equal', 'http://localhost:3000/file_viewer?workNumber=SGP1008');
          cy.findByText('Upload file').should('not.exist');
          cy.findByText('Files').should('exist');
        });
      });
    });
  });

  context('when a search errors', () => {
    before(() => {
      cy.visit('/history?barcode=STAN-10001F');

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindHistoryForLabwareBarcodeQuery, FindHistoryForLabwareBarcodeQueryVariables>(
            'FindHistory',
            (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    message: 'Exception while fetching data (/history) : An error occured'
                  }
                ])
              );
            }
          )
        );
      });
    });

    it('displays an error', () => {
      cy.findByText('History Search Error').should('exist');
      cy.findByText('An error occured').should('exist');
    });
  });
});
