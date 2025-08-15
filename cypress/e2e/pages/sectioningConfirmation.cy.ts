import {
  ConfirmSectionMutation,
  ConfirmSectionMutationVariables,
  FindPlanDataQuery,
  FindPlanDataQueryVariables
} from '../../../src/types/sdk';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { labwareTypes } from '../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../src/types/stan';
import { findPlanData } from '../../../src/mocks/handlers/planHandlers';
import {
  getAllSelect,
  selectOptionForMultiple,
  selectSGPNumber,
  shouldDisplaySelectedValue
} from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

let highestSectionNumber: number = 0;
describe('Sectioning Confirmation', () => {
  before(() => {
    cy.visit('/lab/sectioning/confirm');
  });

  context('when I scan a barcode and core errors', () => {
    before(() => {
      cy.msw().then(({ graphql, worker }) => {
        worker.use(
          graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>('FindPlanData', () => {
            return HttpResponse.json({
              errors: [
                {
                  message: 'Exception while fetching data (/confirmSection) : An error occured'
                }
              ]
            });
          })
        );
      });

      findPlanByBarcode('STAN-0002E');
    });

    it('shows an error', () => {
      cy.findByText('Plan Search Error').should('be.visible');
      cy.findByText('An error occured').should('be.visible');
    });
  });

  context('when I scan in a labware with a plan', () => {
    before(() => {
      selectSGPNumber('SGP1008');
      findPlanByBarcode('STAN-0001F');
    });

    it('displays the source labware for that plan', () => {
      cy.findAllByText('STAN-2021').its('length').should('be.gte', 1);
    });

    it('displays the destination labware for that plan', () => {
      cy.findAllByText('STAN-0001F').its('length').should('be.gte', 1);
    });

    it("should select the section numbering mode as 'auto'", () => {
      cy.get('[type="radio"]').first().should('be.checked');
    });
    it('should auto fill section numbers starting from highest section number', () => {
      let sectionNumber = 0;
      cy.findByRole('table')
        .find('td')
        .eq(1)
        .then((col) => {
          sectionNumber = Number(col.text());
        });
      cy.findAllByTestId('section-number').each((elem) => cy.wrap(elem).should('have.value', sectionNumber + 1 + ''));
    });

    it('disables all section number fields', () => {
      cy.findAllByTestId('section-number').each((elem) => cy.wrap(elem).should('be.disabled'));
    });

    it('fills section thickness', () => {
      cy.findAllByTestId('section-thickness').each((elem) => cy.wrap(elem).should('have.value', 2.5));
    });

    it('enables the user to edit section thickness', () => {
      cy.findAllByTestId('section-thickness').each((elem) => cy.wrap(elem).should('be.enabled'));
    });

    it('sets the section plan’s SGP number to match the global SGP number', () => {
      shouldDisplaySelectedValue('sectionnumber-worknumber-STAN-0001F', 'SGP1008');
    });
    // Section numbers already filled in
    it('enables the Save button', () => {
      saveButton().should('be.enabled');
    });

    context('when a fetal waste is scanned', () => {
      before(() => {
        const sourceLabware = labwareFactory.build(
          { barcode: 'STAN-3333' },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.CASSETTE].build()
            }
          }
        );

        const destinationLabware = labwareFactory.build(
          { barcode: 'STAN-0002D' },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.FETAL_WASTE_CONTAINER].build()
            }
          }
        );
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>('FindPlanData', () => {
              return HttpResponse.json({
                data: {
                  ...findPlanData(sourceLabware, destinationLabware)
                }
              });
            })
          );
        });
        findPlanByBarcode('STAN-0002D');
      });

      it('should display fetal waste labware', () => {
        cy.findByText('Fetal waste container').should('be.visible');
      });

      it("shouldn't display edit layout option", () => {
        cy.findByTestId('div-slide-STAN-0002D').within(() => {
          cy.findByText('Edit Layout').should('not.exist');
        });
      });
      context('when remove labware button is clicked', () => {
        before(() => {
          cy.findByTestId('remove-slide-STAN-0002D').click();
        });
        it('should remove the fetal waste labware without warning', () => {
          cy.findByText('Removing labware').should('not.exist');
          cy.findByTestId('div-slide-STAN-0002D').should('not.exist');
        });
      });
    });

    context('when I scan the same barcode again', () => {
      before(() => {
        findPlanByBarcode('STAN-0001F');
      });

      it('shows an error', () => {
        cy.findByText('"STAN-0001F" has already been scanned').should('be.visible');
      });
    });

    context('when I try and leave the page without saving', () => {
      it('shows a confirm box', () => {
        cy.on('window:confirm', (str) => {
          expect(str).to.equal('You have unsaved changes. Are you sure you want to leave?');
          // Returning false cancels the event
          return false;
        });

        cy.findByText('Search').click();
      });
      after(() => {
        cy.findByRole('button', { name: /Cancel/ }).click();
      });
    });

    context('when I edit the layout', () => {
      it('adds or removes sections', () => {
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findByText('STAN-2021').click();
          cy.findByText(`\u00d72`).should('be.visible');
          cy.findByText('STAN-2021').click({ ctrlKey: true });
          cy.findByText(`\u00d72`).should('not.exist');
          cy.findByText('Done').click();
        });
      });
    });

    context("when a new section is added in 'auto' mode for section numbering ", () => {
      before(() => {
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findByText('STAN-2021').click();
          cy.findByText('Done').click();
        });
      });

      it('should renumber all section numbers', () => {
        readHighestSectionNumber();
        cy.findAllByTestId('section-number').each((elem) => {
          highestSectionNumber++;
          cy.wrap(elem).should('have.value', highestSectionNumber + '');
        });
      });
      context('after section deletion', () => {
        before(() => {
          cy.screenshot();
          readHighestSectionNumber();
          cy.screenshot();
          cy.findByText('Edit Layout').click();
          cy.findByRole('dialog').within(() => {
            cy.findByText('STAN-2021').click({ ctrlKey: true });
            cy.findByText('Done').click();
          });
          cy.screenshot();
        });
        it('renumbers all section numbers', () => {
          cy.findAllByTestId('section-number').each((elem) => {
            cy.wrap(elem).should('have.value', ++highestSectionNumber + '');
          });
        });
      });
      it('should display region fields for all sections', () => {
        getAllSelect('region-select').forEach((elem: any) => {
          cy.wrap(elem).should('be.enabled');
        });
      });
      after(() => {
        findPlanByBarcode('STAN-0001E');
      });
    });

    context("when a tube is cancelled in 'auto' mode", () => {
      before(() => {
        const sourceLabware = labwareFactory.build(
          { barcode: 'STAN-2222' },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.CASSETTE].build()
            }
          }
        );

        const destinationLabware = labwareFactory.build(
          { barcode: 'STAN-0001D' },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.TUBE].build()
            }
          }
        );
        destinationLabware.id = -2;
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>('FindPlanData', () => {
              return HttpResponse.json({
                data: {
                  ...findPlanData(sourceLabware, destinationLabware)
                }
              });
            })
          );
        });

        findPlanByBarcode('STAN-0001D');
        cy.findByTestId('remove-tube-STAN-0001D').click();
      });

      it('should display a warning message', () => {
        cy.findByText('Cancelling tube').should('be.visible');
      });

      it('should empty the section field for cancelled tube', () => {
        cy.findByRole('button', { name: /Continue/i }).click();
        cy.findByTestId('sectionnumber-tube-STAN-0001D').should('not.exist');
      });
    });
    context('when a slide is removed in auto mode', () => {
      before(() => {
        const sourceLabware = labwareFactory.build(
          { barcode: 'STAN-2222' },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.CASSETTE].build()
            }
          }
        );

        const destinationLabware = labwareFactory.build(
          { barcode: 'STAN-0001C' },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.SUPERFROST_PLUS].build()
            }
          }
        );
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>('FindPlanData', () => {
              return HttpResponse.json({
                data: {
                  ...findPlanData(sourceLabware, destinationLabware)
                }
              });
            })
          );
        });
        findPlanByBarcode('STAN-0001C');
        cy.findByTestId('remove-slide-STAN-0001C').click();
      });
      it('should display a warning message', () => {
        cy.findByText('Removing labware').should('be.visible');
      });
      it('should remove the labware on pressing Continue button', () => {
        cy.findByRole('button', { name: /Continue/i }).click();
        cy.findByText('STAN-0001C').should('not.exist');
      });
    });
    context("when 'manual' mode is selected for section numbering", () => {
      before(() => {
        cy.visit('/lab/sectioning/confirm');
      });
      before(() => {
        selectSGPNumber('SGP1008');
        findPlanByBarcode('STAN-0001F');
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findByText('STAN-2021').click();
          cy.findByText(`\u00d72`).should('be.visible');
          cy.findByText('Done').click();
        });
        cy.get('[type = "radio"]').eq(1).click();
      });
      it('enables all section number fields ', () => {
        cy.findAllByTestId('section-number').each((elem) => cy.wrap(elem).should('be.enabled'));
      });
      it('should empty all section number fields', () => {
        cy.findAllByTestId('section-number').each((elem) => cy.wrap(elem).should('have.value', ''));
      });
      // Section numbers not filled in
      it('disables the Save button', () => {
        saveButton().should('be.disabled');
      });
    });
    context('when I add the section number in manual mode', () => {
      before(() => {
        cy.findAllByTestId('section-number').each((elem, index) => {
          cy.wrap(elem).type(String(index + 10));
        });
      });

      it('displays save button as disabled', () => {
        saveButton().should('be.disabled');
      });
    });
    context('when duplicate regions are selected', () => {
      before(() => {
        selectOptionForMultiple('region-select', 'Top', 0);
        selectOptionForMultiple('region-select', 'Top', 1);
      });
      it('displays error', () => {
        cy.findAllByText('Unique value required.').should('have.length', 2);
      });
      it('disables the Save button', () => {
        saveButton().should('be.disabled');
      });
    });
    context('when unique regions are selected', () => {
      before(() => {
        selectOptionForMultiple('region-select', 'Top', 0);
        selectOptionForMultiple('region-select', 'Middle', 1);
      });
      it('enables the Save button', () => {
        saveButton().should('be.enabled');
      });
    });

    context('when core errors on saving', () => {
      before(() => {
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.mutation<ConfirmSectionMutation, ConfirmSectionMutationVariables>('ConfirmSection', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'the Sectioning operation failed'
                  }
                ]
              });
            })
          );
        });

        saveButton().click();
      });

      it('shows an error', () => {
        cy.findByText('the Sectioning operation failed').should('be.visible');
      });
    });

    context('when core succeeds on saving', () => {
      before(() => {
        saveButton().click();
      });

      it('shows the success dialog', () => {
        cy.findByText('Sections Confirmed');
      });
      it('displays Store option in updated page after success', () => {
        cy.findByRole('button', { name: /Store/i }).should('be.enabled');
      });
      it('displays Print option in updated page after success', () => {
        cy.findByTestId('print-div').within(() => {
          cy.findByText('Proviasette').should('be.visible');
          cy.findAllByRole('table').eq(0).find('tr').should('have.length.at.least', 1);
        });
      });
    });

    context('when print button is clicked for labware', () => {
      before(() => {
        cy.get('[id=printButton]').last().click();
      });
      it('displays a print success message', () => {
        cy.findByTestId('print-div').within(() => {
          cy.findByText('Proviasette Printer successfully printed STAN-2021').should('be.visible');
        });
      });
    });
  });

  describe('when store option is selected for confirmed labware', () => {
    before(() => {
      cy.findByRole('button', { name: /Store/i }).click();
    });
    context('while in store page with confirmed labware', () => {
      it('navigates to store page', () => {
        cy.url().should('be.equal', 'http://localhost:3000/store');
      });
      it('when redirected to the Store page', () => {
        cy.findByText('Awaiting storage').should('be.visible');
        cy.findByRole('table').find('tr').should('have.length.at.least', 1);
      });
      it('store all button should be disabled', () => {
        cy.findByRole('button', { name: /Store All/i }).should('be.disabled');
      });
    });
  });
});

function findPlanByBarcode(barcode: string) {
  cy.findByTestId('plan-finder').find('input').clear().type(`${barcode}{enter}`);
}

function saveButton() {
  return cy.findByRole('button', { name: /Save/i });
}

const readHighestSectionNumber = () => {
  cy.findByRole('table')
    .find('td')
    .eq(1)
    .then((col) => {
      highestSectionNumber = Number(col.text());
    });
};
