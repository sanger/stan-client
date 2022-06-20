export enum RegistrationType {
  BLOCK,
  SLIDE,
  TISSUE_SAMPLE,
}
export function shouldBehaveLikeARegistrationForm(
  registrationType: RegistrationType
) {
  describe("Validation", () => {
    it("requires Donor ID", () => {
      cy.findByLabelText("Donor ID").focus().blur();
      cy.findByText("Donor ID is a required field").should("be.visible");
    });

    context("when Donor ID has contiguous spaces", () => {
      before(() => cy.findByLabelText("Donor ID").type("DONOR  1").blur());

      it("shows a warning", () => {
        cy.findByText(
          "Donor ID contains invalid characters. Only letters, numbers, spaces, hyphens, slashes, backslashes, commas, colons, semicolons, full stops and underscores are permitted."
        );
      });
    });

    context("when Donor ID has forbidden characters", () => {
      before(() => {
        cy.findByLabelText("Donor ID").clear().blur();
        cy.findByLabelText("Donor ID").clear().type("$DONOR1").blur();
      });

      it("shows a warning", () => {
        cy.findByText(
          "Donor ID contains invalid characters. Only letters, numbers, spaces, hyphens, slashes, backslashes, commas, colons, semicolons, full stops and underscores are permitted."
        ).should("be.visible");
      });
    });

    context("when Donor ID contains single spaces", () => {
      before(() => {
        cy.findByLabelText("Donor ID").clear().blur();
        cy.findByLabelText("Donor ID").type("Donor 1 Is Fine").blur();
      });

      it("does not show a warning", () => {
        cy.findByText(
          "Donor ID contains invalid characters. Only letters, numbers, spaces, hyphens, and underscores are permitted"
        ).should("not.exist");
      });
    });

    context("Life stage selection", () => {
      context("when Fetal is selected", () => {
        before(() => {
          cy.findByLabelText("Fetal").click();
        });
        it(
          registrationType === RegistrationType.SLIDE
            ? "does not show sample collection date"
            : "shows sample collection date",
          () => {
            cy.findByLabelText("Sample Collection Date").should(
              registrationType === RegistrationType.SLIDE
                ? "not.exist"
                : "be.visible"
            );
          }
        );
      });
      context("when Adult is selected", () => {
        before(() => {
          cy.findByLabelText("Adult").click();
        });
        it("does not show sample collection date", () => {
          cy.findByLabelText("Sample Collection Date").should("not.exist");
        });
      });
    });
    it("requires Species", () => {
      cy.findByLabelText("Species").focus().blur();
      cy.findByText("Species is a required field").should("be.visible");
    });

    it("has HuMFre initially disabled", () => {
      cy.findByLabelText("HuMFre").should("be.disabled");
    });

    context("when selecting a non-Human Species", () => {
      before(() => {
        cy.findByLabelText("Species").select("Pig");
      });

      it("keeps HuMFre disabled", () => {
        cy.findByLabelText("HuMFre").should("be.disabled");
      });
    });

    context("when selecting Human for Species", () => {
      before(() => {
        cy.findByLabelText("Species").select("Human");
      });

      it("enables the HuMFre field", () => {
        cy.findByLabelText("HuMFre").should("not.be.disabled");
      });

      it("requires HuMFre to be set", () => {
        cy.findByLabelText("HuMFre").focus().blur();
        cy.findByText("HuMFre is a required field").should("be.visible");
      });
    });

    it("requires Tissue Type", () => {
      cy.findByLabelText("Tissue Type").focus().blur();
      cy.findByText("Tissue Type is a required field").should("be.visible");
    });

    it(
      registrationType === RegistrationType.TISSUE_SAMPLE
        ? "doesn't require Replicate Number"
        : "requires Replicate Number",
      () => {
        cy.findByLabelText("Replicate Number").clear().blur();
        cy.findByText("Replicate Number is a required field").should(
          registrationType === RegistrationType.TISSUE_SAMPLE
            ? "not.exist"
            : "be.visible"
        );
      }
    );

    it("requires Replicate Number to have number part as an an integer", () => {
      cy.findByLabelText("Replicate Number").type("1.1").blur();
      checkReplicateWarningIsVisible();
    });

    it("requires Replicate Number to have number part greater than 0", () => {
      cy.findByLabelText("Replicate Number").clear().type("-1").blur();
      checkReplicateWarningIsVisible();
    });

    it("requires Replicate Number to have number part  greater than or equal to 1", () => {
      cy.findByLabelText("Replicate Number").type("0").blur();
      checkReplicateWarningIsVisible();
    });
    it("requires Replicate Number to be number or number followed by a lowercase letter", () => {
      cy.findByLabelText("Replicate Number").type("0ab").blur();
      checkReplicateWarningIsVisible();
    });
    it("requires Replicate Number to be number or number followed by a lowercase letter", () => {
      cy.findByLabelText("Replicate Number").type("5ab").blur();
      checkReplicateWarningIsVisible();

      cy.findByLabelText("Replicate Number").clear().type("5A").blur();
      checkReplicateWarningIsVisible();
    });

    it("requires Fixative", () => {
      cy.findByLabelText("Fixative").focus().blur();
      cy.findByText("Fixative is a required field").should("be.visible");
    });

    if (registrationType !== RegistrationType.TISSUE_SAMPLE) {
      it("requires Medium", () => {
        cy.findByLabelText("Medium").focus().blur();
        cy.findByText("Medium is a required field").should("be.visible");
      });
    } else {
      it("requires Soultion", () => {
        cy.findByLabelText("Solution").focus().blur();
        cy.findByText("Solution is a required field").should("be.visible");
      });
    }
  });
  const checkReplicateWarningIsVisible = () => {
    cy.findByText(
      "Replicate Number must be a positive integer, optionally followed by a lower case letter."
    ).should("be.visible");
  };
}
