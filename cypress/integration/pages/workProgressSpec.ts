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
          search().within(() =>
            cy.findByTestId("type").select("SGP/R&D Number")
          );
        });
        it("shows an input text field", () => {
          search().within(() =>
            cy.get("[data-testid=valueInput]").should("have.value", "")
          );
        });
      });
      context("when Status is selected in dropdown for type", () => {
        before(() => {
          search().within(() => cy.findByTestId("type").select("Status"));
        });
        it("shows a drop down box with value unstarted ", () => {
          search().within(() =>
            cy
              .get("[data-testid=valueSelect]")
              .should("have.value", "unstarted")
          );
        });
      });
      context(" when WorkType is selected in dropdown for type", () => {
        before(() => {
          search().within(() => cy.findByTestId("type").select("Work Type"));
        });
        it("shows a drop down box with value", () => {
          search().within(() =>
            cy.get("[data-testid = valueSelect]").should("be.visible")
          );
        });
      });
    });
  });

  // TESTCASES for  Work Number Search action
  describe("Testcases for  Work Number based search action", () => {
    before(() => {
      search().within(() => cy.findByTestId("type").select("SGP/R&D Number"));
    });
    context("no value is entered", () => {
      it("shows a disabled search button ", () => {
        cy.findByRole("button", { name: /Search/i }).should("be.disabled");
      });
    });
    context("when a search value is given", () => {
      before(() => {
        search().within(() => cy.findByTestId("valueInput").type("SGP1001"));
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
      it("displays filter options for worktype and status", () => {
        filter().within(() => {
          cy.findByTestId("type").should("have.value", "Work Type", "Status");
        });
      });
      context("when search result is filtered for 'Work Type 10", () => {
        before(() => {
          filter().within(() => {
            cy.findByTestId("type").select("Work Type");
            cy.findByTestId("valueSelect").select("Work Type 10");
          });
          cy.findByRole("button", { name: /Filter/i }).click();
        });
        it("should only displays WorkType 10 in table", () => {
          cy.findByRole("table").contains("td", "Work Type 10");
        });
        it("should only display WorkType 10 in table", () => {
          cy.findByRole("table")
            .find("tr")
            .then((row) => row.length === 1);
        });
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
      search().within(() => cy.findByTestId("type").select("Work Type"));
    });
    context("when a value is given ", () => {
      before(() => {
        search().within(() =>
          cy.findByTestId("valueSelect").select("Work Type 8")
        );
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show table with result", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
    });
    context("when a value is given which has no results", () => {
      before(() => {
        search().within(() =>
          cy.findByTestId("valueSelect").select("Work Type 2")
        );
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
    context("when a value is given", () => {
      before(() => {
        search().within(() => cy.findByTestId("type").select("Status"));
        search().within(() => cy.findByTestId("valueSelect").select("active"));
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show a table with results", () => {
        cy.findByRole("table").contains("active");
      });
    });
    context("when a value is given with no results", () => {
      before(() => {
        search().within(() => cy.findByTestId("valueSelect").select("failed"));
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
    context("when url is given for searching WorkNumber", () => {
      before(() => {
        cy.visit("?searchType=SGP%2FR%26D%20Number&searchValue=SGP1001");
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
      it("will show the 'SGP/R&D Number' in  type dropdown ", () => {
        search().within(() =>
          cy.findByTestId("type").should("have.value", "SGP/R&D Number")
        );
      });
      it("will show the given work number in text box ", () => {
        search().within(() =>
          cy.findByTestId("valueInput").should("have.value", "SGP1001")
        );
      });
    });
    context("when valid url is given for searching WorkType", () => {
      before(() => {
        cy.visit("/?searchType=Work%20Type&searchValue=Work%20Type%2010");
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
      it("will display the given Work type in value dropdown", () => {
        search().within(() =>
          cy.findByTestId("valueSelect").should("have.value", "Work Type 10")
        );
      });
    });
    context(
      "when valid url is given for filtering WorkType on Status search",
      () => {
        before(() => {
          cy.visit(
            "/?filterType=Work%20Type&filterValues[]=Work%20Type%2010&searchType=Status&searchValue=active"
          );
        });
        it("should only displays WorkType 10 in table", () => {
          cy.findByRole("table").contains("td", "Work Type 10");
        });
        it("should only display WorkType 10 in table", () => {
          cy.findByRole("table")
            .find("tr")
            .then((row) => row.length === 1);
        });
      }
    );

    context("when invalid WorkType is given in url", () => {
      before(() => {
        cy.visit("/?searchType=Work%20Type&searchValue=Invalid");
      });
      it("will show a warning", () => {
        cy.findByText(
          "There were no results for the given search. Please try again."
        ).should("be.visible");
      });
    });
    context("when valid url is given for searching Status", () => {
      before(() => {
        cy.visit("?searchType=Status&searchValue=active");
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("active");
      });
      it("will display the given Status in value dropdown", () => {
        search().within(() =>
          cy.findByTestId("valueSelect").should("have.value", "active")
        );
      });
    });
    context("when invalid Status is given in url", () => {
      before(() => {
        cy.visit("?searchType=Status&searchValue=Invalid");
      });
      it("will show a warning", () => {
        cy.findByText(
          "There were no results for the given search. Please try again."
        ).should("be.visible");
      });
    });
  });

  const search = () => cy.findByTestId("search");
  const filter = () => cy.findByTestId("filter");
});
