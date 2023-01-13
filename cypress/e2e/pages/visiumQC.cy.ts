import {
  RecordOpWithSlotCommentsMutation,
  RecordOpWithSlotCommentsMutationVariables,
  RecordVisiumQcMutation,
  RecordVisiumQcMutationVariables
} from '../../../src/types/sdk';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';

describe('Visium QC Page', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/visium_qc', 'workNumber');
  before(() => {
    cy.visit('/lab/visium_qc');
    cy.get('select[name="workNumber"]').select('SGP1008');
  });

  describe('On load', () => {
    it('shows SGP Number section', () => {
      cy.findByText('SGP Number').should('be.visible');
    });
    it('shows QC Type section', () => {
      cy.findByText('QC Type').should('be.visible');
    });
    it('shows Slide Processing in QC Type dropdown', () => {
      cy.findByTestId('qcType').should('have.value', 'Slide Processing');
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
      it('displays scan field as disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
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
          cy.get('select[name=costing]').should('be.disabled');
        });
        it('should show the assigned costing', () => {
          cy.get('select[name=costing]').should('have.value', SlideCosting.Sgp);
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
          cy.get('select[name=costing]').should('be.enabled');
        });
        it('should show the assigned costing', () => {
          cy.get('select[name=costing]').should('have.value', '');
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
        cy.findByTestId('passFailComments').get('select').should('be.enabled');
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
        cy.findByTestId('passFailComments').get('select').should('be.enabled');
      });
    });
    context('When changing the comment all dropdown', () => {
      before(() => {
        cy.findByTestId('commentAll').select('Slide damaged');
      });
      it('changes all the comments', () => {
        cy.findByTestId('passFailComments').within(() => {
          cy.get('select option:selected').each((elem) => {
            cy.wrap(elem).should('have.text', 'Slide damaged');
          });
        });
      });
    });
    describe('On Save', () => {
      context('When there is no server error', () => {
        context('When slide costing field is empty, all other fields are valid', () => {
          before(() => {
            cy.get('select[name="costing"]').select('');
            cy.get('select[name="workNumber"]').select('SGP1008');
            cy.findByTestId('formInput').type('123456');
          });
          it('should display error message for Slide costing', () => {
            cy.findByText('Slide costing is a required field').should('be.visible');
          });
        });
        context('When all other fields are valid except LOT number', () => {
          context('when Reagent LOT number is empty', () => {
            before(() => {
              cy.get('select[name="workNumber"]').select('SGP1008');
              cy.get('select[name="costing"]').select('Faculty');
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
              cy.get('select[name="workNumber"]').select('SGP1008');
              cy.get('select[name="costing"]').select('Faculty');
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
            cy.get('select[name="workNumber"]').select('');
            cy.findByTestId('formInput').clear().type('123456');
            cy.get('select[name="costing"]').select('Faculty');
          });
          it('should not enable Save button', () => {
            cy.findByRole('button', { name: /Save/i }).should('be.disabled');
          });
        });
        context('When both work number and slide costing fields are selected', () => {
          before(() => {
            cy.get('select[name="workNumber"]').select('SGP1008');
            cy.findByTestId('formInput').clear().type('123456');
            cy.get('select[name="costing"]').select('Faculty');
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
          cy.get('select[name="workNumber"]').select('SGP1008');
          cy.findByTestId('formInput').clear().type('123456');
          cy.get('select[name="costing"]').select('Faculty');
          cy.findByRole('button', { name: /Save/i }).click();
        });

        it('shows an error', () => {
          cy.findByText('Failed to record Slide Processing').should('be.visible');
        });
      });
    });
  });
  describe('On Visium QCType as cDNA Amplification', () => {
    before(() => {
      cy.findByTestId('remove').click();
      cy.findByTestId('qcType').select('cDNA amplification');
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
          cy.findByText('A1').should('be.visible');
        });
      });
    });
    context('When user enters a value in CQ value text box', () => {
      before(() => {
        cy.findByTestId('allMeasurementValue').type('5');
      });
      it('shows cq value in all text fields in CQ column of table', () => {
        cy.findAllByTestId('measurementValue1').should('have.value', 5);
      });
    });

    describe('On Save', () => {
      it('Save button should be disabled when there is no SGP number', () => {
        cy.get('select[name="workNumber"]').select('');
        cy.findByRole('button', { name: /Save/i }).should('be.disabled');
      });

      context('When there is no server error', () => {
        before(() => {
          cy.get('select[name="workNumber"]').select('SGP1008');
          cy.findByRole('button', { name: /Save/i }).should('not.be.disabled').click();
        });

        it('shows a success message', () => {
          cy.findByText('cDNA amplification complete').should('be.visible');
        });
        after(() => {
          cy.findByRole('button', { name: /Reset/i }).click();
        });
      });
    });
  });

  describe('On Visium QCType as Visium concentration', () => {
    before(() => {
      cy.get('select[name="workNumber"]').select('SGP1008');
      cy.findByTestId('qcType').select('Visium concentration');
    });

    context('When user scans in a 96 well plate ', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-5100{enter}');
      });

      it('displays the labware layout  on the page', () => {
        cy.findByText('STAN-5100').should('be.visible');
      });

      it('shows measurementType dropdown with fields', () => {
        cy.findByTestId('measurementType').select('Library concentration');
        cy.findByRole('table').get('th').eq(1).should('have.text', 'Library concentration');
      });

      it('display text boxes to enter concentration value for all slots with samples', () => {
        cy.findByRole('table').within(() => {
          cy.findByText('A1').should('be.visible');
          cy.findByTestId('measurementValue0').should('be.visible');
          cy.findByTestId('comments0').should('be.visible');
        });
      });
    });

    describe('On Save', () => {
      context('When all values are valid and there is no server error', () => {
        before(() => {
          cy.findByTestId('measurementValue0').clear().type('300.45');
          cy.findByTestId('comments0').select('Potential to work');
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
      cy.get('select[name="workNumber"]').select('SGP1008');
      cy.findByTestId('qcType').select('SPRI clean up');
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
        cy.findAllByTestId('comment').eq(0).contains('option', 'Difficult/very slow to separate');
        cy.findAllByTestId('comment').eq(0).contains('option', 'Bead loss during clean up');
      });
      it('shows comment all select box', () => {
        cy.findByTestId('commentAll').should('exist');
      });
      it('displays scan field as disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });
    });
    context('when comment is selected in commentAll', () => {
      before(() => {
        cy.findByTestId('commentAll').select('Bead loss during clean up');
      });
      it('should select the commentAll selected option in all comment dropdowns', () => {
        cy.findAllByTestId('comment').then((comments) => {
          comments.each((i, comment) => {
            cy.wrap(comment).find(':selected').should('have.text', 'Bead loss during clean up');
          });
        });
      });
    });
    context('when no comment is selected', () => {
      before(() => {
        cy.findByTestId('commentAll').select('');
      });
      it('should remove selection from all comment dropdowns', () => {
        cy.findAllByTestId('comment').then((comments) => {
          comments.each((i, comment) => {
            cy.wrap(comment).find(':selected').should('have.text', '');
          });
        });
      });
      it('Save button should be disabled', () => {
        saveButton().should('be.disabled');
      });
    });
    context('when a comment is selected', () => {
      before(() => {
        cy.findAllByTestId('comment').eq(0).select('Beads cracked during drying step');
      });
      it('Save button should be enabled', () => {
        saveButton().should('be.enabled');
      });
    });

    describe('On Save', () => {
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
    describe('When there is a server error', () => {
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
        cy.get('select[name="workNumber"]').select('SGP1008');
        cy.findByTestId('qcType').select('SPRI clean up');
        cy.get('#labwareScanInput').type('STAN-2100{enter}');
        cy.findAllByTestId('comment').eq(0).select('Beads cracked during drying step');
        saveButton().click();
      });
      it('shows an error', () => {
        cy.findByText('Failed to record SPRI clean up').should('be.visible');
      });
    });
  });

  function saveButton() {
    return cy.findByRole('button', { name: /Save/i });
  }
});
