import {
  SlotCopyMutation,
  SlotCopyMutationVariables,
} from "../../../src/types/sdk";

describe("Visium cDNA Page", () => {
  before(() => {
    cy.visit("/lab/visium_cdna");
  });

  describe("On load", () => {
    it("shows a 96 well plate for the output", () => {
      cy.findByText(/96 WELL PLATE/i).should("be.visible");
    });

    it("disables the Save button", () => {
      saveButton().should("be.disabled");
    });
  });

  context("When a user scans in a TP Slide", () => {
    before(() => {
      cy.get("#labwareScanInput").type("STAN-3100{enter}");
    });

    it("shows it on the page", () => {
      cy.findByText("STAN-3100").should("be.visible");
    });

    it("keeps the Save button disabled", () => {
      saveButton().should("be.disabled");
    });

    context("When user selects some source slots", () => {
      before(() => {
        cy.get("#inputLabwares").within(() => {
          cy.findByText("A1").click();
          cy.findByText("D1").click({ shiftKey: true });
        });
      });

      it("displays the table with A1 slot", () => {
        cy.findByRole("table").contains("td", "A1");
      });
      it("displays the table with D1 slot", () => {
        cy.findByRole("table").contains("td", "D1");
      });
    });

    context("When user maps some source slots", () => {
      before(() => {
        cy.get("#inputLabwares").within(() => {
          cy.findByText("A1").click();
          cy.findByText("D1").click({ shiftKey: true });
        });

        cy.get("#outputLabwares").within(() => {
          cy.findByText("G1").click();
        });
      });

      it("enables the Save Button", () => {
        saveButton().should("not.be.disabled");
      });
    });
    context(
      "When user maps slots that failed in Visium QC- Slide processing",
      () => {
        before(() => {
          cy.get("#inputLabwares").within(() => {
            cy.findByText("A2").click();
          });

          cy.get("#outputLabwares").within(() => {
            cy.findByText("G1").click();
          });
        });
        it("display the notification to user about failed slots", () => {
          cy.findByText("Failed slot(s)").should("be.visible");
        });
        after(() => {
          cy.findByRole("button", { name: /Cancel/i }).click();
        });
      }
    );

    describe("On save", () => {
      context("When there is a server error", () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<SlotCopyMutation, SlotCopyMutationVariables>(
                "SlotCopy",
                (req, res, ctx) => {
                  return res.once(
                    ctx.errors([
                      {
                        message:
                          "Exception while fetching data (/slotCopy) : The operation could not be validated.",
                        extensions: {
                          problems: ["Labware is discarded: [STAN-4100]"],
                        },
                      },
                    ])
                  );
                }
              )
            );
          });

          saveButton().click();
        });

        it("shows an error", () => {
          cy.findByText("Labware is discarded: [STAN-4100]").should(
            "be.visible"
          );
        });
      });

      context("When there is no server error", () => {
        before(() => {
          cy.msw().then(({ worker }) => {
            worker.resetHandlers();
          });

          saveButton().should("not.be.disabled").click();
        });

        it("shows a success message", () => {
          cy.findByText("Slots copied").should("be.visible");
        });

        it("shows the label printer component", () => {
          cy.findByRole("button", { name: "Print Labels" }).should(
            "be.visible"
          );
        });
      });
    });
  });
});

function saveButton() {
  return cy.findByRole("button", { name: /Save/i });
}
