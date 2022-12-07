import { RegistrationType, shouldBehaveLikeARegistrationForm } from '../shared/registration.cy';
import { RegisterSectionsMutation, RegisterSectionsMutationVariables } from '../../../src/types/sdk';

describe('Section Registration Page', () => {
  before(() => {
    cy.visit('/admin/section_registration');
    cy.get('select').select('Slide');
  });

  describe('Spatial Locations', () => {
    context('when updating the tissue type and spatial location for one slide, then adding another slide', () => {
      before(() => {
        cy.findByLabelText('Tissue Type').select('Liver');
        cy.findByLabelText('Spatial Location').select('3 - Surface central region');
        cy.get('#labwareTypesSelect').select('Visium LP');
        cy.findByText('+ Add Visium LP').click();
      });
      it('should still be set when going back to the first slide', () => {
        cy.get('#labware-summaries > a').eq(0).click();
        cy.findByLabelText('Tissue Type').should('have.value', 'Liver');
        cy.findByLabelText('Spatial Location').should('have.value', '3');
      });

      after(() => {
        cy.findByRole('button', { name: '- Remove Slide' }).click();
      });
    });
  });

  describe('Validation', () => {
    shouldBehaveLikeARegistrationForm(RegistrationType.SLIDE);

    it('requires SGP Number', () => {
      cy.findByTestId('select_workNumber').focus().blur();
      cy.findByText('SGP number is required').should('be.visible');
    });

    it('requires External Slide Barcode', () => {
      cy.findByLabelText('External Labware Barcode').focus().blur();
      cy.findByText('External Labware Barcode is a required field').should('be.visible');
    });

    it('requires Section External Identifier', () => {
      cy.findByLabelText('Section External Identifier').focus().blur();
      cy.findByText('Section External Identifier is a required field').should('be.visible');
    });

    it('requires Section External Identifier to only permit certain characters', () => {
      cy.findByLabelText('Section External Identifier').type('EXT&99').blur();
      cy.findByText(
        'Section External Identifier contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted'
      ).should('be.visible');
    });
  });

  describe('Initialisation', () => {
    it('should display SGP Number field', () => {
      cy.findByTestId('select_workNumber').should('exist');
    });
    it('should not be showing a Remove Slide button', () => {
      cy.findByRole('button', { name: /- Remove Slide/i }).should('not.exist');
    });

    it('should not be showing a Remove Section button', () => {
      cy.findByRole('button', { name: /- Remove Section/i }).should('not.exist');
    });

    it('should have one labware', () => {
      cy.get('#labware-summaries').children().should('have.length', 1);
    });
  });

  describe('Adding/Removing Sections', () => {
    context('when clicking on a slot', () => {
      before(() => {
        cy.findByText('B1').click();
      });

      it('should add a new section', () => {
        cy.findByText('2 Section(s)').should('be.visible');
      });

      it('should show the Remove Section buttons', () => {
        cy.findAllByRole('button', { name: /- Remove Section/i }).should('be.visible');
      });

      context('when clicking the Remove Section button', () => {
        before(() => {
          cy.findAllByRole('button', { name: /- Remove Section/i })
            .eq(1)
            .click();
        });

        it('should remove a section', () => {
          cy.findByText('1 Section(s)').should('be.visible');
        });
      });
    });
  });

  describe('Adding/Removing multiple sections to the same slot', () => {
    context("when clicking on 'Add Another Section to A1'", () => {
      before(() => {
        cy.findByRole('button', {
          name: '+ Add Another Section to A1'
        }).click();
      });

      after(() => {
        cy.findAllByRole('button', { name: '- Remove Section' }).eq(0).click();
      });

      it('should add a new section', () => {
        cy.findByText('2 Section(s)').should('be.visible');
      });
    });
  });

  describe('Adding/Removing slides', () => {
    context('when selecting a slide type and clicking Add Visium TO', () => {
      before(() => {
        cy.get('#labwareTypesSelect').select('Visium TO');
        cy.findByText('+ Add Visium TO').click();
      });

      it('adds Visium TO slide', () => {
        cy.get('#labware-summaries').children().should('have.length', 2);
      });

      it('should show the Remove Slide button', () => {
        cy.findAllByRole('button', { name: /- Remove Visium TO/ }).should('be.visible');
      });

      context('when clicking the Remove Visium TO button', () => {
        before(() => {
          cy.findAllByRole('button', { name: /- Remove Visium TO/ }).click();
        });

        it('removes the slide', () => {
          cy.get('#labware-summaries').children().should('have.length', 1);
        });
      });
    });
  });

  describe('Submission', () => {
    context('when the submission fails server side', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RegisterSectionsMutation, RegisterSectionsMutationVariables>(
              'RegisterSections',
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
        cy.findByTestId('select_workNumber').select('SGP1008');
        cy.findByText('Register').click();
      });

      it('shows the server errors', () => {
        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });
    });

    context('when the submission is successful', () => {
      before(() => {
        cy.msw().then(({ worker }) => {
          worker.resetHandlers();
        });

        fillInForm();
        cy.findByTestId('select_workNumber').select('SGP1008');
        cy.findByText('Register').click();
      });

      it('shows the created labware', () => {
        cy.findByText('ExtBC1').should('be.visible');
      });
    });
  });
});

function fillInForm() {
  cy.findByLabelText('External Labware Barcode').clear().type('ExtBC1');
  cy.findByLabelText('Fixative').select('None');
  cy.findByLabelText('Medium').select('Paraffin');
  cy.findByLabelText('Donor ID').clear().type('DONOR_1');
  cy.findByLabelText('Species').select('Human');
  cy.findByLabelText('HuMFre').select('HuMFre1');
  cy.findByLabelText('Tissue Type').select('Liver');
  cy.findByLabelText('Spatial Location').select('3 - Surface central region');
  cy.findByLabelText('Replicate Number').clear().type('2');
  cy.findByLabelText('Section External Identifier').clear().type('S_EXT_ID_1');
  cy.findByLabelText('Section Number').clear().type('5');
  cy.findByLabelText('Section Thickness').clear().type('2');
}
