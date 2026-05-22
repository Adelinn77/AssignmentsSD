describe('QuestionController — Unit Tests', () => {
    const BASE = '/api/questions';

    let author;
    let voter;
    let authConfig;

    const makeQuestion = () => ({
        title: `Test Question ${Date.now()} ${Math.floor(Math.random() * 100000)}`,
        text: 'Test content',
        authorName: author.username,
        status: 'RECEIVED',
        tags: []
    });

    before(() => {
        cy.registerUser({ username: `question_author_${Date.now()}` }).then((user) => {
            author = user;
            authConfig = user.auth;
        });

        cy.registerUser({ username: `question_voter_${Date.now()}` }).then((user) => {
            voter = user;
        });
    });

    it('POST /questions — create question', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: BASE, body: question, auth: authConfig }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body).to.have.property('questionId');
            expect(res.body.title).to.eq(question.title);
            expect(res.body.text).to.eq(question.text);
            expect(res.body.authorName).to.eq(author.username);
            expect(res.body.status).to.eq('RECEIVED');
        });
    });

    it('GET /questions — list questions', () => {
        cy.request({ method: 'GET', url: BASE, auth: authConfig }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');
        });
    });

    it('GET /questions/title/:title — get question by title', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: BASE, body: question, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `${BASE}/title/${encodeURIComponent(question.title)}`, auth: authConfig }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.title).to.eq(question.title);
            });
        });
    });

    it('GET /questions/:id — get question by id', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: BASE, body: question, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `${BASE}/${createRes.body.questionId}`, auth: authConfig }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.title).to.eq(question.title);
            });
        });
    });

    it('GET /questions/author/:username — get questions by author', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: BASE, body: question, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `${BASE}/author/${author.username}`, auth: authConfig }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
                expect(res.body.some((q) => q.title === question.title)).to.eq(true);
            });
        });
    });

    it('PUT /questions/title/:title — update question', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: BASE, body: question, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            const updatedQuestion = { ...question, title: `Updated ${question.title}`, text: 'Updated content', status: 'IN_PROGRESS' };

            cy.request({ method: 'PUT', url: `${BASE}/title/${encodeURIComponent(question.title)}`, body: updatedQuestion, auth: authConfig }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.title).to.eq(updatedQuestion.title);
                expect(res.body.text).to.eq('Updated content');
                expect(res.body.status).to.eq('IN_PROGRESS');
            });
        });
    });

    it('PUT /questions/:id/like — like question', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: BASE, body: question, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `${BASE}/${createRes.body.questionId}/like?username=${voter.username}`, auth: voter.auth }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.likes).to.eq(1);
                expect(res.body.currentUserVote).to.eq('LIKE');
            });
        });
    });

    it('PUT /questions/:id/dislike — dislike question', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: BASE, body: question, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `${BASE}/${createRes.body.questionId}/dislike?username=${voter.username}`, auth: voter.auth }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.dislikes).to.eq(1);
                expect(res.body.currentUserVote).to.eq('DISLIKE');
            });
        });
    });

    it('DELETE /questions/title/:title — delete question by title', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: BASE, body: question, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'DELETE', url: `${BASE}/title/${encodeURIComponent(question.title)}`, auth: authConfig }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.contain(question.title);
            });

            cy.request({ method: 'GET', url: `${BASE}/title/${encodeURIComponent(question.title)}`, auth: authConfig, failOnStatusCode: false }).then((res) => {
                expect(res.status).to.eq(404);
            });
        });
    });
});
