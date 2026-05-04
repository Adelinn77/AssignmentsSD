// =============================================================
// Custom Cypress Commands — Unified (E2E & Unit)
// =============================================================

// ── Cleanup ──────────────────────────────────────────────────
Cypress.Commands.add('cleanupDatabase', () => {
    cy.request({ method: 'DELETE', url: '/api/testing/cleanup', failOnStatusCode: false });
});

// ── Users ────────────────────────────────────────────────────
Cypress.Commands.add('createUser', (userData) => {
    return cy.request({ method: 'POST', url: '/api/users', body: userData, failOnStatusCode: false });
});

Cypress.Commands.add('deleteUser', (username) => {
    return cy.request({ method: 'DELETE', url: `/api/users/${username}`, failOnStatusCode: false });
});

// ── Questions ────────────────────────────────────────────────
Cypress.Commands.add('createQuestion', (data) => {
    return cy.request({ method: 'POST', url: '/api/questions', body: data, failOnStatusCode: false });
});

Cypress.Commands.add('deleteQuestionByTitle', (title) => {
    return cy.request({
        method: 'DELETE',
        url: `/api/questions/title/${encodeURIComponent(title)}`,
        failOnStatusCode: false
    });
});

// ── Answers ──────────────────────────────────────────────────
Cypress.Commands.add('createAnswer', (data) => {
    return cy.request({ method: 'POST', url: '/api/answers', body: data, failOnStatusCode: false });
});

Cypress.Commands.add('deleteAnswer', (id) => {
    return cy.request({ method: 'DELETE', url: `/api/answers/${id}`, failOnStatusCode: false });
});

// ── Tags ─────────────────────────────────────────────────────
Cypress.Commands.add('createTag', (data) => {
    return cy.request({ method: 'POST', url: '/api/tags', body: data, failOnStatusCode: false });
});

Cypress.Commands.add('deleteTagByLabel', (label) => {
    return cy.request({ method: 'DELETE', url: `/api/tags/label/${label}`, failOnStatusCode: false });
});

// ── Helpers ──────────────────────────────────────────────────
Cypress.Commands.add('seedUserAndQuestion', (user, question) => {
    cy.createUser(user);
    return cy.createQuestion(question);
});
