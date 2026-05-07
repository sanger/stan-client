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
        scanInput('STAN-213');
      });

      it('Add labware button is enabled', () => {
        cy.findByText('+ Add Labware').should('not.be.disabled');
      });
    });
  });
  describe('Source labware table', () => {
    context('when destination labware is added', () => {
      it(' disables scan labware input', () => {
        cy.findByText('+ Add Labware').click({ force: true });
        cy.get('#labwareScanInput').should('be.disabled');
      });

      context('when destination labware becomes empty again', () => {
        it('re-enables scan labware input', () => {
          cy.findByText('Delete Layout').click({ force: true });
          cy.get('#labwareScanInput').should('not.be.disabled');
        });
      });
    });
  });
  describe('Multi sample Proviasette block', () => {
    context('when adding a Proviasette', () => {
      after(() => {
        cy.findAllByText('Delete Layout').first().click({ force: true });
      });
      describe('when adding different sources to different slots', () => {
        it('adds a source row for each selected source', () => {
          addLabware('Proviasette', '1');
          editLayout(0, ['STAN-113', 'STAN-213'], ['A1', 'B1']);

          cy.findByTestId('planned-source-table').within(() => {
            cy.findByText('STAN-113').should('exist');
            cy.findByText('STAN-213').should('exist');
          });
        });
      });
    });
  });
  describe('Adding multiple labware', () => {
    it('should display two Tubes', () => {
      addLabware('Tube', '2');

      cy.findByTestId(`divSection-Tube`).within(() => {
        cy.findAllByTestId('plan').should('have.length', 2);
      });
    });
  });

  describe('Labware Layout', () => {
    context('when labware layout is added', () => {
      context('when editing a layout', () => {
        it('should display STAN-113', () => {
          editLayout(0, ['STAN-113'], ['A1']);

          cy.findAllByTestId('planned-source-table')
            .first()
            .within(() => {
              cy.findByText('STAN-113').should('exist');
            });
        });
      });

      context('when removing a layout', () => {
        it('removes the panel', () => {
          removeLayout();

          cy.findByTestId(`divSection-Tube`).within(() => {
            cy.findAllByTestId('plan').should('have.length', 1);
          });
        });
        after(() => {
          cy.findByText('Delete Layout').click({ force: true });
        });
      });
    });
  });

  describe('Prebarcoded tube', () => {
    context('when adding a Prebarcoded tube', () => {
      it('shows Barcode field', () => {
        addLabware('Prebarcoded tube', '1');
        cy.findByLabelText('Barcode').should('be.visible');
      });
      it('shows other fields', () => {
        checkBlockProcessingFields();
      });
    });
    context('when entering an invalid value in Barcode field', () => {
      it('should display an error message', () => {
        cy.findAllByLabelText('Barcode').last().type('Barcode1').blur();
        cy.findByText('Barcode should be two letters followed by 8 numbers').should('be.visible');
      });
      after(() => {
        cy.findByText('Delete Layout').click({ force: true });
      });
    });

    context('when adding labware other than Prebarcoded tube', () => {
      it('should not show Barcode field', () => {
        addLabware('Tube');
        cy.findByLabelText('Barcode').should('not.exist');
      });
      it('shows other fields', () => {
        checkBlockProcessingFields();
      });
    });
  });

  describe('Auto numbering of replicate numbers', () => {
    before(() => {
      cy.reload();
    });
    context('when adding grouped labware for replicate number based on original samples', () => {
      it('should autofill all replicate numbers consecutively based on original samples of source labware', () => {
        //Mock handler will ensure that they are grouped in two's
        const sources = ['STAN-1111', 'STAN-2111', 'STAN-3111', 'STAN-4111'];
        sources.forEach((barcode) => {
          scanInput(barcode);
        });
        sources.forEach((barcode, indx) => {
          cy.findByText('+ Add Labware').click({ force: true });
          editLayout(indx, [barcode], ['A1']);
        });

        //they are randomly generated so we can't check the exact value
        cy.findAllByTestId('replicate-number')
          .should('have.length', 4)
          .then(($inputs) => {
            // Wait for all to be populated first
            cy.wrap($inputs.eq(0)).should('not.have.value', '').and('be.disabled');
            cy.wrap($inputs.eq(1)).should('not.have.value', '').and('be.disabled');
            cy.wrap($inputs.eq(2)).should('not.have.value', '').and('be.disabled');
            cy.wrap($inputs.eq(3)).should('not.have.value', '').and('be.disabled');
          });
      });
    });
    context('when adding multiple labware with same source labware', () => {
      it('should autofill all replicate numbers so that it continues the sequence of source labware', () => {
        cy.findByText('+ Add Labware').click({ force: true });
        editLayout(4, ['STAN-1111'], ['A1']);
        cy.findAllByTestId('replicate-number').eq(4).should('not.have.value', '').and('be.disabled');
      });
    });
    context('when adding a labware with a source labware that does not hold a replicate number', () => {
      it('replicate number field should be empty and enabled', () => {
        const tissue = tissueFactory.build({ replicate: null });
        const sample = sampleFactory.build({ tissue: tissue });
        createLabwareFromParams({ barcode: 'STAN-5555', slots: [slotFactory.build({ samples: [sample] })] });
        cy.reload();
        scanInput('STAN-5555');
        cy.findByText('+ Add Labware').click({ force: true });
        editLayout(0, ['STAN-5555'], ['A1']);

        cy.findAllByTestId('replicate-number').should('have.value', '').and('be.enabled');
      });
    });
  });
  describe('Leaving page', () => {
    context('when I try and leave the page', () => {
      after(() => {
        cy.findByRole('button', { name: /Cancel/i }).click({ force: true });
      });
      it('shows a confirm box', () => {
        cy.findByText('Search').click({ force: true });
        cy.on('window:confirm', (str) => {
          expect(str).to.equal('You have unsaved changes. Are you sure you want to leave?');
          // Returning false cancels the event
          return false;
        });
      });
    });
  });
  describe('Save button', () => {
    context('When fields not filled in', () => {
      it('Shows error for SGP Number', () => {
        selectOption('workNumber', '');
        // blur from the work number without selecting
        cy.findByTestId('workNumber').within(() => {
          cy.findByRole('combobox').blur();
        });
        cy.findByText('SGP number is required').should('be.visible');
      });
    });
  });
  describe('API Requests', () => {
    context('when request is successful', () => {
      context('when I click Save', () => {
        before(() => {
          cy.reload();
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
        });
        it('displays Block labware generation', () => {
          fillInTheForm();

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

        it('should display all destination labware', () => {
          cy.findAllByText('Dest-STAN-111').should('have.length', 2);
        });
      });

      context('Printing labels', () => {
        it('shows a success message for print', () => {
          printLabels();
          cy.findByText(/Tube Printer successfully printed/).should('exist');
        });
      });
    });

    context('when request is unsuccessful', () => {
      before(() => {
        cy.reload();

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
      });

      it('shows the errors', () => {
        fillInTheForm();

        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });
    });
  });
});
function checkBlockProcessingFields() {
  cy.findByText('Replicate Number').should('be.visible');
  cy.findByText('Labware generation comments').should('be.visible');
}

function scanInput(barcode: string) {
  cy.get('#labwareScanInput').type(`${barcode}{enter}`);
}
function addLabware(labwareType: string, numberOfLabware = '1') {
  selectOption('labwareType', labwareType);
  cy.findByTestId('numLabware').type('{selectall}').type(numberOfLabware);
  cy.findByText('+ Add Labware').click({ force: true });
}

const editLayout = (layoutIndex: number, sourcesBarcode: Array<string>, addresses: Array<string>) => {
  cy.findAllByText('Edit Layout').eq(layoutIndex).click({ force: true });
  cy.findByRole('dialog').within(() => {
    sourcesBarcode.forEach((sourceBarcode, indx) => {
      cy.findAllByText(sourceBarcode).first().click({ force: true });
      cy.findByText(addresses[indx]).click({ force: true });
    });
    cy.findByText('Done').click({ force: true });
  });
};

function printLabels() {
  cy.findByLabelText('printers').select('Tube Printer');
  cy.findByText('Print Labels').click({ force: true });
}

const removeLayout = () => {
  cy.findAllByTestId('plan')
    .first()
    .within(() => {
      cy.findByRole('button', { name: /Delete Layout/i }).click({ force: true });
    });
};

const fillInTheForm = () => {
  selectSGPNumber('SGP1008');
  scanInput('STAN-113');
  addLabware('Tube');
  editLayout(0, ['STAN-113'], ['A1']);
  addLabware('Prebarcoded tube');
  cy.findAllByText('Barcode').last().type('FF10153223');
  editLayout(1, ['STAN-113'], ['A1']);

  cy.findByRole('button', { name: /Save/i }).click({ force: true });
};
