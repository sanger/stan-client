describe("Visium Perm", () => {
  before(() => cy.visit("/lab/visium_perm"));

  describe("filling in form", () => {
    before(() => {
      cy.get("#labwareScanInput").type("STAN-4111{enter}");
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

  describe("scanning labware with empty slots", () => {
    before(() => {
      cy.visit("/lab/visium_perm");
      cy.get("#labwareScanInput").type("STAN-4011{enter}");
    });

    it("displays control tube scanner", () => {
      cy.findByText("Control Tube").should("be.visible");
    });

    context("when user scans control tube", () => {
      before(() => {
        cy.findByTestId("controltubeDiv").within(() => {
          cy.get("#labwareScanInput").type("STAN-3111{enter}");
        });
      });
      it("displays the table with control tube", () => {
        cy.findByText("STAN-3111").should("be.visible");
      });
      it("displays Positive control checkbox for all slots", () => {
        cy.findAllByRole("checkbox", { name: /Positive Control/i }).should(
          "have.length",
          4
        );
      });
    });

    context("when a control tube is selected for A1", () => {
      before(() => {
        cy.findAllByRole("checkbox").eq(0).click();
      });
      it("displays the control tube barcode for A1 slot", () => {
        cy.findAllByTestId("permData.0.label").should("have.text", "STAN-3111");
      });
    });

    context("when address A2 is assigned with control tube", () => {
      before(() => {
        cy.findAllByRole("checkbox").eq(1).click();
      });
      it("removes the control tube from A1 and displays in A2", () => {
        cy.findAllByTestId("permData.0.label").should("have.text", "");
        cy.findAllByTestId("permData.1.label").should("have.text", "STAN-3111");
      });
    });

    context("when scanned control tube is removed", () => {
      before(() => {
        cy.findByTestId("controltubeDiv").within(() => {
          cy.findByTestId("removeButton").click();
        });
      });
      it("removes the control tube assigned", () => {
        cy.findAllByText("STAN-3111").should("not.exist");
      });
    });
    context("when submit button clicked with control tube data", () => {
      before(() => {
        cy.findByTestId("controltubeDiv").within(() => {
          cy.get("#labwareScanInput").type("STAN-3111{enter}");
        });
        cy.findAllByRole("checkbox").eq(1).click();
        cy.findByRole("button", { name: "Submit" }).click();
      });
      it("submits the form", () => {
        cy.findByText("Visium Permeabilisation complete").should("be.visible");
      });
    });
  });
});
