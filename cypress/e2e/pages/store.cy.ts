import {
  FindLabwareLocationQuery,
  FindLabwareLocationQueryVariables,
  FindLocationByBarcodeQuery,
  FindLocationByBarcodeQueryVariables,
  TransferLocationItemsMutation,
  TransferLocationItemsMutationVariables
} from '../../../src/types/sdk';
import { setAwaitingLabwareInSessionStorage } from '../shared/awaitingStorage.cy';
import { locationResponse } from '../../../src/mocks/handlers/locationHandlers';
import { locationRepository } from '../../../src/mocks/repositories/locationRepository';
import { HttpResponse } from 'msw';

describe('Store', () => {
  describe('Location search', () => {
    context('when the location is found', () => {
      before(() => {
        cy.visit('/store');
        cy.findByLabelText('Find Location:').should('be.visible').type('STO-001F{enter}');
      });

      it("takes you to that location's page", () => {
        cy.location('pathname').should('eq', '/locations/STO-001F');
        cy.findByText('Location STO-001F could not be found').should('not.exist');
      });
    });

    context('when the location is not found', () => {
      before(() => {
        cy.visit('/store');
        cy.findByLabelText('Find Location:').should('be.visible').type('FAKE-LOCATION{enter}');
      });

      it('displays an error', () => {
        cy.location('pathname').should('eq', '/locations/FAKE-LOCATION');
        cy.findByText('There was an error while trying to load the page. Please try again.').should('be.visible');
      });
    });
  });

  describe('Labware search', () => {
    context('when the labware is found', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>('FindLabwareLocation', () => {
              return HttpResponse.json({
                data: {
                  stored: [
                    {
                      location: {
                        barcode: 'STO-015'
                      }
                    }
                  ]
                }
              });
            })
          );
        });

        cy.visit('/store');
        cy.findByLabelText('Find Labware:').should('be.visible').type('STAN-1007{enter}');
      });

      it('takes you to the location where the labware is stored', () => {
        cy.location('pathname').should('eq', '/locations/STO-015');
        cy.location('search').should('eq', '?labwareBarcode=STAN-1007');
      });

      it('displays which address the labware is in (if any)', () => {
        cy.findByTextContent('Labware STAN-1007 is in address 1').should('be.visible');
      });
    });

    context('when the labware is not found', () => {
      before(() => {
        cy.visit('/store');
        cy.findByLabelText('Find Labware:').type('FAKE-LABWARE{enter}');
      });

      it('displays an error on the store page', () => {
        cy.findByText('FAKE-LABWARE could not be found in storage');
      });
    });
  });

  describe('when awaiting labwares are in session storage', () => {
    before(() => {
      setAwaitingLabwareInSessionStorage();
      cy.visit('/store');
    });

    it('store all button should be disabled', () => {
      cy.findByRole('button', { name: /Store All/i }).should('be.disabled');
    });
    it('should display a table with labware information', () => {
      cy.findByRole('table').get('th').should('have.length', 8);
      cy.findByRole('table').get('th').eq(0).should('have.text', 'Barcode');
      cy.findByRole('table').get('th').eq(1).should('have.text', 'Labware Type');
      cy.findByRole('table').get('th').eq(2).should('have.text', 'External Identifier');
      cy.findByRole('table').get('th').eq(3).should('have.text', 'Donor');
      cy.findByRole('table').get('th').eq(4).should('have.text', 'Tissue Type');
      cy.findByRole('table').get('th').eq(5).should('have.text', 'Spatial Location');
      cy.findByRole('table').get('th').eq(6).should('have.text', 'Replicate');
    });
    after(() => {
      sessionStorage.removeItem('awaitingLabwares');
    });
  });

  describe('transferring items in storage', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>(
            'FindLocationByBarcode',
            ({ variables }) => {
              const location = locationRepository.findByBarcode(variables.barcode);
              return HttpResponse.json({
                data: {
                  location: { ...locationResponse(location!), children: [] }
                }
              });
            }
          )
        );
      });
      cy.visit('/locations/STO-014');
    });
    it('should display transfer items option', () => {
      cy.findByText('Transfer items from location').should('be.visible');
    });
    it('should disable transfer button', () => {
      cy.findByRole('button', { name: 'Transfer' }).should('be.disabled');
    });

    context('while entering source location barcode for transfer', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>(
              'FindLocationByBarcode',
              ({ variables }) => {
                const location = locationRepository.findByBarcode(variables.barcode);
                return HttpResponse.json({
                  data: {
                    location: { ...locationResponse(location!), customName: 'STO-014 location' }
                  }
                });
              }
            )
          );
        });
        cy.get('[id=source_barcode]').type('STO-014{enter}');
      });

      it('should display description', () => {
        cy.findByTestId('transfer-source-description').should('contain.text', 'STO-014 location');
      });
      context('Error on transfer', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<TransferLocationItemsMutation, TransferLocationItemsMutationVariables>(
                'TransferLocationItems',
                () => {
                  return HttpResponse.json({
                    errors: [
                      {
                        message: 'Exception while fetching data : The operation could not be validated.',
                        extensions: {
                          problems: []
                        }
                      }
                    ]
                  });
                }
              )
            );
          });
          cy.findByRole('button', { name: 'Transfer' }).click();
        });
        it('should display error message', () => {
          cy.contains('The operation could not be validated.').should('be.visible');
        });
      });
      context('On successful transfer', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            const location = locationRepository.findByBarcode('STO-014');
            worker.use(
              graphql.mutation<TransferLocationItemsMutation, TransferLocationItemsMutationVariables>(
                'TransferLocationItems',
                () => {
                  return HttpResponse.json({
                    data: {
                      transfer: {
                        ...locationResponse(location!),
                        children: [],
                        stored: [
                          { barcode: 'STAN-1011', address: 'A1' },
                          { barcode: 'STAN-1022', address: 'A2' }
                        ]
                      }
                    }
                  });
                }
              )
            );
          });
          cy.findByRole('button', { name: 'Transfer' }).click();
        });
        it('should display success message', () => {
          cy.contains('All items transferred from STO-014').should('be.visible');
        });
        it('should display transferred items', () => {
          cy.findByText('STAN-1011').should('be.visible');
          cy.findByText('STAN-1022').should('be.visible');
        });
      });
    });
  });
});
