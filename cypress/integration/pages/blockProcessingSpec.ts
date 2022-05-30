import {
  PerformTissueBlockMutation,
  PerformTissueBlockMutationVariables,
} from "../../../src/types/sdk";
import { labwareTypeInstances } from "../../../src/lib/factories/labwareTypeFactory";
import labwareFactory from "../../../src/lib/factories/labwareFactory";
import { LabwareTypeName } from "../../../src/types/stan";

describe("Block Processing", () => {
  before(() => {
    cy.visit("/lab/block_processing");
  });

  describe("Add Labware button", () => {
    context("when there is no source labware loaded", () => {
      it("is disabled", () => {
        cy.findByText("+ Add Labware").should("be.disabled");
      });
    });

    context("when there is source labware loaded", () => {
      before(() => {
        cy.get("#labwareScanInput").type("STAN-113{enter}");
      });

      it("is enabled", () => {
        cy.findByText("+ Add Labware").should("not.be.disabled");
      });
    });
  });

  describe("Source labware table", () => {
    context("when destination labware is added", () => {
      before(() => {
        cy.findByText("+ Add Labware").click();
      });

      it("scan labware input becomes disabled", () => {
        cy.get("#labwareScanInput").should("be.disabled");
      });

      context("when destination labware becomes empty again", () => {
        before(() => {
          cy.findByText("Delete Layout").click();
        });

        it("scan labware input is re-enabled", () => {
          cy.get("#labwareScanInput").should("not.be.disabled");
        });
      });
    });
  });

  describe("Adding multiple labware", () => {
    before(() => {
      cy.findByTestId("labwareType").select("Tube");
      cy.findByTestId("numLabware").type("{selectall}").type("2");
      cy.findByText("+ Add Labware").click();
    });
    it("should display two Tubes", () => {
      cy.findByTestId(`divSection-Tube`).within(() => {
        cy.findAllByTestId("plan").should("have.length", 2);
      });
    });
  });

  describe("Labware Layout", () => {
    context("when labware layout is added", () => {
      it("doesn't enable the Save button", () => {
        cy.findByRole("button", { name: /Save/i }).should("be.disabled");
      });

      it("should autofill all replicate numbers", () => {
        cy.findAllByLabelText("Replicate Number")
          .first()
          .should("have.value", 1);
        cy.findAllByLabelText("Replicate Number")
          .last()
          .should("have.value", 2);
      });

      context("when I try and leave the page", () => {
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
    });

    context("when editing a layout", () => {
      before(() => {
        cy.findAllByText("Edit Layout").first().click();
        cy.findByRole("dialog").within(() => {
          cy.findByText("STAN-113").click();
          cy.findByText("A1").click();
          cy.findByText("Done").click();
        });
      });
      it("should display STAN-113", () => {});
    });

    context("when removing a layout", () => {
      before(() => {
        cy.findAllByTestId("plan")
          .first()
          .within(() => {
            cy.findByRole("button", { name: /Delete Layout/i }).click();
          });
      });

      it("removes the panel", () => {
        cy.findByTestId(`divSection-Tube`).within(() => {
          cy.findAllByTestId("plan").should("have.length", 1);
        });
      });
      after(() => {
        cy.findByText("Delete Layout").click();
      });
    });

    context("when adding a Pre-barcoded tube", () => {
      before(() => {
        cy.findAllByRole("combobox").last().select("Pre-barcoded tube");
        cy.findByTestId("numLabware").type("{selectall}").type("1");
        cy.findByText("+ Add Labware").click();
      });

      it("shows Barcode field", () => {
        cy.findByLabelText("Barcode").should("be.visible");
      });
      it("shows other fields", () => {
        checkBlockProcessingFields();
      });
      after(() => {
        cy.findByText("Delete Layout").click();
      });
    });
    context("when adding labware other than Pre-barcoded tube", () => {
      before(() => {
        cy.findAllByRole("combobox").last().select("Tube");
        cy.findByText("+ Add Labware").click();
      });

      it("should not show Barcode field", () => {
        cy.findByLabelText("Barcode").should("not.exist");
      });
      it("shows other fields", () => {
        checkBlockProcessingFields();
      });
    });

    describe("Save button", () => {
      context("when SGP Number is missing", () => {
        before(() => {
          cy.visit("/lab/block_processing");
          addLabwareAndSelectSource();
        });
        it("Save button is disabled", () => {
          cy.findByRole("button", { name: /Save/i }).should("be.disabled");
        });
      });
      context("when there is SGP Number", () => {
        before(() => {
          cy.visit("/lab/block_processing");
          addLabwareAndSelectSource();
          cy.findAllByRole("combobox").first().select("SGP1008");
        });
        it("Save button is enabled", () => {
          cy.findByRole("button", { name: /Save/i }).should("be.enabled");
        });
      });
    });

    describe("API Requests", () => {
      context("when request is successful", () => {
        context("when I click Save", () => {
          before(() => {
            // Store the barcode of the created labware
            cy.msw().then(({ worker, graphql }) => {
              const labwareType = labwareTypeInstances.find(
                (lt) => lt.name === LabwareTypeName.TUBE
              );
              const barcode = "STAN-111";
              const newLabware = labwareFactory.build({ labwareType, barcode });

              worker.use(
                graphql.mutation<
                  PerformTissueBlockMutation,
                  PerformTissueBlockMutationVariables
                >("PerformTissueBlock", (req, res, ctx) => {
                  return res(
                    ctx.data({
                      performTissueBlock: {
                        labware: [newLabware],
                        operations: [],
                      },
                    })
                  );
                })
              );
            });
            cy.findByRole("button", { name: /Save/i }).click();
          });

          it("displays Block processing complete page", () => {
            cy.findByText("Block processing complete").should("be.visible");
            cy.findByRole("table").should("exist");
          });

          it("displays the destination labware", function () {
            cy.findAllByText("STAN-111").its("length").should("be.gte", 1);
          });
        });

        context("Printing labels", () => {
          before(() => {
            printLabels();
          });

          it("shows a success message for print", () => {
            cy.findByText(/Tube Printer successfully printed/).should("exist");
          });
        });
      });
    });

    context("when request is unsuccessful", () => {
      before(() => {
        cy.visit("/lab/block_processing");
        cy.findAllByRole("combobox").first().select("SGP1008");
        addLabwareAndSelectSource();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<
              PerformTissueBlockMutation,
              PerformTissueBlockMutationVariables
            >("PerformTissueBlock", (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    extensions: {
                      problems: [
                        "This thing went wrong",
                        "This other thing went wrong",
                      ],
                    },
                  },
                ])
              );
            })
          );
        });
        cy.findByRole("button", { name: /Save/i }).click();
      });

      it("shows the errors", () => {
        cy.findByText("This thing went wrong").should("be.visible");
        cy.findByText("This other thing went wrong").should("be.visible");
      });
    });
  });
});

function checkBlockProcessingFields() {
  cy.findByLabelText("Replicate Number").should("be.visible");
  cy.findByLabelText("Discard source?").should("be.visible");
  cy.findByLabelText("Medium").should("be.visible");
  cy.findByLabelText("Processing comments").should("be.visible");
}
function addLabwareAndSelectSource() {
  cy.get("#labwareScanInput").type("STAN-113{enter}");

  cy.findAllByRole("combobox").last().select("Tube");
  cy.findByText("+ Add Labware").click();
  cy.findByText("Edit Layout").click();
  cy.findByRole("dialog").within(() => {
    cy.findByText("STAN-113").click();
    cy.findByText("A1").click();
    cy.findByText("Done").click();
  });
}

function printLabels() {
  cy.findByLabelText("printers").select("Tube Printer");
  cy.findByText("Print Labels").click();
}
