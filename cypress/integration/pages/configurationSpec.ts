import {
  AddReleaseRecipientMutation,
  AddReleaseRecipientMutationVariables,
} from "../../../src/types/sdk";

describe("Configuration Spec", () => {
  before(() => {
    cy.visitAsAdmin("/config");
  });

  it("should display a tab panel", () => {
    cy.findByRole("tabpanel").should("exist");
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
          cy.scrollTo(0, 0);
          cy.findByText(config.tabName).click();
        });
        it("toggles the enabled field", () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(
            () => {
              cy.get(`tr:contains('${config.field}') input`).click();
              cy.findByText(`"${config.field}" disabled`).should("be.visible");
              cy.get(`tr:contains('${config.field}') input`).click();
              cy.findByText(`"${config.field}" enabled`).should("be.visible");
            }
          );
        });

        it("saves new entites", () => {
          cy.get(`div[data-testid="config"]:contains('${config.name}')`).within(
            () => {
              cy.findByRole("button", { name: config.buttonName }).click();
              cy.focused().type(`${config.newValue}{enter}`);
              cy.findByText("Saved").should("be.visible");
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
              cy.findByRole("button", { name: config.buttonName }).click();
              cy.focused().type(`${config.newValue}{enter}`);
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
          cy.findByRole("button", { name: "+ Add Username" }).click();
          cy.focused().type(`I should fail{enter}`);
          cy.findByText("Save Failed").should("be.visible");
          cy.findByText("Something went wrong").should("be.visible");
        }
      );
    });
  });
});
