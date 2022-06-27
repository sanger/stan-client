import {
  ConfirmSectionMutation,
  ConfirmSectionMutationVariables,
  FindPlanDataQuery,
  FindPlanDataQueryVariables,
} from "../../../src/types/sdk";
import labwareFactory from "../../../src/lib/factories/labwareFactory";
import { labwareTypes } from "../../../src/lib/factories/labwareTypeFactory";
import { LabwareTypeName } from "../../../src/types/stan";
import { findPlanData } from "../../../src/mocks/handlers/planHandlers";

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
      cy.get("select").select("SGP1008");
      findPlanByBarcode("STAN-0001F");
    });

    it("displays the source labware for that plan", () => {
      cy.findAllByText("STAN-2021").its("length").should("be.gte", 1);
    });

    it("displays the destination labware for that plan", () => {
      cy.findAllByText("STAN-0001F").its("length").should("be.gte", 1);
    });

    it("should select the section numbering mode as 'auto'", () => {
      cy.get('[type="radio"]').first().should("be.checked");
    });
    it("should auto fill section numbers starting from highest section number", () => {
      let sectionNumber = 0;
      cy.findByRole("table")
        .find("td")
        .eq(1)
        .then((col) => {
          sectionNumber = Number(col.text());
        });
      cy.findAllByTestId("labware-comments").each((elem) =>
        cy
          .wrap(elem)
          .find("input")
          .should("have.value", sectionNumber + 1 + "")
      );
    });

    it("disables all section number fields", () => {
      cy.findAllByTestId("labware-comments").each((elem) =>
        cy.wrap(elem).find("input").should("be.disabled")
      );
    });
    // Section numbers already filled in
    it("enables the Save button", () => {
      saveButton().should("be.enabled");
    });

    context("when a fetal waste is scanned", () => {
      before(() => {
        const sourceLabware = labwareFactory.build(
          { barcode: "STAN-3333" },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.CASSETTE].build(),
            },
          }
        );

        const destinationLabware = labwareFactory.build(
          { barcode: "STAN-0002D" },
          {
            associations: {
              labwareType: labwareTypes[
                LabwareTypeName.FETAL_WASTE_CONTAINER
              ].build(),
            },
          }
        );
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>(
              "FindPlanData",
              (req, res, ctx) => {
                return res.once(
                  findPlanData(sourceLabware, destinationLabware, ctx)
                );
              }
            )
          );
        });
        findPlanByBarcode("STAN-0002D");
      });

      it("should display fetal waste labware", () => {
        cy.findByText("Fetal waste container").should("be.visible");
      });

      it("shouldn't display edit layout option", () => {
        cy.findByTestId("div-slide-STAN-0002D").within(() => {
          cy.findByText("Edit Layout").should("not.exist");
        });
      });
      context("when remove labware button is clicked", () => {
        before(() => {
          cy.findByTestId("remove-slide-STAN-0002D").click();
        });
        it("should remove the fetal waste labware without warning", () => {
          cy.findByText("Removing labware").should("not.exist");
          cy.findByTestId("div-slide-STAN-0002D").should("not.exist");
        });
      });
    });

    context("when I scan the same barcode again", () => {
      before(() => {
        findPlanByBarcode("STAN-0001F");
      });

      it("shows an error", () => {
        cy.findByText('"STAN-0001F" has already been scanned').should(
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
    });

    context(
      "when a new section is added in 'auto' mode for section numbering ",
      () => {
        before(() => {
          cy.findByText("Edit Layout").click();
          cy.findByRole("dialog").within(() => {
            cy.findByText("STAN-2021").click();
            cy.findByText("Done").click();
          });
        });

        it("should renumber all section numbers", () => {
          let highestSectionNumber = 0;
          cy.findByRole("table")
            .find("td")
            .eq(1)
            .then((col) => {
              highestSectionNumber = Number(col.text());
            });

          cy.findAllByTestId("labware-comments").each((elem) => {
            highestSectionNumber++;
            cy.wrap(elem)
              .find("input")
              .should("have.value", highestSectionNumber + "");
          });
        });
        after(() => {
          findPlanByBarcode("STAN-0001E");
        });
      }
    );

    context("when a tube is cancelled in 'auto' mode", () => {
      before(() => {
        const sourceLabware = labwareFactory.build(
          { barcode: "STAN-2222" },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.CASSETTE].build(),
            },
          }
        );

        const destinationLabware = labwareFactory.build(
          { barcode: "STAN-0001D" },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.TUBE].build(),
            },
          }
        );
        destinationLabware.id = -2;
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>(
              "FindPlanData",
              (req, res, ctx) => {
                return res.once(
                  findPlanData(sourceLabware, destinationLabware, ctx)
                );
              }
            )
          );
        });

        findPlanByBarcode("STAN-0001D");
        cy.findByTestId("remove-tube-STAN-0001D").click();
      });

      it("should display a warning message", () => {
        cy.findByText("Cancelling tube").should("be.visible");
      });

      it("should empty the section field for cancelled tube", () => {
        cy.findByRole("button", { name: /Continue/i }).click();
        cy.findByTestId("sectionnumber-tube-STAN-0001D").should("not.exist");
      });
    });
    context("when a slide is removed in auto mode", () => {
      before(() => {
        const sourceLabware = labwareFactory.build(
          { barcode: "STAN-2222" },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.CASSETTE].build(),
            },
          }
        );

        const destinationLabware = labwareFactory.build(
          { barcode: "STAN-0001C" },
          {
            associations: {
              labwareType: labwareTypes[LabwareTypeName.SLIDE].build(),
            },
          }
        );
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>(
              "FindPlanData",
              (req, res, ctx) => {
                return res.once(
                  findPlanData(sourceLabware, destinationLabware, ctx)
                );
              }
            )
          );
        });
        findPlanByBarcode("STAN-0001C");
        cy.findByTestId("remove-slide-STAN-0001C").click();
      });
      it("should display a warning message", () => {
        cy.findByText("Removing labware").should("be.visible");
      });
      it("should remove the labware on pressing Continue button", () => {
        cy.findByRole("button", { name: /Continue/i }).click();
        cy.findByText("STAN-0001C").should("not.exist");
      });
    });
    context("when 'manual' mode is selected for section numbering", () => {
      before(() => {
        cy.get('[type = "radio"]').eq(1).click();
      });
      it("enables all section number fields ", () => {
        cy.findAllByTestId("labware-comments").each((elem) =>
          cy.wrap(elem).find("input").should("be.enabled")
        );
      });
      it("should empty all section number fields", () => {
        cy.findAllByTestId("labware-comments").each((elem) =>
          cy.wrap(elem).find("input").should("have.value", "")
        );
      });
      // Section numbers not filled in
      it("disables the Save button", () => {
        saveButton().should("be.disabled");
      });
    });

    context("when I add the section number in manual mode", () => {
      before(() => {
        cy.findAllByTestId("labware-comments").each((elem) => {
          cy.wrap(elem)
            .find("input")
            .each((input) => {
              cy.wrap(input).type("10");
            });
        });
      });
      it("enables the Save button", () => {
        saveButton().should("be.enabled");
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
