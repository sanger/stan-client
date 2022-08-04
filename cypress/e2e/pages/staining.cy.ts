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

      it("shows a validation error for work number", () => {
        cy.findByText("SGP Number is a required field").should("be.visible");
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

  describe("On RNSAcope and IHC Stain type selection", () => {
    context("when RNAscope Stain Type is selected", () => {
      before(() => {
        cy.findByLabelText("Stain Type").select("RNAscope");
        cy.get("#labwareScanInput").type("STAN-3111{enter}");
      });
      it("displays a table to enter stain information", () => {
        cy.findByTestId("stain-info-table").contains("STAN-3111");
      });
      it("shows a table with RNAScope Plex Number column enabled", () => {
        cy.findByTestId("STAN-3111-plexRNAscope").should("be.enabled");
      });
      it("shows a table with IHC Plex Number column disabled", () => {
        cy.findByTestId("STAN-3111-plexIHC").should("be.disabled");
      });
    });
    context("when IHC Stain Type is selected", () => {
      before(() => {
        cy.findByLabelText("Stain Type").select("IHC");
      });
      it("shows a table with IHC Plex Number column enabled", () => {
        cy.findByTestId("STAN-3111-plexIHC").should("be.enabled");
      });
      it("shows a table with RNAScope Plex Number column disabled", () => {
        cy.findByTestId("STAN-3111-plexRNAscope").should("be.disabled");
      });
    });
    context("when RNAscope & IHC Stain Type is selected", () => {
      before(() => {
        cy.findByLabelText("Stain Type").select("RNAscope & IHC");
      });
      it("shows a table with RNAScope Plex Number column enabled", () => {
        cy.findByTestId("STAN-3111-plexRNAscope").should("be.enabled");
      });
      it("shows a table with IHC Plex Number column enabled", () => {
        cy.findByTestId("STAN-3111-plexIHC").should("be.enabled");
      });
    });
    context(
      "when 'Positive' is selected for experimental panel column in 'Apply all' row",
      () => {
        before(() => {
          cy.get("#labwareScanInput").type("STAN-4111{enter}");
          cy.findByTestId("all-panel").select("Positive");
        });
        it("selects 'Positive' value for all experimental panel columns", () => {
          cy.findAllByText("Positive").should("have.length", 3);
        });
      }
    );
  });
});
