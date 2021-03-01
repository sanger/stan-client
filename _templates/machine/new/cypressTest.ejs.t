---
to: cypress/integration/pages/<%= name %>Spec.ts
---
describe("<%= Name %> Page", () => {

  before(() => {
    cy.visit("/<%= name %>");
    cy.wait(2000);
  });

  it("needs some tests");

})