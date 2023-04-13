import { RegisterTissuesMutation, RegisterTissuesMutationVariables } from '../../../src/types/sdk';

import { tissueFactory } from '../../../src/lib/factories/sampleFactory';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { RegistrationType, shouldBehaveLikeARegistrationForm } from '../shared/registration.cy';
import { selectFocusBlur, selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';

describe('Registration', () => {
  before(() => {
    cy.visit('/admin/registration');
  });

  describe('Validation', () => {
    shouldBehaveLikeARegistrationForm(RegistrationType.BLOCK);

    it('should display Work numbers section', () => {
      cy.findByText('SGP Number').should('be.visible');
      cy.findByTestId('workNumber').should('be.visible');
    });
    it('requires Work numbers', () => {
      selectFocusBlur('workNumber');
      cy.findByText('At least one work number must be selected').should('be.visible');
    });

    it('requires External Identifier', () => {
      cy.findByLabelText('External Identifier').focus().blur();
      cy.findByText('External Identifier is a required field').should('be.visible');
    });

    it('requires External Identifier to only permit certain characters', () => {
      cy.findByLabelText('External Identifier').type('EXT&99').blur();
      cy.findByText(
        'External Identifier contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted'
      ).should('be.visible');
    });

    it('requires Last Known Section Number', () => {
      cy.findByLabelText('Last Known Section Number').clear().blur();
      cy.findByText('Last Known Section Number is a required field').should('be.visible');
    });

    it('requires Last Known Section Number to be an integer', () => {
      cy.findByLabelText('Last Known Section Number').type('1.1').blur();
      cy.findByText('Last Known Section Number must be an integer').should('be.visible');
    });

    it('requires Last Known Section Number to be greater than or equal to 0', () => {
      cy.findByLabelText('Last Known Section Number').clear().type('-1').blur();
      cy.findByText('Last Known Section Number must be greater than or equal to 0').should('be.visible');
    });

    it('requires Labware Type', () => {
      cy.findByLabelText('Labware Type').focus().blur();
      cy.findByText('Labware Type is a required field').should('be.visible');
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
        selectSGPNumber('SGP1008');
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
        cy.visit('/admin/registration');

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>(
              'RegisterTissues',
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
        selectSGPNumber('SGP1008');
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
          graphql.mutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>(
            'RegisterTissues',
            (req, res, ctx) => {
              return res.once(
                ctx.data({
                  register: {
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
      selectSGPNumber('SGP1008');
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
  cy.findByLabelText('External Identifier').type('EXT_ID_1');
  selectOption('HuMFre', 'HuMFre1');
  selectOption('Tissue Type', 'Liver');
  selectOption('Spatial Location', '3 - Surface central region');
  cy.findByLabelText('Replicate Number').type('2');
  cy.findByLabelText('Last Known Section Number').type('5');
  selectOption('Labware Type', 'Proviasette');
  selectOption('Fixative', 'None');
  selectOption('Medium', 'Paraffin');
}
