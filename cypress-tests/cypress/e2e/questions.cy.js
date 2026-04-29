// =============================================================
// Questions API - End-to-End Tests
// =============================================================
// Tests the QuestionController endpoints:
//   POST   /api/questions                → createQuestion
//   GET    /api/questions                → getAllQuestions
//   GET    /api/questions/title/{title}  → getQuestionByTitle
//   GET    /api/questions/author/{user}  → getQuestionsByAuthor
//   PUT    /api/questions/title/{title}  → updateQuestion
//   DELETE /api/questions/title/{title}  → deleteQuestionByTitle
// =============================================================

describe('Questions API E2E Tests', () => {

    const testUser = {
        username: 'q_test_user',
        email: 'q_test_user@test.com',
        phone: '0700000001',
        firstName: 'Question',
        lastName: 'Tester'
    };

    const testQuestion = {
        title: 'What is Spring Boot?',
        text: 'Explain Spring Boot architecture and its advantages.',
        authorName: 'q_test_user',
        status: 'RECEIVED',
        tags: ['spring-boot', 'java']
    };

    // Setup: create a test user (required as question author)
    // and cleanup questions/answers
    before(() => {
        cy.cleanupDatabase();
        cy.request({ method: 'DELETE', url: `/api/users/${testUser.username}`, failOnStatusCode: false });
        cy.request('POST', '/api/users', testUser);
    });

    beforeEach(() => {
        cy.cleanupDatabase();
    });

    after(() => {
        cy.cleanupDatabase();
        cy.request({ method: 'DELETE', url: `/api/users/${testUser.username}`, failOnStatusCode: false });
    });

    // ─── CREATE ──────────────────────────────────────────────

    it('POST /api/questions → should create a new question (201)', () => {
        cy.request('POST', '/api/questions', testQuestion).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('title', testQuestion.title);
            expect(response.body).to.have.property('text', testQuestion.text);
            expect(response.body).to.have.property('authorName', testQuestion.authorName);
            expect(response.body).to.have.property('status', testQuestion.status);
            expect(response.body.tags).to.be.an('array');
        });
    });

    it('POST /api/questions → should return 409 when title already exists', () => {
        cy.request('POST', '/api/questions', testQuestion);

        cy.request({
            method: 'POST',
            url: '/api/questions',
            body: testQuestion,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(409);
        });
    });

    it('POST /api/questions → should return error for non-existent author', () => {
        cy.request({
            method: 'POST',
            url: '/api/questions',
            body: {
                ...testQuestion,
                title: 'Question by Ghost',
                authorName: 'non_existent_author_xyz'
            },
            failOnStatusCode: false
        }).then((response) => {
            // Should fail because the author doesn't exist
            expect(response.status).to.be.oneOf([400, 409]);
        });
    });

    // ─── READ ALL ────────────────────────────────────────────

    it('GET /api/questions → should return an array of questions (200)', () => {
        cy.request('GET', '/api/questions').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/questions → should include newly created question', () => {
        cy.request('POST', '/api/questions', testQuestion);

        cy.request('GET', '/api/questions').then((response) => {
            expect(response.status).to.eq(200);
            const found = response.body.find(q => q.title === testQuestion.title);
            expect(found).to.not.be.undefined;
            expect(found.authorName).to.eq(testQuestion.authorName);
        });
    });

    // ─── READ BY TITLE ───────────────────────────────────────

    it('GET /api/questions/title/{title} → should return question by title (200)', () => {
        cy.request('POST', '/api/questions', testQuestion);

        cy.request('GET', `/api/questions/title/${encodeURIComponent(testQuestion.title)}`)
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('title', testQuestion.title);
                expect(response.body).to.have.property('text', testQuestion.text);
                expect(response.body).to.have.property('authorName', testQuestion.authorName);
            });
    });

    it('GET /api/questions/title/{title} → should return 404 for non-existent title', () => {
        cy.request({
            method: 'GET',
            url: '/api/questions/title/NonExistentQuestionTitle12345',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    // ─── READ BY AUTHOR ──────────────────────────────────────

    it('GET /api/questions/author/{username} → should return questions by author (200)', () => {
        cy.request('POST', '/api/questions', testQuestion);

        cy.request('GET', `/api/questions/author/${testQuestion.authorName}`)
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.an('array');
                expect(response.body.length).to.be.greaterThan(0);
                expect(response.body[0].authorName).to.eq(testQuestion.authorName);
            });
    });

    it('GET /api/questions/author/{username} → should return 404 for non-existent author', () => {
        cy.request({
            method: 'GET',
            url: '/api/questions/author/non_existent_author_xyz',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    // ─── UPDATE ──────────────────────────────────────────────

    it('PUT /api/questions/title/{title} → should update question (200)', () => {
        cy.request('POST', '/api/questions', testQuestion);

        const updatedData = {
            title: 'Updated: What is Spring Boot?',
            text: 'Updated explanation of Spring Boot architecture.',
            authorName: testQuestion.authorName,
            status: 'IN_PROGRESS',
            tags: ['spring-boot', 'updated']
        };

        cy.request('PUT', `/api/questions/title/${encodeURIComponent(testQuestion.title)}`, updatedData)
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('title', updatedData.title);
                expect(response.body).to.have.property('text', updatedData.text);
                expect(response.body).to.have.property('status', updatedData.status);
            });
    });

    it('PUT /api/questions/title/{title} → should return 400 for non-existent question', () => {
        cy.request({
            method: 'PUT',
            url: '/api/questions/title/NonExistentTitle12345',
            body: {
                title: 'New Title',
                text: 'New Text',
                authorName: testQuestion.authorName,
                status: 'RECEIVED'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });

    // ─── DELETE ──────────────────────────────────────────────

    it('DELETE /api/questions/title/{title} → should delete question (200)', () => {
        cy.request('POST', '/api/questions', testQuestion);

        cy.request('DELETE', `/api/questions/title/${encodeURIComponent(testQuestion.title)}`)
            .then((response) => {
                expect(response.status).to.eq(200);
            });

        // Verify question is gone
        cy.request({
            method: 'GET',
            url: `/api/questions/title/${encodeURIComponent(testQuestion.title)}`,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    it('DELETE /api/questions/title/{title} → should return 404 for non-existent question', () => {
        cy.request({
            method: 'DELETE',
            url: '/api/questions/title/NonExistentTitle12345',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

});
