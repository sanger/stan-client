describe("Original Sample Processing", () => {
  before(() => {
    cy.visit("/lab/original_sample_processing");
  });

  context("when there is no type selected", () => {
    it("displays text to start choosing processing type ", () => {
      cy.findByText("Choose a processing type to get started:").should(
        "be.visible"
      );
    });
  });

  context("when Block Processing is selected", () => {
    before(() => {
      cy.findByRole("combobox").select("Block Processing");
    });

    it("should display Block Processing page ", () => {
      cy.url().should("include", "/lab/original_sample_processing?type=block");
    });
  });
  context("when Pot Processing is selected", () => {
    before(() => {
      cy.visit("/lab/original_sample_processing");
      cy.findByRole("combobox").select("Pot Processing");
    });

    it("should display Pot Processing page ", () => {
      cy.url().should("include", "/lab/original_sample_processing?type=pot");
    });
    after(() => {
      cy.visit("/lab/original_sample_processing");
    });
  });
});
