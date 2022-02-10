describe("Visium Perm", () => {
  before(() => cy.visit("/lab/visium_perm"));

  describe("filling in form", () => {
    before(() => {
      cy.get("#labwareScanInput").type("STAN-411{enter}");
    });

    it("enables the button", () => {
      cy.findByRole("button", { name: "Submit" }).should("not.be.disabled");
    });

    context("when clicking Submit", () => {
      before(() => cy.findByRole("button", { name: "Submit" }).click());

      it("submits the form", () => {
        cy.findByText("Visium Permeabilisation complete").should("be.visible");
      });
    });
  });
  describe("checking control barcode input", () => {
    before(() => {
      cy.get("#labwareScanInput").type("STAN-411{enter}");
    });

    it("enables the button", () => {
      cy.findByRole("button", { name: "Submit" }).should("not.be.disabled");
    });

    context("when clicking Submit", () => {
      before(() => cy.findByRole("button", { name: "Submit" }).click());

      it("submits the form", () => {
        cy.findByText("Visium Permeabilisation complete").should("be.visible");
      });
    });
  });
});
