// =============================================================
// Questions API - End-to-End Tests
// =============================================================

describe('Questions API E2E Tests', () => {

    const testUser = {
        username: 'q_test_user', email: 'q_test_user@test.com', phone: '0700000001', firstName: 'Question', lastName: 'Tester'
    };

    const testQuestion = {
        title: 'What is Spring Boot?', text: 'Explain Spring Boot architecture.', authorName: 'q_test_user', status: 'RECEIVED', tags: ['spring-boot']
    };

    before(() => {
        cy.cleanupDatabase();
        cy.deleteUser(testUser.username);
        cy.createUser(testUser);
    });

    beforeEach(() => { cy.cleanupDatabase(); });

    after(() => {
        cy.cleanupDatabase();
        cy.deleteUser(testUser.username);
    });

    it('POST /api/questions → should create a new question (201)', () => {
        cy.request('POST', '/api/questions', testQuestion).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('title', testQuestion.title);
        });
    });

    it('POST /api/questions → should return 409 when title already exists', () => {
        cy.createQuestion(testQuestion);
        cy.request({ method: 'POST', url: '/api/questions', body: testQuestion, failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(409);
        });
    });

    it('POST /api/questions → should return error for non-existent author', () => {
        cy.request({
            method: 'POST', url: '/api/questions', body: { ...testQuestion, title: 'Ghost', authorName: 'non_existent_xyz' }, failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([400, 409]);
        });
    });

    it('GET /api/questions → should return an array of questions (200)', () => {
        cy.request('GET', '/api/questions').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/questions/title/{title} → should return question by title (200)', () => {
        cy.createQuestion(testQuestion);
        cy.request('GET', `/api/questions/title/${encodeURIComponent(testQuestion.title)}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('title', testQuestion.title);
        });
    });

    it('GET /api/questions/author/{username} → should return questions by author (200)', () => {
        cy.createQuestion(testQuestion);
        cy.request('GET', `/api/questions/author/${testQuestion.authorName}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body[0].authorName).to.eq(testQuestion.authorName);
        });
    });

    it('PUT /api/questions/title/{title} → should update question (200)', () => {
        cy.createQuestion(testQuestion);
        const updatedData = { ...testQuestion, title: 'Updated: What is Spring Boot?', status: 'IN_PROGRESS' };
        cy.request('PUT', `/api/questions/title/${encodeURIComponent(testQuestion.title)}`, updatedData).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('title', updatedData.title);
        });
    });

    it('DELETE /api/questions/title/{title} → should delete question (200)', () => {
        cy.createQuestion(testQuestion);
        cy.request('DELETE', `/api/questions/title/${encodeURIComponent(testQuestion.title)}`).then((response) => {
            expect(response.status).to.eq(200);
        });
        cy.request({ method: 'GET', url: `/api/questions/title/${encodeURIComponent(testQuestion.title)}`, failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });
});
