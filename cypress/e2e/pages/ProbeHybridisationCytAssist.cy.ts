import { selectOption, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import { RecordProbeOperationMutation, RecordProbeOperationMutationVariables } from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('CytAssist Probe Hybridisation', () => {
  before(() => {
    cy.visit('/lab/probe_hybridisation_cytassist');
  });
  describe('On load', () => {
    it('displays the correct title', () => {
      cy.findByText('Probe Hybridisation CytAssist').should('be.visible');
    });
    it('displays the labware scanner', () => {
      cy.findByText('Labware').should('be.visible');
    });
    it('should not display the Probe Settings', () => {
      cy.findByText('Probe Settings').should('not.exist');
    });
  });
  describe('When a labware is scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    it('shows labware table', () => {
      cy.findAllByRole('table').should('have.length.above', 0);
      //Table should display barcode of labware scanned
      cy.findAllByRole('table').contains('td', 'STAN-3111');
    });
    it('updates start time field', () => {
      cy.findByTestId('performed').should('contain.value', new Date().toISOString().split('T')[0]);
    });
    it('should display Probe Settings', () => {
      cy.findByText('Probe Settings').should('be.visible');
      cy.findByText('Apply to all').should('be.visible');
      cy.findByRole('button', { name: 'Add to all' }).should('be.disabled');
    });
    it('displays the scanned labware in probe table', () => {
      cy.findByTestId('STAN-3111-workNumber').should('be.visible');
      cy.findByTestId('labware.0.probes.0.panel').should('be.visible');
      cy.findByTestId('labware.0.probes.0.lot').should('be.visible');
      cy.findByTestId('labware.0.probes.0.customPanel').scrollIntoView().should('be.visible');
      cy.findByTestId('labware.0.probes.0.costing').should('be.visible');
      cy.findByTestId('labware.0.probes.0.actions').should('be.visible');
      //Should not display remove button
      cy.findByTestId('labware.0.probes.0.actions').within(() => {
        cy.findByTestId('removeButton').should('not.exist');
        cy.findByTestId('addButton').should('be.visible');
      });
    });
  });
  describe('Start time', () => {
    it('displays the current date', () => {
      cy.findByTestId('performed').should('contain.value', new Date().toISOString().split('T')[0]);
    });
    context('When entering no value', () => {
      before(() => {
        cy.findByLabelText('Start Time').clear().blur();
      });
      it('should display an error message', () => {
        cy.findByText('Start Time is a required field').should('be.visible');
      });
    });
    context('Entering a future date', () => {
      before(() => {
        cy.findByLabelText('Start Time').clear().type('2075-01-01T10:00').blur();
      });
      it('should display an error message', () => {
        cy.findByText('Please select a date and time on or before current time').should('be.visible');
      });
    });
  });

  describe('SGP number for all', () => {
    context('When SGP number is selected for all labware', () => {
      before(() => {
        selectOption('workNumberAll', 'SGP1008');
      });
      it('should select SGP1008 for all labware', () => {
        shouldDisplaySelectedValue('STAN-3111-workNumber', 'SGP1008');
      });
    });
  });
  describe('Labware Costing for all', () => {
    context('When labware costing is selected for all labware', () => {
      before(() => {
        selectOption('costingAll', 'SGP');
      });
      it('should select costing for all labware', () => {
        shouldDisplaySelectedValue('STAN-3111-kitCosting', 'SGP');
      });
    });
  });
  describe('Labware reagent Lot for all', () => {
    context('When Reagent Lot is set for all labware', () => {
      before(() => {
        cy.findByTestId('reagentLotAll').clear().type('123456').blur();
      });
      it('should set Sample Prep Reagent Lot for the scanned labware', () => {
        cy.findByTestId('labware.0.reagentLot').should('contain.value', '123456');
      });
    });
  });
  describe('Probe for all', () => {
    context('when probe settings are correctly entered', () => {
      before(() => {
        selectOption('probe-name', 'CytAssist APT gene expression panel');
        cy.findByTestId('probe-lot').type('1234');
        selectOption('probe-costing', 'Faculty');
        selectOption('custom-probe', 'Custom spike 1');
      });
      it('enables Add to all button', () => {
        cy.findByRole('button', { name: 'Add to all' }).should('be.enabled');
      });
    });
    context('when probe lot is invalid', () => {
      before(() => {
        cy.findByTestId('probe-lot').type('1234333ddd');
      });
      it('disables Add to all button', () => {
        cy.findByRole('button', { name: 'Add to all' }).should('be.disabled');
      });
    });
    context('when probe name is empty', () => {
      before(() => {
        cy.findByTestId('probe-lot').type('1234333');
        selectOption('probe-name', '');
      });
      it('disables Add to all button', () => {
        cy.findByRole('button', { name: 'Add to all' }).should('be.disabled');
      });
    });
    context('when probe costing is empty', () => {
      before(() => {
        cy.findByTestId('probe-lot').type('1234333');
        selectOption('probe-name', '');
        selectOption('probe-costing', '');
      });
      it('disables Add to all button', () => {
        cy.findByRole('button', { name: 'Add to all' }).should('be.disabled');
      });
    });
    context('When probe is added for all', () => {
      before(() => {
        selectOption('probe-name', 'CytAssist APT gene expression panel');
        cy.findByTestId('probe-lot').clear().type('1234');
        selectOption('probe-costing', 'Faculty');
        selectOption('custom-probe', 'Custom spike 1');
        cy.findByRole('button', { name: 'Add to all' }).click();
      });
      it('adds a new probe row to all the scanned labware', () => {
        shouldDisplaySelectedValue('labware.0.probes.0.panel', 'CytAssist APT gene expression panel');
        cy.findByTestId('labware.0.probes.0.lot').should('have.value', '1234');
        shouldDisplaySelectedValue('labware.0.probes.0.customPanel', 'Custom spike 1');
        shouldDisplaySelectedValue('labware.0.probes.0.costing', 'Faculty');
      });

      it('displays error when same panel is selected for multiple probes in same labware', () => {
        cy.findByRole('button', { name: 'Add to all' }).click();
        cy.findAllByText('Unique value required for Probe Panel').should('be.visible');
      });
    });
  });
  describe('Add and remove buttons', () => {
    context('when remove button is pressed', () => {
      before(() => {
        cy.findByTestId('labware.0.probes.0.actions').within(() => {
          cy.findByTestId('removeButton').click();
        });
      });
      it('should remove the first row', () => {
        cy.findByTestId('labware.0.probes.1.actions').should('not.exist');
        //Displays only one row with value
        shouldDisplaySelectedValue('labware.0.probes.0.panel', 'CytAssist APT gene expression panel');
        cy.findByTestId('labware.0.probes.0.lot').should('have.value', '1234');
        shouldDisplaySelectedValue('labware.0.probes.0.customPanel', 'Custom spike 1');
        shouldDisplaySelectedValue('labware.0.probes.0.costing', 'Faculty');
        //Action column updated
        cy.findByTestId('labware.0.probes.0.actions').within(() => {
          cy.findByTestId('removeButton').should('not.exist');
          cy.findByTestId('addButton').should('exist');
        });
      });
    });
    context('when add button is pressed', () => {
      before(() => {
        cy.findByTestId('labware.0.probes.0.actions').within(() => {
          cy.findByTestId('addButton').click();
        });
      });
      it('adds a new empty row', () => {
        cy.findByTestId('labware.0.probes.1.actions').should('exist');
        //Displays only one row with value
        shouldDisplaySelectedValue('labware.0.probes.1.name', '');
        cy.findByTestId('labware.0.probes.1.lot').should('have.value', '');
        shouldDisplaySelectedValue('labware.0.probes.1.customPanel', '');
        shouldDisplaySelectedValue('labware.0.probes.1.customPanel', '');
        //Action column updated
        cy.findByTestId('labware.0.probes.1.actions').within(() => {
          cy.findByTestId('removeButton').should('exist');
          cy.findByTestId('addButton').should('exist');
        });
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
                        'Exception while fetching data (/probe_hybridisation_cytassist) : The operation could not be validated.',
                      extensions: {
                        problems: ['Labware is discarded: [STAN-3111]']
                      }
                    }
                  ]
                });
              }
            )
          );
        });
        fillInTheForm();
      });
      it('shows an error', () => {
        cy.findByText('Labware is discarded: [STAN-3111]').should('be.visible');
      });
    });
    context('On success', () => {
      before(() => {
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('shows a success message', () => {
        cy.findByText('Probe hybridisation CytAssist recorded on all labware').should('be.visible');
      });
    });
  });
});

const fillInTheForm = () => {
  cy.reload();
  cy.get('#labwareScanInput').type('STAN-3111{enter}');
  selectOption('STAN-3111-workNumber', 'SGP1008');
  selectOption('STAN-3111-kitCosting', 'SGP');
  cy.findByTestId('labware.0.reagentLot').type('345678');
  selectOption('labware.0.probes.0.panel', 'CytAssist APT gene expression panel');
  cy.findByTestId('labware.0.probes.0.lot').type('1234');
  selectOption('labware.0.probes.0.customPanel', 'Custom spike 1');
  selectOption('labware.0.probes.0.costing', 'SGP');
  cy.findByRole('button', { name: 'Save' }).click();
};
