import { PerformTissueBlockMutation, PerformTissueBlockMutationVariables } from '../../../src/types/sdk';
import { labwareTypeInstances } from '../../../src/lib/factories/labwareTypeFactory';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { LabwareTypeName } from '../../../src/types/stan';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';
import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { sampleFactory, tissueFactory } from '../../../src/lib/factories/sampleFactory';
import { slotFactory } from '../../../src/lib/factories/slotFactory';
import { createLabwareFromParams } from '../../../src/mocks/handlers/labwareHandlers';
import { HttpResponse } from 'msw';

describe('Block Processing', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/original_sample_processing?type=block');
  before(() => {
    cy.visit('/lab/original_sample_processing?type=block');
  });

  describe('Add Labware button', () => {
    context('when no source labware is scanned', () => {
      it('Add labware button is disabled', () => {
        cy.findByText('+ Add Labware').should('be.disabled');
      });
    });

    context('when source labware is loaded', () => {
      before(() => {
        scanInput('STAN-113');
      });

      it('Add labware button is enabled', () => {
        cy.findByText('+ Add Labware').should('not.be.disabled');
      });
    });
  });
  describe('Source labware table', () => {
    context('when destination labware is added', () => {
      before(() => {
        cy.findByText('+ Add Labware').click();
      });

      it(' disables scan labware input', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });

      context('when destination labware becomes empty again', () => {
        before(() => {
          cy.findByText('Delete Layout').click();
        });

        it('re-enables scan labware input', () => {
          cy.get('#labwareScanInput').should('not.be.disabled');
        });
      });
    });
  });
  describe('Adding multiple labware', () => {
    before(() => {
      selectOption('labwareType', 'Tube');
      cy.findByTestId('numLabware').type('{selectall}').type('2');
      cy.findByText('+ Add Labware').click();
    });
    it('should display two Tubes', () => {
      cy.findByTestId(`divSection-Tube`).within(() => {
        cy.findAllByTestId('plan').should('have.length', 2);
      });
    });
  });

  describe('Labware Layout', () => {
    context('when labware layout is added', () => {
      context('when editing a layout', () => {
        before(() => {
          cy.findAllByText('Edit Layout').first().click();
          cy.findByRole('dialog').within(() => {
            cy.findByText('STAN-113').click();
            cy.findByText('A1').click();
            cy.findByText('Done').click();
          });
        });
        it('should display STAN-113', () => {
          cy.findByTestId(`divSection-Tube`).within(() => {
            cy.findByText('STAN-113').should('exist');
          });
        });
      });

      context('when removing a layout', () => {
        before(() => {
          cy.findAllByTestId('plan')
            .first()
            .within(() => {
              cy.findByRole('button', { name: /Delete Layout/i }).click();
            });
        });

        it('removes the panel', () => {
          cy.findByTestId(`divSection-Tube`).within(() => {
            cy.findAllByTestId('plan').should('have.length', 1);
          });
        });
        after(() => {
          cy.findByText('Delete Layout').click();
        });
      });
    });
  });

  describe('Prebarcoded tube', () => {
    context('when adding a Prebarcoded tube', () => {
      before(() => {
        selectOption('labwareType', 'Prebarcoded tube');
        cy.findByTestId('numLabware').type('{selectall}').type('1');
        cy.findByText('+ Add Labware').click();
      });

      it('shows Barcode field', () => {
        cy.findByLabelText('Barcode').should('be.visible');
      });
      it('shows other fields', () => {
        checkBlockProcessingFields();
      });
    });
    context('when entering an invalid value in Barcode field', () => {
      before(() => {
        cy.findAllByLabelText('Barcode').last().type('Barcode1').blur();
      });
      it('should display an error message', () => {
        cy.findByText('Barcode should be in the format with two letters followed by 8 numbers').should('be.visible');
      });
      after(() => {
        cy.findByText('Delete Layout').click();
      });
    });

    context('when adding labware other than Prebarcoded tube', () => {
      before(() => {
        addLabware('Tube');
      });

      it('should not show Barcode field', () => {
        cy.findByLabelText('Barcode').should('not.exist');
      });
      it('shows other fields', () => {
        checkBlockProcessingFields();
      });
    });
  });

  describe('Auto numbering of replicate numbers', () => {
    before(() => {
      cy.visit('/lab/original_sample_processing?type=block');
    });
    context('when adding grouped labware for replicate number baed on original samples', () => {
      const sources = ['STAN-1111', 'STAN-2111', 'STAN-3111', 'STAN-4111'];
      before(() => {
        //Mock handler will ensure that they are grouped in two's
        sources.forEach((barcode) => {
          scanInput(barcode);
        });
        sources.forEach((barcode, indx) => {
          cy.findByText('+ Add Labware').click();
          cy.findAllByText('Edit Layout').eq(indx).click();
          cy.findByRole('dialog').within(() => {
            cy.findAllByText(barcode).first().click();
            cy.findByText('A1').click();
            cy.findByText('Done').click();
          });
        });
      });

      it('should autofill all replicate numbers consecutively based on original samples of source labware', () => {
        //they are randomly generated so we can't check the exact value
        cy.findAllByLabelText('Replicate Number').eq(0).should('not.have.value', '').and('be.disabled');
        cy.findAllByLabelText('Replicate Number').eq(1).should('not.have.value', '').and('be.disabled');
        cy.findAllByLabelText('Replicate Number').eq(2).should('not.have.value', '').and('be.disabled');
        cy.findAllByLabelText('Replicate Number').eq(3).should('not.have.value', '').and('be.disabled');
      });
    });
    context('when adding multiple labware with same source labware', () => {
      before(() => {
        cy.findByText('+ Add Labware').click();
        cy.findAllByText('Edit Layout').eq(4).click();
        cy.findByRole('dialog').within(() => {
          cy.findByText('STAN-1111').click();
          cy.findByText('A1').click();
          cy.findByText('Done').click();
        });
      });
      it('should autofill all replicate numbers so that it continues the sequence of source labware', () => {
        cy.findAllByLabelText('Replicate Number').eq(4).should('not.have.value', '').and('be.disabled');
      });
    });
    context('when adding a labware with a source labware that does not hold a replicate number', () => {
      before(() => {
        const tissue = tissueFactory.build({ replicate: null });
        const sample = sampleFactory.build({ tissue: tissue });
        createLabwareFromParams({ barcode: 'STAN-5555', slots: [slotFactory.build({ samples: [sample] })] });
        cy.visit('/lab/original_sample_processing?type=block');
        scanInput('STAN-5555');
        cy.findByText('+ Add Labware').click();
        cy.findByText('Edit Layout').click();
        cy.findByRole('dialog').within(() => {
          cy.findAllByText('STAN-5555').eq(0).click();
          cy.findByText('A1').click();
          cy.findByText('Done').click();
        });
      });
      it('replicate number field should be empty and enabled', () => {
        cy.findByLabelText('Replicate Number').should('have.value', '').and('be.enabled');
      });
    });
  });
  describe('Leaving page', () => {
    context('when I try and leave the page', () => {
      it('shows a confirm box', () => {
        cy.on('window:confirm', (str) => {
          expect(str).to.equal('You have unsaved changes. Are you sure you want to leave?');
          // Returning false cancels the event
          return false;
        });

        cy.findByText('Search').click();
      });
    });
  });
  describe('Save button', () => {
    context('When fields not filled in', () => {
      before(() => {
        cy.visit('/lab/original_sample_processing?type=block');
        scanInput('STAN-113');
        addLabware('Tube');
        selectOption('workNumber', '');
        cy.findByTestId('Replicate Number').click();
        selectOption('comments', '');
      });
      it('Shows error for replicate number', () => {
        cy.findByText('Replicate number is required').should('be.visible');
      });
      it('Shows error for SGP Number', () => {
        cy.findByText('SGP number is required').should('be.visible');
      });
    });
  });
  describe('API Requests', () => {
    context('when request is successful', () => {
      context('when I click Save', () => {
        before(() => {
          cy.visit('/lab/original_sample_processing?type=block');
          // Store the barcode of the created labware
          cy.msw().then(({ worker, graphql }) => {
            const newLabware = [LabwareTypeName.TUBE, LabwareTypeName.PRE_BARCODED_TUBE].map((type) => {
              const labwareType = labwareTypeInstances.find((lt) => lt.name === type);
              const barcode = 'Dest-STAN-111';
              return labwareFactory.build({ labwareType, barcode });
            });
            worker.use(
              graphql.mutation<PerformTissueBlockMutation, PerformTissueBlockMutationVariables>(
                'PerformTissueBlock',
                () => {
                  return HttpResponse.json({
                    data: {
                      performTissueBlock: {
                        labware: newLabware,
                        operations: []
                      }
                    }
                  });
                }
              )
            );
          });
          scanInput('STAN-113');
          addLabware('Tube');
          selectSource();
          addLabware('Prebarcoded tube');
          cy.findAllByText('Barcode').last().type('FF10153223');
          cy.findAllByText('Edit Layout').last().click();
          cy.findByRole('dialog').within(() => {
            cy.findByText('STAN-113').click();
            cy.findByText('A1').click();
            cy.findByText('Done').click();
          });

          selectSGPNumber('SGP1008');
          cy.findByRole('button', { name: /Save/i }).click();
        });
        it('displays Block labware generation', () => {
          cy.findByText('Block labware generation complete').should('be.visible');
          cy.findByRole('table').should('exist');
        });

        it('displays the table column headers in correct order', () => {
          ['Barcode', 'Labware Type', 'Fixative', 'Donor ID', 'Tissue type', 'Spatial location', 'Replicate'].forEach(
            (val, indx) => {
              cy.get('th').eq(indx).contains(val);
            }
          );
        });

        it('should not display all destination labware except Pre-barcoded Tube', function () {
          cy.findAllByText('Dest-STAN-111').its('length').should('be.gte', 1);
        });
      });

      context('Printing labels', () => {
        before(() => {
          printLabels();
        });

        it('shows a success message for print', () => {
          cy.findByText(/Tube Printer successfully printed/).should('exist');
        });
      });
    });

    context('when request is unsuccessful', () => {
      before(() => {
        cy.visit('/lab/original_sample_processing?type=block');
        scanInput('STAN-113');
        addLabware('Tube');
        selectSource();
        selectSGPNumber('SGP1008');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<PerformTissueBlockMutation, PerformTissueBlockMutationVariables>(
              'PerformTissueBlock',
              () => {
                return HttpResponse.json({
                  errors: [
                    {
                      extensions: {
                        problems: ['This thing went wrong', 'This other thing went wrong']
                      }
                    }
                  ]
                });
              }
            )
          );
        });
        cy.findByRole('button', { name: /Save/i }).click();
      });

      it('shows the errors', () => {
        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });
    });
  });
});
function checkBlockProcessingFields() {
  cy.findByLabelText('Replicate Number').should('be.visible');
  cy.findByLabelText('Labware generation comments').should('be.visible');
}

function scanInput(barcode: string) {
  cy.get('#labwareScanInput').type(`${barcode}{enter}`);
}
function addLabware(labwareType: string) {
  selectOption('labwareType', labwareType);
  cy.findByText('+ Add Labware').click();
}

function selectSource() {
  cy.findByText('Edit Layout').click();
  cy.findByRole('dialog').within(() => {
    cy.findByText('STAN-113').click();
    cy.findByText('A1').click();
    cy.findByText('Done').click();
  });
}

function printLabels() {
  cy.findByLabelText('printers').select('Tube Printer');
  cy.findByText('Print Labels').click();
}
