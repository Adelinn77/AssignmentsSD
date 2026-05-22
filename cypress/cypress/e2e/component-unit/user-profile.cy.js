describe('UserProfile Component — Unit/End-to-End Tests', () => {
    const frontendUrl = Cypress.env('frontendUrl');

    let user;

    before(() => {
        cy.registerUser({
            username: `profile_user_${Date.now()}`,
            firstName: 'John',
            lastName: 'Doe'
        }).then((created) => {
            user = created;
        });
    });

    beforeEach(() => {
        cy.loginByUi(user.username, user.password);
        cy.visit(`${frontendUrl}/users/${user.username}`);
    });

    it('should render the profile header correctly', () => {
        cy.get('.profile-header h1').should('contain', `${user.firstName} ${user.lastName}`);
        cy.get('.profile-header .username-tag').should('contain', `@${user.username}`);
        cy.get('.profile-header .score-badge').should('contain', 'Reputation Score: 0');
    });

    it('should display the correct contact information', () => {
        cy.get('.contact-info').within(() => {
            cy.get('h3').should('contain', 'Contact Information');
            cy.get('p').should('contain', `Email: ${user.email}`);
            cy.get('p').should('contain', `Phone: ${user.phone}`);
        });
    });

    it('should render the questions section', () => {
        cy.get('.user-questions-section').within(() => {
            cy.get('h3').should('contain', 'My Questions');
        });
    });

    it('should render the JSON debug section', () => {
        cy.get('.json-debug-section h4').should('contain', 'Debug Data');
        cy.get('.json-debug-section pre').should('exist');
    });
});
