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
      it('should have qcType as empty', () => {
        cy.findByTestId('qcType').should('have.value', '');
      });
    });
  });

  describe('LabwareResult component', () => {
    describe('when no qcType is selected', () => {
      it('should not display measurement fields', () => {
        cy.findAllByTestId('coverage').should('have.length', 0);
      });
      it('should not display comment dropdowns', () => {
        cy.findAllByTestId('comment').should('have.length', 0);
      });
      it('should not display pass/fail icons', () => {
        cy.findAllByTestId('passIcon').should('have.length', 0);
        cy.findAllByTestId('failIcon').should('have.length', 0);
      });
    });
    describe('when Stain Qc is selected', () => {
      it('has all slots as passed', () => {
        selectOption('qcType', 'Stain QC');
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

      it('should not display measurement fields', () => {
        cy.findAllByTestId('coverage').should('have.length', 0);
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

        context('when Save is selected', () => {
          it('displays Operation complete message', () => {
            cy.findByRole('button', { name: 'Save' }).should('be.enabled').click();
            cy.findByText('Stain QC complete').should('be.visible');
          });
        });
      });
    });

    describe('when Tissue coverage is selected', () => {
      before(() => {
        cy.visit('/lab/staining_qc');
      });
      it('should  display measurement fields', () => {
        selectOption('qcType', 'Tissue coverage');
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-411{enter}');
        cy.findAllByTestId('coverage').should('have.length.above', 0);
      });
      it('should not display comment dropdowns', () => {
        cy.findAllByTestId('comment').should('have.length', 0);
      });
      it('should not display pass/fail icons', () => {
        cy.findAllByTestId('passIcon').should('have.length', 0);
        cy.findAllByTestId('failIcon').should('have.length', 0);
      });
      context('when Save is selected', () => {
        it('displays Operation complete message', () => {
          cy.findByRole('button', { name: 'Save' }).should('be.enabled').click();
          cy.findByText('Tissue coverage complete').should('be.visible');
        });
      });
    });
  });
});
