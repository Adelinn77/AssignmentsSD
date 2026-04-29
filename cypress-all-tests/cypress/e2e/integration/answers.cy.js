// =============================================================
// Answers API - End-to-End Tests
// =============================================================

describe('Answers API E2E Tests', () => {

    const testUser = {
        username: 'a_test_user', email: 'a_test_user@test.com', phone: '0700000002', firstName: 'Answer', lastName: 'Tester'
    };

    const testQuestion = {
        title: 'Answer Test Question', text: 'This question exists so we can test answers against it.', authorName: 'a_test_user', status: 'RECEIVED', tags: ['testing']
    };

    let currentQuestionId;

    before(() => {
        cy.cleanupDatabase();
        cy.deleteUser(testUser.username);
        cy.createUser(testUser);
    });

    beforeEach(() => {
        cy.cleanupDatabase();
        // Creăm întrebarea și îi salvăm ID-ul ca să-l folosim la răspunsuri
        cy.createQuestion(testQuestion).then((res) => {
            currentQuestionId = res.body.questionId;
        });
    });

    after(() => {
        cy.cleanupDatabase();
        cy.deleteUser(testUser.username);
    });

    it('POST /api/answers → should create a new answer (201)', () => {
        const answerData = {
            text: 'Spring Boot provides auto-configuration and embedded servers.',
            questionId: currentQuestionId,
            authorName: testUser.username
        };

        cy.request('POST', '/api/answers', answerData).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('answerId');
        });
    });

    it('GET /api/answers → should return an array of answers (200)', () => {
        cy.request('GET', '/api/answers').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/answers/{id} → should return answer by ID (200)', () => {
        const answerData = {
            text: 'Test',
            questionId: currentQuestionId,
            authorName: testUser.username
        };

        cy.request('POST', '/api/answers', answerData).then((createRes) => {
            cy.request('GET', `/api/answers/${createRes.body.answerId}`).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('answerId', createRes.body.answerId);
            });
        });
    });

    it('GET /api/answers/question/{questionId} → should return answers for a question (200)', () => {
        cy.request('GET', `/api/answers/question/${currentQuestionId}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/answers/user/{userId} → should return answers by user (200)', () => {
        // Poti inlocui /1 cu ID-ul real daca endpoint-ul are nevoie
        cy.request('GET', '/api/answers/user/1').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('PUT /api/answers/{id} → should update an answer (200)', () => {
        const answerData = {
            text: 'Original',
            questionId: currentQuestionId,
            authorName: testUser.username
        };

        cy.request('POST', '/api/answers', answerData).then((createRes) => {
            const updateData = {
                text: 'Updated',
                questionId: currentQuestionId,
                authorName: testUser.username
            };

            cy.request('PUT', `/api/answers/${createRes.body.answerId}`, updateData).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });

    it('DELETE /api/answers/{id} → should delete an answer (200)', () => {
        const answerData = {
            text: 'Delete me',
            questionId: currentQuestionId,
            authorName: testUser.username
        };

        cy.request('POST', '/api/answers', answerData).then((createRes) => {
            cy.request('DELETE', `/api/answers/${createRes.body.answerId}`).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });
});
