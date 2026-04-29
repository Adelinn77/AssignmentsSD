// =============================================================
// Custom Cypress Commands for Forum App E2E Tests
// =============================================================
// These commands match the ACTUAL API endpoints from the
// Spring Boot backend controllers.
// =============================================================

/**
 * Cleanup: Deletes all answers and questions via TestingController
 * Maps to: DELETE /api/testing/cleanup (TestingController.java)
 */
Cypress.Commands.add('cleanupDatabase', () => {
    cy.request({
        method: 'DELETE',
        url: '/api/testing/cleanup',
        failOnStatusCode: false
    });
});

/**
 * Create a user via UserController
 * Maps to: POST /api/users (UserController.java)
 */
Cypress.Commands.add('createUser', (userData) => {
    return cy.request({
        method: 'POST',
        url: '/api/users',
        body: userData,
        failOnStatusCode: false
    });
});

/**
 * Delete a user by username
 * Maps to: DELETE /api/users/{username} (UserController.java)
 */
Cypress.Commands.add('deleteUser', (username) => {
    return cy.request({
        method: 'DELETE',
        url: `/api/users/${username}`,
        failOnStatusCode: false
    });
});

/**
 * Create a question via QuestionController
 * Maps to: POST /api/questions (QuestionController.java)
 * Body: { title, text, authorName, status, tags }
 */
Cypress.Commands.add('createQuestion', (questionData) => {
    return cy.request({
        method: 'POST',
        url: '/api/questions',
        body: questionData,
        failOnStatusCode: false
    });
});

/**
 * Create an answer via AnswerController
 * Maps to: POST /api/answers (AnswerController.java)
 * Body: { questionId, userId, text }
 */
Cypress.Commands.add('createAnswer', (answerData) => {
    return cy.request({
        method: 'POST',
        url: '/api/answers',
        body: answerData,
        failOnStatusCode: false
    });
});

/**
 * Create a tag via TagController
 * Maps to: POST /api/tags (TagController.java)
 * Body: { label }
 */
Cypress.Commands.add('createTag', (tagData) => {
    return cy.request({
        method: 'POST',
        url: '/api/tags',
        body: tagData,
        failOnStatusCode: false
    });
});

/**
 * Delete a tag by label
 * Maps to: DELETE /api/tags/label/{label} (TagController.java)
 */
Cypress.Commands.add('deleteTag', (label) => {
    return cy.request({
        method: 'DELETE',
        url: `/api/tags/label/${label}`,
        failOnStatusCode: false
    });
});
