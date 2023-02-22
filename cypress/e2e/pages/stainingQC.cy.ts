import {
  getAllSelect,
  selectOption,
  selectSGPNumber,
  shouldDisplaySelectedValue
} from '../shared/customReactSelect.cy';

describe('Staining QC', () => {
  before(() => {
    cy.visit('/lab/staining_qc');
  });

  describe('Save button', () => {
    context('when no labwares have been scanned', () => {
      it('is disabled', () => {
        selectSGPNumber('SGP1008');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
    });

    context('when there is at least 1 labware', () => {
      before(() => {
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-411{enter}');
      });

      it('is not disabled', () => {
        cy.findByRole('button', { name: 'Save' }).should('not.be.disabled');
      });
    });
  });

  describe('LabwareResult component', () => {
    describe('when it first loads', () => {
      it('has all slots as passed', () => {
        cy.findAllByTestId('passIcon').then(($passIcons) => {
          $passIcons.each((i, icon) => {
            const classList = Array.from(icon.classList);
            expect(classList).to.includes('text-green-700');
          });
        });
      });

      it('has comment dropdowns enabled', () => {
        getAllSelect('comment').forEach((elem: any) => {
          cy.wrap(elem).should('be.enabled');
        });
      });

      it('has coverage field displayed', () => {
        cy.findAllByTestId('coverage').should('have.length.above', 0);
      });
    });

    context('when clicking the Fail All button', () => {
      before(() => {
        cy.findByRole('button', { name: 'Fail All' }).click();
      });

      it('fails all the slots', () => {
        cy.findAllByTestId('failIcon').then(($failIcons) => {
          $failIcons.each((indx, failIcon) => {
            const classList = Array.from(failIcon.classList);
            expect(classList).to.includes('text-red-700');
          });
        });
      });

      it('enables all the comment dropdowns', () => {
        getAllSelect('comment').forEach((elem: any) => {
          cy.wrap(elem).should('be.enabled');
        });
      });

      context('when changing the comment all dropdown', () => {
        before(() => {
          selectOption('commentAll', 'Wrong morphology');
        });
        it('changes all the comments', () => {
          cy.findByTestId('passFailComments').within(() => {
            shouldDisplaySelectedValue('comment', 'Wrong morphology');
          });
        });
      });
    });
  });
});
