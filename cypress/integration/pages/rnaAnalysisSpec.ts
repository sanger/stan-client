import {
  ExtractResultQuery,
  ExtractResultQueryVariables,
  PassFail,
} from "../../../src/types/sdk";
import { labwareTypeInstances } from "../../../src/lib/factories/labwareTypeFactory";
import { LabwareTypeName } from "../../../src/types/stan";
import labwareFactory from "../../../src/lib/factories/labwareFactory";
import { extractResultMachine } from "../../../src/components/extractResult/extractResult.machine";

function scanLabware(barcode: string) {
  cy.get("#labwareScanInput")
    .should("not.be.disabled")
    .clear()
    .type(`${barcode}{enter}`);
}
describe("RNA Analysis", () => {
  before(() => {
    cy.visit("/lab/rna_analysis");
  });

  context("when barcode is scanned whose extraction is recorded", () => {
    before(() => {
      scanLabware("STAN-3111");
    });
    it("displays the table with the barcode", () => {
      cy.findByRole("table").contains("STAN-3111");
    });
    it("enables the Analysis button", () => {
      cy.get("#analysis").should("be.enabled");
    });
  });
  context("when same barcode is entered multiple times", () => {
    before(() => {
      scanLabware("STAN-3111");
    });
    it("displays the error message", () => {
      cy.findByText(`"STAN-3111" has already been scanned`).should(
        "be.visible"
      );
    });
  });

  context("removes the row when delete button is pressed ", () => {
    before(() => {
      cy.findByTestId("remove").click();
    });
    it("should remove the row", () => {
      cy.get("[data-testid=remove]").should("not.exist");
    });
    it("disables the Analysis button", () => {
      cy.get("#analysis").should("be.disabled");
    });
    after(() => {
      scanLabware("STAN-3111");
    });
  });
  context("when barcode is scanned whose extraction is not recorded", () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        const labwareType = labwareTypeInstances.find(
          (lt) => lt.name === LabwareTypeName.TUBE
        );
        // Create the new bit of labware
        const newLabware = labwareFactory.build({
          labwareType,
        });
        newLabware.barcode = "STAN-3112";
        worker.use(
          graphql.query<ExtractResultQuery, ExtractResultQueryVariables>(
            "ExtractResult",
            (req, res, ctx) => {
              return res.once(
                ctx.data({
                  extractResult: {
                    result: undefined,
                    labware: newLabware,
                    concentration: undefined,
                  },
                })
              );
            }
          )
        );
      });
      scanLabware("STAN-3112");
    });
    it("displays a warning message", () => {
      cy.findByText("No extraction recorded for the tube STAN-3112").should(
        "be.visible"
      );
    });
    it("will not display STAN-3112 in table", () => {
      cy.findByRole("table").get("STAN-3112").should("not.exist");
    });
  });

  context("when analysis button is pressed", () => {
    before(() => {
      cy.get("#analysis").click();
    });

    it("displays table to enter analysis data", () => {
      cy.findAllByRole("table")
        .should("have.length", 2)
        .eq(1)
        .contains("STAN-3111");
    });
    it("displays analysis table with barcode STAN-3111", () => {
      cy.findAllByRole("table").should("have.length", 2);
    });
    it("should display lock icon in extraction result table", () => {
      cy.get("[data-testid=remove]").should("not.exist");
    });
    it("should display lock icon", () => {
      cy.get("[data-testid=lock]").should("exist");
    });
  });

  context("when RIN type is selected", () => {
    it("should not display range in measurement dropdown", () => {
      cy.findByTestId("measurementType").should("not.have.value", "Range");
    });
  });

  context("when DV200 type is selected", () => {
    before(() => {
      cy.findByTestId("analysisType").select("DV200");
    });
    it("should contain range in measurement dropdown", () => {
      cy.findByTestId("measurementType").contains("Range");
    });
    it("should dispaly only one text field for measurement value", () => {
      cy.findByTestId("measurementValue").should("have.length", 1);
    });
  });
  context("when 'Range' is selected in mesaurement type", () => {
    before(() => {
      cy.findByTestId("measurementType").select("Range");
    });
    it("should display two text fields for maesurement value", () => {
      cy.findByText("Upper bound").should("be.visible");
      cy.findByText("Lower bound").should("be.visible");
    });
  });
});
