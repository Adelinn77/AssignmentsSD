// =============================================================
// UNIT TESTS — AnswerController
// =============================================================
// Tested class : AnswerController.java
// Service layer : AnswerService.java
// DTO           : AnswerDTO (answerId, questionId, userId, text,
//                 dateTime, imageUrls)
//
// Each "it" block tests ONE unit of behaviour in isolation.
// =============================================================

describe('AnswerController — Unit Tests', () => {

    const BASE = '/api/answers';

    const AUTHOR = {
        username: 'ans_unit_author',
        email: 'ans_unit@test.com',
        phone: '0730000001',
        firstName: 'AUnit',
        lastName: 'Author'
    };

    const QUESTION = {
        title: 'Answer Unit Test Question',
        text: 'Placeholder question for answer tests.',
        authorName: AUTHOR.username,
        status: 'RECEIVED',
        tags: []
    };

    // Setup: user + question
    before(() => {
        cy.cleanupDatabase();
        cy.deleteUser(AUTHOR.username);
        cy.request('POST', '/api/users', AUTHOR);
    });

    beforeEach(() => {
        cy.cleanupDatabase();
        // Re-create the parent question for each test
        cy.request('POST', '/api/questions', QUESTION);
    });

    after(() => {
        cy.cleanupDatabase();
        cy.deleteUser(AUTHOR.username);
    });

    // ==========================================================
    // POST /api/answers  →  createAnswer()
    // ==========================================================
    describe('POST /api/answers — createAnswer()', () => {

        it('should return 201 and an answerId', () => {
            cy.request('POST', BASE, { text: 'A new answer.' }).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body).to.have.property('answerId');
                expect(res.body.answerId).to.be.a('number');
            });
        });

        it('should persist the answer (retrievable by ID)', () => {
            cy.request('POST', BASE, { text: 'Persistent answer.' }).then((createRes) => {
                const id = createRes.body.answerId;
                cy.request('GET', `${BASE}/${id}`).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body.answerId).to.eq(id);
                });
            });
        });

        it('should accept an answer with only text', () => {
            cy.request('POST', BASE, { text: 'Minimal answer.' }).then((res) => {
                expect(res.status).to.eq(201);
            });
        });

        it('should accept an answer with questionId and userId', () => {
            cy.request('POST', BASE, { text: 'Full answer.', questionId: 1, userId: 1 }).then((res) => {
                expect(res.status).to.eq(201);
            });
        });

        it('should generate unique answerId for each new answer', () => {
            cy.request('POST', BASE, { text: 'Answer 1' }).then((r1) => {
                cy.request('POST', BASE, { text: 'Answer 2' }).then((r2) => {
                    expect(r1.body.answerId).to.not.eq(r2.body.answerId);
                });
            });
        });
    });

    // ==========================================================
    // GET /api/answers  →  getAllAnswers()
    // ==========================================================
    describe('GET /api/answers — getAllAnswers()', () => {

        it('should return 200 with an array', () => {
            cy.request('GET', BASE).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
            });
        });

        it('should include all created answers', () => {
            cy.request('POST', BASE, { text: 'Ans A' });
            cy.request('POST', BASE, { text: 'Ans B' });
            cy.request('GET', BASE).then((res) => {
                expect(res.body.length).to.be.greaterThan(1);
            });
        });

        it('should return objects with answerId field', () => {
            cy.request('POST', BASE, { text: 'Field check' });
            cy.request('GET', BASE).then((res) => {
                res.body.forEach(a => {
                    expect(a).to.have.property('answerId');
                });
            });
        });
    });

    // ==========================================================
    // GET /api/answers/{id}  →  getAnswerById()
    // ==========================================================
    describe('GET /api/answers/:id — getAnswerById()', () => {

        it('should return 200 with the correct answer', () => {
            cy.request('POST', BASE, { text: 'Get by ID answer.' }).then((createRes) => {
                const id = createRes.body.answerId;
                cy.request('GET', `${BASE}/${id}`).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body.answerId).to.eq(id);
                });
            });
        });

        it('should return 404 for a non-existent ID', () => {
            cy.request({ method: 'GET', url: `${BASE}/999999`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should return 404 after the answer is deleted', () => {
            cy.request('POST', BASE, { text: 'To be deleted.' }).then((createRes) => {
                const id = createRes.body.answerId;
                cy.request('DELETE', `${BASE}/${id}`);
                cy.request({ method: 'GET', url: `${BASE}/${id}`, failOnStatusCode: false })
                    .then((res) => {
                        expect(res.status).to.eq(404);
                    });
            });
        });
    });

    // ==========================================================
    // GET /api/answers/question/{questionId}  →  getAnswersByQuestionId()
    // ==========================================================
    describe('GET /api/answers/question/:questionId — getAnswersByQuestionId()', () => {

        it('should return 200 with an array', () => {
            cy.request('GET', `${BASE}/question/1`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
            });
        });

        it('should return empty array for a question with no answers', () => {
            cy.request('GET', `${BASE}/question/999999`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array').that.has.length(0);
            });
        });
    });

    // ==========================================================
    // GET /api/answers/user/{userId}  →  getAnswersByUserId()
    // ==========================================================
    describe('GET /api/answers/user/:userId — getAnswersByUserId()', () => {

        it('should return 200 with an array', () => {
            cy.request('GET', `${BASE}/user/1`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
            });
        });

        it('should return empty array for a user with no answers', () => {
            cy.request('GET', `${BASE}/user/999999`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.have.length(0);
            });
        });
    });

    // ==========================================================
    // PUT /api/answers/{id}  →  updateAnswer()
    // ==========================================================
    describe('PUT /api/answers/:id — updateAnswer()', () => {

        it('should return 200 with updated data', () => {
            cy.request('POST', BASE, { text: 'Original.' }).then((createRes) => {
                const id = createRes.body.answerId;
                cy.request('PUT', `${BASE}/${id}`, { text: 'Updated text.' }).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body.answerId).to.eq(id);
                });
            });
        });

        it('should persist the update (verified by GET)', () => {
            cy.request('POST', BASE, { text: 'Before update.' }).then((createRes) => {
                const id = createRes.body.answerId;
                cy.request('PUT', `${BASE}/${id}`, { text: 'After update.' });
                cy.request('GET', `${BASE}/${id}`).then((res) => {
                    expect(res.body.answerId).to.eq(id);
                });
            });
        });

        it('should return 400 for a non-existent answer ID', () => {
            cy.request({ method: 'PUT', url: `${BASE}/999999`, body: { text: 'X' }, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(400);
                });
        });
    });

    // ==========================================================
    // DELETE /api/answers/{id}  →  deleteAnswer()
    // ==========================================================
    describe('DELETE /api/answers/:id — deleteAnswer()', () => {

        it('should return 200 with success message', () => {
            cy.request('POST', BASE, { text: 'Delete me.' }).then((createRes) => {
                const id = createRes.body.answerId;
                cy.request('DELETE', `${BASE}/${id}`).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body).to.include('deleted successfully');
                });
            });
        });

        it('should make the answer unreachable via GET', () => {
            cy.request('POST', BASE, { text: 'Gone soon.' }).then((createRes) => {
                const id = createRes.body.answerId;
                cy.request('DELETE', `${BASE}/${id}`);
                cy.request({ method: 'GET', url: `${BASE}/${id}`, failOnStatusCode: false })
                    .then((res) => {
                        expect(res.status).to.eq(404);
                    });
            });
        });

        it('should return 404 for a non-existent answer', () => {
            cy.request({ method: 'DELETE', url: `${BASE}/999999`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should not affect other answers', () => {
            cy.request('POST', BASE, { text: 'Keep me.' }).then((r1) => {
                cy.request('POST', BASE, { text: 'Delete me.' }).then((r2) => {
                    cy.request('DELETE', `${BASE}/${r2.body.answerId}`);
                    cy.request('GET', `${BASE}/${r1.body.answerId}`).then((res) => {
                        expect(res.status).to.eq(200);
                    });
                });
            });
        });
    });

});
