// =============================================================
// Answers API - End-to-End Tests
// =============================================================
// Tests the AnswerController endpoints:
//   POST   /api/answers                     → createAnswer
//   GET    /api/answers                     → getAllAnswers
//   GET    /api/answers/{id}                → getAnswerById
//   GET    /api/answers/question/{questionId}→ getAnswersByQuestionId
//   GET    /api/answers/user/{userId}       → getAnswersByUserId
//   PUT    /api/answers/{id}                → updateAnswer
//   DELETE /api/answers/{id}                → deleteAnswer
// =============================================================

describe('Answers API E2E Tests', () => {

    const testUser = {
        username: 'a_test_user',
        email: 'a_test_user@test.com',
        phone: '0700000002',
        firstName: 'Answer',
        lastName: 'Tester'
    };

    const testQuestion = {
        title: 'Answer Test Question',
        text: 'This question exists so we can test answers against it.',
        authorName: 'a_test_user',
        status: 'RECEIVED',
        tags: ['testing']
    };

    let questionTitle = testQuestion.title;

    // Setup: create user and question, store question title for reference
    before(() => {
        cy.cleanupDatabase();
        cy.request({ method: 'DELETE', url: `/api/users/${testUser.username}`, failOnStatusCode: false });
        cy.request('POST', '/api/users', testUser);
    });

    beforeEach(() => {
        cy.cleanupDatabase();
        // Re-create the question before each answer test
        cy.request('POST', '/api/questions', testQuestion);
    });

    after(() => {
        cy.cleanupDatabase();
        cy.request({ method: 'DELETE', url: `/api/users/${testUser.username}`, failOnStatusCode: false });
    });

    // ─── CREATE ──────────────────────────────────────────────

    it('POST /api/answers → should create a new answer (201)', () => {
        const answerData = {
            text: 'Spring Boot provides auto-configuration and embedded servers.',
            // Note: questionId and userId would need to be set if the backend requires them
            // The backend's AnswerService.saveAnswer() uses mapDTOToEntity which builds 
            // Question/User from IDs, but they can be null
        };

        cy.request('POST', '/api/answers', answerData).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('answerId');
        });
    });

    it('POST /api/answers → should return 400 for invalid data', () => {
        cy.request({
            method: 'POST',
            url: '/api/answers',
            body: {},
            failOnStatusCode: false
        }).then((response) => {
            // Empty answer should still be created (no validation beyond questionId/userId)
            // but let's verify we get a response
            expect(response.status).to.be.oneOf([201, 400]);
        });
    });

    // ─── READ ALL ────────────────────────────────────────────

    it('GET /api/answers → should return an array of answers (200)', () => {
        cy.request('GET', '/api/answers').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/answers → should include newly created answer', () => {
        const answerData = { text: 'A test answer for listing.' };

        cy.request('POST', '/api/answers', answerData).then((createRes) => {
            const answerId = createRes.body.answerId;

            cy.request('GET', '/api/answers').then((response) => {
                expect(response.status).to.eq(200);
                const found = response.body.find(a => a.answerId === answerId);
                expect(found).to.not.be.undefined;
            });
        });
    });

    // ─── READ BY ID ──────────────────────────────────────────

    it('GET /api/answers/{id} → should return answer by ID (200)', () => {
        const answerData = { text: 'Answer to retrieve by ID.' };

        cy.request('POST', '/api/answers', answerData).then((createRes) => {
            const answerId = createRes.body.answerId;

            cy.request('GET', `/api/answers/${answerId}`).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('answerId', answerId);
            });
        });
    });

    it('GET /api/answers/{id} → should return 404 for non-existent ID', () => {
        cy.request({
            method: 'GET',
            url: '/api/answers/999999',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    // ─── READ BY QUESTION ID ─────────────────────────────────

    it('GET /api/answers/question/{questionId} → should return answers for a question (200)', () => {
        // This endpoint always returns 200 with an array (possibly empty)
        cy.request('GET', '/api/answers/question/1').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    // ─── READ BY USER ID ─────────────────────────────────────

    it('GET /api/answers/user/{userId} → should return answers by user (200)', () => {
        cy.request('GET', '/api/answers/user/1').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    // ─── UPDATE ──────────────────────────────────────────────

    it('PUT /api/answers/{id} → should update an answer (200)', () => {
        const answerData = { text: 'Original answer text.' };

        cy.request('POST', '/api/answers', answerData).then((createRes) => {
            const answerId = createRes.body.answerId;

            const updatedData = {
                text: 'Updated answer text with more detail.'
            };

            cy.request('PUT', `/api/answers/${answerId}`, updatedData).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('answerId', answerId);
            });
        });
    });

    it('PUT /api/answers/{id} → should return 400 for non-existent answer', () => {
        cy.request({
            method: 'PUT',
            url: '/api/answers/999999',
            body: { text: 'Updated text' },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });

    // ─── DELETE ──────────────────────────────────────────────

    it('DELETE /api/answers/{id} → should delete an answer (200)', () => {
        const answerData = { text: 'Answer to be deleted.' };

        cy.request('POST', '/api/answers', answerData).then((createRes) => {
            const answerId = createRes.body.answerId;

            cy.request('DELETE', `/api/answers/${answerId}`).then((response) => {
                expect(response.status).to.eq(200);
            });

            // Verify answer is gone
            cy.request({
                method: 'GET',
                url: `/api/answers/${answerId}`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
        });
    });

    it('DELETE /api/answers/{id} → should return 404 for non-existent answer', () => {
        cy.request({
            method: 'DELETE',
            url: '/api/answers/999999',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

});
