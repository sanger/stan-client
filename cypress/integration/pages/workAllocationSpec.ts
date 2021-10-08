describe("Work Allocation", () => {
  before(() => {
    cy.visit("/sgp");
  });

  describe("Allocating Work", () => {
    context(
      "when I submit the form without selecting a work type, project, or cost code",
      () => {
        before(() => {
          cy.findByRole("button", { name: /Submit/i }).click();
        });

        it("says the work type is required", () => {
          cy.findByText("Work Type is a required field").should("exist");
        });

        it("says project is required", () => {
          cy.findByText("Project is a required field").should("exist");
        });

        it("says cost code is required", () => {
          cy.findByText("Cost Code is a required field").should("exist");
        });
        it("says number of blocks or slides is required", () => {
          cy.findByText("Number of blocks or slides required").should("exist");
        });
      }
    );

    context(
      "when I select a work type, project, cost code,number of blocks/slides and then submit the form",
      () => {
        before(() => {
          cy.findByLabelText("Work Type").select("TEST_WT_1");
          cy.findByLabelText("Project").select("TEST999");
          cy.findByLabelText("Cost Code").select("S999");
          cy.findByLabelText("Number of blocks").type("5");
          cy.findByLabelText("Number of slides").type("15");
          cy.findByRole("button", { name: /Submit/i }).click();
        });

        it("allocates new Work", () => {
          cy.findByText(
            /Assigned SGP\d+ \(TEST_WT_1 - 5 blocks and 15 slides\) to project TEST999 and cost code S999/
          ).should("exist");
        });
      }
    );
  });

  describe("Editing the status of Work", () => {
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
        cy.findByRole("button", { name: /Cancel/i }).should("be.visible");
        cy.findByRole("button", { name: /Save/i }).should("be.visible");
      });
    });

    context("when saving active status", () => {
      before(() => {
        cy.findByLabelText("New Status").select("Active");
        cy.findByRole("button", { name: /Save/i }).click();
      });
      it("updates the Work status", () => {
        cy.findByTestId("work-allocation-table").within(() => {
          cy.findByText(/ACTIVE/i).should("exist");
        });
      });
    });
  });

  describe("Comments are shown or hidden dependent on chosen new status", () => {
    before(() => {
      cy.findAllByRole("button", { name: /Edit Status/i }).then(
        (editButtons) => {
          editButtons[0].click();
        }
      );
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

  describe("Saving the Work status", () => {
    context("when I click save", () => {
      before(() => {
        cy.findByLabelText("New Status").select("Complete");
        cy.findByRole("button", { name: /Save/i }).click();
      });

      it("updates the Work status", () => {
        cy.findByTestId("work-allocation-table").within(() => {
          cy.findByText(/COMPLETED/i).should("exist");
        });
      });
    });
  });
});
