describe("Store", () => {
  describe("Location search", () => {
    context("when the location is found", () => {
      before(() => {
        cy.visit("/store");
        cy.wait(2000);
        cy.findByLabelText("Find Location:").type("STO-001F{enter}");
      });

      it("takes you to that location's page", () => {
        cy.location("pathname").should("eq", "/locations/STO-001F");
        cy.findByText("Location STO-001F could not be found").should(
          "not.be.visible"
        );
      });
    });

    context("when the location is not found", () => {
      before(() => {
        cy.visit("/store");
        cy.wait(2000);
        cy.findByLabelText("Find Location:").type("FAKE-LOCATION{enter}");
      });

      it("displays an error", () => {
        cy.location("pathname").should("eq", "/locations/FAKE-LOCATION");
        cy.findByText(
          "There was an error while trying to load the page. Please try again."
        ).should("be.visible");
      });
    });
  });

  describe("Labware search", () => {
    context("when the labware is found", () => {
      before(() => {
        cy.visit("/store");
        cy.wait(2000);
        cy.findByLabelText("Find Labware:").type("STAN-1001{enter}");
      });

      it("takes you to the location where the labware is stored", () => {
        cy.location("pathname").should("eq", "/locations/STO-014");
        cy.location("search").should("eq", "?labwareBarcode=STAN-1001");
      });

      it("displays which address the labware is in (if any)", () => {
        cy.findByTextContent("Labware STAN-1001 is in address 1").should(
          "be.visible"
        );
      });
    });

    context("when the labware is not found", () => {
      before(() => {
        cy.visit("/store");
        cy.wait(2000);
        cy.findByLabelText("Find Labware:").type("FAKE-LABWARE{enter}");
      });

      it("displays an error on the store page", () => {
        cy.findByText("FAKE-LABWARE could not be found in storage");
      });
    });
  });
});
