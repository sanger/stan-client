import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';

describe('Staining QC', () => {
  describe('When Stain QC is selected', () => {
    before(() => {
      cy.visit('/lab/staining_qc');
    });
    context('when Save is selected', () => {
      it('displays Operation complete message', () => {
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-411{enter}');
        selectOption('qcType', 'Stain QC');
        cy.findByRole('button', { name: 'Save' }).should('be.enabled').click();
        cy.findByText('Stain QC complete').should('be.visible');
      });
    });
  });

  describe('when Tissue coverage is selected', () => {
    before(() => {
      cy.visit('/lab/staining_qc');
    });
    context('when Save is selected', () => {
      it('displays Operation complete message', () => {
        selectOption('qcType', 'Tissue coverage');
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-411{enter}');
        cy.findByRole('button', { name: 'Save' }).should('be.enabled').click();
        cy.findByText('Tissue coverage complete').should('be.visible');
      });
    });
  });

  describe('when Pretreatment QC is selected', () => {
    before(() => {
      cy.visit('/lab/staining_qc');
    });

    context('when Save is selected', () => {
      it('displays Operation complete message', () => {
        selectOption('qcType', 'Pretreatment QC');
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-411{enter}');
        cy.findByRole('button', { name: 'Save' }).should('be.enabled').click();
        cy.findByText('Pretreatment QC complete').should('be.visible');
      });
    });
  });
});
