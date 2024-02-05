import { HttpResponse } from 'msw';

describe('Login', () => {
  context('When user is already logged in', () => {
    it('redirects to /', () => {
      cy.visit('/login');
      cy.location('pathname').should('eq', '/');
    });
  });

  context('When user is not not logged in', () => {
    beforeEach(() => {
      cy.visitAsGuest('/login');
    });

    context('When credentials are not correct', () => {
      beforeEach(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation('Login', () => {
              return HttpResponse.json({
                data: {
                  user: null
                }
              });
            })
          );
        });

        cy.get("input[name='username']").type('jb1');
        cy.get("input[name='password']").type('supersecret');
        cy.findByTestId('signIn').click();
      });

      it('shows an error message', () => {
        cy.findByTextContent('Username or password is incorrect').should('be.visible');
      });
    });

    context('When credentials are correct', () => {
      beforeEach(() => {
        cy.get("input[name='username']").type('jb1');
        cy.get("input[name='password']").type('supersecret');
        cy.findByTestId('signIn').click();
      });

      it('shows a success message', () => {
        cy.findByText('Login Successful!').should('be.visible');
      });

      it('redirects to the Dashboard', () => {
        cy.location('pathname').should('eq', '/');
      });
    });

    context('When username is missing', () => {
      beforeEach(() => {
        cy.get("input[name='password']").type('supersecret');
        cy.findByTestId('signIn').click();
      });

      it('does not submit the form', () => {
        cy.location('pathname').should('eq', '/login');
      });
    });

    describe('When password is missing', () => {
      beforeEach(() => {
        cy.get("input[name='username']").type('jb1');
        cy.findByTestId('signIn').click();
      });

      it('does not submit the form', () => {
        cy.location('pathname').should('eq', '/login');
      });
    });
  });
});

describe('Self Registration', () => {
  describe('When Registration succeed', () => {
    before(() => {
      cy.visitAsGuest('/login');
      register();
    });
    it('shows a success message', () => {
      cy.findByText('Successfully registered as End User!').should('be.visible');
    });
    it('redirects to the Dashboard', () => {
      cy.location('pathname').should('eq', '/');
    });
  });

  describe('When Registration fails', () => {
    before(() => {
      cy.visitAsGuest('/login');
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation('RegisterAsEndUser', () => {
            return HttpResponse.json({
              data: {
                user: null
              }
            });
          })
        );
      });
      register();
    });
    it('shows an error message', () => {
      cy.findByText('LDAP check failed for userx').should('be.visible');
    });
    it('remains on the login page', () => {
      cy.location('pathname').should('eq', '/login');
    });
  });
});

const register = () => {
  cy.findByTestId('username').type('userx');
  cy.findByTestId('password').type('myPassword123');
  cy.findByTestId('register').click();
};
