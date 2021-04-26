import {
  ReleaseLabwareMutation,
  ReleaseLabwareMutationVariables,
} from "../../../src/types/sdk";

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
              return res(
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
