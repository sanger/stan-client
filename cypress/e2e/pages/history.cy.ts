import {
  FindHistoryForLabwareBarcodeQuery,
  FindHistoryForLabwareBarcodeQueryVariables,
} from "../../../src/types/sdk";

describe("History Page", () => {
  context("when I visit the page with no URL params", () => {
    before(() => cy.visit("/history"));

    it("does not perform a history search", () => {
      cy.findByTestId("history").should("not.exist");
    });
  });

  context("when I visit the page with bad URL params", () => {
    before(() => cy.visit("/history?bad=params&no=search"));

    it("does not use the params to fill in the form", () => {
      cy.get("input[name='value']").invoke("val").should("eq", "");
    });

    it("does not perform a history search", () => {
      cy.findByTestId("history").should("not.exist");
    });
  });

  describe("By Labware Barcode", () => {
    context("when I visit the page with good URL params", () => {
      before(() => cy.visit("/history?kind=labwareBarcode&value=STAN-0001F"));

      it("uses the params to fill in the form", () => {
        cy.get("input[name='value']").invoke("val").should("eq", "STAN-0001F");
        cy.get("select[name='kind']")
          .invoke("val")
          .should("eq", "labwareBarcode");
      });

      it("does performs a history search", () => {
        cy.findByTestId("history").should("exist");
        cy.findByTextContent("History for Labware Barcode STAN-0001F");
      });
    });
  });

  describe("By Sample ID", () => {
    context("when I visit the page with good URL params", () => {
      before(() => cy.visit("/history?kind=sampleId&value=10"));

      it("does performs a history search", () => {
        cy.findByTestId("history").should("exist");
        cy.findByTextContent("History for Sample ID 10");
      });
    });
  });

  describe("By External ID", () => {
    context("when I visit the page with good URL params", () => {
      before(() => cy.visit("/history?kind=externalName&value=EXT123"));

      it("uses the params to fill in the form", () => {
        cy.get("input[name='value']").invoke("val").should("eq", "EXT123");
        cy.get("select[name='kind']")
          .invoke("val")
          .should("eq", "externalName");
      });

      it("does performs a history search", () => {
        cy.findByTestId("history").should("exist");
        cy.findByTextContent("History for External ID EXT123");
      });
    });
  });

  describe("By Donor Name", () => {
    context("when I visit the page with good URL params", () => {
      before(() => cy.visit("/history?kind=donorName&value=DNR123"));

      it("uses the params to fill in the form", () => {
        cy.get("input[name='value']").invoke("val").should("eq", "DNR123");
        cy.get("select[name='kind']").invoke("val").should("eq", "donorName");
      });

      it("does performs a history search", () => {
        cy.findByTestId("history").should("exist");
        cy.findByTextContent("History for Donor Name DNR123");
      });
    });
  });

  describe("By Work Number", () => {
    context("when I visit the page with good URL params", () => {
      before(() => cy.visit("/history?kind=workNumber&value=SGP1"));

      it("uses the params to fill in the form", () => {
        cy.get("input[name='value']").invoke("val").should("eq", "SGP1");
        cy.get("select[name='kind']").invoke("val").should("eq", "workNumber");
      });

      it("does performs a history search", () => {
        cy.findByTestId("history").should("exist");
        cy.findByTextContent("History for Work Number SGP1");
      });
    });
  });

  context("when a search errors", () => {
    before(() => {
      cy.visit("/history?kind=labwareBarcode&value=STAN-10001F");

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<
            FindHistoryForLabwareBarcodeQuery,
            FindHistoryForLabwareBarcodeQueryVariables
          >("FindHistoryForLabwareBarcode", (req, res, ctx) => {
            return res.once(
              ctx.errors([
                {
                  message: `History Search Error`,
                },
              ])
            );
          })
        );
      });
    });

    it("displays an error", () => {
      cy.findByText("History Search Error").should("exist");
    });
  });
});
