import {
  RegisterOriginalSamplesMutation,
  RegisterOriginalSamplesMutationVariables,
} from "../../../src/types/sdk";
import {
  RegistrationType,
  shouldBehaveLikeARegistrationForm,
} from "../shared/registration";
import { tissueFactory } from "../../../src/lib/factories/sampleFactory";
import labwareFactory from "../../../src/lib/factories/labwareFactory";

describe("Registration", () => {
  before(() => {
    cy.visit("/admin/tissue_registration");
  });

  describe("Validation", () => {
    shouldBehaveLikeARegistrationForm(RegistrationType.TISSUE_SAMPLE);

    it("does not require External Identifier", () => {
      cy.findByTestId("External Identifier").focus().blur();
      cy.findByText("External Identifier is a required field").should(
        "not.exist"
      );
    });

    it("requires External Identifier to only permit certain characters", () => {
      cy.findByTestId("External Identifier").type("EXT&99").blur();
      cy.findByText(
        "External Identifier contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted"
      ).should("be.visible");
    });

    it("requires Labware Type", () => {
      cy.findByLabelText("Labware Type").focus().blur();
      cy.findByText("Labware Type is a required field").should("be.visible");
    });
  });

  context("when clicking the Add Another Tissue Sample button", () => {
    before(() => {
      cy.findByText("Delete Sample").should("not.exist");
      cy.findByText("Sample Information").siblings().should("have.length", 1);
      cy.findByText("+ Add Another Tissue Sample").click();
    });

    it("adds another tissue sample", () => {
      cy.findByText("Sample Information").siblings().should("have.length", 2);
    });

    it("shows the Delete Sample button for each sample", () => {
      cy.findAllByText("Delete Sample").should("be.visible");
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
        cy.reload();
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
    context("when there is no sample collection date for fetal sample", () => {
      before(() => {
        cy.reload();
        fillInForm();
        cy.findByLabelText("Sample Collection Date").clear();
        cy.findByText("Register").click();
      });
      it("shows the validation error for sample collection date", () => {
        cy.findByText(
          "Sample Collection Date is a required field for fetal samples"
        ).should("be.visible");
      });
    });

    context("when a future date is entered for sample collection", () => {
      before(() => {
        cy.reload();
        fillInForm();
        cy.findByLabelText("Sample Collection Date")
          .type("2050-04-01", {
            force: true,
          })
          .blur();
      });
      it("shows an error message to enter a past date", () => {
        cy.findByText(
          `Please select a date on or before ${new Date().toLocaleDateString()}`
        );
      });
    });

    context("when the submission is successful", () => {
      before(() => {
        cy.reload();
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

    context(
      "when store button is clicked after successful registration",
      () => {
        before(() => {
          cy.findByRole("button", { name: /Store/i }).click();
        });
        it("should go to store page", () => {
          cy.url().should("include", "/store");
        });
        it("should list the registered labware in store page", () => {
          cy.findByText("LW_BC_1").should("be.visible");
        });
      }
    );

    context("when the submission fails server side", () => {
      before(() => {
        cy.visit("/admin/tissue_registration");

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<
              RegisterOriginalSamplesMutation,
              RegisterOriginalSamplesMutationVariables
            >("RegisterOriginalSamples", (req, res, ctx) => {
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
      cy.reload();

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<
            RegisterOriginalSamplesMutation,
            RegisterOriginalSamplesMutationVariables
          >("RegisterOriginalSamples", (req, res, ctx) => {
            return res.once(
              ctx.data({
                registerOriginalSamples: {
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
  cy.findByLabelText("Fetal").click();
  cy.findByLabelText("Sample Collection Date").type("2022-01-01", {
    force: true,
  });
  cy.findByLabelText("Species").select("Human");
  cy.findByTestId("External Identifier").type("EXT_ID_1");
  cy.findByLabelText("HuMFre").select("HuMFre1");
  cy.findByLabelText("Tissue Type").select("Liver");
  cy.findByLabelText("Spatial Location").select("3");
  cy.findByTestId("Replicate Number").type("2");
  cy.findByLabelText("Labware Type").select("Pot");
  cy.findByLabelText("Fixative").select("None");
  cy.findByLabelText("Solution").select("Formalin");
}
