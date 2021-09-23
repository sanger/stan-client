describe("Staining QC", () => {
  before(() => {
    cy.visit("/lab/staining_qc");
  });

  describe("Save button", () => {
    context("when no labwares have been scanned", () => {
      it("is disabled", () => {
        cy.findByRole("button", { name: "Save" }).should("be.disabled");
      });
    });

    context("when there is at least 1 labware", () => {
      before(() => {
        cy.get("#labwareScanInput").type("STAN-411{enter}");
      });

      it("is not disabled", () => {
        cy.findByRole("button", { name: "Save" }).should("not.be.disabled");
      });
    });
  });

  describe("LabwareResult component", () => {
    describe("when it first loads", () => {
      it("has all slots as passed", () => {
        cy.findAllByTestId("passIcon").then(($passIcons) => {
          $passIcons.each((i, icon) => {
            const classList = Array.from(icon.classList);
            expect(classList).to.includes("text-green-700");
          });
        });
      });

      it("has all comment dropdowns disabled", () => {
        cy.findByTestId("passFailComments").get("select").should("be.disabled");
      });
    });

    context("when clicking the Fail All button", () => {
      before(() => {
        cy.findByRole("button", { name: "Fail All" }).click();
      });

      it("fails all the slots", () => {
        cy.findAllByTestId("failIcon").then(($failIcons) => {
          $failIcons.each((indx, failIcon) => {
            const classList = Array.from(failIcon.classList);
            expect(classList).to.includes("text-red-700");
          });
        });
      });

      it("enables all the comment dropdowns", () => {
        cy.findByTestId("passFailComments").get("select").should("be.enabled");
      });

      context("when changing the comment all dropdown", () => {
        before(() => {
          cy.findByTestId("commentAll").select("Wrong morphology");
        });
        it("changes all the comments", () => {
          cy.findByTestId("passFailComments").within(() => {
            cy.get("select option:selected").each((elem) => {
              cy.wrap(elem).should("have.text", "Wrong morphology");
            });
          });
        });
      });
    });
  });
});
