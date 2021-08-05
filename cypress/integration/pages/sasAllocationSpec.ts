describe("SAS Allocation", () => {
  before(() => {
    cy.visit("/sas");
  });

  describe("Allocating an SAS", () => {
    context(
      "when I submit the form without selecting a project or cost code",
      () => {
        before(() => {
          cy.findByRole("button", { name: /Submit/i }).click();
        });

        it("says project is required", () => {
          cy.findByText("Project is a required field").should("exist");
        });

        it("says cost code is required", () => {
          cy.findByText("Cost Code is a required field").should("exist");
        });
      }
    );

    context(
      "when I select a project and cost code and then submit the form",
      () => {
        before(() => {
          cy.findByLabelText("Project").select("TEST999");
          cy.findByLabelText("Cost Code").select("S999");
          cy.findByRole("button", { name: /Submit/i }).click();
        });

        it("allocates a new SAS", () => {
          cy.findByText(
            /Assigned SAS\d+ to project TEST999 and cost code S999/
          ).should("exist");
        });
      }
    );
  });

  describe("Editing the status of an SAS number", () => {
    context("when I click the Edit Status button", () => {
      before(() => {
        cy.findAllByRole("button", { name: /Edit Status/i }).then(
          (editButtons) => {
            editButtons[0].click();
          }
        );
      });

      it("shows a form to edit the status", () => {
        cy.findByLabelText("New Status").should("be.visible");
        cy.findByLabelText("Comment").should("be.visible");
        cy.findByRole("button", { name: /Cancel/i }).should("be.visible");
        cy.findByRole("button", { name: /Save/i }).should("be.visible");
      });
    });

    describe("Comments are shown or hidden dependent on chosen new status", () => {
      context("when new status is Pause", () => {
        before(() => {
          cy.findByLabelText("New Status").select("Pause");
        });

        it("shows the comments", () => {
          cy.findByLabelText("Comment").should("be.visible");
        });
      });

      context("when new status is Fail", () => {
        before(() => {
          cy.findByLabelText("New Status").select("Fail");
        });

        it("shows the comments", () => {
          cy.findByLabelText("Comment").should("be.visible");
        });
      });

      context("when new status is Complete", () => {
        before(() => {
          cy.findByLabelText("New Status").select("Complete");
        });

        it("does not show the comments", () => {
          cy.findByLabelText("Comment").should("not.exist");
        });
      });
    });

    describe("Saving the SAS status", () => {
      context("when I click save", () => {
        before(() => {
          cy.findByLabelText("New Status").select("Complete");
          cy.findByRole("button", { name: /Save/i }).click();
        });

        it("updates the SAS status", () => {
          cy.findByTestId("sas-allocation-table").within(() => {
            cy.findByText(/COMPLETED/i).should("exist");
          });
        });
      });
    });
  });
});
