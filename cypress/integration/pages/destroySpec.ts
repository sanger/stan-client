import {
  DestroyMutation,
  DestroyMutationVariables,
} from "../../../src/types/sdk";

describe("Destroy Page", () => {
  before(() => {
    cy.visit("/admin/destroy");
  });

  context("when form is submitted without filling in any fields", () => {
    before(() => {
      cy.findByRole("button", { name: /Destroy Labware/i }).click();
    });

    it("shows an error about labwares", () => {
      cy.findByText("Please scan in at least 1 labware").should("be.visible");
    });

    it("shows an error about not choosing a reason", () => {
      cy.findByText("Please choose a reason").should("be.visible");
    });
  });

  context("when all is valid", () => {
    before(() => {
      fillInForm();
    });

    it("shows a success message", () => {
      cy.findByText("Labware(s) Destroyed").should("be.visible");
    });
  });

  context("when there is a server error", () => {
    before(() => {
      cy.visit("/admin/destroy");

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<DestroyMutation, DestroyMutationVariables>(
            "Destroy",
            (req, res, ctx) => {
              return res(
                ctx.errors([
                  {
                    message: `Exception while fetching data (/destroy) : Something went wrong`,
                  },
                ])
              );
            }
          )
        );
      });

      fillInForm();
    });

    it("shows an error", () => {
      cy.findByText("Something went wrong").should("be.visible");
    });
  });
});

function fillInForm() {
  cy.get("#labwareScanInput").type("STAN-123{enter}");
  cy.get("#labwareScanInput").type("STAN-456{enter}");
  cy.findByLabelText("Reason").select("Operator error.");
  cy.findByRole("button", { name: /Destroy Labware/i }).click();
}
