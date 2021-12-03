describe("Staining Page", () => {
  before(() => {
    cy.visit("/lab/staining");
  });

  describe("Showing measurements", () => {
    context("when a Stain Type with measurements is selected", () => {
      before(() => {
        cy.findByLabelText("Stain Type").select("H&E");
      });

      it("shows measurements fields", () => {
        cy.findByText("Measurements").should("be.visible");
      });
    });

    context("when a Stain Type without measurements is selected", () => {
      before(() => {
        cy.findByLabelText("Stain Type").select("Masson's Trichrome");
      });

      it("doesn't show measurements fields", () => {
        cy.findByText("Measurements").should("not.exist");
      });
    });

    context("when no Stain Type is selected", () => {
      before(() => {
        cy.findByLabelText("Stain Type").select("");
      });

      it("doesn't show measurements fields", () => {
        cy.findByText("Measurements").should("not.exist");
      });
    });
  });

  describe("Validation", () => {
    context("when submitting the form with nothing filled in", () => {
      before(() => {
        cy.findByLabelText("Stain Type").select("Masson's Trichrome");
        cy.findByRole("button", { name: "Submit" }).click();
      });

      it("shows a validation error for labware", () => {
        cy.findByText("Labware field must have at least 1 items").should(
          "be.visible"
        );
      });
    });

    context("when a Stain Type with measurements is selected", () => {
      before(() => {
        cy.findByLabelText("Stain Type").select("H&E");
        cy.findByRole("button", { name: "Submit" }).click();
      });

      it("shows an error for missing durations", () => {
        cy.findAllByText("Duration must be greater than or equal to 1").should(
          "have.length",
          3
        );
      });
    });
  });
});
