import {
  ExtractMutation,
  ExtractMutationVariables,
} from "../../../src/types/graphql";

function scanInLabware() {
  cy.get("#labwareScanInput").type("STAN-011{enter}");
  cy.wait(500);
  cy.get("#labwareScanInput").type("STAN-012{enter}");
  cy.wait(500);
  cy.get("#labwareScanInput").type("STAN-013{enter}");
}

describe("RNA Extraction", () => {
  context("when extraction fails", () => {
    before(() => {
      cy.visit("/lab/extraction");

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<ExtractMutation, ExtractMutationVariables>(
            "Extract",
            (req, res, ctx) => {
              return res(
                ctx.errors([
                  {
                    message:
                      "Exception while fetching data (/extract) : Failed to extract",
                  },
                ])
              );
            }
          )
        );
      });

      scanInLabware();
      cy.findByText("Extract").click();
    });

    it("doesn't lock the labware scan table", () => {
      cy.get("#labwareScanInput").should("not.be.disabled");
    });

    it("doesn't disable the Extract button", () => {
      cy.findByRole("button", { name: /Extract/i }).should("not.be.disabled");
    });

    it("shows an error message", () => {
      cy.findByText("Failed to extract").should("be.visible");
    });
  });

  context("when extraction is successful", () => {
    before(() => {
      cy.visit("/lab/extraction");
      cy.wait(2000);
      scanInLabware();
      cy.findByText("Extract").click();
    });

    it("hides the Extract button", () => {
      cy.findByRole("button", { name: /Extract/i }).should("not.exist");
    });

    it("shows a success message", () => {
      cy.findByText("Extraction Complete").should("be.visible");
    });

    context("when you click the Print Labels button", () => {
      before(() => {
        cy.findByRole("button", { name: /Print Labels/i }).click();
      });

      it("prints the destination labware", () => {
        cy.findByText(
          "Tube Printer successfully printed 2 labels for STAN-1004, STAN-1005, STAN-1006"
        ).should("be.visible");
      });
    });
  });
});
