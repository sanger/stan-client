import {
  AddReleaseRecipientMutation,
  AddReleaseRecipientMutationVariables,
} from "../../../src/types/sdk";

describe("Configuration Spec", () => {
  before(() => {
    cy.visitAsAdmin("/config");
    cy.wait(3000);
  });

  testEntityManager(
    "Comments - section",
    "Section Folded",
    "+ Add Text",
    "My new comment"
  );

  testEntityManager(
    "Destruction Reasons",
    "Experiment complete.",
    "+ Add Text",
    "My new comment"
  );

  testEntityManager("Species", "Mouse", "+ Add Name", "Monkey");

  testEntityManager("HMDMC Numbers", "HMDMC1", "+ Add Hmdmc", "HMDMC9");

  testEntityManager(
    "Release Destinations",
    "Vento lab",
    "+ Add Name",
    "Fab lab"
  );

  testEntityManager("Release Recipients", "cs41", "+ Add Username", "az99");

  context("When adding a Release Recipients fails", () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<
            AddReleaseRecipientMutation,
            AddReleaseRecipientMutationVariables
          >("AddReleaseRecipient", (req, res, ctx) => {
            return res(
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

function testEntityManager(
  name: string,
  field: string,
  buttonName: string,
  newValue: string
) {
  describe(name, () => {
    beforeEach(() => {
      cy.get(`div[data-testid="config"]:contains('${name}')`).as(
        "entityManager"
      );
    });

    it("toggles the enabled field", () => {
      cy.get("@entityManager").within(() => {
        cy.get(`tr:contains('${field}') input`).click();
        cy.findByText(`"${field}" disabled`).should("be.visible");
        cy.get(`tr:contains('${field}') input`).click();
        cy.findByText(`"${field}" enabled`).should("be.visible");
      });
    });

    it("saves new entites", () => {
      cy.get("@entityManager").within(() => {
        cy.findByRole("button", { name: buttonName }).click();
        cy.focused().type(`${newValue}{enter}`);
        cy.findByText("Saved").should("be.visible");
      });
    });
  });
}
