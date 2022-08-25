import { RecordVisiumQcMutation, RecordVisiumQcMutationVariables } from '../../../src/types/sdk';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';

describe('Visium QC Page', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/visium_qc');
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
        before(() => {
          cy.get('select[name="workNumber"]').select('SGP1008');
          cy.findByRole('button', { name: /Save/i }).should('not.be.disabled').click();
        });

        it('shows a success message', () => {
          cy.findByText('Visium QC complete').should('be.visible');
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
          cy.findByRole('button', { name: /Save/i }).click();
        });

        it('shows an error', () => {
          cy.findByText('Failed to record Visium QC').should('be.visible');
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
          cy.findByText('Visium QC complete').should('be.visible');
        });
        after(() => {
          cy.findByRole('button', { name: /Reset/i }).click();
        });
      });
    });
  });

  describe('On Visium QCType as cDNA concentration', () => {
    before(() => {
      cy.get('select[name="workNumber"]').select('SGP1008');
      cy.findByTestId('qcType').select('cDNA concentration');
    });

    context('When user scans in a 96 well plate ', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-5100{enter}');
      });
      it('displays the labware layout  on the page', () => {
        cy.findByText('STAN-5100').should('be.visible');
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
          cy.findByText('Visium QC complete').should('be.visible');
        });

        after(() => {
          cy.findByRole('button', { name: /Reset/i }).click();
        });
      });
    });
  });

  describe('On Visium QCType as Library concentration', () => {
    before(() => {
      cy.get('select[name="workNumber"]').select('SGP1008');
      cy.findByTestId('qcType').select('Library concentration');
    });

    context('When user scans in a 96 well plate ', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-5100{enter}');
      });
      it('displays the labware layout  on the page', () => {
        cy.findByText('STAN-5100').should('be.visible');
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
          cy.findByText('Visium QC complete').should('be.visible');
        });
      });
    });
  });

  function saveButton() {
    return cy.findByRole('button', { name: /Save/i });
  }
});
