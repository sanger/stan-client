import { selectOption, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import { RecordProbeOperationMutation, RecordProbeOperationMutationVariables } from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Xenium Probe Hybridisation', () => {
  before(() => {
    cy.visit('/lab/probe_hybridisation_xenium');
  });
  describe('On load', () => {
    it('displays the correct title', () => {
      cy.findByText('Probe Hybridisation Xenium').should('be.visible');
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
      //Should display start time field
      cy.findByLabelText('Start Time').should('be.visible');
      //Should display Apply all section
      cy.findByText('Apply to all').should('be.visible');
      //Should display worknumber field for all labware
      cy.findByTestId('workNumberAll').should('be.visible');
      //Should display table to add probe information to all labware
      cy.findByTestId('probe-all-table').should('be.visible');
      //Should display Probe table for all labware
      cy.findByTestId('probeTable').should('be.visible');
      //Should display Add to all button
      cy.findByRole('button', { name: 'Add to all' }).should('be.visible');
    });
    it('should display scanned labware in probe table', () => {
      cy.findByTestId('STAN-3111-workNumber').should('be.visible');
      cy.findByTestId('STAN-3111-0-name').should('be.visible');
      cy.findByTestId('STAN-3111-0-lot').should('be.visible');
      cy.findByTestId('STAN-3111-0-plex').scrollIntoView().should('be.visible');
      cy.findByTestId('STAN-3111-0-costing').should('be.visible');
      cy.findByTestId('STAN-3111-0-action').should('be.visible');
      //Should not display remove button
      cy.findByTestId('STAN-3111-0-action').within(() => {
        cy.findByTestId('removeButton').should('not.exist');
        cy.findByTestId('addButton').should('be.visible');
      });
    });
  });
  describe('Start time', () => {
    it('should display the current date', () => {
      cy.findByTestId('performed').should('contain.value', new Date().toISOString().split('T')[0]);
    });
    context('Entering no value', () => {
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
    context('Entering a past date', () => {
      before(() => {
        cy.findByLabelText('Start Time').clear().type('2020-01-01T10:00').blur();
      });
      it('should display an error message', () => {
        cy.findByTestId('performed').should('contain.value', '2020-01-01');
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
  describe('Probe for all', () => {
    context('When probe is added for all', () => {
      before(() => {
        cy.reload();
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
        selectOption('probe-name', 'Custom breast');
        cy.findByTestId('probe-lot').type('1234');
        cy.findByTestId('probe-plex').scrollIntoView().type('2');
        selectOption('probe-costing', 'Faculty');
        cy.findByRole('button', { name: 'Add to all' }).click();
      });
      it('should display probe information added for all labware', () => {
        //Should adds probe information to the existing rows
        cy.findByTestId('STAN-3111-0-name').should('be.visible');
        shouldDisplaySelectedValue('STAN-3111-0-name', 'Custom breast');
        cy.findByTestId('STAN-3111-0-lot').should('have.value', '1234');
        cy.findByTestId('STAN-3111-0-plex').scrollIntoView().should('have.value', '2');
        shouldDisplaySelectedValue('STAN-3111-0-costing', 'Faculty');
      });

      it('displays error when same panel is selected for multiple probes in same labware', () => {
        cy.findByTestId('addButton').click();
        cy.findByRole('button', { name: 'Add to all' }).click();
        cy.findAllByText('Unique value required for Probe Panel').should('be.visible');
      });
    });
  });
  describe('Add and remove buttons', () => {
    context('when remove button is pressed', () => {
      before(() => {
        cy.findByTestId('STAN-3111-0-action').within(() => {
          cy.findByTestId('removeButton').click();
        });
      });
      it('should remove the first row', () => {
        cy.findByTestId('STAN-3111-1-action').should('not.exist');
        //Displays only one row with value
        shouldDisplaySelectedValue('STAN-3111-0-name', 'Custom breast');
        cy.findByTestId('STAN-3111-0-lot').should('have.value', '1234');
        cy.findByTestId('STAN-3111-0-plex').scrollIntoView().should('have.value', '2');
        shouldDisplaySelectedValue('STAN-3111-0-costing', 'Faculty');
        //Action column updated
        cy.findByTestId('STAN-3111-0-action').within(() => {
          cy.findByTestId('removeButton').should('not.exist');
          cy.findByTestId('addButton').should('exist');
        });
      });
    });
    context('when add button is pressed', () => {
      before(() => {
        cy.findByTestId('STAN-3111-0-action').within(() => {
          cy.findByTestId('addButton').click();
        });
      });
      it('should remove the first row', () => {
        cy.findByTestId('STAN-3111-1-action').should('exist');
        //Displays only one row with value
        shouldDisplaySelectedValue('STAN-3111-1-name', '');
        cy.findByTestId('STAN-3111-1-lot').should('have.value', '');
        cy.findByTestId('STAN-3111-1-plex').scrollIntoView().should('have.value', '');
        shouldDisplaySelectedValue('STAN-3111-1-costing', '');
        //Action column updated
        cy.findByTestId('STAN-3111-1-action').within(() => {
          cy.findByTestId('removeButton').should('exist');
          cy.findByTestId('addButton').should('exist');
        });
      });
    });
  });
  describe('Multiple labware', () => {
    before(() => {
      cy.visit('/lab/probe_hybridisation_xenium');
      cy.get('#labwareScanInput').type('STAN-3112{enter}');
    });
    it('should display probe settings for multiple labware', () => {
      cy.findByTestId('STAN-3112-workNumber').should('be.visible');
      cy.findByTestId('STAN-3112-0-name').should('be.visible');
      cy.findByTestId('STAN-3112-0-lot').should('be.visible');
      cy.findByTestId('STAN-3112-0-plex').scrollIntoView().should('be.visible');
      cy.findByTestId('STAN-3112-0-costing').should('be.visible');
      cy.findByTestId('STAN-3112-0-action').should('be.visible');
    });
  });

  describe('Save', () => {
    context('On save button status check', () => {
      before(() => {
        selectOption('STAN-3112-workNumber', 'SGP1008');
        selectOption('STAN-3112-0-name', 'Custom breast');
        cy.findByTestId('STAN-3112-0-lot').type('1234');
        cy.findByTestId('STAN-3112-0-plex').scrollIntoView().type('2');
        selectOption('STAN-3112-0-costing', 'SGP');
      });
      it('should enable save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
      it('changes status on Start time field', () => {
        cy.findByLabelText('Start Time').clear();
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
        cy.findByLabelText('Start Time').clear().type('2021-01-01T10:00').blur();
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
      it('changes status on SGP field', () => {
        selectOption('STAN-3112-workNumber', '');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
        selectOption('STAN-3112-workNumber', 'SGP1008');
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
      it('changes status on  panel name field', () => {
        selectOption('STAN-3112-0-name', '');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
        selectOption('STAN-3112-0-name', 'Custom breast');
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
      it('changes status on  lot name field', () => {
        cy.findByTestId('STAN-3112-0-lot').clear();
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
        cy.findByTestId('STAN-3112-0-lot').type('1234');
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
      it('changes status on  plex field', () => {
        cy.findByTestId('STAN-3112-0-plex').scrollIntoView().clear();
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
        cy.findByTestId('STAN-3112-0-plex').type('2');
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
      it('changes status on  costing field', () => {
        selectOption('STAN-3112-0-costing', '');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
        selectOption('STAN-3112-0-costing', 'Faculty');
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
    });
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
                        'Exception while fetching data (/probe_hybridisation_xenium) : The operation could not be validated.',
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

        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('shows an error', () => {
        cy.findByText('Labware is discarded: [STAN-3111]').should('be.visible');
      });
    });
    context('When there is no server error', () => {
      before(() => {
        cy.msw().then(({ worker }) => {
          worker.resetHandlers();
        });

        cy.findByRole('button', { name: 'Save' }).click();
      });

      it('shows a success message', () => {
        cy.findByText('Xenium probe hybridisation recorded on all labware').should('be.visible');
      });
    });
  });
});
