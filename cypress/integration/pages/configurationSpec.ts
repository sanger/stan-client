import {
  AddReleaseRecipientMutation,
  AddReleaseRecipientMutationVariables,
} from "../../../src/types/sdk";

describe("Configuration Spec", () => {
  before(() => {
    cy.visitAsAdmin("/config");
  });

  context("Tab panel", () => {
    it("should display a tab panel", () => {
      cy.findByRole("tabpanel").should("exist");
    });
    after(() => {
      cy.findByText("Destruction Reasons").click();
    });
  });
  describe("Entities with boolean property", () => {
    [
      {
        name: "Comments - section",
        field: "Section Folded",
        buttonName: "+ Add Text",
        newValue: "My new comment",
        tabName: "Comments",
      },
      {
        name: "Destruction Reasons",
        tabName: "Destruction Reasons",
        field: "Experiment complete.",
        buttonName: "+ Add Text",
        newValue: "My new comment",
      },
      {
        name: "Species",
        tabName: "Species",
        field: "Mouse",
        buttonName: "+ Add Name",
        newValue: "Monkey",
      },
      {
        name: "HuMFre Numbers",
        tabName: "HuMFre Numbers",
        field: "HuMFre1",
        buttonName: "+ Add Humfre",
        newValue: "HuMFre9",
      },
      {
        name: "Release Destinations",
        tabName: "Release Destinations",
        field: "Vento lab",
        buttonName: "+ Add Name",
        newValue: "Fab lab",
      },
      {
        name: "Release Recipients",
        tabName: "Release Recipients",
        field: "cs41",
        buttonName: "+ Add Username",
        newValue: "az99",
      },
    ].forEach((config) => {
      describe(config.name, () => {
        before(() => {
          cy.findByText(config.tabName).click();
        });
        it("toggles the enabled field", () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(
            () => {
              selectElement(`tr:contains('${config.field}') input`);
              cy.findByText(`"${config.field}" disabled`).should("be.visible");
              selectElement(`tr:contains('${config.field}') input`);
              cy.findByText(`"${config.field}" enabled`).should("be.visible");
            }
          );
        });

        it("saves new entites", () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(
            () => {
              clickButton(config.buttonName);
              enterNewValue(config.newValue);
              cy.findByText("Saved").scrollIntoView().should("be.visible");
            }
          );
        });
      });
    });
  });

  describe("setting entities with string values", () => {
    [
      {
        name: "Users",
        tabName: "Users",
        field: "Test user",
        buttonName: "+ Add Username",
        newValue: "az99",
      },
    ].forEach((config) => {
      describe(config.name, () => {
        before(() => {
          cy.scrollTo(0, 0);
          cy.findByText(config.tabName).click();
        });
        it("sets the value field", () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(
            () => {
              cy.get(`tr:contains('${config.field}') select`).select("normal");
              cy.findByText(
                `"${config.field}" - role changed to normal`
              ).should("be.visible");
            }
          );
        });

        it("saves new entites", () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(
            () => {
              clickButton(config.buttonName);
              enterNewValue(config.newValue);
              cy.findByText("Saved").should("be.visible");
            }
          );
        });
      });
    });
  });

  context("When adding a Release Recipients fails", () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<
            AddReleaseRecipientMutation,
            AddReleaseRecipientMutationVariables
          >("AddReleaseRecipient", (req, res, ctx) => {
            return res.once(
              ctx.errors([
                {
                  message:
                    "Exception while fetching data (/addReleaseRecipient) : Something went wrong",
                },
              ])
            );
          })
        );
      });
      cy.scrollTo(0, 0);
      cy.findByText("Release Recipients").click();
    });

    it("shows an error message", () => {
      cy.get(`div[data-testid="config"]:contains('Release Recipients')`).within(
        () => {
          clickButton("+ Add Username");
          enterNewValue(`I should fail{enter}`);
          cy.findByText("Save Failed").should("be.visible");
          cy.findByText("Something went wrong").should("be.visible");
        }
      );
    });
  });
  function selectElement(findTag: string) {
    return cy.get(findTag).scrollIntoView().click({
      force: true,
    });
  }
  function clickButton(buttonName: string) {
    cy.findByRole("button", { name: buttonName })
      .scrollIntoView()
      .click({ force: true });
  }
  function enterNewValue(value: string) {
    cy.findByTestId("input-field")
      .scrollIntoView()
      .focus()
      .type(`${value}{enter}`, { force: true });
  }
});
