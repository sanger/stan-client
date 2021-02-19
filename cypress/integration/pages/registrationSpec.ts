import {
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../../../src/types/graphql";

describe("Registration", () => {
  before(() => {
    cy.visit("/admin/registration");
    cy.wait(2000);
  });

  describe("Validation", () => {
    it("requires Donor ID", () => {
      cy.findByLabelText("Donor ID").focus().blur();
      cy.findByText("Donor ID is a required field").should("be.visible");
    });

    it("requires Donor ID to only permit certain characters", () => {
      cy.findByLabelText("Donor ID").type("$DONOR1").blur();
      cy.findByText(
        "Donor ID contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted"
      ).should("be.visible");
    });

    it("requires External Identifier", () => {
      cy.findByLabelText("External Identifier").focus().blur();
      cy.findByText("External Identifier is a required field").should(
        "be.visible"
      );
    });

    it("requires External Identifer to only permit certain characters", () => {
      cy.findByLabelText("External Identifier").type("EXT&99").blur();
      cy.findByText(
        "External Identifier contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted"
      ).should("be.visible");
    });

    it("requires HMDMC", () => {
      cy.findByLabelText("HMDMC").focus().blur();
      cy.findByText("HMDMC is a required field").should("be.visible");
    });

    it("requires Tissue Type", () => {
      cy.findByLabelText("Tissue Type").focus().blur();
      cy.findByText("Tissue Type is a required field").should("be.visible");
    });

    it("requires Replicate Number", () => {
      cy.findByLabelText("Replicate Number").clear().blur();
      cy.findByText("Replicate Number is a required field").should(
        "be.visible"
      );
    });

    it("requires Replicate Number to be an integer", () => {
      cy.findByLabelText("Replicate Number").type("1.1").blur();
      cy.findByText("Replicate Number must be an integer").should("be.visible");
    });

    it("requires Replicate Number to be greater than 0", () => {
      cy.findByLabelText("Replicate Number").clear().type("-1").blur();
      cy.findByText(
        "Replicate Number must be greater than or equal to 1"
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

    it("requires Replicate Number to be greater than or equal to 1", () => {
      cy.findByLabelText("Replicate Number").type("0").blur();
      cy.findByText(
        "Replicate Number must be greater than or equal to 1"
      ).should("be.visible");
    });

    it("requires Labware Type", () => {
      cy.findByLabelText("Labware Type").focus().blur();
      cy.findByText("Labware Type is a required field").should("be.visible");
    });

    it("requires Fixative", () => {
      cy.findByLabelText("Fixative").focus().blur();
      cy.findByText("Fixative is a required field").should("be.visible");
    });

    it("requires Medium", () => {
      cy.findByLabelText("Medium").focus().blur();
      cy.findByText("Medium is a required field").should("be.visible");
    });
  });

  context("when changing the selected Tissue Type", () => {
    before(() => {
      cy.findByLabelText("Tissue Type").select("Kidney");
    });

    it("updates the available Spatial Location", () => {
      cy.findByLabelText("Spatial Location")
        .find("option")
        .should("have.length", 7); // 6 options plus empty

      cy.findByLabelText("Spatial Location").select("2");
      cy.findByLabelText("Spatial Location").find(":selected").contains("2");
      cy.findByLabelText("Tissue Type").select("Liver");
      cy.findByLabelText("Spatial Location")
        .find(":selected")
        .should("have.value", "");
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
        cy.wait(2000);
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
        cy.wait(2000);

        fillInForm();

        cy.findByText("Register").click();
      });

      it("shows a success message", () => {
        cy.findByText(
          "Your tissue blocks have been successfully registered"
        ).should("be.visible");
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
              return res(
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

        cy.wait(2000);

        fillInForm();
        cy.findByText("Register").click();
      });

      it("shows the server errors", () => {
        cy.findByText("This thing went wrong").should("be.visible");
        cy.findByText("This other thing went wrong").should("be.visible");
      });
    });
  });
});

function fillInForm() {
  cy.findByLabelText("Donor ID").type("DONOR_1");
  cy.findByLabelText("External Identifier").type("EXT_ID_1");
  cy.findByLabelText("HMDMC").select("HMDMC1");
  cy.findByLabelText("Tissue Type").select("Liver");
  cy.findByLabelText("Spatial Location").select("3");
  cy.findByLabelText("Replicate Number").type("2");
  cy.findByLabelText("Last Known Section Number").type("5");
  cy.findByLabelText("Labware Type").select("Proviasette");
  cy.findByLabelText("Fixative").select("None");
  cy.findByLabelText("Medium").select("Paraffin");
  cy.get('[type="radio"]').check("15x15");
}
