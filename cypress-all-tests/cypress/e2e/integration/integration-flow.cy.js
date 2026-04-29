// =============================================================
// Full Integration Flow - End-to-End Test
// =============================================================

describe('Full Integration Flow E2E Test', () => {

    const user = { username: 'integration_user', email: 'int@test.com', phone: '073', firstName: 'Int', lastName: 'Test' };
    const question = { title: 'Int Q', text: 'Explain ORM.', authorName: 'integration_user', status: 'RECEIVED', tags: ['orm'] };

    before(() => {
        cy.cleanupDatabase();
        cy.deleteUser(user.username);
        cy.deleteTagByLabel('orm');
    });

    after(() => {
        cy.cleanupDatabase();
        cy.deleteUser(user.username);
        cy.deleteTagByLabel('orm');
    });

    it('should complete a full CRUD lifecycle across all resources', () => {
        // 1. Create User
        cy.request('POST', '/api/users', user).its('status').should('eq', 201);

        // 2. Verify User exists
        cy.request('GET', `/api/users/${user.username}`).its('status').should('eq', 200);

        // 3. Create Question
        cy.request('POST', '/api/questions', question).its('status').should('eq', 201);

        // 4. Verify Question
        cy.request('GET', `/api/questions/title/${encodeURIComponent(question.title)}`).its('status').should('eq', 200);

        // 5. Create Answer
        cy.request('POST', '/api/answers', { text: 'Ans' }).then((res) => {
            const answerId = res.body.answerId;

            // 6. Update Answer
            cy.request('PUT', `/api/answers/${answerId}`, { text: 'UPDATED Ans' }).its('status').should('eq', 200);

            // 7. Delete Answer
            cy.request('DELETE', `/api/answers/${answerId}`).its('status').should('eq', 200);
        });

        // 8. Update Question
        cy.request('PUT', `/api/questions/title/${encodeURIComponent(question.title)}`, { ...question, status: 'RESOLVED' }).its('status').should('eq', 200);

        // 9. Delete Question
        cy.request('DELETE', `/api/questions/title/${encodeURIComponent(question.title)}`).its('status').should('eq', 200);

        // 10. Delete User
        cy.request('DELETE', `/api/users/${user.username}`).its('status').should('eq', 200);
    });
});
