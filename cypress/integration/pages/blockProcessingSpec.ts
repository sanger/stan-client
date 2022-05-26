import { PlanMutation, PlanMutationVariables } from "../../../src/types/sdk";

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

      it("becomes disabled", () => {
        cy.get("#labwareScanInput").should("be.disabled");
      });

      context("when destination labware becomes empty again", () => {
        before(() => {
          cy.findByText("Delete Layout").click();
        });

        it("is re-enabled", () => {
          cy.get("#labwareScanInput").should("not.be.disabled");
        });
      });
    });
  });

  describe("Adding multiple labware", () => {
    before(() => {
      cy.findByTestId("labwareType").select("Tube");
      cy.findByTestId("numLabware").type("2");
      cy.findByText("+ Add Labware").click();
    });
    it("should display two Tubes", () => {
      cy.findByTestId(`divSection-tube`).within(() => {
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
        cy.findAllByText("Replicate Number").each((el, indx) => {
          cy.wrap(el)
            .find("input")
            .should("have.value", indx + 1);
        });
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

    context("when adding a layout", () => {
      before(() => {
        cy.findAllByText("Edit Layout").first().click();
        cy.findByRole("dialog").within(() => {
          cy.findByText("STAN-113").click();
          cy.findByText("A1").click();
          cy.findByText("Done").click();
        });
      });

      after(() => {
        cy.findByText("Delete Layout").click();
      });

      it("removes the panel", () => {
        cy.findByTestId(`divSection-tube`).within(() => {
          cy.findAllByTestId("plan").should("have.length", 1);
        });
      });
    });

    context("when adding a Pre-barcoded tube", () => {
      before(() => {
        cy.findByRole("combobox").select("Fetal waste container");
        cy.findByText("+ Add Labware").click();
      });

      it("shows only Number of Labware", () => {
        cy.findByLabelText("Number of Labware").should("be.visible");
        cy.findByLabelText("Barcode").should("not.exist");
        cy.findByLabelText("Section Thickness").should("not.exist");
        cy.findByText("Create Labware").should("be.disabled");
      });
      after(() => {
        cy.findByText("Delete Layout").click();
      });
    });

    context("when adding a Visium TO layout", () => {
      before(() => {
        cy.findByRole("combobox").select("Visium LP");
        cy.findByText("+ Add Labware").click();
      });

      it("shows Barcode and Sectioning Thickness", () => {
        cy.findByLabelText("Number of Labware").should("not.exist");
        cy.findByLabelText("Barcode").should("be.visible");
        cy.findByLabelText("Section Thickness").should("be.visible");
        cy.findByText("Create Labware").should("be.disabled");
      });
    });
  });

  describe("API Requests", () => {
    context("when request is successful", () => {
      before(() => {
        cy.visit("/lab/sectioning");
        createLabware();
      });

      it("removes the Sectioning Layout buttons", () => {
        cy.findByText("Create Labware").should("not.exist");
        cy.findByText("Delete Layout").should("not.exist");
      });

      it("disables the form inputs", () => {
        cy.findByLabelText("Number of Labware").should("be.disabled");
        cy.findByLabelText("Section Thickness").should("be.disabled");
      });

      it("shows the LabelPrinter", () => {
        cy.findByText("Print Labels").should("be.visible");
      });

      it("enables the Next button", () => {
        cy.findByRole("button", { name: /Next/i }).should("be.enabled");
      });

      context("when I click Next", () => {
        before(() => {
          // Store the barcode of the created labware
          cy.findByTestId("plan-destination-labware").within(() => {
            cy.get("td:first-child").invoke("text").as("destinationBarcode");
          });
          cy.findByRole("button", { name: /Next/i }).click();
        });

        it("takes me to the Sectioning Confirmation page", () => {
          cy.url().should("include", "/lab/sectioning/confirm");
        });

        it("displays the source labware", () => {
          cy.findAllByText("STAN-113").its("length").should("be.gte", 1);
        });

        it("displays the destination labware", function () {
          cy.findAllByText(this.destinationBarcode)
            .its("length")
            .should("be.gte", 1);
        });
      });
    });

    context("when request is unsuccessful", () => {
      before(() => {
        cy.visit("/lab/sectioning");

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<PlanMutation, PlanMutationVariables>(
              "Plan",
              (req, res, ctx) => {
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
              }
            )
          );
        });

        createLabware();
      });

      it("shows the errors", () => {
        cy.findByText("This thing went wrong").should("be.visible");
        cy.findByText("This other thing went wrong").should("be.visible");
      });

      it("doesn't enable the Next button", () => {
        cy.findByRole("button", { name: /Next/i }).should("not.be.enabled");
      });
    });
  });

  describe("Printing", () => {
    context("when printing succeeds", () => {
      before(() => {
        cy.visit("/lab/sectioning");
        createLabware();
        printLabels();
      });

      it("shows a success message", () => {
        cy.findByText(/Tube Printer successfully printed/).should("exist");
      });
    });

    context("when printing fails", () => {
      before(() => {
        cy.visit("/lab/sectioning");
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation("Print", (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    message: "Tube Printer failed to print",
                  },
                ])
              );
            })
          );
        });
        createLabware();
        printLabels();
      });

      it("shows an error message", () => {
        cy.findByText(/Tube Printer failed to print/).should("exist");
      });
    });
  });
});

function createLabware() {
  cy.get("#labwareScanInput").type("STAN-113{enter}");

  cy.findByRole("combobox").select("Tube");
  cy.findByText("+ Add Labware").click();
  cy.findByText("Edit Layout").click();
  cy.findByRole("dialog").within(() => {
    cy.findByText("STAN-113").click();
    cy.findByText("A1").click();
    cy.findByText("Done").click();
  });
  cy.findByLabelText("Section Thickness").type("5");
  cy.findByText("Create Labware").click();
}

function printLabels() {
  cy.findByLabelText("printers").select("Tube Printer");
  cy.findByText("Print Labels").click();
}
