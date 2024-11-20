import { http, HttpResponse } from 'msw';
import { selectFocusBlur, selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { RegistrationType, shouldBehaveLikeARegistrationForm } from '../shared/registration.cy';
import { RegisterTissuesMutation, RegisterTissuesMutationVariables } from '../../../src/types/sdk';
import { tissueFactory } from '../../../src/lib/factories/sampleFactory';
import labwareFactory from '../../../src/lib/factories/labwareFactory';

describe('Block Registration Page', () => {
  beforeEach(() => {
    cy.msw().then(({ worker, graphql }) => {
      worker.use(
        http.post('/register/block', () => {
          return HttpResponse.json({ barcodes: ['STAN-3111', 'STAN-3112'] }, { status: 200 });
        })
      );
    });
  });
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
    it('should display upload file form', () => {
      cy.get('[type="radio"][name="file-registration-btn"]').check();
      cy.findByText('Select file...').should('be.visible');
    });
    it('upload btn should be disabled until the user selected a file', () => {
      cy.findByTestId('upload-btn').should('be.disabled');
    });
    it('shows the registered block', () => {
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
      cy.findByText('STAN-3111').should('be.visible');
      cy.findByText('STAN-3112').should('be.visible');
    });

    context('On file upload failure', () => {
      before(() => {
        cy.visit('/admin/registration');
        cy.get('[type="radio"][name="file-registration-btn"]').check();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            http.post('/register/block', () => {
              return HttpResponse.json({ problems: 'Error Message' }, { status: 500 });
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
    context('File contains existing external names', () => {
      context('should alert the user', () => {
        before(() => {
          uploadFileWithClashes();
        });
        it('displays the clashModal', () => {
          cy.findByText('External Name Already In Use').should('be.visible');
        });
      });
      context('On confirm', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              http.post('/register/block', () => {
                return HttpResponse.json({ barcodes: ['STAN-18418'] }, { status: 200 });
              })
            );
          });
          cy.findByRole('button', { name: 'Confirm' }).click({ force: true });
        });
        it('should show the registered block', () => {
          cy.findByText('Registration complete').should('be.visible');
        });
      });
      context('On cancel', () => {
        before(() => {
          uploadFileWithClashes();
          cy.findByRole('button', { name: 'Cancel' }).click({ force: true });
        });
        it('should not upload the file', () => {
          cy.findByTestId('upload-btn').should('be.enabled');
        });
      });
    });
  });

  describe('Manual Registration', () => {
    describe('Validation', () => {
      before(() => {
        cy.visit('/admin/registration');
        cy.get('[type="radio"][name="manual-registration-btn"]').check();
      });
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
          cy.visit('/admin/registration');
          cy.get('[type="radio"][name="manual-registration-btn"]').check();
          fillInRegistrationForm();
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
          cy.visit('/admin/registration');
          cy.get('[type="radio"][name="manual-registration-btn"]').check();
          fillInRegistrationForm();
          cy.findByLabelText('Sample Collection Date').clear();
          cy.findByText('Register').click();
        });
        it('shows the validation error for sample collection date', () => {
          cy.findByText('Sample Collection Date is a required field for fetal samples').should('be.visible');
        });
      });

      context('when a future date is entered for sample collection', () => {
        before(() => {
          cy.visit('/admin/registration');
          cy.get('[type="radio"][name="manual-registration-btn"]').check();
          fillInRegistrationForm();
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
          cy.visit('/admin/registration');
          cy.get('[type="radio"][name="manual-registration-btn"]').check();
          selectSGPNumber('SGP1008');
          fillInRegistrationForm();
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
          cy.get('[type="radio"][name="manual-registration-btn"]').check();
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>('RegisterTissues', () => {
                return HttpResponse.json({
                  errors: [
                    {
                      extensions: {
                        problems: ['This thing went wrong', 'This other thing went wrong']
                      }
                    }
                  ]
                });
              })
            );
          });
          selectSGPNumber('SGP1008');
          fillInRegistrationForm();
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
        cy.visit('/admin/registration');
        cy.get('[type="radio"][name="manual-registration-btn"]').check();

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>('RegisterTissues', () => {
              return HttpResponse.json({
                data: {
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
                }
              });
            })
          );
        });

        fillInRegistrationForm();
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
  describe('Add another tissue', () => {
    before(() => {
      cy.visit('/admin/registration');
      cy.get('[type="radio"][name="manual-registration-btn"]').check();
      cy.findByText('+ Add Another Tissue').click();
    });
    it('display options to register manually and from file, and both options should be unchecked', () => {
      cy.get('#tissue-summaries').children().should('have.length', 2);
    });
  });
});
function fillInRegistrationForm() {
  cy.findByLabelText('Donor ID').type('DONOR_1');
  cy.findByLabelText('Fetal').click();
  cy.findByLabelText('Sample Collection Date').type('2022-01-01', {
    force: true
  });
  selectOption('Species', 'Human');
  cy.findByLabelText('External Identifier').type('EXT_ID_1');
  selectOption('HuMFre', 'HuMFre1');
  selectOption('Tissue Type', 'Liver');
  selectOption('bioRiskCode', 'bioRisk1');
  selectOption('Spatial Location', '3 - Surface central region');
  cy.findByLabelText('Replicate Number').type('2');
  cy.findByLabelText('Last Known Section Number').type('5');
  selectOption('Labware Type', 'Proviasette');
  selectOption('Fixative', 'None');
  selectOption('Medium', 'Paraffin');
}

const uploadFileWithClashes = () => {
  cy.visit('/admin/registration');
  cy.get('[type="radio"][name="file-registration-btn"]').check();
  cy.msw().then(({ worker, graphql }) => {
    worker.use(
      http.post('/register/block', () => {
        return HttpResponse.json(
          {
            clashes: [
              {
                labware: [
                  {
                    labwareType: {
                      name: 'Proviasette'
                    },
                    barcode: 'STAN-18418'
                  }
                ],
                tissue: {
                  externalName: 'EXT17'
                }
              }
            ]
          },
          { status: 200 }
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
};
