describe("Logout", () => {
  before(() => {
    cy.visit("/");
    cy.wait(2000);
    cy.get("#user-menu").click();
    cy.findByText("Sign out").click();
  });

  it("redirects the user to the /login page", () => {
    cy.location("pathname").should("eq", "/login");
  });

  it("shows a success message", () => {
    cy.findByText("Logout successful").should("exist");
  });
});
