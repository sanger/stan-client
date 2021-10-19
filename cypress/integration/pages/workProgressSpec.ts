import {
  FindWorkProgressQuery,
  FindWorkProgressQueryVariables,
} from "../../../src/types/sdk";

describe("Work Progress", () => {
  before(() => {
    cy.visit("./");
  });

  // TEST CASES for WorkProgressInput Component fields
  describe("Testing component fields", () => {
    context("when the type field is selected", () => {
      context("when Work Number is selected in dropdown for type", () => {
        before(() => {
          cy.findByTestId("type").select("SGP/R&D Number");
        });
        it("shows an input text field", () => {
          cy.get("[data-testid=valueInput]").should("have.value", "");
        });
      });
      context("when Status is selected in dropdown for type", () => {
        before(() => {
          cy.findByTestId("type").select("Status");
        });
        it("shows a drop down box with value unstarted ", () => {
          cy.get("[data-testid=valueSelect]").should("have.value", "unstarted");
        });
      });
      context(" when WorkType is selected in dropdown for type", () => {
        before(() => {
          cy.findByTestId("type").select("Work Type");
        });
        it("shows a drop down box with value", () => {
          cy.get("[data-testid = valueSelect").should("be.visible");
        });
      });
    });
  });

  // TESTCASES for  Work Number Search action
  describe("Testcases for  Work Number based search action", () => {
    before(() => {
      cy.visit("./");
      cy.findByTestId("type").select("SGP/R&D Number");
    });
    context("no value is entered", () => {
      it("shows a disabled search button ", () => {
        cy.findByRole("button", { name: /Search/i }).should("be.disabled");
      });
    });
    context("when a value is given", () => {
      before(() => {
        cy.findByTestId("valueInput").type("SGP1001");
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
    });
    context("when search action return no results", () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<
              FindWorkProgressQuery,
              FindWorkProgressQueryVariables
            >("FindWorkProgress", (req, res, ctx) => {
              return res.once(
                ctx.data({
                  workProgress: [],
                })
              );
            })
          );
        });
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show a notification", () => {
        cy.findByText(
          "There were no results for the given search. Please try again."
        ).should("be.visible");
      });
    });
  });

  //TESTCASES for WorkType based search
  describe("Testcases for WorkType based search", () => {
    before(() => {
      cy.visit("/");
      cy.findByTestId("type").select("Work Type");
    });
    context("when a value is given ", () => {
      before(() => {
        cy.findByTestId("valueSelect").select("Work Type 8");
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show table with result", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
    });
    context("when a value is given which has no results", () => {
      before(() => {
        cy.findByTestId("valueSelect").select("Work Type 2");
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show a notification", () => {
        cy.findByText(
          "There were no results for the given search. Please try again."
        ).should("be.visible");
      });
    });
  });

  //TESTCASES for Status based search
  describe("Test cases for Status based search", () => {
    before(() => {
      cy.findByTestId("type").select("Status");
    });
    context("when a value is given", () => {
      before(() => {
        cy.findByTestId("valueSelect").select("active");
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show a table with results", () => {
        cy.findByRole("table").contains("active");
      });
    });
    context("when a value is given with no results", () => {
      before(() => {
        cy.findByTestId("valueSelect").select("failed");
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show a notification", () => {
        cy.findByText(
          "There were no results for the given search. Please try again."
        ).should("be.visible");
      });
    });
  });

  //URL Test cases
  describe("Testing search based on query parameters in URL", () => {
    context("when url is given for WorkNumber", () => {
      before(() => {
        cy.visit("/?workNumber=SGP1001");
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
      it("will show the 'SGP/R&D Number' in  type dropdown ", () => {
        cy.findByTestId("type").should("have.value", "SGP/R&D Number");
      });
      it("will show the given work number in text box ", () => {
        cy.findByTestId("valueInput").should("have.value", "SGP1001");
      });
    });
    context("when valid url is given for WorkType", () => {
      before(() => {
        cy.visit("/?workType=Work%20Type%207");
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
      it("will display the given Work type in value dropdown", () => {
        cy.findByTestId("valueSelect").should("have.value", "Work Type 7");
      });
    });
    context("when invalid WorkType is given in url", () => {
      before(() => {
        cy.visit("/?workType=Invalid");
      });
      it("will show a warning", () => {
        cy.findByText(
          "There were no results for the given search. Please try again."
        ).should("be.visible");
      });
    });
    context("when valid url is given for Status", () => {
      before(() => {
        cy.visit("/?status=active");
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("active");
      });
      it("will display the given Status in value dropdown", () => {
        cy.findByTestId("valueSelect").should("have.value", "active");
      });
    });
    context("when invalid Status is given in url", () => {
      before(() => {
        cy.visit("/?status=Invalid");
      });
      it("will show a warning", () => {
        cy.findByText(
          "There were no results for the given search. Please try again."
        ).should("be.visible");
      });
    });
  });

  // GENERAL TEST CASES
  describe("Testing general conditions", () => {
    before(() => {
      cy.visit("./");
    });
    context("when URL query params are not set", () => {
      it("will not perform a search immediately", () => {
        cy.findByRole("table").should("not.exist");
      });
    });
    context("when search gets error from server", () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query("FindWorkProgress", (req, res, ctx) => {
              return res(
                ctx.errors([
                  {
                    message:
                      "Exception while fetching data (/find) : Something went wrong",
                  },
                ])
              );
            })
          );
        });
        cy.findByTestId("type").select("SGP/R&D Number");
        cy.findByTestId("valueInput").type("SGP1001");
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show a warning", () => {
        cy.findByText("Something went wrong").should("be.visible");
      });
    });
  });
});
