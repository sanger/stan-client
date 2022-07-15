import { 
  CreateWorkMutation, 
  CreateWorkMutationVariables 
} from "../../../src/types/sdk";

describe("Work Allocation", () => {
  before(() => {
    cy.visit(
      "/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused"
    );
  });

  describe("Allocating Work", () => {
    context(
      "when I submit the form without selecting a work type, work requester, project, cost code or num blocks/slides/originalsamples",
      () => {
        before(() => {
          cy.findByRole("button", { name: /Submit/i })
            .scrollIntoView()
            .click();
        });

        it("says the work type is required", () => {
          cy.findByText("Work Type is a required field").should("exist");
        });

        it("says the work type is required", () => {
          cy.findByText("Work Requester is a required field").should("exist");
        });

        it("says project is required", () => {
          cy.findByText("Project is a required field").should("exist");
        });

        it("says cost code is required", () => {
          cy.findByText("Cost Code is a required field").should("exist");
        });
        it("says number of blocks, slides or original samples are required", () => {
          cy.findByText("Number of blocks, slides or original samples required").should("exist");
        });
      }
    );

    context(
      "when I select a work type, project, cost code, number of blocks/slides/originalsamples and then submit the form",
      () => {
        before(() => {
          cy.visit(
            "/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused"
          );
          cy.findByLabelText("Work Type").select("TEST_WT_1");
          cy.findByLabelText("Work Requester").select("et2");
          cy.findByLabelText("Project").select("TEST999");
          cy.findByLabelText("Cost Code").select("S999");
          cy.findByLabelText("Number of blocks").type("5");
          cy.findByLabelText("Number of slides").type("15");
          cy.findByLabelText("Number of original samples").type("1");
        });

        it("allocates new Work", () => {
          cy.findByRole("button", { name: /Submit/i }).click();
          cy.findByText(
            /Assigned SGP\d+ \(TEST_WT_1 - 5 blocks and 15 slides and 1 original samples\) to project TEST999 and cost code S999 with the work requester et2/
          ).should("exist");
        });

        it("shows an error when the request errors", () => {
          cy.msw().then(({ graphql, worker }) => {
            worker.use(
              graphql.mutation<
                CreateWorkMutation,
                CreateWorkMutationVariables
              >("CreateWork", (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      message: "SGP Request Error",
                    },
                  ])
                );
              })
            );
          });
          cy.findByRole("button", { name: /Submit/i }).click();
          cy.findByText("SGP Request Error").should("exist");
        });
      }
    );

    context("blocks, slide, original samples validation", () => {
      before(() => {
          cy.visit("/sgp");
      });

      it("should not show an error message if Number of Blocks has a value", () => {
          cy.get("input[name='numBlocks']").type("1");
          cy.findByRole("button", { name: /Submit/i }).should("be.visible").click();
          cy.findByText("Number of blocks, slides or original samples required").should("not.exist");;
      })

      it("should not show an error message if Number of slides has a value", () => {
          cy.get("input[name='numSlides']").type("1");
          cy.findByRole("button", { name: /Submit/i }).should("be.visible").click();
          cy.findByText("Number of blocks, slides or original samples required").should("not.exist");;
      })

      it("should not show an error message if Number of original samples has a value", () => {
          cy.get("input[name='numOriginalSamples']").type("1");
          cy.findByRole("button", { name: /Submit/i }).should("be.visible").click();
          cy.findByText("Number of blocks, slides or original samples required").should("not.exist");;
      })
    });
  });

  describe("Editing the number of blocks, slides and original samples column for Work ", () => {
    context("Entering a value in 'Number of blocks', 'Number of slides' and 'Number of original samples' cells in table", () => {
      before(() => {
        cy.findByTestId("SGP1008-block").type("1");
        cy.findByTestId("SGP1008-slide").type("2");
        cy.findByTestId("SGP1008-originalSamples").type("3");
        
        //change the focus
        cy.findAllByRole("button", { name: /Edit Status/i }).then(
          (editButtons) => {
            editButtons[0].focus();
          }
        );
      });

      it("updates the number of blocks", () => {
        cy.findByTestId("SGP1008-block").should("have.value", 1);
      });

      it("updates the number of slides", () => {
        cy.findByTestId("SGP1008-slide").should("have.value", 2);
      });

      it("updates the number of original samples", () => {
        cy.findByTestId("SGP1008-originalSamples").should("have.value", 3);
      });
    });
  });

  describe("Editing the priority column for Work ", () => {
    context("Entering a value in 'Priority' cell in table", () => {
      before(() => {
        cy.visit(
          "/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused"
        );
        cy.get("td").eq(0).type("A12");
        //change the focus
        cy.findAllByRole("button", { name: /Edit Status/i }).then(
          (editButtons) => {
            editButtons[0].focus();
          }
        );
      });

      it("updates priority", () => {
        cy.findByTestId("SGP1009" + "-" + "priority").should(
          "have.value",
          "A12"
        );
      });
    });

    context("Entering an invalid value in 'Priority' cell in table", () => {
      before(() => {
        cy.get("td").eq(0).clear().type("15");
        //change the focus
        cy.findAllByRole("button", { name: /Edit Status/i }).then(
          (editButtons) => {
            editButtons[0].focus();
          }
        );
      });

      it("displays a validation error message", () => {
        cy.findByText("Invalid format").scrollIntoView().should("be.visible");
      });
    });
  });

  describe("Editing the status of Work", () => {
    context("when I click the Edit Status button", () => {
      before(() => {
        cy.findAllByRole("button", { name: /Edit Status/i }).then(
          (editButtons) => {
            editButtons[0].click();
          }
        );
        cy.window().scrollTo("right");
      });

      it("shows a form to edit the status", () => {
        cy.findByLabelText("New Status").scrollIntoView().should("be.visible");
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
          cy.findAllByText(/ACTIVE/i).should("have.length.above", 0);
        });
      });
    });
  });

  describe("Sorting the SGP management table", () => {
    context("Filter SGP Numbers", () => {
      it("should show the correct work when a filter is applied", () => {
        cy.get("select[name='status']").select('Unstarted');
        cy.findByRole("button", { name: /Search/i }).should("be.visible").click();
        cy.get("table[data-testid='work-allocation-table']").find("tr").should("have.length", 10);
      });
    });

    context("while sorting using SGP number", () => {
      before(() => {
        cy.findByRole("button", { name: /SGP Number/i }).click();
      });

      it("displays the table sorted with SGP number in ascending order", () => {
        cy.get("td").eq(1).should("have.text", "R&D1005");
      });
    });
  });

  /*
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
  });*/
});
