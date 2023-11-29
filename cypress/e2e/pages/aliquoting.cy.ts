import { AliquotMutation, AliquotMutationVariables } from '../../../src/types/sdk';
import { selectSGPNumber } from '../shared/customReactSelect.cy';

function scanInLabware() {
  cy.get('#labwareScanInput').type('STAN-011{enter}');
}

function enterNumberOfDestinationTubes(numTubes: string) {
  cy.findByTestId('numLabware').focus().invoke('val', '').type(numTubes);
}

describe('Aliquoting', () => {
  context('when source labware is not scanned', () => {
    before(() => {
      cy.visit('/lab/aliquoting');
      enterNumberOfDestinationTubes('1');
      selectSGPNumber('SGP1008');
    });
    it('disables the Aliquot button', () => {
      cy.findByRole('button', { name: 'Aliquot' }).should('be.disabled');
    });
  });
  context('when number of destination tubes is zero', () => {
    before(() => {
      cy.visit('/lab/aliquoting');
      enterNumberOfDestinationTubes('0');
      scanInLabware();
      selectSGPNumber('SGP1008');
    });
    it('disables the Aliquot button', () => {
      cy.findByRole('button', { name: 'Aliquot' }).should('be.disabled');
    });
  });
  context('when the work number is not selected', () => {
    before(() => {
      cy.visit('/lab/aliquoting');
      enterNumberOfDestinationTubes('1');
      scanInLabware();
    });
    it('disables the Aliquot button', () => {
      cy.findByRole('button', { name: 'Aliquot' }).should('be.disabled');
    });
  });

  context('when aliquoting fails', () => {
    before(() => {
      cy.visit('/lab/aliquoting');

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<AliquotMutation, AliquotMutationVariables>('Aliquot', (req, res, ctx) => {
            return res.once(
              ctx.errors([
                {
                  message: 'Exception while fetching data (/aliquot) : Failed to aliquot'
                }
              ])
            );
          })
        );
      });

      scanInLabware();
      selectSGPNumber('SGP1008');
      enterNumberOfDestinationTubes('4');
      cy.findByText('Aliquot').click();
    });

    it("doesn't disable the Aliquot button", () => {
      cy.findByRole('button', { name: 'Aliquot' }).should('not.be.disabled');
    });

    it('shows an error message', () => {
      cy.findByText('Failed to aliquot').should('be.visible');
    });
  });

  context('when aliquoting is successful', () => {
    before(() => {
      cy.visit('/lab/aliquoting');
      scanInLabware();
      selectSGPNumber('SGP1008');
      enterNumberOfDestinationTubes('4');
      cy.findByRole('button', { name: 'Aliquot' }).click();
    });

    it('hides the Aliquot button', () => {
      cy.findByRole('button', { name: 'Aliquot' }).should('not.exist');
    });

    it('shows a success message', () => {
      cy.findByText('Aliquoting Complete').should('be.visible');
    });

    it('displays a table with 4 new labels', () => {
      cy.findByTestId('newLabelDiv').within(() => {
        cy.findByRole('table')
          .find('tr')
          .then((row) => {
            //row.length will give you the row count
            expect(row.length - 1).equal(4);
          });
      });
    });
  });

  context('while printing the label from table', () => {
    before(() => {
      cy.findByTestId('newLabelDiv').within(() => {
        cy.contains('STAN-1004').parents('tr').find('button').click();
      });
    });
    it('should display a print success message', () => {
      cy.findByText('Tube Printer successfully printed STAN-1004').should('be.visible');
    });
  });

  context(" when 'Print Labels' button is clicked", () => {
    before(() => {
      cy.findByRole('button', { name: /Print Labels/ }).click();
    });
    it('should display a print success message', () => {
      cy.findByText('Tube Printer successfully printed STAN-1005, STAN-1006, STAN-1007, STAN-1008').should(
        'be.visible'
      );
    });
  });
  context('when store button is clicked', () => {
    before(() => {
      cy.findByRole('button', { name: /Store/i }).click();
    });
    it('should display store page', () => {
      cy.url().should('be.equal', 'http://localhost:3000/store');
    });
  });
});
