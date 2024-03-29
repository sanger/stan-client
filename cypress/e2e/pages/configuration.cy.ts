import {
  AddReleaseRecipientMutation,
  AddReleaseRecipientMutationVariables,
  UpdateReleaseRecipientFullNameMutation,
  UpdateReleaseRecipientFullNameMutationVariables
} from '../../../src/types/sdk';
import { selectOption } from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

describe('Configuration Spec', () => {
  before(() => {
    cy.visitAsAdmin('/config');
  });

  context('Tab panel', () => {
    it('should display a tab panel', () => {
      cy.findByRole('tabpanel').should('exist');
    });
    after(() => {
      cy.findByText('Destruction Reasons').click();
    });
  });
  describe('Entities with boolean property', () => {
    [
      {
        name: 'Comments - section',
        field: 'Section Folded',
        buttonName: '+ Add Text',
        newValue: 'My new comment',
        tabName: 'Comments'
      },
      {
        name: 'Destruction Reasons',
        tabName: 'Destruction Reasons',
        field: 'Experiment complete.',
        buttonName: '+ Add Text',
        newValue: 'My new comment'
      },
      {
        name: 'Species',
        tabName: 'Species',
        field: 'Mouse',
        buttonName: '+ Add Name',
        newValue: 'Monkey'
      },
      {
        name: 'HuMFre Numbers',
        tabName: 'HuMFre Numbers',
        field: 'HuMFre1',
        buttonName: '+ Add Humfre',
        newValue: 'HuMFre9'
      },
      {
        name: 'Release Destinations',
        tabName: 'Release Destinations',
        field: 'Vento lab',
        buttonName: '+ Add Name',
        newValue: 'Fab lab'
      },
      {
        name: 'Release Recipients',
        tabName: 'Release Recipients',
        field: 'cs41',
        buttonName: '+ Add Username',
        newValue: 'az99'
      }
    ].forEach((config) => {
      describe(config.name, () => {
        before(() => {
          cy.findByText(config.tabName).click();
        });
        it('toggles the enabled field', () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(() => {
            selectElement(`tr:contains('${config.field}') input`);
            cy.findByText(`"${config.field}" disabled`).should('be.visible');
            selectElement(`tr:contains('${config.field}') input`);
            cy.findByText(`"${config.field}" enabled`).should('be.visible');
          });
        });

        it('saves new entites', () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(() => {
            clickButton(config.buttonName);
            enterNewValue(config.newValue);
            cy.findByText('Saved').scrollIntoView().should('be.visible');
          });
        });
      });
    });
  });

  describe('setting entities with string values', () => {
    [
      {
        name: 'Users',
        tabName: 'Users',
        field: 'Test user',
        buttonName: '+ Add Username',
        newValue: 'az99'
      }
    ].forEach((config) => {
      describe(config.name, () => {
        before(() => {
          cy.scrollTo(0, 0);
          cy.findByText(config.tabName).click();
        });
        it('sets the value field', () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(() => {
            selectOption(`${config.field}-select`, 'normal');
            cy.findByText(`"${config.field}" - role changed to normal`).should('be.visible');
          });
        });

        it('saves new entites', () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(() => {
            clickButton(config.buttonName);
            enterNewValue(config.newValue);
            cy.findByText('Saved').should('be.visible');
          });
        });
      });
    });
  });

  describe('displays extra input field when specified', () => {
    const config = {
      name: 'Release Recipients',
      tabName: 'Release Recipients',
      field: 'cs41',
      extraFieldValue: 'Csaba Csordas',
      buttonName: '+ Add Username',
      newValue: 'az99',
      newExtraFieldValue: 'Arielle Zimran'
    };
    context('configuration table should contains extra column to display extra field values', () => {
      before(() => {
        cy.scrollTo(0, 0);
        cy.findByText(config.name).click();
      });

      it('displays extra field values', () => {
        cy.get(`div[data-testid="config"]:contains(${config.name})`)
          .find(`tr:contains(${config.field}) `)
          .find('input')
          .first()
          .should('have.value', config.extraFieldValue);
      });

      it('displays extra field input when adding new entity', () => {
        clickButton(config.buttonName);
        cy.findByTestId('input-field').scrollIntoView().focus().type(`${config.newValue}`);
        enterNewExtraFieldValue(config.extraFieldValue);
        cy.findByText('Saved').scrollIntoView().should('be.visible');
      });
    });
  });

  context('When adding a Release Recipients fails', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<AddReleaseRecipientMutation, AddReleaseRecipientMutationVariables>(
            'AddReleaseRecipient',
            () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Exception while fetching data (/addReleaseRecipient) : Something went wrong'
                  }
                ]
              });
            }
          )
        );
      });
    });

    it('shows an error message', () => {
      cy.get(`div[data-testid="config"]:contains('Release Recipients')`).within(() => {
        clickButton('+ Add Username');
        enterNewValue(`I should fail{enter}`);
        cy.findByText('Save Failed').should('be.visible');
        cy.findByText('Something went wrong').should('be.visible');
      });
    });
  });

  context('When Updating a Release Recipient full name successfully', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<UpdateReleaseRecipientFullNameMutation, UpdateReleaseRecipientFullNameMutationVariables>(
            'UpdateReleaseRecipientFullName',
            () => {
              return HttpResponse.json({
                data: {
                  updateReleaseRecipientFullName: {
                    username: 'et2',
                    fullName: 'Ethan Twin',
                    enabled: true
                  }
                }
              });
            }
          )
        );
      });
      cy.get(`div[data-testid="config"]:contains('Release Recipients')`)
        .find(`tr:contains('et2') `)
        .find('input')
        .first()
        .focus()
        .type(`Ethan Twin {enter}`, { force: true });
    });
    it('shows a success message', () => {
      cy.findByText('Changes for "et2" saved').should('be.visible');
    });
  });
  function selectElement(findTag: string) {
    return cy.get(findTag).last().scrollIntoView().click({
      force: true
    });
  }
  function clickButton(buttonName: string) {
    cy.findByRole('button', { name: buttonName }).scrollIntoView().click({ force: true });
  }
  function enterNewValue(value: string) {
    cy.findByTestId('input-field').scrollIntoView().focus().type(`${value}{enter}`, { force: true });
  }

  function enterNewExtraFieldValue(value: string) {
    cy.findByTestId('extra-input-field').scrollIntoView().focus().type(`${value}{enter}`, { force: true });
  }
});
