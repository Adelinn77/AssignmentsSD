// =============================================================
// Frontend Smoke Tests
// =============================================================

describe('Frontend Smoke Tests', () => {
    const frontendUrl = Cypress.env('frontendUrl');
    let user;

    before(() => {
        cy.registerUser({ username: `frontend_user_${Date.now()}`, firstName: 'Front', lastName: 'Tester' }).then((created) => {
            user = created;
        });
    });

    it('should render the login page', () => {
        cy.visit(`${frontendUrl}/auth/login`);
        cy.get('h1.login-title').should('contain', 'Login');
        cy.get('#username').should('exist');
        cy.get('#password').should('exist');
        cy.get('#btn-login').should('exist');
    });

    it('should log in and redirect to questions', () => {
        cy.loginByUi(user.username, user.password);
        cy.get('h2').should('contain', 'Questions List');
    });

    it('should keep logged out users on login page', () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.window().then((win) => win.sessionStorage.clear());

        cy.visit(`${frontendUrl}/questions`);
        cy.url().should('eq', `${frontendUrl}/auth/login`);
    });
});
