describe("Location Grid View", () => {
  before(() => {
    cy.visit("/locations/STO-014");
    cy.wait(2000);
  });

  it("selects the first available address", () => {
    cy.findByText("Selected Address: 2").should("be.visible");
  });

  context("when scanning in a barcode", () => {
    before(() => {
      cy.findByPlaceholderText("Labware barcode...").type("STAN-2001{enter}");
    });

    it("stores it", () => {
      cy.findByText("STAN-2001").should("be.visible");
    });

    it("shows a success message", () => {
      cy.findByText("Barcode successfully stored").should("be.visible");
    });

    it("selects the next available address", () => {
      cy.findByText("Selected Address: 3").should("be.visible");
    });

    it("empties the value of the ScanInput", () => {
      cy.findByPlaceholderText("Labware barcode...").should("have.value", "");
    });
  });

  context("when selecting an occupied address", () => {
    before(() => {
      cy.findByText("STAN-2001").click();
    });

    it("locks the ScanInput", () => {
      cy.findByPlaceholderText("Labware barcode...").should("be.disabled");
    });

    it("shows a delete button", () => {
      cy.findByTestId("selectedAddress").find("button").should("be.visible");
    });

    context("when clicking the button", () => {
      before(() => {
        cy.findByTestId("selectedAddress").find("button").click();
      });

      it("shows a confirmation modal", () => {
        cy.findByTextContent(
          "Are you sure you want to remove STAN-2001 from Box 1 in Rack 1 in Freezer 1 in Room 1234?"
        ).should("be.visible");
      });

      context("when confirming", () => {
        before(() => {
          cy.findByRole("button", { name: /Unstore Barcode/i }).click();
        });

        it("unstores the barcode", () => {
          cy.findByText("STAN-2001").should("not.exist");
        });

        it("shows a success message", () => {
          cy.findByText("Barcode successfully unstored").should("be.visible");
        });
      });
    });
  });
});
