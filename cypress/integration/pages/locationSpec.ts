describe("Location", () => {
  before(() => {
    cy.visit("/locations/STO-024");
  });

  describe("Custom Names", () => {
    it("displays the custom name", () => {
      cy.findByText("Box 3 in Rack 3 in Freezer 1 in Room 1234").should(
        "be.visible"
      );
    });

    context("when I click and edit the custom name", () => {
      before(() => {
        cy.findByText("Box 3 in Rack 3 in Freezer 1 in Room 1234").click();
        cy.focused().type("Freezer McCool{enter}");
      });

      it("updates it", () => {
        cy.findByText("Freezer McCool").should("be.visible");
      });
    });
  });

  describe("Displaying Properties", () => {
    it("displays the name", () => {
      cy.findByText("Location 24").should("exist");
    });

    it("displays the barcode", () => {
      cy.findByText("STO-024").should("exist");
    });

    it("displays the parent", () => {
      cy.findByText("Rack 3 in Freezer 1 in Room 1234").should("exist");
    });

    it("displays the size", () => {
      cy.findByTextContent("5 row(s) and 5 column(s)").should("exist");
    });

    it("displays the number of stored items", () => {
      cy.findByTestId("storedItemsCount").should("contain", "6");
    });

    it("displays the layout", () => {
      cy.findByText("RightUp").should("exist");
    });

    it("displays a section for Stored Items", () => {
      cy.findByText("Stored Items").should("exist");
    });
  });

  describe("Empty Location", () => {
    context('when clicking the "Empty Location" button', () => {
      before(() => {
        cy.findByRole("button", { name: /Empty Location/i }).click();
      });

      it("shows a confirmation modal", () => {
        cy.findByTextContent(
          "Are you sure you want to remove all labware from Freezer McCool?"
        ).should("exist");
      });

      context('When clicking the "Remove All Labware" button', () => {
        before(() => {
          cy.findByRole("button", { name: /Remove All Labware/i }).click();
        });

        it("removes all labware from the Location", () => {
          cy.findByTestId("storedItemsCount").should("contain", "0");
        });

        it("shows a success message", () => {
          cy.findByText("Location emptied").should("be.visible");
        });
      });
    });
  });

  describe("Stored Items", () => {
    context("when Location has children", () => {
      before(() => {
        cy.visit("/locations/STO-005");
      });

      it("doesn't display a section for Stored Items", () => {
        cy.findByText("Stored Items").should("not.exist");
      });
    });
  });
});
