describe("Unrelease Page", () => {
  before(() => {
    cy.visit("/admin/unrelease");
  });

  describe("Validation", () => {
    context("when the section number is below 0", () => {
      before(() => {
        cy.get("#labwareScanInput")
          .should("not.be.disabled")
          .wait(1000)
          .type("STAN-611{enter}");

        cy.get("input[name='labware.0.highestSection']").type("{selectall}-1");

        cy.findByRole("button", { name: /Submit/i }).click();
      });

      it("shows an error", () => {
        cy.findByText(
          "Section number must be greater than or equal to 0"
        ).should("be.visible");
      });
    });
  });
});
