import {
  ConfirmSectionMutation,
  ConfirmSectionMutationVariables,
  FindPlanDataQuery,
  FindPlanDataQueryVariables,
} from "../../../src/types/sdk";

describe("Sectioning Confirmation", () => {
  before(() => {
    cy.visit("/lab/sectioning/confirm");
  });

  context("when I scan a barcode and core errors", () => {
    before(() => {
      cy.msw().then(({ graphql, worker }) => {
        worker.use(
          graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>(
            "FindPlanData",
            (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    message: "Plan Search Error",
                  },
                ])
              );
            }
          )
        );
      });

      findPlanByBarcode("STAN-0002E");
    });

    it("shows an error", () => {
      cy.findByText("Plan Search Error").should("be.visible");
    });
  });

  context("when I scan in a labware with a plan", () => {
    before(() => {
      findPlanByBarcode("STAN-0001F");
    });

    it("displays the source labware for that plan", () => {
      cy.findAllByText("STAN-2021").its("length").should("be.gte", 1);
    });

    it("displays the destination labware for that plan", () => {
      cy.findAllByText("STAN-0001F").its("length").should("be.gte", 1);
    });

    // Section numbers not yet filled in
    it("doesn't enable the Save button", () => {
      saveButton().should("be.disabled");
    });

    context("when I scan the same barcode again", () => {
      before(() => {
        findPlanByBarcode("STAN-0001F");
      });

      it("shows an error", () => {
        cy.findByText("Plan has already been found for STAN-0001F").should(
          "be.visible"
        );
      });
    });

    context("when I try and leave the page without saving", () => {
      it("shows a confirm box", () => {
        cy.on("window:confirm", (str) => {
          expect(str).to.equal(
            "You have unsaved changes. Are you sure you want to leave?"
          );
          // Returning false cancels the event
          return false;
        });

        cy.findByText("Search").click();
      });
    });

    context("when I edit the layout", () => {
      it("adds or removes sections", () => {
        cy.findByText("Edit Layout").click();
        cy.findByRole("dialog").within(() => {
          cy.findByText("STAN-2021").click();
          cy.findByText(`\u00d72`).should("be.visible");
          cy.findByText("STAN-2021").click({ ctrlKey: true });
          cy.findByText(`\u00d72`).should("not.exist");
          cy.findByText("Done").click();
        });
      });
      after(() => {
        findPlanByBarcode("STAN-0001E");
      });
    });

    context("when I add the section number", () => {
      before(() => {
        cy.findAllByTestId("labware-comments").each((elem) =>
          cy.wrap(elem).find("input").type("10")
        );
      });

      it("enables the Save button", () => {
        saveButton().should("not.be.disabled");
      });
    });

    context("when core errors on saving", () => {
      before(() => {
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.mutation<
              ConfirmSectionMutation,
              ConfirmSectionMutationVariables
            >("ConfirmSection", (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    message:
                      "There was an error confirming the Sectioning operation",
                  },
                ])
              );
            })
          );
        });

        saveButton().click();
      });

      it("shows an error", () => {
        cy.findByText(
          "There was an error confirming the Sectioning operation"
        ).should("be.visible");
      });
    });

    context("when core succeeds on saving", () => {
      before(() => {
        saveButton().click();
      });

      it("shows the success dialog", () => {
        cy.findByText("Sections Confirmed");
      });
      it("displays Store option in updated page after success", () => {
        cy.findByRole("button", { name: /Store/i }).should("be.enabled");
      });
      it("displays Print option in updated page after success", () => {
        cy.findByTestId("print-div").within(() => {
          cy.findByText("Tube").should("be.visible");
          cy.findByRole("table").contains("td", "STAN-0001F");
          cy.findByRole("table").contains("td", "STAN-0001E");
        });
      });
    });

    context("when print button is clicked for labware", () => {
      before(() => {
        cy.get("[id=printButton]").eq(0).click();
      });
      it("displays a print success message", () => {
        cy.findByTestId("print-div").within(() => {
          cy.findByText("Tube Printer successfully printed STAN-0001F").should(
            "be.visible"
          );
        });
      });
    });
  });

  describe("when store option selected for confimed labware is", () => {
    before(() => {
      cy.findByRole("button", { name: /Store/i }).click();
    });
    context("while in store page with confirmed labware", () => {
      it("navigates to store page", () => {
        cy.url().should("be.equal", "http://localhost:3000/store");
      });
      it("when redirected to the Store page", () => {
        cy.findByRole("table").contains("td", "STAN-0001F");
        cy.findByRole("table").contains("td", "STAN-0001E");
      });
      it("store all button should be disabled", () => {
        cy.findByRole("button", { name: /Store All/i }).should("be.disabled");
      });
    });
  });
});

function findPlanByBarcode(barcode: string) {
  cy.findByTestId("plan-finder")
    .find("input")
    .clear()
    .type(`${barcode}{enter}`);
}

function saveButton() {
  return cy.findByRole("button", { name: /Save/i });
}
