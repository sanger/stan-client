import {
  PlanMutation,
  PlanMutationVariables,
} from "../../../src/types/graphql";

describe("Sectioning", () => {
  before(() => {
    cy.visit("/lab/sectioning");
    cy.wait(2000);
  });

  describe("Add Labware button", () => {
    context("when there is no source labware loaded", () => {
      it("is disabled", () => {
        cy.get("#labwareScanInput").should("not.be.disabled");
      });
    });

    context("when there is source labware loaded", () => {
      before(() => {
        cy.get("#labwareScanInput").type("STAN-123{enter}");
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

  describe("Labware Layout", () => {
    context("when labware layout is added", () => {
      before(() => {
        cy.findByText("+ Add Labware").click();
      });

      it("has a disabled Create Labware button", () => {
        cy.findByRole("button", { name: /Create Labware/i }).should(
          "be.disabled"
        );
      });
    });

    context("when adding a layout", () => {
      before(() => {
        cy.findByText("Edit Layout").click();
        cy.findByRole("dialog").within(() => {
          cy.findByText("STAN-123").click();
          cy.findByText("A1").click();
          cy.findByText("Done").click();
        });
      });

      after(() => {
        cy.findByText("Delete Layout").click();
      });

      it("enables the Create Labware button", () => {
        cy.findByText("Create Labware").should("not.be.disabled");
      });

      context("when Quantity is invalid", () => {
        before(() => {
          cy.findByLabelText("Quantity").clear();
        });

        after(() => {
          cy.findByLabelText("Quantity").clear().type("1");
        });

        it("disabled the Create Labware button", () => {
          cy.findByRole("button", { name: /Create Labware/i }).should(
            "be.disabled"
          );
        });
      });

      context("when Section Thickness is invalid", () => {
        before(() => {
          cy.findByLabelText("Section Thickness").clear();
        });

        after(() => {
          cy.findByLabelText("Section Thickness").clear().type("5");
        });

        it("disabled the Create Labware button", () => {
          cy.findByText("Create Labware").should("be.disabled");
        });
      });
    });

    context("when adding a Visium TO layout", () => {
      before(() => {
        cy.findByRole("combobox").select("Visium LP");
        cy.findByText("+ Add Labware").click();
      });

      it("shows Barcode and Sectioning Thickness", () => {
        cy.findByLabelText("Quantity").should("not.be.visible");
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
        cy.wait(2000);
        createLabware();
      });

      it("removes the Sectioning Layout buttons", () => {
        cy.findByText("Create Labware").should("not.be.visible");
        cy.findByText("Delete Layout").should("not.be.visible");
      });

      it("disables the form inputs", () => {
        cy.findByLabelText("Quantity").should("be.disabled");
        cy.findByLabelText("Section Thickness").should("be.disabled");
      });

      it("shows the LabelPrinter", () => {
        cy.findByText("Print Labels").should("be.visible");
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
                return res(
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

        cy.wait(2000);
        createLabware();
      });

      it("shows the errors", () => {
        cy.findByText("This thing went wrong").should("be.visible");
        cy.findByText("This other thing went wrong").should("be.visible");
      });
    });
  });

  describe("Printing", () => {
    before(() => {
      cy.visit("/lab/sectioning");
      cy.wait(2000);
      createLabware();
    });

    context("when printing succeeds", () => {
      before(() => {
        cy.visit("/lab/sectioning");
        cy.wait(2000);
        createLabware();
        cy.findByLabelText("printers").select("slidelabel");
        cy.findByText("Print Labels").click();
      });

      it("shows a success message", () => {
        cy.findByText("slidelabel successfully printed STAN-002FB").should(
          "exist"
        );
      });
    });

    context("when printing fails", () => {
      before(() => {
        cy.visit("/lab/sectioning");
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation("Print", (req, res, ctx) => {
              return res(
                ctx.errors([
                  {
                    message: "slidelabel failed to print STAN-002FB",
                  },
                ])
              );
            })
          );
        });
        cy.wait(2000);
        createLabware();
        cy.findByLabelText("printers").select("slidelabel");
        cy.findByText("Print Labels").click();
      });

      it("shows an error message", () => {
        cy.findByText("slidelabel failed to print STAN-002FB").should("exist");
      });
    });
  });
});

function createLabware() {
  cy.get("#labwareScanInput").type("STAN-123{enter}");

  cy.findByRole("combobox").select("Tube");
  cy.findByText("+ Add Labware").click();
  cy.findByText("Edit Layout").click();
  cy.findByRole("dialog").within(() => {
    cy.findByText("STAN-123").click();
    cy.findByText("A1").click();
    cy.findByText("Done").click();
  });
  cy.findByText("Create Labware").click();
}
