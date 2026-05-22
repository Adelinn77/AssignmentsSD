describe('Login & Navbar Components — Unit/End-to-End Tests', () => {
    const frontendUrl = Cypress.env('frontendUrl');

    let user;

    before(() => {
        cy.registerUser({ username: `navbar_user_${Date.now()}`, firstName: 'Navbar', lastName: 'Tester' }).then((created) => {
            user = created;
        });
    });

    describe('Login Component', () => {
        it('should render the login form correctly', () => {
            cy.visit(`${frontendUrl}/auth/login`);

            cy.get('h1.login-title').should('contain', 'Login');
            cy.get('#username').should('exist');
            cy.get('#password').should('exist');
            cy.get('#btn-login').should('exist');
            cy.get('#btn-create').should('exist');
        });
    });

    describe('Navbar Component — Logged In State', () => {
        beforeEach(() => {
            cy.loginByUi(user.username, user.password);
        });

        it('should render navigation links for an authenticated normal user', () => {
            cy.get('nav a').should('have.length', 2);
            cy.get('nav').should('contain', 'Home (Questions)');
            cy.get('nav').should('contain', 'Profile');
            cy.get('nav').should('not.contain', 'Users');
        });

        it('should render the Logout button', () => {
            cy.get('nav button').should('contain', 'Logout');
        });

        it('should have correct href attributes for routing', () => {
            cy.contains('a', 'Home (Questions)').should('have.attr', 'href', '/questions');
            cy.contains('a', 'Profile').should('have.attr', 'href', `/users/${user.username}`);
        });

        it('should log out and navigate to login page', () => {
            cy.contains('button', 'Logout').click();
            cy.url().should('eq', `${frontendUrl}/auth/login`);
        });
    });

    describe('Navbar Component — Logged Out State', () => {
        beforeEach(() => {
            cy.clearCookies();
            cy.clearLocalStorage();
            cy.window().then((win) => win.sessionStorage.clear());
            cy.visit(`${frontendUrl}/auth/login`);
        });

        it('should NOT render navigation links or logout button when logged out', () => {
            cy.get('nav a').should('have.length', 0);
            cy.get('nav button').should('not.exist');
        });
    });
});
