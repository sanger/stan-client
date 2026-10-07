import { selectOption, selectSGPNumber, shouldBeDisabled, shouldBeEnabled } from '../shared/customReactSelect.cy';
import {
  FindMeasurementByBarcodeAndNameQuery,
  FindMeasurementByBarcodeAndNameQueryVariables,
  FindReagentPlateQuery,
  FindReagentPlateQueryVariables,
  PerformLibraryConstructionMutation,
  PerformLibraryConstructionMutationVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';
import ReagentPlateFactory from '../../../src/lib/factories/reagentPlateFactory';

const removeReagentPlate = () => {
  cy.findByTestId('reagent-plate-div').within(() => {
    cy.findByTestId('removeButton').click();
  });
};

const removeDestinationLabware = () => {
  cy.findByTestId('destination-labware-div').within(() => {
    cy.findByTestId('removeButton').click();
  });
};

const transferReagent = ({
  reagentPlateBarcode,
  reagentAddress,
  destinationLabwareBarcode,
  destinationAddress
}: {
  reagentPlateBarcode: string;
  reagentAddress: string;
  destinationLabwareBarcode: string;
  destinationAddress: string;
}) => {
  cy.findByTestId(`labware-${reagentPlateBarcode}`).within(() => {
    cy.findByText(reagentAddress).wait(1000).click({ force: true });
  });
  cy.findByTestId(`labware-${destinationLabwareBarcode}`).within(() => {
    cy.findByText(destinationAddress).wait(1000).click({ force: true });
  });
};

describe('Visium 3 Library Construction', () => {
  before(() => cy.visit('/lab/libraryConstruction'));

  describe('Reagent Transfer Step', () => {
    describe('Dual Index Plate', () => {
      describe('On page load', () => {
        it('disables dual index plate scanner', () => {
          cy.findByTestId('source-scan-input').should('be.disabled');
        });
        it('enables the plate type select box', () => {
          shouldBeEnabled('source-plate-type');
        });
        describe('on selecting the plate type', () => {
          before(() => {
            selectOption('source-plate-type', 'Dual Index TT Set A');
          });
          it('enables dual index plate scanner once the plate type is selected', () => {
            cy.findByTestId('source-scan-input').should('be.enabled');
          });
        });
      });
      describe('on scanning dual index plate', () => {
        describe('when scanning a dual index plate not in the system', () => {
          before(() => {
            cy.msw().then(({ worker, graphql }) => {
              worker.use(
                graphql.query<FindReagentPlateQuery, FindReagentPlateQueryVariables>('FindReagentPlate', () => {
                  return HttpResponse.json({
                    data: {
                      reagentPlate: null
                    }
                  });
                })
              );
            });
            cy.findByTestId('source-scan-input').type('543767897643212345678652{enter}');
          });
          it('shows a warning message', () => {
            cy.findByText('Reagent plate with barcode 543767897643212345678652 not found').should('be.visible');
          });
          it('displays the dual index plate layout', () => {
            cy.findByTestId('labware-543767897643212345678652').should('be.visible');
          });
        });
        describe('when scanning a TS SET A dual index plate', () => {
          before(() => {
            removeReagentPlate();
            cy.findByTestId('labware-543767897643212345678652').should('not.exist');
            cy.msw().then(({ worker, graphql }) => {
              worker.use(
                graphql.query<FindReagentPlateQuery, FindReagentPlateQueryVariables>('FindReagentPlate', () => {
                  return HttpResponse.json({
                    data: {
                      reagentPlate: ReagentPlateFactory.build({
                        barcode: '543767897643212345678653',
                        plateType: 'Dual Index TS Set A'
                      })
                    }
                  });
                })
              );
            });
            cy.findByTestId('source-scan-input').clear().type('543767897643212345678653{enter}');
          });
          it('shows a warning message', () => {
            cy.findByText(
              'Reagent plate with barcode 543767897643212345678653 is not of type Dual Index TT Set A. Found Dual Index TS Set A instead.'
            ).should('be.visible');
          });
          it('displays the dual index plate layout', () => {
            cy.findByTestId('labware-543767897643212345678653').should('be.visible');
          });
        });
      });
    });
    describe('Destination Labware', () => {
      describe('On page load', () => {
        it('disables labware SGP number', () => {
          shouldBeDisabled('workNumber');
        });
        describe('on scanning a destination labware', () => {
          before(() => {
            cy.get('#labwareScanInput').type('STAN-03122{enter}');
          });
          it('enables labware SGP number', () => {
            shouldBeEnabled('workNumber');
          });
        });
      });
      describe('accepts multiple destination labware', () => {
        before(() => {
          selectSGPNumber('SGP1009');
          cy.get('#labwareScanInput').type('STAN-03123{enter}');
          selectSGPNumber('SGP1010');
          cy.get('#labwareScanInput').type('STAN-03124{enter}');
          selectSGPNumber('SGP1011');
        });
        after(() => {
          removeDestinationLabware();
          removeDestinationLabware();
        });
        it('displays last labware scanned', () => {
          cy.findByTestId('labware-STAN-03124').should('be.visible');
        });

        it('enables the user the paginate through all the destination labware', () => {
          cy.findByTestId('left-button').should('be.visible');
          cy.findByTestId('right-button').should('be.visible');
        });
      });
    });
    describe('Reagent transfer', () => {
      describe('When transferring reagents', () => {
        before(() => {
          transferReagent({
            reagentPlateBarcode: '543767897643212345678653',
            reagentAddress: 'A2',
            destinationLabwareBarcode: 'STAN-03122',
            destinationAddress: 'D1'
          });
          transferReagent({
            reagentPlateBarcode: '543767897643212345678653',
            reagentAddress: 'A3',
            destinationLabwareBarcode: 'STAN-03122',
            destinationAddress: 'C1'
          });
          transferReagent({
            reagentPlateBarcode: '543767897643212345678653',
            reagentAddress: 'A4',
            destinationLabwareBarcode: 'STAN-03122',
            destinationAddress: 'B1'
          });
          transferReagent({
            reagentPlateBarcode: '543767897643212345678653',
            reagentAddress: 'A5',
            destinationLabwareBarcode: 'STAN-03122',
            destinationAddress: 'A1'
          });
        });
        it('disables the reagent slot after transferring', () => {
          cy.findByTestId('labware-543767897643212345678653').within(() => {
            cy.findByText('A2').should('not.have.class', 'bg-green-500'); //bg-green-300
            cy.findByText('A3').should('not.have.class', 'bg-green-500');
            cy.findByText('A4').should('not.have.class', 'bg-green-500');
            cy.findByText('A5').should('not.have.class', 'bg-green-500');
          });
        });
        it('shows the transferred reagents on the destination labware', () => {
          cy.findByTestId('labware-STAN-03122').within(() => {
            cy.findByText('A1').parent().should('have.class', 'bg-green-500');
            cy.findByText('B1').parent().should('have.class', 'bg-green-500');
            cy.findByText('C1').parent().should('have.class', 'bg-green-500');
            cy.findByText('D1').parent().should('have.class', 'bg-green-500');
          });
        });
        it('shows the transferred reagent in the reagent transfer table', () => {
          cy.findByTestId('reagent-transfer-table').within(() => {
            cy.get('tbody tr').should('have.length', 4);
          });
        });
        it('enables `Record Cycle` button', () => {
          cy.findByTestId('record-cycle-button').should('be.enabled');
        });
      });
      describe('When undoing the transferred reagents', () => {
        before(() => {
          cy.findByTestId('remove-mapping-STAN-03122-A1').click();
        });
        it('removes the transferred reagent from the reagent transfer table', () => {
          cy.findByTestId('reagent-transfer-table').within(() => {
            cy.get('tbody tr').should('have.length', 3);
          });
        });
        it('resets the destination labware layout', () => {
          cy.findByTestId('labware-STAN-03122').within(() => {
            cy.findByText('A1').parent().should('not.have.class', 'bg-green-500');
          });
        });
        it('reactivates the reagent slot', () => {
          cy.findByTestId('labware-543767897643212345678653').within(() => {
            cy.findByText('A5').parent().should('have.class', 'bg-green-500');
          });
        });
      });
    });
  });

  describe('Record Cycles Step', () => {
    describe('When destination labware does not have cDNA concentration records', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindMeasurementByBarcodeAndNameQuery, FindMeasurementByBarcodeAndNameQueryVariables>(
              'FindMeasurementByBarcodeAndName',
              () => {
                return HttpResponse.json({
                  data: {
                    measurementValueFromLabwareOrParent: []
                  }
                });
              }
            )
          );
        });
        cy.findByTestId('record-cycle-button').click();
      });
      it('shows a warning message', () => {
        cy.findByText('No cDNA concentration measurement found for barcode: STAN-03122').should('be.visible');
      });
    });
    describe('Record cycles page', () => {
      it('displays destination labware with the transferred reagents', () => {
        cy.findByTestId('labware-STAN-03122').within(() => {
          cy.findByText('A1').parent().should('have.class', 'bg-sdb-300');
          cy.findByText('B1').parent().should('have.class', 'bg-green-500');
          cy.findByText('C1').parent().should('have.class', 'bg-green-500');
          cy.findByText('D1').parent().should('have.class', 'bg-green-500');
        });
      });
      it('displays cDNA concentration of the destination labware slots with the transferred reagent', () => {
        cy.findByRole('table').within(() => {
          cy.get('tbody tr').should('have.length', 3);
        });
      });
      it('enables the user to go back to reagent transfer step', () => {
        cy.findByTestId('reagent-transfer-button').should('be.enabled');
      });
    });
    describe('When the form is missing required fields', () => {
      it('shows a validation error message', () => {
        cy.findByText('Please fix the following errors to be able to submit the form:').should('be.visible');
      });
      it('disables the submit button', () => {
        cy.findByTestId('submit-button').should('be.disabled');
      });
    });
    describe('When filling the cycles ', () => {
      before(() => {
        cy.findAllByTestId('cycles-input').then(($inputs) => {
          const count = $inputs.length;
          for (let index = 0; index < count; index++) {
            cy.findAllByTestId('cycles-input')
              .eq(index)
              .type(String(index + 1));
          }
        });
      });

      it('enables the submit button', () => {
        cy.findByTestId('submit-button').should('be.enabled');
      });
    });

    describe('On submit ', () => {
      describe('On server errors ', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<PerformLibraryConstructionMutation, PerformLibraryConstructionMutationVariables>(
                'PerformLibraryConstruction',
                () => {
                  return HttpResponse.json({
                    errors: [
                      {
                        extensions: {
                          problems: ['Some server error occurred']
                        }
                      }
                    ]
                  });
                }
              )
            );
          });
          cy.findByTestId('submit-button').click();
        });
        it('shows server errors', () => {
          cy.findByText('Some server error occurred').should('be.visible');
        });
      });
      describe('On server success ', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<PerformLibraryConstructionMutation, PerformLibraryConstructionMutationVariables>(
                'PerformLibraryConstruction',
                () => {
                  return HttpResponse.json({
                    data: {
                      libraryCon: {
                        operations: []
                      }
                    }
                  });
                }
              )
            );
          });
          cy.findByTestId('submit-button').click();
        });
        it('shows successful message', () => {
          cy.findByText('Library Construction operation completed successfully').should('be.visible');
        });
      });
    });
  });
});
