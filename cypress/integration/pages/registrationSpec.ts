import {
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../../../src/types/sdk";
import { shouldBehaveLikeARegistrationForm } from "../shared/registration";
import { tissueFactory } from "../../../src/lib/factories/sampleFactory";
import labwareFactory from "../../../src/lib/factories/labwareFactory";

describe("Registration", () => {
  before(() => {
    cy.visit("/admin/registration");
  });

  describe("Validation", () => {
    shouldBehaveLikeARegistrationForm();

    it("requires External Identifier", () => {
      cy.findByLabelText("External Identifier").focus().blur();
      cy.findByText("External Identifier is a required field").should(
        "be.visible"
      );
    });

    it("requires External Identifier to only permit certain characters", () => {
      cy.findByLabelText("External Identifier").type("EXT&99").blur();
      cy.findByText(
        "External Identifier contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted"
      ).should("be.visible");
    });

    it("requires Last Known Section Number", () => {
      cy.findByLabelText("Last Known Section Number").clear().blur();
      cy.findByText("Last Known Section Number is a required field").should(
        "be.visible"
      );
    });

    it("requires Last Known Section Number to be an integer", () => {
      cy.findByLabelText("Last Known Section Number").type("1.1").blur();
      cy.findByText("Last Known Section Number must be an integer").should(
        "be.visible"
      );
    });

    it("requires Last Known Section Number to be greater than or equal to 0", () => {
      cy.findByLabelText("Last Known Section Number").clear().type("-1").blur();
      cy.findByText(
        "Last Known Section Number must be greater than or equal to 0"
      ).should("be.visible");
    });

    it("requires Labware Type", () => {
      cy.findByLabelText("Labware Type").focus().blur();
      cy.findByText("Labware Type is a required field").should("be.visible");
    });
  });

  context("when clicking the Add Another Tissue Block button", () => {
    before(() => {
      cy.findByText("Delete Block").should("not.exist");
      cy.findByText("Block Information").siblings().should("have.length", 1);
      cy.findByText("+ Add Another Tissue Block").click();
    });

    it("adds another tissue block", () => {
      cy.findByText("Block Information").siblings().should("have.length", 2);
    });

    it("shows the Delete Block button for each block", () => {
      cy.findAllByText("Delete Block").should("be.visible");
    });
  });

  context("when clicking the Add Another Tissue button", () => {
    before(() => {
      cy.findByText("- Delete Tissue").should("not.exist");
      cy.get("#tissue-summaries").children().should("have.length", 1);
      cy.findByText("+ Add Another Tissue").click();
    });

    it("adds another tissue", () => {
      cy.get("#tissue-summaries").children().should("have.length", 2);
    });
  });

  describe("submission", () => {
    context("when the fields are invalid", () => {
      before(() => {
        cy.visit("/admin/registration");
        fillInForm();
        cy.findByLabelText("Donor ID").clear();
        cy.findByText("Register").click();
      });

      it("shows the validation errors", () => {
        cy.findByText("Donor ID is a required field").should("be.visible");
      });

      it("shows how many errors there are", () => {
        cy.findByText("1 Error").should("be.visible");
      });
    });

    context("when the submission is successful", () => {
      before(() => {
        cy.visit("/admin/registration");
        fillInForm();
        cy.findByText("Register").click();
      });

      it("shows a success message", () => {
        cy.findByText("Registration complete").should("be.visible");
      });

      it("shows the created labware", () => {
        cy.findByText("LW_BC_1").should("be.visible");
        cy.findByText("EXT1").should("be.visible");
      });
    });

    context("when the submission fails server side", () => {
      before(() => {
        cy.visit("/admin/registration");

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<
              RegisterTissuesMutation,
              RegisterTissuesMutationVariables
            >("RegisterTissues", (req, res, ctx) => {
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

        fillInForm();
        cy.findByText("Register").click();
      });

      it("shows the server errors", () => {
        cy.findByText("This thing went wrong").should("be.visible");
        cy.findByText("This other thing went wrong").should("be.visible");
      });
    });
  });

  context("when the submission has clashes", () => {
    const tissue = tissueFactory.build();
    const labware = labwareFactory.buildList(2);

    before(() => {
      cy.visit("/admin/registration");

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<
            RegisterTissuesMutation,
            RegisterTissuesMutationVariables
          >("RegisterTissues", (req, res, ctx) => {
            return res.once(
              ctx.data({
                register: {
                  labware: [],
                  clashes: [
                    {
                      tissue,
                      labware,
                    },
                  ],
                },
              })
            );
          })
        );
      });

      fillInForm();
      cy.findByText("Register").click();
    });

    it("shows a modal with the clashing labware", () => {
      labware.forEach((lw) => {
        cy.findByText(lw.barcode).should("be.visible");
        cy.findAllByText(lw.labwareType.name).should("be.visible");
      });
    });
  });
});

function fillInForm() {
  cy.findByLabelText("Donor ID").type("DONOR_1");
  cy.findByLabelText("Species").select("Human");
  cy.findByLabelText("External Identifier").type("EXT_ID_1");
  cy.findByLabelText("HMDMC").select("HMDMC1");
  cy.findByLabelText("Tissue Type").select("Liver");
  cy.findByLabelText("Spatial Location").select("3");
  cy.findByLabelText("Replicate Number").type("2");
  cy.findByLabelText("Last Known Section Number").type("5");
  cy.findByLabelText("Labware Type").select("Proviasette");
  cy.findByLabelText("Fixative").select("None");
  cy.findByLabelText("Medium").select("Paraffin");
  // Can't figure out why, but for some reason, without { force: true }, this is really temperamental
  cy.get('[type="radio"]').check("10x10", { force: true });
}
