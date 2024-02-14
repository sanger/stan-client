import {
  FindHistoryForWorkNumberQuery,
  FindHistoryForWorkNumberQueryVariables,
  FindHistoryQuery,
  FindHistoryQueryVariables
} from '../../../src/types/sdk';
import { buildHistory } from '../../../src/mocks/handlers/historyHandlers';
import { shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';
describe('History Page', () => {
  describe('By Labware Barcode', () => {
    context('when I visit the page with good URL params', () => {
      before(() => cy.visit('/history?barcode=STAN-1001'));

      it('performs a history search', () => {
        cy.findByTestId('history').should('exist');
        cy.contains('History for barcode STAN-1001');
      });

      it('displays uploaded files section', () => {
        cy.findByText('Files Uploaded').should('be.visible');
      });
    });
  });

  describe('By multiple search fields', () => {
    before(() => {
      cy.visit(
        '/history?barcode=STAN-10001F&donorName=DNR123&workNumber=SGP1008&externalName=EXT123&eventType=Event 1'
      );
    });
    it('uses the params to fill in the form', () => {
      cy.get("input[name='barcode']").invoke('val').should('eq', 'STAN-10001F');
      cy.get("input[name='donorName']").invoke('val').should('eq', 'DNR123');
      cy.get("input[name='externalName']").invoke('val').should('eq', 'EXT123');
      shouldDisplaySelectedValue('workNumber', 'SGP1008');
      shouldDisplaySelectedValue('event-type', 'Event 1');
    });
    it('performs a history search', () => {
      cy.findByTestId('history').should('exist');
      cy.contains(
        'History for barcode STAN-10001F, donorName DNR123, eventType Event 1, externalName EXT123, workNumber SGP1008'
      );
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
      it('does not display flagged labware section', () => {
        cy.findByText('Flagged Labware').should('not.exist');
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

  describe('By Event type', () => {
    context('when I visit the page with good URL params', () => {
      before(() => cy.visit('/history?eventType=Event 1'));

      it('uses the params to fill in the form', () => {
        shouldDisplaySelectedValue('event-type', 'Event 1');
      });

      it('does performs a history search', () => {
        cy.findByTestId('history').should('exist');
        cy.contains('History for eventType Event 1');
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
        cy.visit('/history?workNumber=SGP1008');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindHistoryForWorkNumberQuery, FindHistoryForWorkNumberQueryVariables>(
              'FindHistoryForWorkNumber',
              () => {
                return HttpResponse.json({
                  data: {
                    historyForWorkNumber: buildHistory('SGP1008')
                  },
                  once: true
                });
              }
            )
          );
        });
      });
      context(' when clicking on uploaded files link for authenticated users', () => {
        it('goes to file manager page for SGP1008', () => {
          cy.contains('Files for SGP1008').click();
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
              () => {
                return HttpResponse.json({
                  data: {
                    historyForWorkNumber: buildHistory('SGP1001')
                  },
                  once: true
                });
              }
            )
          );
        });
        cy.visitAsAdmin('/history?workNumber=SGP1008');
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
  describe('when a search errors', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindHistoryQuery, FindHistoryQueryVariables>('FindHistory', () => {
            return HttpResponse.json({
              errors: [
                {
                  message: 'Exception while fetching data (/history) : An error occured'
                }
              ]
            });
          })
        );
      });
      cy.visit('/history?barcode=STAN-10001F');
    });

    it('displays an error', () => {
      cy.findByText('History Search Error').should('exist');
      cy.findByText('An error occured').should('exist');
    });
  });
});
