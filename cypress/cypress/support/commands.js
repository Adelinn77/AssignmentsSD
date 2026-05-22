// =============================================================
// Custom Cypress Commands — Unified (E2E & API)
// =============================================================

const defaultPassword = () => Cypress.env('defaultPassword') || 'TestPassword123!';
const apiUrl = () => Cypress.env('apiUrl') || 'http://localhost:8080';
const tagApiUrl = () => Cypress.env('tagApiUrl') || 'http://localhost:8081';

const uniquePhone = () => `07${Math.floor(10000000 + Math.random() * 90000000)}`;

Cypress.Commands.add('uniquePhone', () => uniquePhone());

Cypress.Commands.add('authFor', (username, password = defaultPassword()) => ({
  user: username,
  pass: password,
}));

Cypress.Commands.add('registerUser', (userData = {}) => {
  const username = userData.username || `cy_user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  const body = {
    username,
    password: userData.password || defaultPassword(),
    email: userData.email || `${username}@test.com`,
    phone: userData.phone || uniquePhone(),
    firstName: userData.firstName || 'Cypress',
    lastName: userData.lastName || 'User',
  };

  return cy.request({
    method: 'POST',
    url: `${apiUrl()}/api/auth/register`,
    body,
    failOnStatusCode: false,
  }).then((response) => {
    expect([200, 201, 400]).to.include(response.status);
    return cy.wrap({ ...body, auth: { user: body.username, pass: body.password }, registerStatus: response.status }, { log: false });
  });
});

Cypress.Commands.add('loginByUi', (username, password = defaultPassword()) => {
  const frontendUrl = Cypress.env('frontendUrl') || 'http://localhost:4200';

  cy.visit(`${frontendUrl}/auth/login`);
  cy.get('#username').clear().type(username);
  cy.get('#password').clear().type(password);
  cy.get('#btn-login').click();
  cy.url().should('eq', `${frontendUrl}/questions`);
});

Cypress.Commands.add('createUserAs', (auth, userData = {}) => {
  const username = userData.username || `cy_created_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  return cy.request({
    method: 'POST',
    url: `${apiUrl()}/api/users`,
    auth,
    body: {
      username,
      password: userData.password || defaultPassword(),
      email: userData.email || `${username}@test.com`,
      phone: userData.phone || uniquePhone(),
      firstName: userData.firstName || 'Created',
      lastName: userData.lastName || 'User',
    },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('deleteUserAs', (auth, username) => {
  return cy.request({
    method: 'DELETE',
    url: `${apiUrl()}/api/users/${encodeURIComponent(username)}`,
    auth,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('createQuestionAs', (auth, questionData = {}) => {
  const title = questionData.title || `Cypress Question ${Date.now()} ${Math.floor(Math.random() * 100000)}`;

  return cy.request({
    method: 'POST',
    url: `${apiUrl()}/api/questions`,
    auth,
    body: {
      title,
      text: questionData.text || 'Question created by Cypress.',
      authorName: questionData.authorName || auth.user,
      status: questionData.status || 'RECEIVED',
      tags: questionData.tags || [],
    },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('deleteQuestionByTitleAs', (auth, title) => {
  return cy.request({
    method: 'DELETE',
    url: `${apiUrl()}/api/questions/title/${encodeURIComponent(title)}`,
    auth,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('createAnswerAs', (auth, answerData = {}) => {
  return cy.request({
    method: 'POST',
    url: `${apiUrl()}/api/answers`,
    auth,
    body: {
      questionId: answerData.questionId,
      authorName: answerData.authorName || auth.user,
      text: answerData.text || 'Answer created by Cypress.',
    },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('deleteAnswerAs', (auth, id) => {
  return cy.request({
    method: 'DELETE',
    url: `${apiUrl()}/api/answers/${id}`,
    auth,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('createTag', (data) => {
  return cy.request({
    method: 'POST',
    url: `${tagApiUrl()}/api/tags`,
    body: data,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('deleteTagByLabel', (label) => {
  return cy.request({
    method: 'DELETE',
    url: `${tagApiUrl()}/api/tags/label/${encodeURIComponent(label)}`,
    failOnStatusCode: false,
  });
});
