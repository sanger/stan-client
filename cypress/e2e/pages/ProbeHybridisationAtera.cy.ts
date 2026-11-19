import { selectOption, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import { RecordProbeOperationMutation, RecordProbeOperationMutationVariables } from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Atera Probe Hybridisation', () => {
  before(() => {
    cy.visit('/lab/probe_hybridisation_atera');
  });

  describe('On load', () => {
    it('displays the correct title', () => {
      cy.findByText('Probe Hybridisation Atera').should('be.visible');
    });
    it('displays the labware scanner', () => {
      cy.findByText('Labware').should('be.visible');
    });
    it('does not display the Probe Settings or Apply to all sections', () => {
      cy.findByText('Probe Settings').should('not.exist');
      cy.findByText('Apply to all').should('not.exist');
    });
    it('does not display the Save button', () => {
      cy.findByRole('button', { name: 'Save' }).should('not.exist');
    });
  });

  describe('When a labware is scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-1410{enter}');
    });
    it('shows the labware in the scan table', () => {
      cy.findAllByRole('table').contains('td', 'STAN-1410');
    });
    it('sets the start time to the current date', () => {
      cy.findByTestId('performed').should('contain.value', new Date().toISOString().split('T')[0]);
    });
    it('displays the Apply to all section', () => {
      cy.findByText('Apply to all').should('be.visible');
    });
    it('displays Probe Settings with a single empty probe row', () => {
      cy.findByText('Probe Settings').should('be.visible');
      cy.findByTestId('labware-probes-table').find('tbody tr').should('have.length', 1);
    });
  });

  describe('Start time', () => {
    context('When entering no value', () => {
      before(() => {
        cy.findByLabelText('Start Time').clear().blur();
      });
      it('displays an error message', () => {
        cy.findByText('Start Time is a required field').should('be.visible');
      });
    });
    context('When entering a future date', () => {
      before(() => {
        cy.findByLabelText('Start Time').clear().type('2075-01-01T10:00').blur();
      });
      it('displays an error message', () => {
        cy.findByText('Please select a date and time on or before current time').should('be.visible');
      });
    });
  });

  describe('Apply to all', () => {
    context('SGP number', () => {
      before(() => {
        selectOption('workNumber', 'SGP1008');
      });
      it('sets the SGP number on the labware', () => {
        shouldDisplaySelectedValue('workNumber-STAN-1410', 'SGP1008');
      });
    });
    context('Kit costing', () => {
      before(() => {
        selectOption('costing', 'SGP');
      });
      it('sets the kit costing on the labware', () => {
        shouldDisplaySelectedValue('kit-costing-STAN-1410', 'SGP');
      });
    });
    context('Sample prep reagent type', () => {
      before(() => {
        selectOption('sample-prep-reagent-type', 'FFPE');
      });
      it('sets the sample prep reagent type on the labware', () => {
        shouldDisplaySelectedValue('sample-prep-reagent-type-STAN-1410', 'FFPE');
      });
      context('Sample prep reagent LOT', () => {
        before(() => {
          cy.findByTestId('sample-prep-reagent-lot').clear().type('123456').blur();
        });
        it('sets the sample prep reagent lot on the labware', () => {
          cy.findByTestId('sample-prep-reagent-lot-STAN-1410').should('have.value', '123456');
        });
      });
      context('when the lot is invalid', () => {
        before(() => {
          cy.findAllByLabelText('Sample Prep Reagent LOT').first().clear().type('12ab').blur();
        });
        it('displays an error', () => {
          cy.findAllByText('Sample Prep Reagent Lot should be a string of 6 digits').should('exist');
        });
      });
    });
  });

  describe('Probe for all', () => {
    context('when the probe lot is invalid', () => {
      before(() => {
        cy.findByTestId('probe-lot').clear().type('abc-123').blur();
      });
      it('displays an error message', () => {
        cy.findByText(
          'LOT number should be a string of maximum length 25 of capital letters, numbers and underscores.'
        ).should('be.visible');
      });
    });
    context('when the probe settings are valid and added to all', () => {
      before(() => {
        selectOption('probe-name', 'Atera APT gene expression panel');
        cy.findByTestId('probe-lot').clear().type('ABC_1234');
        selectOption('probe-costing', 'Faculty');
        cy.findByRole('button', { name: 'Add to all' }).click();
      });
      it('replaces the empty probe row on the labware', () => {
        cy.findByTestId('labware-probes-table').find('tbody tr').should('have.length', 1);
        shouldDisplaySelectedValue('probe-name-STAN-1410-0', 'Atera APT gene expression panel');
        cy.findByTestId('probe-lot-STAN-1410-0').should('have.value', 'ABC_1234');
        shouldDisplaySelectedValue('probe-costing-STAN-1410-0', 'Faculty');
      });
    });
    context('when the same panel is added again', () => {
      before(() => {
        cy.findByRole('button', { name: 'Add to all' }).click();
      });
      it('displays a uniqueness error', () => {
        cy.findAllByText('Unique value required for Probe Panel').should('be.visible');
      });
      after(() => {
        // Remove the duplicated first row
        cy.findAllByTestId('remove-probe-button').first().click();
      });
    });
  });

  describe('Add and remove probe rows', () => {
    context('when the add button is pressed', () => {
      before(() => {
        cy.findByTestId('add-probe-button').click();
      });
      it('adds a new empty probe row', () => {
        cy.findByTestId('labware-probes-table').find('tbody tr').should('have.length', 2);
      });
    });
    context('when the remove button is pressed', () => {
      before(() => {
        cy.findAllByTestId('remove-probe-button').last().click();
      });
      it('removes the row', () => {
        cy.findByTestId('labware-probes-table').find('tbody tr').should('have.length', 1);
      });
    });
  });

  describe('Save', () => {
    context('When there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordProbeOperationMutation, RecordProbeOperationMutationVariables>(
              'RecordProbeOperation',
              () => {
                return HttpResponse.json({
                  errors: [
                    {
                      message:
                        'Exception while fetching data (/recordProbeOperation) : The operation could not be validated.',
                      extensions: {
                        problems: ['Server validation errors']
                      }
                    }
                  ]
                });
              }
            )
          );
        });
        fillInTheForm();
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('shows an error', () => {
        cy.findByText('Server validation errors').should('be.visible');
      });
    });
    context('On success', () => {
      before(() => {
        fillInTheForm();
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('shows a success message', () => {
        cy.findByText(/recorded on all labware/).should('be.visible');
      });
      it('offers a Store button', () => {
        cy.findByRole('button', { name: 'Store' }).should('be.visible');
      });
    });
  });
});

const fillInTheForm = () => {
  cy.reload();
  cy.get('#labwareScanInput').type('STAN-1410{enter}');
  selectOption('workNumber', 'SGP1008');
  selectOption('costing', 'SGP');
  selectOption('sample-prep-reagent-type', 'FFPE');
  cy.findByTestId('sample-prep-reagent-lot').type('123456');
  selectOption('probe-name-STAN-1410-0', 'Atera APT gene expression panel');
  selectOption('probe-costing-STAN-1410-0', 'Faculty');
  cy.findByTestId('probe-lot-STAN-1410-0').type('PROBELOT_123');
};
