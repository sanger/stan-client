export function shouldBehaveLikeARegistrationForm() {
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

    it("requires Species", () => {
      cy.findByLabelText("Species").focus().blur();
      cy.findByText("Species is a required field").should("be.visible");
    });

    it("has HMDMC initially disabled", () => {
      cy.findByLabelText("HMDMC").should("be.disabled");
    });

    context("when selecting a non-Human Species", () => {
      before(() => {
        cy.findByLabelText("Species").select("Pig");
      });

      it("keeps HMDMC disabled", () => {
        cy.findByLabelText("HMDMC").should("be.disabled");
      });
    });

    context("when selecting Human for Species", () => {
      before(() => {
        cy.findByLabelText("Species").select("Human");
      });

      it("enables the HMDMC field", () => {
        cy.findByLabelText("HMDMC").should("not.be.disabled");
      });

      it("requires HMDMC to be set", () => {
        cy.findByLabelText("HMDMC").focus().blur();
        cy.findByText("HMDMC is a required field").should("be.visible");
      });
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

    it("requires Replicate Number to be greater than or equal to 1", () => {
      cy.findByLabelText("Replicate Number").type("0").blur();
      cy.findByText(
        "Replicate Number must be greater than or equal to 1"
      ).should("be.visible");
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
}
