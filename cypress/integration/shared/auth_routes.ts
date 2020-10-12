describe("Authorized routes", () => {
  describe("/admin", () => {
    before(() => {
      cy.visitAsGuest("/admin");
    });

    context("when not authenticated", () => {
      it("redirects to the login page", () => {
        cy.location().should((location) => {
          expect(location.pathname).to.eq("/login");
        });
      });

      it("should display a warning", () => {
        cy.findByText("Please sign in to access /admin").should("be.visible");
      });

      it("should redirect to /admin after logging in", () => {
        cy.get("input[name='username']").type("jb1");
        cy.get("input[name='password']").type("supersecret");
        cy.get("button[type='submit']").click();

        cy.location().should((location) => {
          expect(location.pathname).to.eq("/admin");
        });
      });
    });

    context("when authenticated", () => {
      before("I am authenticated", () => {
        cy.visit("/admin");
      });

      it("goes to the /admin page", () => {
        cy.location().should((location) => {
          expect(location.pathname).to.eq("/admin");
        });
      });
    });
  });
});
