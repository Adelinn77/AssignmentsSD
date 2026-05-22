// =============================================================
// Questions API - End-to-End Tests
// =============================================================

describe('Questions API E2E Tests', () => {
    let author;
    let voter;

    const makeQuestion = () => ({
        title: `E2E Question ${Date.now()} ${Math.floor(Math.random() * 100000)}`,
        text: 'This is an E2E question.',
        authorName: author.username,
        status: 'RECEIVED',
        tags: []
    });

    before(() => {
        cy.registerUser({ username: `e2e_q_author_${Date.now()}` }).then((user) => { author = user; });
        cy.registerUser({ username: `e2e_q_voter_${Date.now()}` }).then((user) => { voter = user; });
    });

    it('POST /api/questions → should create a new question (201)', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: '/api/questions', body: question, auth: author.auth }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('title', question.title);
        });
    });

    it('POST /api/questions → should return 409 when title already exists', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: '/api/questions', body: question, auth: author.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'POST', url: '/api/questions', body: question, auth: author.auth, failOnStatusCode: false }).then((response) => {
                expect(response.status).to.eq(409);
            });
        });
    });

    it('GET /api/questions → should return an array of questions (200)', () => {
        cy.request({ method: 'GET', url: '/api/questions', auth: author.auth }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/questions/title/{title} → should return question by title (200)', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: '/api/questions', body: question, auth: author.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `/api/questions/title/${encodeURIComponent(question.title)}`, auth: author.auth }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('title', question.title);
            });
        });
    });

    it('GET /api/questions/author/{username} → should return questions by author (200)', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: '/api/questions', body: question, auth: author.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'GET', url: `/api/questions/author/${author.username}`, auth: author.auth }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.an('array');
                expect(response.body.some((q) => q.title === question.title)).to.eq(true);
            });
        });
    });

    it('PUT /api/questions/title/{title} → should update question (200)', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: '/api/questions', body: question, auth: author.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            const updatedData = { ...question, title: `Updated: ${question.title}`, status: 'IN_PROGRESS' };

            cy.request({ method: 'PUT', url: `/api/questions/title/${encodeURIComponent(question.title)}`, body: updatedData, auth: author.auth }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('title', updatedData.title);
                expect(response.body).to.have.property('status', 'IN_PROGRESS');
            });
        });
    });

    it('PUT /api/questions/{id}/like → should like question (200)', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: '/api/questions', body: question, auth: author.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `/api/questions/${createRes.body.questionId}/like?username=${voter.username}`, auth: voter.auth }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.likes).to.eq(1);
            });
        });
    });

    it('DELETE /api/questions/title/{title} → should delete question (200)', () => {
        const question = makeQuestion();

        cy.request({ method: 'POST', url: '/api/questions', body: question, auth: author.auth }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'DELETE', url: `/api/questions/title/${encodeURIComponent(question.title)}`, auth: author.auth }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });
});
