import {
  PerformTissuePotMutation,
  PerformTissuePotMutationVariables,
} from "../../../src/types/sdk";
import { labwareTypeInstances } from "../../../src/lib/factories/labwareTypeFactory";
import labwareFactory from "../../../src/lib/factories/labwareFactory";
import { LabwareTypeName } from "../../../src/types/stan";
import { shouldDisplyProjectAndUserNameForWorkNumber } from "../shared/workNumberExtraInfo.cy";

describe("Pot Processing", () => {
  shouldDisplyProjectAndUserNameForWorkNumber(
    "/lab/original_sample_processing?type=pot"
  );
  describe("Add Labware button", () => {
    context("when there is no source labware loaded", () => {
      it("is disabled", () => {
        cy.findByText("+ Add Labware").should("be.disabled");
      });
    });

    context("when source labware is loaded", () => {
      before(() => {
        scanInput();
      });

      it("is enabled", () => {
        cy.findByText("+ Add Labware").should("not.be.disabled");
      });
      it("scan labware input becomes disabled", () => {
        cy.get("#labwareScanInput").should("be.disabled");
      });
    });
  });

  describe("Labware type selection", () => {
    context("when Pot is selected", () => {
      before(() => {
        cy.findByTestId("labwareType").select("Pot");
      });
      it("should display Labware type, Fixative, Number of labware columns for adding labware", () => {
        cy.findByText("Labware type").should("be.visible");
        cy.findByText("Fixative").should("be.visible");
        cy.findByText("Number of labware").should("be.visible");
      });
    });
    context("when Fetal waste container is selected", () => {
      before(() => {
        cy.findByTestId("labwareType").select("Fetal waste container");
      });
      it("should only display Labware type and Number of labware columns for adding labware", () => {
        cy.findByText("Labware type").should("be.visible");
        cy.findByText("Fixative").should("not.exist");
        cy.findByText("Number of labware").should("be.visible");
      });
    });
  });

  describe("Leaving page", () => {
    context("when I try and leave the page", () => {
      it("shows a confirm box", () => {
        cy.on("window:confirm", (str) => {
          expect(str).to.equal(
            "You have unsaved changes. Are you sure you want to leave?"
          );
          // Returning false cancels the event
          return false;
        });

        cy.findByText("Search").click();
      });
    });
  });

  describe("Pot labware", () => {
    context("when adding Pot labware", () => {
      before(() => {
        fillSGPNumber();
        cy.findByTestId("labwareType").select("Pot");
        cy.findByTestId("numLabware").type("{selectall}").type("2");
        cy.findByTestId("fixative").select("Formalin");
        cy.findByText("+ Add Labware").click();
      });
      it("should display two Pots", () => {
        cy.findByTestId(`divSection-Pot`).within(() => {
          cy.findAllByTestId("plan").should("have.length", 2);
        });
      });
      it("should autofill all fixatives", () => {
        cy.findAllByLabelText("Fixative").each((elem) => {
          cy.wrap(elem).should("have.value", "Formalin");
        });
      });

      it("should enable save button", () => {
        cy.findByRole("button", { name: /Save/i }).should("be.enabled");
      });
    });
    context("when Fixative field is cleared", () => {
      before(() => {
        cy.findAllByLabelText("Fixative").first().select("");
      });
      it("should disable save button", () => {
        cy.findByRole("button", { name: /Save/i }).should("be.disabled");
      });
    });
  });
  describe("Work Number", () => {
    context("when work number is empty", () => {
      before(() => {
        cy.findAllByRole("combobox").first().select("");
      });
      it("should disable save button", () => {
        cy.findByRole("button", { name: /Save/i }).should("be.disabled");
      });
    });
  });

  describe("Labware deletion", () => {
    context("when deleting a layout", () => {
      before(() => {
        cy.findAllByTestId("plan")
          .first()
          .within(() => {
            cy.findByRole("button", { name: /Delete Layout/i }).click();
          });
      });

      it("removes the panel", () => {
        cy.findByTestId(`divSection-Pot`).within(() => {
          cy.findAllByTestId("plan").should("have.length", 1);
        });
      });
    });
  });

  describe("Adding Fetal waste container labware", () => {
    before(() => {
      cy.visit("/lab/original_sample_processing?type=pot");
      scanInput();
      cy.findByTestId("labwareType").select("Fetal waste container");
      cy.findByTestId("numLabware").type("{selectall}").type("2");
      cy.findByText("+ Add Labware").click();

      fillSGPNumber();
    });
    it("should display two Fetal waste containers", () => {
      cy.findByTestId(`divSection-Fetalwastecontainer`).within(() => {
        cy.findAllByTestId("plan").should("have.length", 2);
      });
    });

    it("should not show Fixative field", () => {
      cy.findByLabelText("Fixative").should("not.exist");
    });
    it("should enable save button", () => {
      cy.findByRole("button", { name: /Save/i }).should("be.enabled");
    });
  });

  describe("API Requests", () => {
    context("when request is successful", () => {
      context("when I click Save", () => {
        before(() => {
          // Store the barcode of the created labware
          cy.msw().then(({ worker, graphql }) => {
            const labwareType = labwareTypeInstances.find(
              (lt) => lt.name === LabwareTypeName.POT
            );
            const barcode = "STAN-111";
            const newLabware = labwareFactory.build({ labwareType, barcode });

            worker.use(
              graphql.mutation<
                PerformTissuePotMutation,
                PerformTissuePotMutationVariables
              >("PerformTissuePot", (req, res, ctx) => {
                return res(
                  ctx.data({
                    performPotProcessing: {
                      labware: [newLabware],
                      operations: [],
                    },
                  })
                );
              })
            );
          });
          cy.findByRole("button", { name: /Save/i }).click();
        });

        it("displays Pot processing complete page", () => {
          cy.findByText("Pot processing complete").should("be.visible");
          cy.findByRole("table").should("exist");
        });

        it("displays destination labware", function () {
          cy.findAllByText("STAN-111").its("length").should("be.gte", 1);
        });
      });

      context("Printing labels", () => {
        before(() => {
          printLabels();
        });

        it("shows a success message for print", () => {
          cy.findByText(/Pot Printer successfully printed/).should("exist");
        });
      });
    });
  });

  context("when request is unsuccessful", () => {
    before(() => {
      cy.visit("/lab/original_sample_processing?type=pot");
      scanInput();
      cy.findByTestId("labwareType").select("Pot");
      cy.findByTestId("numLabware").type("{selectall}").type("1");
      cy.findByTestId("fixative").select("Formalin");
      cy.findByText("+ Add Labware").click();
      fillSGPNumber();
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<
            PerformTissuePotMutation,
            PerformTissuePotMutationVariables
          >("PerformTissuePot", (req, res, ctx) => {
            return res.once(
              ctx.errors([
                {
                  extensions: {
                    problems: [
                      "This thing went wrong",
                      "This other thing went wrong",
                    ],
                  },
                },
              ])
            );
          })
        );
      });
      cy.findByRole("button", { name: /Save/i }).click();
    });

    it("shows the errors", () => {
      cy.findByText("This thing went wrong").should("be.visible");
      cy.findByText("This other thing went wrong").should("be.visible");
    });
  });
});

function scanInput() {
  cy.get("#labwareScanInput").type("STAN-113{enter}");
}

function printLabels() {
  cy.findByLabelText("printers").select("Pot Printer");
  cy.findByText("Print Labels").click();
}
function fillSGPNumber() {
  cy.findAllByRole("combobox").first().select("SGP1008");
}
