describe("Fetal Waste Page", () => {
  before(() => {
    cy.visit("/lab/fetal_waste");
  });

  describe("Validation", () => {
    context("when submitting the form with nothing filled in", () => {
      before(() => cy.findByRole("button", { name: "Submit" }).click());

      it("shows a validation error for labware", () => {
        cy.findByText("Labware field must have at least 1 items").should(
          "be.visible"
        );
      });
    });
  });
});
