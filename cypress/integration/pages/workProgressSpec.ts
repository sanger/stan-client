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
          cy.get("[data-testid = valueSelect]")
            .children("option")
            .then(($options) => {
              const optionValues = $options.toArray().map((elem) => elem.label);
              expect(optionValues).to.deep.eq([
                "unstarted",
                "active",
                "paused",
                "completed",
                "failed",
              ]);
            });
        });
      });
      context(" when WorkType is selected in dropdown for type", () => {
        before(() => {
          cy.findByTestId("type").select("Work Type");
        });
        it("shows a drop down box with value", () => {
          cy.get("[data-testid = valueSelect]")
            .children("option")
            .then(($options) => {
              const optionValues = $options.toArray().map((elem) => elem.label);
              expect(optionValues).to.deep.eq([
                "Work Type 1",
                "Work Type 2",
                "Work Type 3",
                "TEST_WT_1",
                "Work Type 5",
                "Work Type 6",
                "Work Type 7",
                "Work Type 8",
                "Work Type 9",
                "Work Type 10",
                "Work Type 11",
                "Work Type 12",
                "Work Type 13",
              ]);
            });
        });
      });
    });
  });

  // TESTCASES for  Work Number Search action
  describe("Testcases for  Work Number based search action", () => {
    before(() => {
      cy.findByTestId("type").select("SGP/R&D Number");
    });
    context("no value is entered", () => {
      it("shows a disabled search button ", () => {
        cy.findByRole("button", { name: /Search/i }).should("be.disabled");
      });
    });
    context("when a search value is given", () => {
      before(() => {
        cy.findByTestId("valueInput").type("SGP1001");
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
    });
  });

  //TESTCASES for WorkType based search
  describe("Testcases for WorkType based search", () => {
    before(() => {
      cy.findByTestId("type").select("Work Type");
    });
    context("when a value is given ", () => {
      before(() => {
        cy.findByTestId("valueSelect").select(["Work Type 10", "Work Type 11"]);

        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("will show table with result", () => {
        cy.findByRole("table").contains("Work Type 11");
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
  describe("Testing Status based search", () => {
    context("when a value is given", () => {
      before(() => {
        cy.findByTestId("type").select("Status");
        cy.findByTestId("valueSelect").select(["active", "completed"]);
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

  //Testing WorkNumber link
  describe("Testing WorkNumber link", () => {
    context("when a search is performed using work number", () => {
      before(() => {
        cy.findByTestId("type").select("SGP/R&D Number");
        cy.findByTestId("valueInput").type("SGP1001");
        cy.findByRole("button", { name: /Search/i }).click();
      });
      it("shows a link for work type in the results table", () => {
        cy.findByRole("table").within(() => {
          cy.findByRole("link", { name: "SGP1001" }).should("exist");
        });
      });
    });
    context("when clicking WorkNumber link", () => {
      before(() => {
        cy.findByRole("link", { name: "SGP1001" }).click();
      });
      it("displays the history page for SGP1001", () => {
        cy.url().should("include", "/history/?kind=workNumber&value=SGP1001");
        cy.findAllByText("History").should("have.length.above", 1);
      });
    });
  });

  //URL Test cases
  describe("Testing search based on query parameters in URL", () => {
    context("when url is given for searching WorkNumber", () => {
      before(() => {
        cy.visit("?searchType=SGP%2FR%26D%20Number&searchValues[]=SGP1001");
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
    context("when valid url is given for searching WorkType", () => {
      before(() => {
        cy.visit("/?searchType=Work%20Type&searchValues[]=Work%20Type%2010");
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("SGP/R&D Number");
      });
      it("will display the given Work type in value dropdown", () => {
        cy.findByTestId("valueSelect")
          .invoke("val")
          .should("deep.equal", ["Work Type 10"]);
      });
    });

    context("when valid url is given for searching Status", () => {
      before(() => {
        cy.visit("?searchType=Status&searchValues[]=active");
      });
      it("shows a list of results", () => {
        cy.findByRole("table").contains("active");
      });
      it("will display the given Status in value dropdown", () => {
        cy.findByTestId("valueSelect")
          .invoke("val")
          .should("deep.equal", ["active"]);
      });
    });
  });
});
