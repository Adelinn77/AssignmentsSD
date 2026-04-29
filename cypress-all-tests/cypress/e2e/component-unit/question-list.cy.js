// =============================================================
// COMPONENT UNIT TESTS — Question List Page
// =============================================================

describe('Question List Component — Unit Tests', () => {

    const frontendUrl = 'http://localhost:4200';

    beforeEach(() => {
        // Clean up and set up a predictable state via backend API
        cy.cleanupDatabase();
        cy.request({ method: 'DELETE', url: '/api/users/ui_unit_user', failOnStatusCode: false });
        
        cy.request('POST', 'http://localhost:8080/api/users', {
            username: 'ui_unit_user', email: 'ui@test.com', phone: '070', firstName: 'UI', lastName: 'Test'
        });
        cy.request('POST', 'http://localhost:8080/api/questions', {
            title: 'UI Unit Test Q', text: 'This is a UI test question.', authorName: 'ui_unit_user', status: 'RECEIVED'
        });

        cy.visit(`${frontendUrl}/questions`);
    });

    after(() => {
        cy.cleanupDatabase();
        cy.request({ method: 'DELETE', url: '/api/users/ui_unit_user', failOnStatusCode: false });
    });

    it('should display the component title', () => {
        cy.get('h2').should('contain', 'Questions List');
    });

    it('should render the questions table with 4 columns', () => {
        cy.get('table.questions-table').should('exist');
        cy.get('thead tr th').should('have.length', 4);
    });

    it('should display question data in rows', () => {
        cy.get('tbody tr').should('have.length.at.least', 1);
        cy.get('.title').should('contain', 'UI Unit Test Q');
        cy.get('.text-preview').should('contain', 'This is a UI test question.');
        cy.get('.name').should('contain', 'ui_unit_user');
    });

    it('should display likes and dislikes counters', () => {
        cy.get('.likes').should('contain', '👍');
        cy.get('.dislikes').should('contain', '👎');
    });
});
