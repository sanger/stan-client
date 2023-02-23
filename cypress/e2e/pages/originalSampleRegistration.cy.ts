import { RegisterOriginalSamplesMutation, RegisterOriginalSamplesMutationVariables } from '../../../src/types/sdk';

import { tissueFactory } from '../../../src/lib/factories/sampleFactory';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { RegistrationType, shouldBehaveLikeARegistrationForm } from '../shared/registration.cy';
import { selectFocusBlur, selectOption, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';

describe('Registration', () => {
  before(() => {
    cy.visit('/admin/tissue_registration');
  });

  describe('Validation', () => {
    shouldBehaveLikeARegistrationForm(RegistrationType.TISSUE_SAMPLE);

    it('does not require External Identifier', () => {
      cy.findByTestId('External Identifier').focus().blur();
      cy.findByText('External Identifier is a required field').should('not.exist');
    });

    it('requires External Identifier to only permit certain characters', () => {
      cy.findByTestId('External Identifier').type('EXT&99').blur();
      cy.findByText(
        'External Identifier contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted'
      ).should('be.visible');
    });

    it('requires Labware Type', () => {
      selectFocusBlur('Labware Type');
      cy.findByText('Labware Type is a required field').should('be.visible');
    });
    it('displays add button for identical samples', () => {
      cy.findByText('+ Add Identical Tissue Sample').should('be.visible');
    });
  });

  context('when clicking the Add Another Tissue Sample button', () => {
    before(() => {
      cy.findByText('Delete Sample').should('not.exist');
      cy.findByText('Sample Information').siblings().should('have.length', 1);
      cy.findByText('+ Add Another Tissue Sample').click();
    });

    it('adds another tissue sample', () => {
      cy.findByText('Sample Information').siblings().should('have.length', 2);
    });

    it('shows the Delete Sample button for each sample', () => {
      cy.findAllByText('Delete Sample').should('be.visible');
    });
  });

  context('when clicking the Add Identical Tissue Sample button', () => {
    before(() => {
      cy.visit('/admin/tissue_registration');
      fillInForm();
      cy.findByText('+ Add Identical Tissue Sample').focus().click();
    });

    it('adds another tissue sample', () => {
      cy.findByText('Sample Information').siblings().should('have.length', 2);
    });

    it('shows the Delete Sample button for each sample', () => {
      cy.findAllByText('Delete Sample').should('be.visible');
    });
    it('shows identical information for the created sample with Replicate Number, Fixative, Solution as empty', () => {
      cy.findAllByTestId('Replicate Number').eq(1).should('have.value', '');
      shouldDisplaySelectedValue('Fixative', '');
      shouldDisplaySelectedValue('Solution', '');
      cy.findAllByTestId('External Identifier').eq(1).should('have.value', '');
      shouldDisplaySelectedValue('Spatial Location', '3 - Surface central region');
      shouldDisplaySelectedValue('Labware Type', 'Pot');
    });
  });
  context('when clicking the Add Identical Tissue button', () => {
    before(() => {
      cy.get('#tissue-summaries').children().should('have.length', 1);
      cy.findByText('- Remove Tissue').should('not.exist');
      cy.findByText('+ Add Identical Tissue').click();
    });

    it('adds another tissue', () => {
      cy.get('#tissue-summaries').children().should('have.length', 2);
      cy.findByText('- Remove Tissue').should('exist');
    });
    it('shows identical information for the created sample with Replicate Number, Fixative, Solution as empty', () => {
      shouldDisplaySelectedValue('Replicate Number', '');
      shouldDisplaySelectedValue('Fixative', '');
      shouldDisplaySelectedValue('Solution', '');
      shouldDisplaySelectedValue('Spatial Location', '3 - Surface central region');
      shouldDisplaySelectedValue('Labware Type', 'Pot');
    });
  });

  context('when clicking the Add Another Tissue button', () => {
    before(() => {
      cy.get('#tissue-summaries').children().should('have.length', 2);
      cy.findByText('+ Add Another Tissue').click();
    });

    it('adds another tissue', () => {
      cy.get('#tissue-summaries').children().should('have.length', 3);
    });
  });

  describe('submission', () => {
    context('when the fields are invalid', () => {
      before(() => {
        cy.reload();
        fillInForm();
        cy.findByLabelText('Donor ID').clear();
        cy.findByText('Register').click();
      });

      it('shows the validation errors', () => {
        cy.findByText('Donor ID is a required field').should('be.visible');
      });

      it('shows how many errors there are', () => {
        cy.findByText('1 Error').should('be.visible');
      });
    });
    context('when there is no sample collection date for fetal sample', () => {
      before(() => {
        cy.reload();
        fillInForm();
        cy.findByLabelText('Sample Collection Date').clear();
        cy.findByText('Register').click();
      });
      it('shows the validation error for sample collection date', () => {
        cy.findByText('Sample Collection Date is a required field for fetal samples').should('be.visible');
      });
    });

    context('when a future date is entered for sample collection', () => {
      before(() => {
        cy.reload();
        fillInForm();
        cy.findByLabelText('Sample Collection Date')
          .type('2050-04-01', {
            force: true
          })
          .blur();
      });
      it('shows an error message to enter a past date', () => {
        cy.findByText(`Please select a date on or before ${new Date().toLocaleDateString()}`);
      });
    });

    context('when the submission is successful', () => {
      before(() => {
        cy.reload();
        fillInForm();
        cy.findByText('Register').click();
      });

      it('shows a success message', () => {
        cy.findByText('Registration complete').should('be.visible');
      });

      it('shows the created labware', () => {
        cy.findByText('LW_BC_1').should('be.visible');
        cy.findByText('EXT1').should('be.visible');
      });

      it('displays the result table column headers in correct order', () => {
        cy.get('th').eq(0).contains('Barcode');
        cy.get('th').eq(1).contains('Labware Type');
        cy.get('th').eq(2).contains('External ID');
        cy.get('th').eq(3).contains('Donor ID');
        cy.get('th').eq(4).contains('Tissue type');
        cy.get('th').eq(5).contains('Spatial location');
        cy.get('th').eq(6).contains('Replicate');
        cy.get('th').eq(7).contains('Fixative');
        cy.get('th').eq(8).contains('Solution');
      });
    });

    context('when store button is clicked after successful registration', () => {
      before(() => {
        cy.findByRole('button', { name: /Store/i }).click();
      });
      it('should go to store page', () => {
        cy.url().should('include', '/store');
      });
      it('should list the registered labware in store page', () => {
        cy.findByText('LW_BC_1').should('be.visible');
      });
    });

    context('when the submission fails server side', () => {
      before(() => {
        cy.visit('/admin/tissue_registration');

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RegisterOriginalSamplesMutation, RegisterOriginalSamplesMutationVariables>(
              'RegisterOriginalSamples',
              (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      extensions: {
                        problems: ['This thing went wrong', 'This other thing went wrong']
                      }
                    }
                  ])
                );
              }
            )
          );
        });

        fillInForm();
        cy.findByText('Register').click();
      });

      it('shows the server errors', () => {
        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });
    });
  });

  context('when the submission has clashes', () => {
    const tissue = tissueFactory.build();
    const labware = labwareFactory.buildList(2);

    before(() => {
      cy.reload();

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<RegisterOriginalSamplesMutation, RegisterOriginalSamplesMutationVariables>(
            'RegisterOriginalSamples',
            (req, res, ctx) => {
              return res.once(
                ctx.data({
                  registerOriginalSamples: {
                    labware: [],
                    clashes: [
                      {
                        tissue,
                        labware
                      }
                    ],
                    labwareSolutions: []
                  }
                })
              );
            }
          )
        );
      });

      fillInForm();
      cy.findByText('Register').click();
    });

    it('shows a modal with the clashing labware', () => {
      labware.forEach((lw) => {
        cy.findByText(lw.barcode).should('be.visible');
        cy.findAllByText(lw.labwareType.name).should('be.visible');
      });
    });
  });
});

function fillInForm() {
  cy.findByLabelText('Donor ID').type('DONOR_1');
  cy.findByLabelText('Fetal').click();
  cy.findByLabelText('Sample Collection Date').type('2022-01-01', {
    force: true
  });
  selectOption('Species', 'Human');
  cy.findByTestId('External Identifier').type('EXT_ID_1');
  selectOption('HuMFre', 'HuMFre1');
  selectOption('Tissue Type', 'Liver');
  selectOption('Spatial Location', '3 - Surface central region');
  cy.findByTestId('Replicate Number').type('2');
  selectOption('Labware Type', 'Pot');
  selectOption('Fixative', 'None');
  selectOption('Solution', 'Formalin');
}
