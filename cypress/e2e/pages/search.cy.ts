import { FindQuery, FindQueryVariables } from "../../../src/types/sdk";
import { buildFindResult } from "../../../src/mocks/handlers/findHandlers";

describe("Search", () => {
  context("when URL query params are set", () => {
    before(() => {
      cy.visit(
        "/search?donorName=DNR123&labwareBarcode=STAN-0001F&tissueExternalName=EXT987&tissueTypeName=Tissue Type 1&workNumber=SGP1008" +
          "&createdMin=2021-07-01&createdMax=2021-07-31"
      );
    });

    it("will set the inputs as values from the query parameters", () => {
      cy.findByLabelText("STAN Barcode").should("have.value", "STAN-0001F");
      cy.findByLabelText("External Identifier").should("have.value", "EXT987");
      cy.findByLabelText("Donor ID").should("have.value", "DNR123");
      cy.findByLabelText("Tissue Type").should("have.value", "Tissue Type 1");
      cy.findByLabelText("SGP Number").should("have.value", "SGP1008");
      cy.findByLabelText("Created After").should("have.value", "2021-07-01");
      cy.findByLabelText("Created Before").should("have.value", "2021-07-31");
    });

    it("will perform a search immediately", () => {
      cy.findByRole("table").should("be.visible");
    });

    context("when the Reset button is pressed", () => {
      before(() => {
        cy.findByRole("button", { name: /Reset/i }).click();
      });

      it("clears the search criteria", () => {
        cy.findByLabelText("STAN Barcode").should("have.value", "");
        cy.findByLabelText("External Identifier").should("have.value", "");
        cy.findByLabelText("Donor ID").should("have.value", "");
        cy.findByLabelText("Tissue Type").should("have.value", "");
        cy.findByLabelText("SGP Number").should("have.value", "");
        cy.findByLabelText("Created After").should("have.value", "");
        cy.findByLabelText("Created Before").should("have.value", "");
      });
    });
  });

  context("when URL query params are not set", () => {
    before(() => {
      cy.visit("/search");
    });

    it("will not perform a search immediately", () => {
      cy.findByRole("table").should("not.exist");
    });

    context(
      "when trying to search without a STAN Barcode, External Identifier, Donor ID, Tissue Type set or SGP Number",
      () => {
        before(() => {
          cy.findByRole("button", { name: /Search/i }).click();
        });

        it("will show an error", () => {
          cy.findByText(
            "At least one of STAN Barcode, External Identifier, Donor ID, Tissue Type or SGP Number must not be empty."
          ).should("be.visible");
        });
      }
    );
    context("when a search has more results than the requested amount", () => {
      before(() => {
        cy.visit("/search");

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindQuery, FindQueryVariables>(
              "Find",
              (req, res, ctx) => {
                return res(ctx.data({ find: buildFindResult(200, 150) }));
              }
            )
          );
        });

        cy.findByLabelText("Donor ID").type("DNR123");
        cy.findByRole("button", { name: /Search/i }).click();
      });

      it("will show a warning", () => {
        cy.findByText(
          "Not all results can be displayed. Please refine your search."
        ).should("be.visible");
      });
    });

    context("when a search returns no results", () => {
      before(() => {
        cy.visit("/search");
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindQuery, FindQueryVariables>(
              "Find",
              (req, res, ctx) => {
                return res(ctx.data({ find: buildFindResult(0, 40) }));
              }
            )
          );
        });

        cy.findByLabelText("Donor ID").type("DNR123");
        cy.findByRole("button", { name: /Search/i }).click();
      });

      it("will show a notification", () => {
        cy.findByText(
          "There were no results for the given search. Please try again."
        ).should("be.visible");
      });
    });

    context("when a search gets an error from the server", () => {
      before(() => {
        cy.visit("/search");

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindQuery, FindQueryVariables>(
              "Find",
              (req, res, ctx) => {
                return res(
                  ctx.errors([
                    {
                      message:
                        "Exception while fetching data (/find) : Something went wrong",
                    },
                  ])
                );
              }
            )
          );
        });

        cy.findByLabelText("Donor ID").type("DNR123");
        cy.findByRole("button", { name: /Search/i }).click();
      });

      it("will show a warning", () => {
        cy.findByText("Something went wrong").should("be.visible");
      });
    });
  });
});
