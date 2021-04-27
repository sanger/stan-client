import {
  AddReleaseRecipientMutation,
  AddReleaseRecipientMutationVariables,
} from "../../../src/types/sdk";

describe("Configuration Spec", () => {
  before(() => {
    cy.visitAsAdmin("/config");
  });

  [
    {
      name: "Comments - section",
      field: "Section Folded",
      buttonName: "+ Add Text",
      newValue: "My new comment",
    },
    {
      name: "Destruction Reasons",
      field: "Experiment complete.",
      buttonName: "+ Add Text",
      newValue: "My new comment",
    },
    {
      name: "Species",
      field: "Mouse",
      buttonName: "+ Add Name",
      newValue: "Monkey",
    },
    {
      name: "HMDMC Numbers",
      field: "HMDMC1",
      buttonName: "+ Add Hmdmc",
      newValue: "HMDMC9",
    },
    {
      name: "Release Destinations",
      field: "Vento lab",
      buttonName: "+ Add Name",
      newValue: "Fab lab",
    },
    {
      name: "Release Recipients",
      field: "cs41",
      buttonName: "+ Add Username",
      newValue: "az99",
    },
  ].forEach((config) => {
    describe(config.name, () => {
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
