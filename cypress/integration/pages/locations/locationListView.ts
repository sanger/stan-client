describe("Location - List View", () => {
  before(() => {
    cy.visit("/locations/STO-014");
    cy.wait(2000);
    cy.findByTestId("listIcon").click();
  });

  it("shows stored items", () => {
    for (let i = 1; i <= 6; i++) {
      cy.findByText(`STAN-100${i}`).should("be.visible");
    }
  });

  context("when scanning in a labware barcode", () => {
    before(() => {
      cy.findByPlaceholderText("Labware barcode...").type("STAN-2001{enter}");
    });

    it("stores the barcode", () => {
      cy.findByText(`STAN-2001`).should("be.visible");
    });

    it("displays a success message", () => {
      cy.findByText("Barcode successfully stored").should("be.visible");
    });

    it("sets the ScanInput to empty", () => {
      cy.findByPlaceholderText("Labware barcode...").should("have.value", "");
    });
  });

  context("when clicking the cross next to an item barcode", () => {
    before(() => {
      cy.get("table tr button").first().click();
    });

    it("shows a confirmation modal", () => {
      cy.findByTextContent(
        "Are you sure you want to remove STAN-1001 from Box 1 in Rack 1 in Freezer 1 in Room 1234?"
      ).should("exist");
    });

    context("when confirming", () => {
      before(() => {
        cy.findByRole("button", { name: /Unstore Barcode/i }).click();
      });

      it("unstores the barcode", () => {
        cy.findByText("STAN-1001").should("not.exist");
      });

      it("displays a success message", () => {
        cy.findByText("Barcode successfully unstored").should("be.visible");
      });
    });
  });
});
