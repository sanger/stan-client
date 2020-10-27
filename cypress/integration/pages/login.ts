describe("Login", () => {
  context("When user is already logged in", () => {
    it("redirects to /", () => {
      cy.visit("/login");
      cy.location("pathname").should("eq", "/");
    });
  });

  context("When user is not not logged in", () => {
    beforeEach(() => {
      cy.visitAsGuest("/login");
    });

    context("When credentials are not correct", () => {
      beforeEach(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation("Login", (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    message: "Username or password incorrect",
                  },
                ])
              );
            })
          );
        });

        cy.get("input[name='username']").type("jb1");
        cy.get("input[name='password']").type("supersecret");
        cy.get("button[type='submit']").click();
      });

      it("shows an error message", () => {
        cy.findByText("Username or password incorrect").should("be.visible");
      });
    });

    context("When credentials are correct", () => {
      beforeEach(() => {
        cy.get("input[name='username']").type("jb1");
        cy.get("input[name='password']").type("supersecret");
        cy.get("button[type='submit']").click();
      });

      it("shows a success message", () => {
        cy.findByText("Login Successful!").should("be.visible");
      });

      it("redirects to the Dashboard", () => {
        cy.location("pathname").should("eq", "/");
      });
    });

    context("When username is missing", () => {
      beforeEach(() => {
        cy.get("input[name='password']").type("supersecret");
        cy.get("button[type='submit']").click();
      });

      it("does not submit the form", () => {
        cy.location("pathname").should("eq", "/login");
      });
    });

    describe("When password is missing", () => {
      beforeEach(() => {
        cy.get("input[name='username']").type("jb1");
        cy.get("button[type='submit']").click();
      });

      it("does not submit the form", () => {
        cy.location("pathname").should("eq", "/login");
      });
    });
  });
});
