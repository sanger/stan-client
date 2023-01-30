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

    context('when there is source labware loaded', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-113{enter}');
      });

      it('is enabled', () => {
        cy.findByText('+ Add Labware').should('not.be.disabled');
      });
    });

    context('when a source labware loaded with fetal samples less than 12 weeks old', () => {
      before(() => {
        const sourceLabware = labwareFactory.build(
          { barcode: 'STAN-3333' },
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
            graphql.query<FindLabwareQuery, FindLabwareQueryVariables>('FindLabware', (req, res, ctx) => {
              return res.once(
                ctx.data({
                  labware: sourceLabware
                })
              );
            })
          );
        });
        cy.get('#labwareScanInput').type('STAN-3333{enter}');
      });

      it('should display a warning message', () => {
        cy.findByText('STAN-3333').should('be.visible');
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

      context('when I try and leave the page', () => {
        it('shows a confirm box', () => {
          cy.on('window:confirm', (str) => {
            expect(str).to.equal('You have unsaved changes. Are you sure you want to leave?');
            // Returning false cancels the event
            return false;
          });

          cy.findByText('Search').click();
        });
      });
    });

    context('when adding a layout', () => {
      before(() => {
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findByText('STAN-113').click();
          cy.findByText('A1').click();
          cy.findByText('Done').click();
        });
        cy.findByLabelText('Section Thickness').type('5');
      });

      after(() => {
        cy.findByText('Delete Layout').click();
      });

      it('enables the Create Labware button', () => {
        cy.findByText('Create Labware').should('not.be.disabled');
      });

      context('when Number of Labware is invalid', () => {
        before(() => {
          cy.findByLabelText('Number of Labware').clear();
        });

        after(() => {
          cy.findByLabelText('Number of Labware').clear().type('1');
        });

        it('disabled the Create Labware button', () => {
          cy.findByRole('button', { name: /Create Labware/i }).should('be.disabled');
        });
      });

      context('when Section Thickness is invalid', () => {
        before(() => {
          cy.findByLabelText('Section Thickness').clear();
        });

        after(() => {
          cy.findByLabelText('Section Thickness').clear().type('5');
        });

        it('disabled the Create Labware button', () => {
          cy.findByText('Create Labware').should('be.disabled');
        });
      });
    });

    context('when adding a Fetal waste container', () => {
      before(() => {
        cy.findByRole('combobox').select('Fetal waste container');
        cy.findByText('+ Add Labware').click();
      });

      it('shows only Number of Labware', () => {
        cy.findByLabelText('Number of Labware').should('be.visible');
        cy.findByLabelText('Barcode').should('not.exist');
        cy.findByLabelText('Section Thickness').should('not.exist');
        cy.findByText('Slide LOT number').should('not.exist');
        cy.findByText('Slide costings').should('not.exist');
        cy.findByText('Create Labware').should('be.disabled');
      });
      after(() => {
        cy.findByText('Delete Layout').click();
      });
    });

    context('when adding a Visium LP layout', () => {
      before(() => {
        cy.findByRole('combobox').select('Visium LP');
        cy.findByText('+ Add Labware').click();
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findByText('STAN-113').click();
          cy.findByText('A1').click();
          cy.findByText('Done').click();
        });
      });

      it('shows Barcode, Sectioning Thickness,Slide LOT number, Slide costings', () => {
        cy.findByLabelText('Number of Labware').should('not.exist');
        cy.findByLabelText('Barcode').should('be.visible');
        cy.findByLabelText('Section Thickness').should('be.visible');
        cy.findByText('Slide LOT number').should('be.visible');
        cy.findByText('Slide costings').should('be.visible');
        cy.findByText('Create Labware').should('be.disabled');
      });
      after(() => {
        cy.findByText('Delete Layout').click();
      });
    });

    context('when adding a Visium TO layout', () => {
      before(() => {
        cy.findByRole('combobox').select('Visium TO');
        cy.findByText('+ Add Labware').click();
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findByText('STAN-113').click();
          cy.findByText('A1').click();
          cy.findByText('Done').click();
        });
      });

      it('shows Barcode, Sectioning Thickness,Slide LOT number, Slide costings', () => {
        cy.findByLabelText('Number of Labware').should('exist');
        cy.findByLabelText('Barcode').should('not.exist');
        cy.findByLabelText('Section Thickness').should('be.visible');
        cy.findByText('Slide LOT number').should('be.visible');
        cy.findByText('Slide costings').should('be.visible');
      });

      context('enabling Create Labware button', () => {
        it('disables Create Labware button if not all fields entered', () => {
          cy.findByLabelText('Section Thickness').type('2');
          cy.findByText('Create Labware').should('be.disabled');
        });
        it('should validate Slide LOT number', () => {
          cy.findByTestId('formInput').type('1').blur();
          cy.findByText('Slide lot number should be a 6-7 digits number').should('be.visible');
        });
        it('disables Create Labware button if not all fields entered', () => {
          cy.findByTestId('formInput').clear().type('123456');
          cy.findByText('Create Labware').should('be.disabled');
        });
        it('should not allow empty value in Slide costings', () => {
          cy.get('select[name="costing"]').select('SGP');
          cy.get('select[name="costing"]').select('').blur();
          cy.findByText('Slide costing is a required field').should('be.visible');
        });
        it('enables Create Labware button when all field values are entered', () => {
          cy.get('select[name="costing"]').select('SGP');
          cy.findByText('Create Labware').should('be.enabled');
        });
      });
      after(() => {
        cy.findByText('Delete Layout').click();
      });
    });

    context('when adding a Visium ADH layout', () => {
      before(() => {
        cy.findByRole('combobox').select('Visium ADH');
        cy.findByText('+ Add Labware').click();
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findByText('STAN-113').click();
          cy.findByText('A1').click();
          cy.findByText('Done').click();
        });
      });

      it('shows Barcode, Sectioning Thickness,Slide LOT number, Slide costings', () => {
        cy.findByLabelText('Number of Labware').should('exist');
        cy.findByLabelText('Barcode').should('not.exist');
        cy.findByLabelText('Section Thickness').should('be.visible');
        cy.findByText('Create Labware').should('be.disabled');
        cy.findByText('Slide LOT number').should('be.visible');
        cy.findByText('Slide costings').should('be.visible');
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

      it('disables the form inputs', () => {
        cy.findByLabelText('Number of Labware').should('be.disabled');
        cy.findByLabelText('Section Thickness').should('be.disabled');
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
            graphql.mutation<PlanMutation, PlanMutationVariables>('Plan', (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    extensions: {
                      problems: ['This thing went wrong', 'This other thing went wrong']
                    }
                  }
                ])
              );
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
            graphql.mutation('Print', (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    message: 'Exception while fetching data (/print) : An error occured'
                  }
                ])
              );
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
  cy.findByLabelText('Section Thickness').clear().type('5');
  cy.findByText('Create Labware').click();
}

function printLabels() {
  cy.findByLabelText('printers').select('Tube Printer');
  cy.findByText('Print Labels').click();
}
