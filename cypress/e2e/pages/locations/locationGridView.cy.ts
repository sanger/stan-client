import { GetLabwareInLocationQuery, GetLabwareInLocationQueryVariables } from '../../../../src/types/sdk';
import { createLabware } from '../../../../src/mocks/handlers/labwareHandlers';
import { buildLabwareFragment } from '../../../../src/lib/helpers/labwareHelper';
import { HttpResponse } from 'msw';

describe('Location Grid View', () => {
  before(() => {
    cy.visit('/locations/STO-021');
  });

  it('selects the first available address', () => {
    cy.findByText('Selected Address: 1').should('exist');
  });

  context('when scanning in a barcode', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<GetLabwareInLocationQuery, GetLabwareInLocationQueryVariables>('GetLabwareInLocation', () => {
            // The number after STAN- determines what kind of labware will be returned
            const labwares = ['STAN-2001'].map((barcode) => {
              const labware = createLabware(barcode);
              sessionStorage.setItem(`labware-${labware.barcode}`, JSON.stringify(labware));
              return buildLabwareFragment(labware);
            });

            const payload: GetLabwareInLocationQuery = {
              labwareInLocation: labwares
            };
            return HttpResponse.json({ data: payload });
          })
        );
      });
      cy.findByPlaceholderText('Labware barcode...').type('STAN-2001{enter}');
    });

    it('stores it', () => {
      cy.findByText('STAN-2001').should('be.visible');
    });

    it('shows a success message', () => {
      cy.findByText('Barcode successfully stored').should('be.visible');
    });

    it('selects the next available address', () => {
      cy.findByText('Selected Address: 2').should('exist');
    });

    it('empties the value of the ScanInput', () => {
      cy.findByPlaceholderText('Labware barcode...').should('have.value', '');
    });
  });

  context('when selecting an occupied address', () => {
    before(() => {
      cy.findByText('STAN-2001').click();
    });

    it('shows a table with details of labware in the selected address', () => {
      cy.findByTestId('labware-table').should('exist');
      cy.findByTestId('labware-table').within((elem) => {
        ['Address', 'Barcode', 'External Identifier', 'Donor', 'Spatial Location', 'Replicate'].forEach((colName) => {
          cy.get(`th:contains('${colName}')`).should('exist');
        });
        cy.wrap(elem).find('tr').get(`td:contains(STAN-2001)`).should('exist');
      });
    });

    it('locks the ScanInput', () => {
      cy.findByPlaceholderText('Labware barcode...').should('be.disabled');
    });

    it('shows a delete button', () => {
      cy.findByTestId('selectedAddress').find('button').should('be.visible');
    });

    context('when clicking the button', () => {
      before(() => {
        cy.findByTestId('selectedAddress').find('button').click();
      });

      it('shows a confirmation modal', () => {
        cy.findByTextContent(
          'Are you sure you want to remove STAN-2001 from Box 4 in Rack 2 in Freezer 1 in Room 1234?'
        ).should('be.visible');
      });

      context('when confirming', () => {
        before(() => {
          cy.findByRole('button', { name: /Unstore Barcode/i }).click();
        });

        it('unstores the barcode', () => {
          cy.findByText('STAN-2001').should('not.exist');
        });

        it('shows a success message', () => {
          cy.findByText('Barcode successfully unstored').should('be.visible');
        });
      });
    });
  });
});
