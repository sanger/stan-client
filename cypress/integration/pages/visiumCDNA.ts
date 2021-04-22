import {
  SlotCopyMutation,
  SlotCopyMutationVariables,
} from "../../../src/types/graphql";

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

  context("When a user scans in a LP Slide", () => {
    before(() => {
      cy.get("#labwareScanInput").type("STAN-4100{enter}");
    });

    it("shows it on the page", () => {
      cy.findByText("STAN-4100").should("be.visible");
    });

    it("keeps the Save button disabled", () => {
      saveButton().should("be.disabled");
    });

    context("When user maps all source slots", () => {
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

    describe("On save", () => {
      context("When there is a server error", () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<SlotCopyMutation, SlotCopyMutationVariables>(
                "SlotCopy",
                (req, res, ctx) => {
                  return res(
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

          saveButton().click();
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
