import { RegisterOriginalSamplesMutation, RegisterOriginalSamplesMutationVariables } from '../../../src/types/sdk';

import { tissueFactory } from '../../../src/lib/factories/sampleFactory';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { RegistrationType, shouldBehaveLikeARegistrationForm } from '../shared/registration.cy';
import { selectFocusBlur, selectOption } from '../shared/customReactSelect.cy';
import { rest } from 'msw';

describe('Registration', () => {
  before(() => {
    cy.visit('/admin/tissue_registration');
  });

  describe('On mount', () => {
    it('display options to register manually and from file, and both options should be unchecked', () => {
      cy.get('[type="radio"][name="manual"]').should('be.visible').should('not.be.checked');
      cy.get('[type="radio"][name="file"]').should('be.visible').should('not.be.checked');
    });
  });

  describe('File Registration', () => {
    before(() => {
      cy.get('[type="radio"][name="file"]').check();
    });
    it('should display upload file form', () => {
      cy.findByText('Select file...').should('be.visible');
    });
    it('upload btn should be disabled until the user selected a file', () => {
      cy.findByTestId('upload-btn').should('be.disabled');
    });
    context('On registration success', () => {
      before(() => {
        cy.get('input[type=file]').selectFile(
          {
            contents: Cypress.Buffer.from('file contents'),
            fileName: 'file.xlsx',
            mimeType: 'text/plain',
            lastModified: Date.now()
          },
          { force: true }
        );
        cy.findByTestId('upload-btn').click();
      });
      it('shows the registered block', () => {
        cy.findByText('STAN-3111').should('be.visible');
        cy.findByText('STAN-3112').should('be.visible');
      });
      shouldDisplaysSuccessTable();
    });
    context('On registration failure', () => {
      before(() => {
        cy.visit('/admin/tissue_registration');
        cy.get('[type="radio"][name="file"]').check();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            rest.post('/register/original', (req, res, ctx) => {
              return res(
                ctx.status(500),
                ctx.json({
                  problems: 'Error Message'
                })
              );
            })
          );
        });
        cy.get('input[type=file]').selectFile(
          {
            contents: Cypress.Buffer.from('file contents'),
            fileName: 'file2.xlsx',
            mimeType: 'text/plain',
            lastModified: Date.now()
          },
          { force: true }
        );
        cy.findByTestId('upload-btn').click();
      });
      it('should display an error', () => {
        cy.findByText('Error Message').should('be.visible');
      });
    });
  });

  describe('Manual Registration', () => {
    before(() => {
      cy.visit('/admin/tissue_registration');
      cy.get('[type="radio"][name="manual"]').check();
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
    });
    context('when clicking the Add Another Tissue button', () => {
      before(() => {
        cy.findByText('+ Add Another Tissue').click();
      });

      it('adds another tissue', () => {
        cy.get('#tissue-summaries').children().should('have.length', 2);
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

        shouldDisplaysSuccessTable();
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
});

function fillInForm() {
  cy.get('[type="radio"][name="manual"]').check();
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

function shouldDisplaysSuccessTable() {
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
}
