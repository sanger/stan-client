import { selectOption, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';

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
      cy.findByTestId('probeTable').contains('td', 'STAN-3111');
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

    context('When SGP number is selected for all labware', () => {
      before(() => {
        selectOption('workNumberAll', 'SGP1008');
      });
      it('should select SGP1008 for all labware', () => {
        shouldDisplaySelectedValue('STAN-3111-workNumber', 'SGP1008');
      });
    });
    describe('Probe', () => {
      context('When invalid values filled in', () => {
        before(() => {
          cy.findByTestId('probeAll-lot').type('1234567890123456789012345678');
          cy.findByTestId('probeAll-plex').type('-1');
        });
      });
    });
  });
});
