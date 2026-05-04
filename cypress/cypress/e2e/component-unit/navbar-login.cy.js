// =============================================================
// COMPONENT UNIT TESTS — Login Page & Navbar
// =============================================================

describe('Login & Navbar Components — Unit Tests', () => {

    const frontendUrl = 'http://localhost:4200';

    describe('Login Component', () => {
        it('should render the login works text', () => {
            cy.visit(`${frontendUrl}/auth/login`);
            cy.get('p').should('contain', 'login works!');
        });
    });

    describe('Navbar Component', () => {
        beforeEach(() => {
            cy.visit(frontendUrl);
        });

        it('should render all three navigation links', () => {
            cy.get('nav a').should('have.length', 3);
            cy.get('nav').should('contain', 'Home (Questions)');
            cy.get('nav').should('contain', 'Login');
            cy.get('nav').should('contain', 'Profile');
        });

        it('should have correct href attributes for routing', () => {
            cy.contains('a', 'Home (Questions)').should('have.attr', 'href', '/questions');
            cy.contains('a', 'Login').should('have.attr', 'href', '/auth/login');
            cy.contains('a', 'Profile').should('have.attr', 'href', '/users/ion_pop');
        });
    });
});
