import { rest } from 'msw';
import { selectFocusBlur, selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { RegistrationType, shouldBehaveLikeARegistrationForm } from '../shared/registration.cy';
import { RegisterTissuesMutation, RegisterTissuesMutationVariables } from '../../../src/types/sdk';
describe('Block Registration Page', () => {
  describe('Initial display', () => {
    before(() => {
      cy.visit('/admin/registration');
    });
    it('display options to register manually and from file, and both options should be unchecked', () => {
      cy.get('[type="radio"][name="manual-registration-btn"]').should('be.visible').should('not.be.checked');
      cy.get('[type="radio"][name="file-registration-btn"]').should('be.visible').should('not.be.checked');
    });
  });
  describe('File Registration', () => {
    before(() => {
      cy.get('[type="radio"][name="file-registration-btn"]').check();
    });
    it('should display upload file form', () => {
      cy.findByText('Select file...').should('be.visible');
    });
    it('upload btn should be disabled until the user selected a file', () => {
      cy.findByTestId('upload-btn').should('be.disabled');
    });
    context('On file upload success', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            rest.post('/register/block', (req, res, ctx) => {
              return res(
                ctx.status(200),
                ctx.json({
                  barcodes: ['STAN-3111', 'STAN-3112']
                })
              );
            })
          );
        });
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
    });
    context('On file upload failure', () => {
      before(() => {
        cy.visit('/admin/registration');
        cy.get('[type="radio"][name="file-registration-btn"]').check();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            rest.post('/register/block', (req, res, ctx) => {
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
    describe('Validation', () => {
      before(() => {
        cy.visit('/admin/registration');
        cy.get('[type="radio"][name="manual-registration-btn"]').check();
      });
      it('requires SGP Number', () => {
        selectFocusBlur('workNumber');
        cy.findByText('At least one work number must be selected').should('be.visible');
      });
      it('displays sample collection date when Fetal life stage is selected', () => {
        cy.get('[type="radio"][data-testid="fetal"]').check();
        cy.findByTestId('Sample Collection Date').should('be.visible');
      });
      it('hides sample collection date when Fetal life stage is not selected', () => {
        cy.get('[type="radio"][data-testid="adult"]').check();
        cy.findByTestId('Sample Collection Date').should('not.exist');
      });
      it('HuMFre is a required field when species is set to Human', () => {
        selectOption('Species', 'Human');
        selectFocusBlur('HuMFre');
        cy.findByText('HuMFre is a required field').should('be.visible');
      });
      it('Spatial location is a required field', () => {
        selectOption('Tissue Type', 'Liver');
        selectFocusBlur('Spatial Location');
        cy.findByText('Spatial Location must be greater than or equal to 0').should('be.visible');
      });
      it('External identifier is a required field', () => {
        cy.findByTestId('External Identifier').clear().blur();
        cy.findByText('External Identifier is a required field').should('be.visible');
      });
      it('Fixative is a required field', () => {
        selectFocusBlur('Fixative');
        cy.findByText('Fixative is a required field').should('be.visible');
      });
      it('Medium is a required field', () => {
        selectFocusBlur('Medium');
        cy.findByText('Medium is a required field').should('be.visible');
      });
      it('Labware type is a  required field', () => {
        selectFocusBlur('Labware Type');
        cy.findByText('Labware Type is a required field').should('be.visible');
      });
      context('should behave like registration block forms', () => {
        before(() => {
          selectOption('Species', '');
          selectOption('Tissue Type', '');
        });
        shouldBehaveLikeARegistrationForm(RegistrationType.BLOCK);
      });
    });

    describe('Submission', () => {
      context('when the submission fails server side', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>(
                'RegisterTissues',
                (req, res, ctx) => {
                  return res.once(
                    ctx.errors([
                      {
                        extensions: {
                          problems: ['Error Message']
                        }
                      }
                    ])
                  );
                }
              )
            );
          });
          fillInRegistrationForm();
          cy.findByText('Register').click();
        });
        it('shows the server errors', () => {
          cy.findByText('Error Message').should('be.visible');
        });
      });

      describe('when the submission is successful', () => {
        before(() => {
          cy.msw().then(({ worker }) => {
            worker.resetHandlers();
          });
          fillInRegistrationForm();
          cy.findByText('Register').click();
        });
        it('shows a success message', () => {
          cy.findByText('Registration complete').should('be.visible');
        });
      });
    });
  });
  describe('Add another tissue', () => {
    before(() => {
      cy.reload();
      cy.get('[type="radio"][name="manual-registration-btn"]').check();
      cy.findByText('+ Add Another Tissue').click();
    });
    it('display options to register manually and from file, and both options should be unchecked', () => {
      cy.get('#tissue-summaries').children().should('have.length', 2);
    });
  });
});
function fillInRegistrationForm() {
  selectSGPNumber('SGP1008');
  cy.get('[type="radio"][data-testid="adult"]').check();
  cy.findByLabelText('Donor ID').clear().type('DONOR_1');
  selectOption('Fixative', 'None');
  selectOption('Medium', 'Paraffin');
  cy.findByTestId('External Identifier').clear().type('A50-LNG-1-FO-XX');
  selectOption('Species', 'Human');
  selectOption('HuMFre', 'HuMFre1');
  selectOption('Tissue Type', 'Liver');
  selectOption('Labware Type', 'Cassette');
  selectOption('Spatial Location', '3 - Surface central region');
  cy.findByLabelText('Replicate Number').clear().type('2');
}
