import {
  FindLabwareQuery,
  FindLabwareQueryVariables,
  PlanMutation,
  PlanMutationVariables
} from '../../../src/types/sdk';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { labwareTypes } from '../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../src/types/stan';
import { selectOption } from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

describe('Sectioning Planning', () => {
  before(() => {
    cy.visit('/lab/sectioning');
  });

  describe('Add Labware button', () => {
    context('when there is no source labware loaded', () => {
      it('is disabled', () => {
        cy.get('#labwareScanInput').should('not.be.disabled');
      });
    });
    context('number of labware is defined greater than 1', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-113{enter}');
        cy.findByTestId('numLabware').type('{selectall}').type('2');
        cy.findByText('+ Add Labware').click();
      });
      it('create as much labware layouts as much precised ', () => {
        cy.findAllByTestId('labware-').should('have.length', 2);
      });
    });
    context('when a source labware loaded with fetal samples less than 12 weeks old', () => {
      before(() => {
        cy.reload();
        const sourceLabware = labwareFactory.build(
          { barcode: 'STAN-113' },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.CASSETTE].build()
            }
          }
        );
        sourceLabware.slots.forEach((slot) =>
          slot.samples.forEach(
            (sample) => (sample.tissue.collectionDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toDateString())
          )
        );
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.query<FindLabwareQuery, FindLabwareQueryVariables>('FindLabware', () => {
              return HttpResponse.json({
                data: {
                  labware: sourceLabware
                }
              });
            })
          );
        });
        cy.get('#labwareScanInput').type('STAN-113{enter}');
      });

      it('should display a warning message', () => {
        cy.findByText('STAN-113').should('be.visible');
      });
    });
  });

  describe('Source labware table', () => {
    context('when destination labware is added', () => {
      before(() => {
        cy.findByText('+ Add Labware').click();
      });

      it('becomes disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });

      context('when destination labware becomes empty again', () => {
        before(() => {
          cy.findByText('Delete Layout').click();
        });

        it('is re-enabled', () => {
          cy.get('#labwareScanInput').should('not.be.disabled');
        });
      });
    });
  });

  describe('Labware Layout', () => {
    context('when labware layout is added', () => {
      before(() => {
        cy.findByText('+ Add Labware').click();
      });

      it('has a disabled Create Labware button', () => {
        cy.findByRole('button', { name: /Create Labware/i }).should('be.disabled');
      });

      it("doesn't enable the Next button", () => {
        cy.findByRole('button', { name: /Next/i }).should('be.disabled');
      });

      it('hides section thickness inputs until samples are transferred', () => {
        cy.findByTestId('section-thickness').should('not.exist');
      });

      context('when I try and leave the page', () => {
        it('shows a confirm box', () => {
          cy.on('window:confirm', (str) => {
            expect(str).to.equal('You have unsaved changes. Are you sure you want to leave?');
            // Returning false cancels the event
            return false;
          });
          cy.findByText('Search').click();
        });
        after(() => {
          cy.findByRole('button', { name: /Cancel/ }).click();
        });
      });
    });

    context('when adding a layout', () => {
      before(() => {
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findAllByText('STAN-113').first().click();
          cy.findByText('A1').click();
          cy.findByText('Done').click();
        });
      });

      after(() => {
        cy.findByText('Delete Layout').click();
      });

      it('enables the Create Labware button', () => {
        cy.findByText('Create Labware').should('not.be.disabled');
      });

      it('displays the section thickness input for the planned slot only', () => {
        cy.findAllByTestId('section-thickness').should('have.length', 1);
      });
      it('set the section thickness input with the predefined value', () => {
        cy.findByTestId('section-thickness').should('have.value', '0.5');
      });
    });
  });

  describe('API Requests', () => {
    context('when request is successful', () => {
      before(() => {
        cy.visit('/lab/sectioning');
        createLabware();
      });

      it('removes the Sectioning Layout buttons', () => {
        cy.findByText('Create Labware').should('not.exist');
        cy.findByText('Delete Layout').should('not.exist');
      });

      it('shows the LabelPrinter', () => {
        cy.findByText('Print Labels').should('be.visible');
      });

      it('enables the Next button', () => {
        cy.findByRole('button', { name: /Next/i }).should('be.enabled');
      });

      context('when I click Next', () => {
        before(() => {
          // Store the barcode of the created labware
          cy.findByTestId('plan-destination-labware').within(() => {
            cy.get('td:first-child').invoke('text').as('destinationBarcode');
          });
          cy.findByRole('button', { name: /Next/i }).click();
        });

        it('takes me to the Sectioning Confirmation page', () => {
          cy.url().should('include', '/lab/sectioning/confirm');
        });

        it('displays the source labware', () => {
          cy.findAllByText('STAN-113').its('length').should('be.gte', 1);
        });

        it('displays the destination labware', function () {
          cy.findAllByText(this.destinationBarcode).its('length').should('be.gte', 1);
        });
      });
    });

    context('when request is unsuccessful', () => {
      before(() => {
        cy.visit('/lab/sectioning');

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<PlanMutation, PlanMutationVariables>('Plan', () => {
              return HttpResponse.json({
                errors: [
                  {
                    extensions: {
                      problems: ['This thing went wrong', 'This other thing went wrong']
                    }
                  }
                ]
              });
            })
          );
        });

        createLabware();
      });

      it('shows the errors', () => {
        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });

      it("doesn't enable the Next button", () => {
        cy.findByRole('button', { name: /Next/i }).should('not.be.enabled');
      });
    });
  });

  describe('Printing', () => {
    context('when printing succeeds', () => {
      before(() => {
        cy.visit('/lab/sectioning');
        createLabware();
        printLabels();
      });

      it('shows a success message', () => {
        cy.findByText(/Tube Printer successfully printed/).should('exist');
      });
    });

    context('when printing fails', () => {
      before(() => {
        cy.visit('/lab/sectioning');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation('Print', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Exception while fetching data (/print) : An error occured'
                  }
                ]
              });
            })
          );
        });
        createLabware();
        printLabels();
      });

      it('shows an error message', () => {
        cy.findByText(/Tube Printer failed to print/).should('exist');
      });
    });
  });
});

function createLabware() {
  cy.get('#labwareScanInput').type('STAN-113{enter}');
  selectOption('labware-type', 'Tube');
  cy.findByText('+ Add Labware').click();
  cy.findByText('Edit Layout').click();
  cy.findByRole('dialog').within(() => {
    cy.findByText('STAN-113').click();
    cy.findByText('A1').click();
    cy.findByText('Done').click();
  });
  cy.findByTestId('section-thickness').eq(0).clear().type('5');
  cy.findByText('Create Labware').click();
}

function printLabels() {
  cy.findByLabelText('printers').select('Tube Printer');
  cy.findByText('Print Labels').click();
}
