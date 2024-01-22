import {
  RecordOpWithSlotCommentsMutation,
  RecordOpWithSlotCommentsMutationVariables,
  RecordVisiumQcMutation,
  RecordVisiumQcMutationVariables,
  SlideCosting
} from '../../../src/types/sdk';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';
import {
  getAllSelect,
  selectOption,
  selectOptionForMultiple,
  selectSGPNumber,
  shouldBeDisabled,
  shouldDisplaySelectedValue,
  shouldHaveOption
} from '../shared/customReactSelect.cy';

describe('Visium QC Page', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/visium_qc');
  before(() => {
    cy.visit('/lab/visium_qc');
    selectSGPNumber('SGP1008');
  });

  describe('On load', () => {
    it('shows SGP Number section', () => {
      cy.findByText('SGP Number').should('be.visible');
    });
    it('shows QC Type section', () => {
      cy.findByText('QC Type').should('be.visible');
    });
    it('shows Slide Processing in QC Type dropdown', () => {
      shouldDisplaySelectedValue('qcType', 'Slide Processing');
    });
    it('show Labware section', () => {
      cy.findByText('Labware').should('be.visible');
    });
  });
  describe('On Visium QCType as Slide Processing', () => {
    context('When user scans in a slide ', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-2100{enter}');
      });
      it('shows it on the page', () => {
        cy.findByText('STAN-2100').should('be.visible');
      });
      it('shows Slide costing drop down', () => {
        cy.findByText('Slide costings').should('be.visible');
      });
      it('shows Reagent LOT number drop down', () => {
        cy.findByText('Reagent LOT number').should('be.visible');
      });
      it('has all slots as passed', () => {
        cy.findAllByTestId('passIcon').then(($passIcons) => {
          $passIcons.each((i, icon) => {
            const classList = Array.from(icon.classList);
            expect(classList).to.includes('text-green-700');
          });
        });
      });
      after(() => {
        cy.findByTestId('remove').click();
      });
    });
    context('costing field check', () => {
      context('when user enters a labware which has already assigned a costing', () => {
        before(() => {
          cy.get('#labwareScanInput').type('STAN-2101{enter}');
        });
        it('disables Slide costing drop down', () => {
          shouldBeDisabled('slide-costing');
        });
        it('should show the assigned costing', () => {
          shouldDisplaySelectedValue('slide-costing', SlideCosting.Sgp);
        });
        after(() => {
          cy.findByTestId('remove').click();
        });
      });
      context('when user enters a labware with invalid barcode', () => {
        before(() => {
          cy.get('#labwareScanInput').type('aaa{enter}');
        });
        it('shows barcode not found message', () => {
          cy.findByText('No labware found with barcode: aaa').should('be.visible');
        });
      });
      context('when user enters a labware which has not assigned a costing', () => {
        before(() => {
          cy.get('#labwareScanInput').clear().type('STAN-2100{enter}');
        });
        it('enables Slide costing drop down', () => {
          shouldBeDisabled('slide-costing');
        });
        it('should show the assigned costing', () => {
          shouldDisplaySelectedValue('slide-costing', '');
        });
      });
    });
    context('When user clicks Pass All button', () => {
      before(() => {
        cy.findByTestId('passAll').click();
      });

      it('has all slots as passed', () => {
        cy.findAllByTestId('passIcon').then(($passIcons) => {
          $passIcons.each((i, icon) => {
            const classList = Array.from(icon.classList);
            expect(classList).to.includes('text-green-700');
          });
        });
      });
      it('has all comment dropdowns enabled', () => {
        getAllSelect('comment').forEach((elem: any) => {
          cy.wrap(elem).should('be.enabled');
        });
      });
    });
    context('When user clicks Fail All button', () => {
      before(() => {
        cy.findAllByTestId('failAll').click();
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
    });
    context('When changing the comment all dropdown', () => {
      before(() => {
        selectOption('commentAll', 'Slide damaged');
      });
      it('changes all the comments', () => {
        shouldDisplaySelectedValue('comment', 'Slide damaged');
      });
    });
    describe('On Save', () => {
      context('When there is no server error', () => {
        context('When slide costing field is empty, all other fields are valid', () => {
          before(() => {
            cy.reload();
            cy.get('#labwareScanInput').type('STAN-2105{enter}');
            selectOption('slide-costing', '');
            selectSGPNumber('SGP1008');
            cy.findByTestId('formInput').type('123456');
          });
          it('should display error message for Slide costing', () => {
            cy.findByText('Slide costing is a required field').should('be.visible');
          });
        });
        context('When all other fields are valid except LOT number', () => {
          context('when Reagent LOT number is empty', () => {
            before(() => {
              selectOption('slide-costing', 'Faculty');
              selectSGPNumber('SGP1008');
              cy.findByTestId('formInput').clear();
            });
            it('should not enable Save button', () => {
              cy.findByRole('button', { name: /Save/i }).should('be.disabled');
            });
            it('should display error message for Slide LOT number', () => {
              cy.findByText('Reagent LOT number is a required field').should('be.visible');
            });
          });
          context('when Reagent LOT number has invalid format', () => {
            before(() => {
              selectOption('slide-costing', 'Faculty');
              selectSGPNumber('SGP1008');
              cy.findByTestId('formInput').type('123').blur();
            });
            it('should not enable Save button', () => {
              cy.findByRole('button', { name: /Save/i }).should('be.disabled');
            });
            it('should display error message for Slide LOT number', () => {
              cy.findByText('Reagent LOT number should be a 6-7 digits number').should('be.visible');
            });
          });
        });
        context('When work number is empty and all other fields are valid', () => {
          before(() => {
            selectOption('slide-costing', 'Faculty');
            selectSGPNumber('');
            cy.findByTestId('formInput').clear().type('123456');
          });
          it('should not enable Save button', () => {
            cy.findByRole('button', { name: /Save/i }).should('be.disabled');
          });
        });
        context('When both work number and slide costing fields are selected', () => {
          before(() => {
            selectOption('slide-costing', 'Faculty');
            selectSGPNumber('SGP1008');
            cy.findByTestId('formInput').clear().type('123456');
          });
          it('should  enable Save button', () => {
            cy.findByRole('button', { name: /Save/i }).should('be.enabled');
          });
        });
        context('When Save button is pressed', () => {
          before(() => {
            cy.findByRole('button', { name: /Save/i }).click();
          });
          it('shows a success message', () => {
            cy.findByText('Slide Processing complete').should('be.visible');
          });
        });

        after(() => {
          cy.findByRole('button', { name: /Reset/i }).click();
        });
      });
      context('When there is a server error', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<RecordVisiumQcMutation, RecordVisiumQcMutationVariables>(
                'RecordVisiumQC',
                (req, res, ctx) => {
                  return res.once(
                    ctx.errors([
                      {
                        message: 'Exception while fetching data : The operation could not be validated.',
                        extensions: {
                          problems: ['Labware is discarded: [STAN-2100]']
                        }
                      }
                    ])
                  );
                }
              )
            );
          });
          cy.get('#labwareScanInput').type('STAN-2100{enter}');
          selectOption('slide-costing', 'Faculty');
          selectSGPNumber('SGP1008');
          cy.findByTestId('formInput').clear().type('123456');
          cy.findByRole('button', { name: /Save/i }).click();
        });

        it('shows an error', () => {
          cy.findByText('Failed to record Slide Processing').should('be.visible');
        });
      });
    });
    context('when the user scan two labwares', () => {
      before(() => {
        cy.reload();
        cy.get('#labwareScanInput').clear().type('STAN-2100{enter}');
        cy.get('#labwareScanInput').type('STAN-2101{enter}');
      });
      it('should display both labwares', () => {
        cy.findAllByTestId('passFailComments').should('have.length', 2);
      });
      it('displays scan field as disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });
    });
  });
  describe('On Visium QCType as Amplification', () => {
    before(() => {
      cy.reload();
      selectOption('qcType', 'Amplification');
    });

    context('When user scans in a 96 well plate ', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-5100{enter}');
      });
      it('displays the labware layout  on the page', () => {
        cy.findByText('STAN-5100').should('be.visible');
      });

      it('display slots having samples as highlighted', () => {
        cy.findByTestId('labware').within(() => {
          cy.findByText('A1')
            .parent()
            .then(($slot) => {
              $slot.each((i, slotElement) => {
                const classList = Array.from(slotElement.classList);
                expect(classList).to.includes('bg-sdb-300');
              });
            });
        });
      });

      it('display text boxes to enter cq value for all slots with samples', () => {
        cy.findByRole('table').within(() => {
          cy.findAllByTestId('Cq value-input').should('have.length.above', 0);
          cy.findAllByTestId('Cycles-input').should('have.length.above', 0);
        });
      });
      it('displays scan field as disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });
    });
    context('When user enters a value in CQ value text box', () => {
      before(() => {
        cy.findByTestId('all-Cq value').type('5');
      });
      it('shows cq value in all text fields in CQ column of table', () => {
        cy.findAllByTestId('Cq value-input').should('have.value', 5);
      });
    });
    context('When user enters a value in Cycles text box', () => {
      before(() => {
        cy.findByTestId('all-Cycles').type('3');
      });
      it('shows cq value in all text fields in CQ column of table', () => {
        cy.findAllByTestId('Cycles-input').should('have.value', 3);
      });
    });

    describe('On Save', () => {
      it('Save button should be disabled when there is no SGP number', () => {
        selectSGPNumber('');
        cy.findByRole('button', { name: /Save/i }).should('be.disabled');
      });

      context('When there is no server error', () => {
        before(() => {
          selectSGPNumber('SGP1008');
          cy.findByRole('button', { name: /Save/i }).should('not.be.disabled').click();
        });

        it('shows a success message', () => {
          cy.findByText('Amplification complete').should('be.visible');
        });
        after(() => {
          cy.findByRole('button', { name: /Reset/i }).click();
        });
      });
    });
  });

  describe('On Visium QCType as Visium concentration', () => {
    before(() => {
      cy.reload();
      selectSGPNumber('SGP1008');
      selectOption('qcType', 'Visium concentration');
    });
    context('On load', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-5100{enter}');
      });
      it('shows measurementType dropdown with no option selected', () => {
        shouldDisplaySelectedValue('measurementType', '');
        cy.findByRole('table').should('not.exist');
      });
      it('displays scan field as disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });
    });
    describe('On Save', () => {
      context('When all values are valid and there is no server error', () => {
        before(() => {
          selectOption('measurementType', 'cDNA concentration');
          cy.findAllByTestId('cDNA concentration-input').eq(0).type('.45');
          selectOption('comments0', 'Potential to work');
          saveButton().click();
        });

        it('shows a success message', () => {
          cy.findByText('Visium concentration complete').should('be.visible');
        });

        after(() => {
          cy.findByRole('button', { name: /Reset/i }).click();
        });
      });
    });
  });

  describe('On SPRI clean up', () => {
    before(() => {
      cy.reload();
      selectSGPNumber('SGP1008');
      selectOption('qcType', 'SPRI clean up');
    });
    context('When user scans in a slide ', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-2100{enter}');
      });
      it('shows it on the page', () => {
        cy.findByText('STAN-2100').should('be.visible');
      });

      it('shows comment field for all slots with samples', () => {
        cy.findAllByTestId('comment').should('have.length.above', 1);
      });
      it('lists cleanup category comments in all dropdown', () => {
        shouldHaveOption('comment', 'Difficult/very slow to separate');
        shouldHaveOption('comment', 'Bead loss during clean up');
      });
      it('shows comment all select box', () => {
        cy.findByTestId('commentAll').should('exist');
      });
      it('displays scan field as disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });
      context('when comment is selected in commentAll', () => {
        before(() => {
          selectOption('commentAll', 'Bead loss during clean up');
        });
        it('should select the commentAll selected option in all comment dropdowns', () => {
          shouldDisplaySelectedValue('comment', 'Bead loss during clean up');
        });
      });
      context('when no comment is selected', () => {
        before(() => {
          selectOption('commentAll', '');
        });
        it('should remove selection from all comment dropdowns', () => {
          shouldDisplaySelectedValue('comment', '');
        });
        it('Save button should be disabled', () => {
          saveButton().should('be.disabled');
        });
      });
      context('when a comment is selected', () => {
        before(() => {
          selectOptionForMultiple('comment', 'Beads cracked during drying step', 0);
        });
        it('Save button should be enabled', () => {
          saveButton().should('be.enabled');
        });
      });

      context('On Save', () => {
        context('When atleast one comment is selected and there is no server error', () => {
          before(() => {
            saveButton().click();
          });
          it('shows a success message', () => {
            cy.findByText('SPRI clean up').should('be.visible');
          });

          after(() => {
            cy.findByRole('button', { name: /Reset/i }).click();
          });
        });
      });
      context('When there is a server error', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<RecordOpWithSlotCommentsMutation, RecordOpWithSlotCommentsMutationVariables>(
                'RecordOpWithSlotComments',
                (req, res, ctx) => {
                  return res.once(
                    ctx.errors([
                      {
                        message: 'Exception while fetching data : The operation could not be validated.',
                        extensions: {
                          problems: ['Labware is discarded: [STAN-2100]']
                        }
                      }
                    ])
                  );
                }
              )
            );
          });
          selectSGPNumber('SGP1008');
          selectOption('qcType', 'SPRI clean up');
          cy.get('#labwareScanInput').type('STAN-2100{enter}');
          selectOptionForMultiple('comment', 'Beads cracked during drying step', 0);
          saveButton().click();
        });
        it('shows an error', () => {
          cy.findByText('Failed to record SPRI clean up').should('be.visible');
        });
      });
    });
    context('When user scans in a 96 well plate ', () => {
      before(() => {
        cy.findByTestId('removeButton').click();
        cy.get('#labwareScanInput').type('STAN-5100{enter}');
      });
      it('shows it on the page', () => {
        cy.findByText('STAN-5100').should('be.visible');
      });

      it('shows comment field for all slots with samples', () => {
        cy.findAllByTestId('comment').should('have.length.above', 1);
      });
      it('shows comment all select box', () => {
        cy.findByTestId('commentAll').should('exist');
      });
      it('displays scan field as disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });
      context('when comment is selected in commentAll', () => {
        before(() => {
          selectOption('commentAll', 'Bead loss during clean up');
        });
        it('should select the commentAll selected option in all comment dropdowns', () => {
          shouldDisplaySelectedValue('comment', 'Bead loss during clean up', 0);
        });
      });
      context('when no comment is selected', () => {
        before(() => {
          selectOption('commentAll', '');
        });
        it('should remove selection from all comment dropdowns', () => {
          shouldDisplaySelectedValue('comment', '');
        });
        it('Save button should be disabled', () => {
          saveButton().should('be.disabled');
        });
      });
      context('when a comment is selected', () => {
        before(() => {
          selectOptionForMultiple('comment', 'Beads cracked during drying step', 0);
        });
        it('Save button should be enabled', () => {
          saveButton().should('be.enabled');
        });
      });

      context('On Save', () => {
        context('When atleast one comment is selected and there is no server error', () => {
          before(() => {
            saveButton().click();
          });
          it('shows a success message', () => {
            cy.findByText('SPRI clean up').should('be.visible');
          });

          after(() => {
            cy.findByRole('button', { name: /Reset/i }).click();
          });
        });
      });
      context('When there is a server error', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<RecordOpWithSlotCommentsMutation, RecordOpWithSlotCommentsMutationVariables>(
                'RecordOpWithSlotComments',
                (req, res, ctx) => {
                  return res.once(
                    ctx.errors([
                      {
                        message: 'Exception while fetching data : The operation could not be validated.',
                        extensions: {
                          problems: ['Labware is discarded: [STAN-2100]']
                        }
                      }
                    ])
                  );
                }
              )
            );
          });
          selectSGPNumber('SGP1008');
          selectOption('qcType', 'SPRI clean up');
          cy.get('#labwareScanInput').type('STAN-2100{enter}');
          selectOptionForMultiple('comment', 'Beads cracked during drying step', 0);
          saveButton().click();
        });
        it('shows an error', () => {
          cy.findByText('Failed to record SPRI clean up').should('be.visible');
        });
      });
    });
  });

  describe('When selecting qPCR Results for QCType', () => {
    before(() => {
      cy.reload();
      selectOption('qcType', 'qPCR results');
    });

    context('When a user enters a global CQ value', () => {
      before(() => {
        cy.findByTestId('all-Cq value').type('5');
      });
      it('updates all the Cq value inputs inside the table related to the slots', () => {
        cy.findAllByTestId('Cq value-input').should('have.value', 5);
      });
    });

    describe('On Save', () => {
      it('Save button should be disabled when there is no SGP number', () => {
        selectSGPNumber('');
        cy.findByRole('button', { name: /Save/i }).should('be.disabled');
      });

      context('When there is no server error', () => {
        before(() => {
          selectSGPNumber('SGP1008');
          cy.findByRole('button', { name: /Save/i }).should('not.be.disabled').click();
        });

        it('shows a success message', () => {
          cy.findByText('qPCR results complete').should('be.visible');
        });
        after(() => {
          cy.findByRole('button', { name: /Reset/i }).click();
        });
      });
    });
  });

  function saveButton() {
    return cy.findByRole('button', { name: /Save/i });
  }
});
