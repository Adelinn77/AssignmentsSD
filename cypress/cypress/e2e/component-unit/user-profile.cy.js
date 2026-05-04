// =============================================================
// COMPONENT UNIT TESTS — User Profile Page
// =============================================================

describe('User Profile Component — Unit Tests', () => {

    const frontendUrl = 'http://localhost:4200';
    const profileUser = {
        username: 'profile_unit', email: 'profile@unit.com', phone: '07111', firstName: 'Profile', lastName: 'Unit'
    };

    before(() => {
        cy.request({ method: 'DELETE', url: `http://localhost:8080/api/users/${profileUser.username}`, failOnStatusCode: false });
        cy.request('POST', 'http://localhost:8080/api/users', profileUser);
    });

    after(() => {
        cy.request({ method: 'DELETE', url: `http://localhost:8080/api/users/${profileUser.username}`, failOnStatusCode: false });
    });

    it('should display loading state initially', () => {
        // Intercept API call to delay it and check loading state
        cy.intercept('GET', `/api/users/${profileUser.username}`, {
            delay: 1000,
            body: profileUser
        }).as('getUser');

        cy.visit(`${frontendUrl}/users/${profileUser.username}`);
        cy.contains('Loading profile data...').should('be.visible');
        cy.wait('@getUser');
    });

    it('should display user information correctly', () => {
        cy.visit(`${frontendUrl}/users/${profileUser.username}`);
        
        cy.get('.profile-header h1').should('contain', `${profileUser.firstName} ${profileUser.lastName}`);
        cy.get('.username-tag').should('contain', `@${profileUser.username}`);
        cy.get('.contact-info').should('contain', profileUser.email);
        cy.get('.contact-info').should('contain', profileUser.phone);
    });

    it('should display error message when user fails to load', () => {
        cy.intercept('GET', `/api/users/${profileUser.username}`, {
            statusCode: 500,
            body: 'Internal Server Error'
        }).as('getUserError');

        cy.visit(`${frontendUrl}/users/${profileUser.username}`);
        cy.wait('@getUserError');
        cy.get('.error-msg').should('contain', 'Failed to load user profile. Please try again.');
    });
});
