import { FindQuery, FindQueryVariables } from '../../../src/types/sdk';
import { buildFindResult } from '../../../src/mocks/handlers/findHandlers';

describe('Search', () => {
  context('when URL query params are set', () => {
    before(() => {
      cy.visit(
        '/search?donorName=DNR123&labwareBarcode=STAN-0001F&tissueExternalName=EXT987&tissueTypeName=Tissue Type 1&workNumber=SGP1008' +
          '&createdMin=2021-07-01&createdMax=2021-07-31'
      );
    });

    it('will set the inputs as values from the query parameters', () => {
      cy.findByLabelText('STAN Barcode').should('have.value', 'STAN-0001F');
      cy.findByLabelText('External Identifier').should('have.value', 'EXT987');
      cy.findByLabelText('Donor ID').should('have.value', 'DNR123');
      cy.contains('Tissue Type 1').should('be.visible');
      cy.contains('SGP Number').should('be.visible');
      cy.findByLabelText('Created After').should('have.value', '2021-07-01');
      cy.findByLabelText('Created Before').should('have.value', '2021-07-31');
    });

    it('should display view panel ', () => {
      cy.findByTestId('view').should('exist');
      cy.get('[type="radio"]').first().should('be.checked');
    });
    it('will perform a search immediately', () => {
      cy.findByRole('table').should('be.visible');
      it('should display all records table', () => {
        cy.findByRole('table').get('th').should('have.length', 11);
        [
          'Barcode',
          'Created',
          'Labware Type',
          'SGP Numbers',
          'External ID',
          'Donor ID',
          'Tissue Type',
          'Section Number',
          'Replicate',
          'Embedding Medium',
          'Location'
        ].forEach((text, index) => {
          cy.findByRole('table').get('th').eq(index).should('have.text', text);
        });
      });
    });
    context('when unique barcode view option is selected', () => {
      before(() => {
        cy.get('[type="radio"]').eq(1).check();
      });
      it('should display  unique barcode table', () => {
        cy.findByRole('table').get('th').should('have.length', 3);
        ['Barcode', 'Labware Type', 'Location'].forEach((text, index) => {
          cy.findByRole('table').get('th').eq(index).should('have.text', text);
        });
      });
    });

    context('when the Reset button is pressed', () => {
      before(() => {
        cy.findByRole('button', { name: /Reset/i }).click();
      });

      it('clears the search criteria', () => {
        cy.findByLabelText('STAN Barcode').should('have.value', '');
        cy.findByLabelText('External Identifier').should('have.value', '');
        cy.findByLabelText('Donor ID').should('have.value', '');
        cy.findByLabelText('Tissue Type').should('have.value', '');
        cy.findByLabelText('SGP Number').should('have.value', '');
        cy.findByLabelText('Created After').should('have.value', '');
        cy.findByLabelText('Created Before').should('have.value', '');
      });
    });
  });

  context('when URL query params are not set', () => {
    before(() => {
      cy.visit('/search');
    });

    it('will not perform a search immediately', () => {
      cy.findByRole('table').should('not.exist');
    });
    it('will show an info icon', () => {
      cy.findByTestId('info-icon').should('exist');
    });

    context(
      'when trying to search without a STAN Barcode, External Identifier, Donor ID, Tissue Type set or SGP Number',
      () => {
        before(() => {
          cy.findByRole('button', { name: /Search/i }).click();
        });

        it('will show an error', () => {
          cy.findByText(
            'At least one of STAN Barcode, External Identifier, Donor ID, Tissue Type or SGP Number must not be empty.'
          ).should('be.visible');
        });
      }
    );
    context('when a search has more results than the requested amount', () => {
      before(() => {
        cy.visit('/search');

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindQuery, FindQueryVariables>('Find', (req, res, ctx) => {
              return res(ctx.data({ find: buildFindResult(200, 150) }));
            })
          );
        });

        cy.findByLabelText('Donor ID').type('DNR123');
        cy.findByRole('button', { name: /Search/i }).click();
      });

      it('will show a warning', () => {
        cy.findByText('Not all results can be displayed. Please refine your search.').should('be.visible');
      });

      it('shows the download button', () => {
        cy.findByTestId('download').should('be.visible');
      });

      context('when unique barcode option is selected', () => {
        before(() => {
          cy.get('[type="radio"]').eq(1).check();
        });
        it('will show a warning', () => {
          cy.findByText('Not all results can be displayed. Please refine your search.').should('be.visible');
        });
      });
    });

    context('when a search returns no results', () => {
      before(() => {
        cy.visit('/search');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindQuery, FindQueryVariables>('Find', (req, res, ctx) => {
              return res(ctx.data({ find: buildFindResult(0, 40) }));
            })
          );
        });

        cy.findByLabelText('Donor ID').type('DNR123');
        cy.findByRole('button', { name: /Search/i }).click();
      });

      it('will show a notification', () => {
        cy.findByText('There is no stored labware matching your search. Please try again.').should('be.visible');
      });

      it('will not show the download button', () => {
        cy.findByTestId('download').should('not.exist');
      });
    });

    context('when a search gets an error from the server', () => {
      before(() => {
        cy.visit('/search');

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindQuery, FindQueryVariables>('Find', (req, res, ctx) => {
              return res(
                ctx.errors([
                  {
                    message: 'Exception while fetching data (/find) : Something went wrong'
                  }
                ])
              );
            })
          );
        });

        cy.findByLabelText('Donor ID').type('DNR123');
        cy.findByRole('button', { name: /Search/i }).click();
      });

      it('will show a warning', () => {
        cy.findByText('Something went wrong').should('be.visible');
      });
    });
  });
});
