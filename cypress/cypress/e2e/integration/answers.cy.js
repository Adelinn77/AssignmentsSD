// =============================================================
// Answers API - End-to-End Tests
// =============================================================

describe('Answers API E2E Tests', () => {
    let questionAuthor;
    let answerAuthor;
    let voter;
    let question;

    const makeAnswer = () => ({
        questionId: question.questionId,
        authorName: answerAuthor.username,
        text: `E2E answer ${Date.now()} ${Math.floor(Math.random() * 100000)}`
    });

    before(() => {
        cy.registerUser({ username: `e2e_answer_question_${Date.now()}` }).then((user) => {
            questionAuthor = user;
            return cy.createQuestionAs(user.auth, { authorName: user.username });
        }).then((response) => {
            expect(response.status).to.eq(201);
            question = response.body;
        });

        cy.registerUser({ username: `e2e_answer_author_${Date.now()}` }).then((user) => { answerAuthor = user; });
        cy.registerUser({ username: `e2e_answer_voter_${Date.now()}` }).then((user) => { voter = user; });
    });

    it('POST /api/answers → should create answer (201)', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: '/api/answers', body: answer, auth: answerAuthor.auth }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('answerId');
            expect(response.body).to.have.property('text', answer.text);
        });
    });

    it('GET /api/answers → should return an array of answers (200)', () => {
        cy.request({ method: 'GET', url: '/api/answers', auth: answerAuthor.auth }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/answers/question/{questionId} → should return answers by question (200)', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: '/api/answers', body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `/api/answers/question/${question.questionId}`, auth: answerAuthor.auth }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.some((a) => a.answerId === createRes.body.answerId)).to.eq(true);
            });
        });
    });

    it('PUT /api/answers/{id} → should update answer (200)', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: '/api/answers', body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `/api/answers/${createRes.body.answerId}`, auth: answerAuthor.auth, body: { ...answer, text: 'Updated E2E answer' } }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('text', 'Updated E2E answer');
            });
        });
    });

    it('PUT /api/answers/{id}/like → should like answer (200)', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: '/api/answers', body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `/api/answers/${createRes.body.answerId}/like?username=${voter.username}`, auth: voter.auth }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.likes).to.eq(1);
            });
        });
    });

    it('PUT /api/answers/{id}/accept → should accept answer (200)', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: '/api/answers', body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `/api/answers/${createRes.body.answerId}/accept?username=${questionAuthor.username}`, auth: questionAuthor.auth }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.accepted).to.eq(true);
            });
        });
    });

    it('DELETE /api/answers/{id} → should delete answer (200)', () => {
        return cy.createQuestionAs(questionAuthor.auth, { authorName: questionAuthor.username }).then((questionRes) => {
            const localAnswer = { questionId: questionRes.body.questionId, authorName: answerAuthor.username, text: `To delete ${Date.now()}` };

            cy.request({ method: 'POST', url: '/api/answers', body: localAnswer, auth: answerAuthor.auth }).then((createRes) => {
                expect(createRes.status).to.eq(201);

                cy.request({ method: 'DELETE', url: `/api/answers/${createRes.body.answerId}`, auth: answerAuthor.auth }).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });
    });
});
