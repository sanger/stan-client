describe("Logout", () => {
  before(() => {
    cy.visit("/");
    cy.get("#user-menu").click();
    cy.findByRole("menu").find("a[href='/logout']").click();
  });

  it("redirects the user to the /login page", () => {
    cy.location("pathname").should("eq", "/login");
  });

  it("shows a success message", () => {
    cy.findByText("Logout successful").should("be.visible");
  });
});
