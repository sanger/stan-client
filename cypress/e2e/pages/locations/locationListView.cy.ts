import { GetLabwareInLocationQuery, GetLabwareInLocationQueryVariables } from '../../../../src/types/sdk';
import { buildLabwareFragment } from '../../../../src/lib/helpers/labwareHelper';
import { createLabware } from '../../../../src/mocks/handlers/labwareHandlers';

describe('Location - List View', () => {
  const labwaresBarcodes: string[] = [...Array(6).map((_, indx) => `STAN-100${indx + 1}`), 'STAN-2001'];
  before(() => {
    cy.visit('/locations/STO-014');
    cy.msw().then(({ worker, graphql }) => {
      worker.use(
        graphql.query<GetLabwareInLocationQuery, GetLabwareInLocationQueryVariables>(
          'GetLabwareInLocation',
          (req, res, ctx) => {
            // The number after STAN- determines what kind of labware will be returned
            const labwares = [...labwaresBarcodes].map((barcode) => {
              const labware = createLabware(barcode);
              sessionStorage.setItem(`labware-${labware.barcode}`, JSON.stringify(labware));
              return buildLabwareFragment(labware);
            });

            const payload: GetLabwareInLocationQuery = {
              labwareInLocation: labwares
            };
            return res(ctx.data(payload));
          }
        )
      );
    });
  });

  it('shows stored items', () => {
    for (let i = 1; i <= 6; i++) {
      cy.findByText(`STAN-100${i}`).should('be.visible');
    }
    it('shows a table with details of all stored items', () => {
      cy.findByTestId('labware-table').should('exist');
      cy.findByTestId('labware-table').within((elem) => {
        ['Address', 'Barcode', 'External Identifier', 'Donor', 'Spatial Location', 'Replicate'].forEach((colName) => {
          cy.get(`th:contains('${colName}')`).should('exist');
        });
        [...labwaresBarcodes].forEach(() => cy.wrap(elem).find('tr').get(`td:contains(STAN-1001)`).should('exist'));
      });
    });
  });

  context('when scanning in a labware barcode', () => {
    before(() => {
      cy.findByPlaceholderText('Labware barcode...').type('STAN-2001{enter}');
    });

    it('stores the barcode', () => {
      cy.findByPlaceholderText('Labware barcode...').should('exist');
      cy.findByText(`STAN-2001`).should('be.visible');
    });

    it('displays a success message', () => {
      cy.findByText('Barcode successfully stored').should('be.visible');
    });

    it('sets the ScanInput to empty', () => {
      cy.findByPlaceholderText('Labware barcode...').should('have.value', '');
    });
  });

  context('when clicking the cross next to an item barcode', () => {
    before(() => {
      cy.findAllByTestId('removeButton').first().click();
    });

    it('shows a confirmation modal', () => {
      cy.findByTextContent(
        'Are you sure you want to remove STAN-1001 from Box 1 in Rack 1 in Freezer 1 in Room 1234?'
      ).should('exist');
    });

    context('when confirming', () => {
      before(() => {
        cy.findByRole('button', { name: /Unstore Barcode/i }).click();
      });

      it('unstores the barcode', () => {
        cy.findByText('STAN-1001').should('not.exist');
      });

      it('displays a success message', () => {
        cy.findByText('Barcode successfully unstored').should('be.visible');
      });
    });
  });
});
