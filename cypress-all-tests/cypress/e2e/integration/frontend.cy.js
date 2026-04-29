// =============================================================
// Frontend E2E Tests (Angular UI)
// =============================================================

describe('Frontend UI E2E Tests', () => {

    const frontendUrl = 'http://localhost:4200';

    describe('Questions List Page', () => {
        it('should load the questions page at /questions', () => {
            cy.visit(`${frontendUrl}/questions`);
            cy.contains('Questions List').should('be.visible');
        });
    });

    describe('Login Page', () => {
        it('should load the login page at /auth/login', () => {
            cy.visit(`${frontendUrl}/auth/login`);
            cy.contains('login works!').should('be.visible');
        });
    });

    describe('User Profile Page', () => {
        const profileUser = {
            username: 'profile_test_user', email: 'profile@test.com', phone: '07', firstName: 'A', lastName: 'B'
        };

        before(() => {
            cy.deleteUser(profileUser.username);
            cy.createUser(profileUser);
        });

        after(() => { cy.deleteUser(profileUser.username); });

        it('should load user profile page and display user data', () => {
            cy.visit(`${frontendUrl}/users/${profileUser.username}`);
            cy.get('.profile-container', { timeout: 10000 }).should('exist');
            cy.contains(`@${profileUser.username}`).should('be.visible');
        });
    });

    describe('Navigation', () => {
        it('should navigate via navbar', () => {
            cy.visit(`${frontendUrl}/questions`);
            cy.contains('a', 'Login').click();
            cy.url().should('include', '/auth/login');
        });
    });
});
