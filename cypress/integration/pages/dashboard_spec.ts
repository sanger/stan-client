describe("Dashboard", () => {
  context("when visiting as a guest", () => {
    before(() => {
      cy.visitAsGuest("/");
    });

    it("does not show the Admin nav link", () => {
      cy.get("a[href='/']").should("exist");
      cy.get("a[href='/admin']").should("not.exist");
    });

    it("does not show the user menu", () => {
      cy.findByRole("menu").should("not.be.visible");
    });

    context("when clicking the guest icon", () => {
      before(() => {
        cy.get("#user-menu").click();
      });

      it("shows the user menu", () => {
        cy.findByRole("menu").should("be.visible");
      });

      it("shows a link to login", () => {
        cy.findByRole("menu").find("a[href='/login']").should("be.visible");
      });
    });
  });

  context("when visiting as an authenticated user", () => {
    before(() => {
      cy.visit("/");
    });

    it("does show the Admin nav link", () => {
      cy.get("a[href='/']").should("exist");
      cy.get("a[href='/admin']").should("exist");
    });

    it("shows the user's username", () => {
      cy.findAllByText("jb1").should("exist");
    });

    it("does not show the user menu", () => {
      cy.findByRole("menu").should("not.be.visible");
    });

    context("when clicking the username", () => {
      before(() => {
        cy.get("#user-menu").click();
      });

      it("shows the user menu", () => {
        cy.findByRole("menu").should("be.visible");
      });

      it("shows a link to logout", () => {
        cy.findByRole("menu").find("a[href='/logout']").should("be.visible");
      });
    });
  });
});
