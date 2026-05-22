describe('AnswerController — Unit Tests', () => {
    const BASE = '/api/answers';

    let questionAuthor;
    let answerAuthor;
    let voter;
    let question;

    const makeAnswer = () => ({
        questionId: question.questionId,
        authorName: answerAuthor.username,
        text: `Test answer ${Date.now()} ${Math.floor(Math.random() * 100000)}`
    });

    before(() => {
        cy.registerUser({ username: `answer_q_author_${Date.now()}` }).then((user) => {
            questionAuthor = user;
            return cy.createQuestionAs(user.auth, { authorName: user.username });
        }).then((res) => {
            expect(res.status).to.eq(201);
            question = res.body;
        });

        cy.registerUser({ username: `answer_author_${Date.now()}` }).then((user) => {
            answerAuthor = user;
        });

        cy.registerUser({ username: `answer_voter_${Date.now()}` }).then((user) => {
            voter = user;
        });
    });

    it('POST /answers — create answer', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body).to.have.property('answerId');
            expect(res.body.text).to.eq(answer.text);
            expect(res.body.authorName).to.eq(answerAuthor.username);
            expect(res.body.questionId).to.eq(question.questionId);
        });
    });

    it('GET /answers — list answers', () => {
        cy.request({ method: 'GET', url: BASE, auth: answerAuthor.auth }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');
        });
    });

    it('GET /answers/:id — get answer by id', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `${BASE}/${createRes.body.answerId}`, auth: answerAuthor.auth }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.answerId).to.eq(createRes.body.answerId);
                expect(res.body.text).to.eq(answer.text);
            });
        });
    });

    it('GET /answers/question/:questionId — get answers by question', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `${BASE}/question/${question.questionId}`, auth: answerAuthor.auth }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
                expect(res.body.some((a) => a.answerId === createRes.body.answerId)).to.eq(true);
            });
        });
    });

    it('GET /answers/user/:userId — get answers by user id', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `/api/users/${answerAuthor.username}`, auth: answerAuthor.auth }).then((userRes) => {
                cy.request({ method: 'GET', url: `${BASE}/user/${userRes.body.score === undefined ? 0 : createRes.body.userId}`, auth: answerAuthor.auth }).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body).to.be.an('array');
                });
            });
        });
    });

    it('PUT /answers/:id — update answer', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({
                method: 'PUT',
                url: `${BASE}/${createRes.body.answerId}`,
                body: { answerId: createRes.body.answerId, questionId: question.questionId, authorName: answerAuthor.username, text: 'Updated answer content' },
                auth: answerAuthor.auth
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.text).to.eq('Updated answer content');
            });
        });
    });

    it('PUT /answers/:id/like — like answer', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `${BASE}/${createRes.body.answerId}/like?username=${voter.username}`, auth: voter.auth }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.likes).to.eq(1);
                expect(res.body.currentUserVote).to.eq('LIKE');
            });
        });
    });

    it('PUT /answers/:id/dislike — dislike answer', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `${BASE}/${createRes.body.answerId}/dislike?username=${voter.username}`, auth: voter.auth }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.dislikes).to.eq(1);
                expect(res.body.currentUserVote).to.eq('DISLIKE');
            });
        });
    });

    it('PUT /answers/:id/accept — accept answer as question author', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `${BASE}/${createRes.body.answerId}/accept?username=${questionAuthor.username}`, auth: questionAuthor.auth }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.accepted).to.eq(true);
            });
        });
    });

    it('DELETE /answers/:id — delete answer by id', () => {
        const answer = makeAnswer();

        cy.request({ method: 'POST', url: BASE, body: answer, auth: answerAuthor.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'DELETE', url: `${BASE}/${createRes.body.answerId}`, auth: answerAuthor.auth }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.contain(`${createRes.body.answerId}`);
            });

            cy.request({ method: 'GET', url: `${BASE}/${createRes.body.answerId}`, auth: answerAuthor.auth, failOnStatusCode: false }).then((res) => {
                expect(res.status).to.eq(404);
            });
        });
    });
});
