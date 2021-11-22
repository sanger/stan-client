import {
  RecordVisiumQcMutation,
  RecordVisiumQcMutationVariables,
} from "../../../src/types/sdk";

describe("Visium QC Page", () => {
  before(() => {
    cy.visit("/lab/visium_qc");
  });

  describe("On load", () => {
    it("shows SGP Number section", () => {
      cy.findByText("SGP Number").should("be.visible");
    });
    it("shows QC Type section", () => {
      cy.findByText("QC Type").should("be.visible");
    });
    it("shows Slide Processing in QC Type dropdown", () => {
      cy.findByTestId("qcType").should("have.text", "Slide Processing");
    });
    it("show Slides section", () => {
      cy.findByText("Slide").should("be.visible");
    });
  });

  describe("On Visium QCType as Slide Processing", () => {
    context("When user scans in a slide ", () => {
      before(() => {
        cy.get("#labwareScanInput").type("STAN-2100{enter}");
      });
      it("shows it on the page", () => {
        cy.findByText("STAN-2100").should("be.visible");
      });
      it("has all slots as passed", () => {
        cy.findAllByTestId("passIcon").then(($passIcons) => {
          $passIcons.each((i, icon) => {
            const classList = Array.from(icon.classList);
            expect(classList).to.includes("text-green-700");
          });
        });
      });
      it("displays scan field as disabled", () => {
        cy.get("#labwareScanInput").should("be.disabled");
      });
    });
    context("When user clicks Pass All button", () => {
      before(() => {
        cy.findByTestId("passAll").click();
      });

      it("has all slots as passed", () => {
        cy.findAllByTestId("passIcon").then(($passIcons) => {
          $passIcons.each((i, icon) => {
            const classList = Array.from(icon.classList);
            expect(classList).to.includes("text-green-700");
          });
        });
      });
      it("has all comment dropdowns disabled", () => {
        cy.findByTestId("passFailComments").get("select").should("be.disabled");
      });
    });
    context("When user clicks Fail All button", () => {
      before(() => {
        cy.findAllByTestId("failAll").click();
      });
      it("fails all the slots", () => {
        cy.findAllByTestId("failIcon").then(($failIcons) => {
          $failIcons.each((indx, failIcon) => {
            const classList = Array.from(failIcon.classList);
            expect(classList).to.includes("text-red-700");
          });
        });
      });
      it("enables all the comment dropdowns", () => {
        cy.findByTestId("passFailComments").get("select").should("be.enabled");
      });
    });
    context("When changing the comment all dropdown", () => {
      before(() => {
        cy.findByTestId("commentAll").select("Slide damaged");
      });
      it("changes all the comments", () => {
        cy.findByTestId("passFailComments").within(() => {
          cy.get("select option:selected").each((elem) => {
            cy.wrap(elem).should("have.text", "Slide damaged");
          });
        });
      });
    });
    describe("On Save", () => {
      context("When there is no server error", () => {
        before(() => {
          cy.findByRole("button", { name: /Save/i })
            .should("not.be.disabled")
            .click();
        });

        it("shows a success message", () => {
          cy.findByText("Visium QC complete").should("be.visible");
        });

        after(() => {
          cy.findByRole("button", { name: /Reset/i }).click();
        });
      });
      context("When there is a server error", () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<
                RecordVisiumQcMutation,
                RecordVisiumQcMutationVariables
              >("RecordVisiumQC", (req, res, ctx) => {
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
              })
            );
          });
          cy.get("#labwareScanInput").type("STAN-2100{enter}");
          cy.findByRole("button", { name: /Save/i }).click();
        });

        it("shows an error", () => {
          cy.findByText("Failed to record Visium QC").should("be.visible");
        });
      });
    });
  });
});
