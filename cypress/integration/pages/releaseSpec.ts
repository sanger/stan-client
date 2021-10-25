import {
  GetLabwareInLocationQuery,
  GetLabwareInLocationQueryVariables,
  ReleaseLabwareMutation,
  ReleaseLabwareMutationVariables,
} from "../../../src/types/sdk";
import { buildLabwareFragment } from "../../../src/lib/helpers/labwareHelper";
import { labwareTypeInstances } from "../../../src/lib/factories/labwareTypeFactory";
import labwareFactory from "../../../src/lib/factories/labwareFactory";

describe("Release Page", () => {
  before(() => {
    cy.visit("/admin/release");
  });

  context("when form is submitted without filling in any fields", () => {
    before(() => {
      cy.findByRole("button", { name: /Release Labware/i })
        .should("be.visible")
        .click();
    });

    it("shows an error about labwares", () => {
      cy.findByText("Please scan in at least 1 labware").should("be.visible");
    });

    it("shows an error about Group/Team", () => {
      cy.findByText("Group/Team is a required field").should("be.visible");
    });

    it("shows an error about Contact", () => {
      cy.findByText("Contact is a required field").should("be.visible");
    });
  });

  context("when all is valid", () => {
    before(() => {
      fillInForm();
    });

    it("shows a success message", () => {
      cy.findByText("Labware(s) Released").should("be.visible");
    });

    it("shows the download button", () => {
      cy.findByText("Download Release File").should("be.visible");
      // cy.get("a[href='/release?id=1001,1002']").should("be.visible");
    });
  });

  context(
    "when form is submitted with a labware that has already been released",
    () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<
              ReleaseLabwareMutation,
              ReleaseLabwareMutationVariables
            >("ReleaseLabware", (req, res, ctx) => {
              const { barcodes } = req.variables.releaseRequest;
              return res.once(
                ctx.errors([
                  {
                    message: `Exception while fetching data (/release) : Labware has already been released: [${barcodes.join(
                      ","
                    )}]`,
                  },
                ])
              );
            })
          );
        });

        cy.visit("/admin/release");

        fillInForm();
      });

      it("shows an error", () => {
        cy.findByText(
          "Labware has already been released: [STAN-123,STAN-456]"
        ).should("be.visible");
      });

      it("doesn't show the download button", () => {
        cy.findByText("Download Release File").should("not.exist");
      });
    }
  );

  context(
    "when location barcode is scanned with a labware which is already released",
    () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<
              GetLabwareInLocationQuery,
              GetLabwareInLocationQueryVariables
            >("GetLabwareInLocation", (req, res, ctx) => {
              // The number after STAN- determines what kind of labware will be returned
              const labwaresBarcodes: string[] = [
                "STAN-3111",
                "STAN-3112",
                "STAN-3113",
              ];
              const labwares = labwaresBarcodes.map((barcode) => {
                const magicNumber = parseInt(barcode.substr(5, 1));
                const labwareType =
                  labwareTypeInstances[
                    magicNumber % labwareTypeInstances.length
                  ];
                // The number after that determines how many samples to put in each slot
                const samplesPerSlot = parseInt(barcode.substr(6, 1));

                const labware = labwareFactory.build(
                  {
                    barcode: barcode,
                  },
                  {
                    transient: {
                      samplesPerSlot,
                    },
                    associations: {
                      labwareType,
                    },
                  }
                );
                return buildLabwareFragment(labware);
              });
              labwares[0].released = true;
              return res(
                ctx.data({
                  labwareInLocation: labwares,
                })
              );
            })
          );
        });
        cy.get("#locationScanInput").clear().type("STO-111{enter}");
      });
      it("should display a table with STAN-3112", () => {
        cy.findByRole("table").should("contain.text", "STAN-3112");
      });
      it("should display warning message that STAN-3111 is released", () => {
        cy.findByText("Labware STAN-3111 has already been released.").should(
          "exist"
        );
      });
    }
  );
  context("when location barcode is scanned", () => {
    before(() => {
      cy.get("#locationScanInput").clear().type("STO-11{enter}");
    });
    it("should display a table", () => {
      cy.findByRole("table").should("exist");
    });
  });
});
function fillInForm() {
  cy.get("#labwareScanInput")
    .should("not.be.disabled")
    .wait(1000)
    .type("STAN-123{enter}");
  cy.get("#labwareScanInput")
    .should("not.be.disabled")
    .wait(1000)
    .type("STAN-456{enter}");
  cy.findByLabelText("Group/Team").select("Vento lab");
  cy.findByLabelText("Contact").select("cs41");
  cy.findByRole("button", { name: /Release Labware/i }).click();
}
