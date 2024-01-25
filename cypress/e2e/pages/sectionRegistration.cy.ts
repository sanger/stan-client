import { RegistrationType, shouldBehaveLikeARegistrationForm } from '../shared/registration.cy';
import { RegisterSectionsMutation, RegisterSectionsMutationVariables } from '../../../src/types/sdk';
import {
  selectFocusBlur,
  selectOption,
  selectOptionForMultiple,
  selectSGPNumber,
  shouldDisplaySelectedValue
} from '../shared/customReactSelect.cy';
import { rest } from 'msw';

describe('Section Registration Page', () => {
  describe('Initial display', () => {
    before(() => {
      cy.visit('/admin/section_registration');
    });
    it('display options to register manually and from file', () => {
      cy.findByText('Register manually').should('be.visible');
      cy.findByText('Register from file').should('be.visible');
    });
  });
  describe('File Registration', () => {
    it('should display an error when uploading a file with no sections', () => {
      cy.findByTestId('upload-btn').should('be.disabled');
    });
    context('On file upload success', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            rest.post('/register/section', (req, res, ctx) => {
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
      it('shows the created labware', () => {
        cy.findByText('STAN-3111').should('be.visible');
        cy.findByText('STAN-3112').should('be.visible');
      });
    });
    context('On file upload failure', () => {
      before(() => {
        cy.visit('/admin/section_registration');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            rest.post('/register/section', (req, res, ctx) => {
              return res(
                ctx.status(500),
                ctx.json({
                  problems: 'Error 1, Error 2'
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

      it('should display an error', () => {
        cy.findByText('Error 1').should('be.visible');
        cy.findByText('Error 2').should('be.visible');
      });
    });
  });

  describe('Manual Registration ', () => {
    before(() => {
      cy.visit('/admin/section_registration');
      selectOption('initialLabwareType', '6 slot slide');
    });

    describe('Spatial Locations', () => {
      context('when updating the tissue type and spatial location for one slide, then adding another slide', () => {
        before(() => {
          selectOption('Tissue Type', 'Liver');
          selectOption('Spatial Location', '3 - Surface central region');
          selectOption('labwareTypesSelect', 'Visium LP');
          cy.findByText('+ Add Visium LP').click();
        });
        it('should still be set when going back to the first slide', () => {
          cy.get('#labware-summaries > a').eq(0).click();
          shouldDisplaySelectedValue('Spatial Location', '3');
          shouldDisplaySelectedValue('Tissue Type', 'Liver');
        });

        after(() => {
          cy.findByRole('button', { name: '- Remove 6 slot slide' }).click();
        });
      });
    });

    describe('Validation', () => {
      shouldBehaveLikeARegistrationForm(RegistrationType.SLIDE);

      it('requires SGP Number', () => {
        selectFocusBlur('workNumber');
        cy.findByText('SGP number is required').should('be.visible');
      });

      it('shouldnt display Xenium barcode field', () => {
        cy.findByLabelText('Xenium Slide Barcode').should('not.exist');
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
        cy.findByTestId('workNumber').should('exist');
      });
      it('should not be showing a Remove Slide button', () => {
        cy.findByRole('button', { name: /- Remove 6 slot slide/i }).should('not.exist');
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
        it('should have section position as a required field when there are multiple sections', () => {
          selectFocusBlur('region');
          cy.findByText('Section position is a required field for slot with multiple sections').should('be.visible');
        });
        it('should display section position to have unique values', () => {
          selectOptionForMultiple('region', 'Top', 0);
          selectOptionForMultiple('region', 'Top', 1);
          selectFocusBlur('region');
          cy.findAllByText('Unique value required for section position').should('have.length', 2);
        });
      });
    });

    describe('Adding/Removing slides', () => {
      context('when selecting a slide type and clicking Add Visium TO', () => {
        before(() => {
          selectOption('labwareTypesSelect', 'Visium TO');
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
          selectSGPNumber('SGP1008');
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
          selectSGPNumber('SGP1008');
          cy.findByText('Register').click();
        });

        it('shows the created labware', () => {
          cy.findByText('ExtBC1').should('be.visible');
        });
      });
    });

    describe('Xenium slide registration', () => {
      before(() => {
        cy.visit('/admin/section_registration');
        selectOption('initialLabwareType', 'Xenium');
      });
      describe('Validation', () => {
        shouldBehaveLikeARegistrationForm(RegistrationType.SLIDE);

        it('requires SGP Number', () => {
          selectFocusBlur('workNumber');
          cy.findByText('SGP number is required').should('be.visible');
        });

        it('should display Xenium barcode field', () => {
          cy.findByLabelText('Xenium Slide Barcode').should('be.visible');
        });

        it('requires Xenium barcode field to only permit 7 digit number', () => {
          cy.findByLabelText('Xenium Slide Barcode').type('Eabc1').blur();
          cy.findByText('Xenium Barcode must be a 7 digit number.').should('be.visible');
        });
        it('requires Xenium barcode field to only permit 7 digit number', () => {
          cy.findByLabelText('Xenium Slide Barcode').clear().type('1234').blur();
          cy.findByText('Xenium Barcode must be a 7 digit number.').should('be.visible');
        });
        it('requires Xenium barcode field to only permit 7 digit number', () => {
          cy.findByLabelText('Xenium Slide Barcode').clear().type('1234567').blur();
          cy.findByText('Xenium Barcode must be a 7 digit number.').should('not.exist');
        });

        it('requires External Slide Barcode', () => {
          cy.findByLabelText('External Labware Barcode').focus().blur();
          cy.findByText('External Labware Barcode is a required field').should('be.visible');
        });

        it('requires Section External Identifier', () => {
          cy.findByLabelText('Section External Identifier').focus().blur();
          cy.findByText('Section External Identifier is a required field').should('be.visible');
        });
      });
    });
  });
});

function fillInForm() {
  cy.findByLabelText('External Labware Barcode').clear().type('ExtBC1');
  selectOption('Fixative', 'None');
  selectOption('Medium', 'Paraffin');
  cy.findByLabelText('Donor ID').clear().type('DONOR_1');
  selectOption('Species', 'Human');
  selectOption('HuMFre', 'HuMFre1');
  selectOption('Tissue Type', 'Liver');
  selectOption('Spatial Location', '3 - Surface central region');
  cy.findByLabelText('Replicate Number').clear().type('2');
  cy.findByLabelText('Section External Identifier').clear().type('S_EXT_ID_1');
  cy.findByLabelText('Section Number').clear().type('5');
  cy.findByLabelText('Section Thickness').clear().type('2');
}
