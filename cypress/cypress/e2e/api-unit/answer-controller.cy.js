describe('QuestionController — Unit Tests', () => {

    const BASE = '/api/questions';

    const AUTHOR = `test_author_${Date.now()}`;

    const makeQuestion = () => ({
        title: `Test Question ${Date.now()} ${Math.floor(Math.random() * 100000)}`,
        text: 'Test content',
        authorName: AUTHOR,
        status: 'RECEIVED',
        tags: []
    });

    before(() => {
        cy.request({
            method: 'DELETE',
            url: `/api/users/${AUTHOR}`,
            failOnStatusCode: false
        });

        cy.request('POST', '/api/users', {
            username: AUTHOR,
            email: `${AUTHOR}@test.com`,
            phone: '0700000000',
            firstName: 'Test',
            lastName: 'User'
        }).then((res) => {
            expect(res.status).to.eq(201);
        });
    });

    it('POST /questions — create question', () => {
        const question = makeQuestion();

        cy.request('POST', BASE, question).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body).to.exist;
            expect(res.body.title).to.eq(question.title);
            expect(res.body.text).to.eq(question.text);
            expect(res.body.authorName).to.eq(AUTHOR);
            expect(res.body.status).to.eq('RECEIVED');
        });
    });

    it('GET /questions — list questions', () => {
        cy.request('GET', BASE).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');
        });
    });

    it('GET /questions/title/:title — get one question by title', () => {
        const question = makeQuestion();

        cy.request('POST', BASE, question).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request('GET', `${BASE}/title/${encodeURIComponent(question.title)}`)
                .then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body).to.exist;
                    expect(res.body.title).to.eq(question.title);
                    expect(res.body.text).to.eq(question.text);
                    expect(res.body.authorName).to.eq(AUTHOR);
                    expect(res.body.status).to.eq('RECEIVED');
                });
        });
    });

    it('PUT /questions/title/:title — update question', () => {

        const unique = Date.now() + '_' + Math.floor(Math.random() * 100000);

        const question = {
            title: `Test Question ${unique}`,
            text: 'Test content',
            authorName: AUTHOR,
            status: 'RECEIVED',
            tags: []
        };

        cy.request('POST', BASE, question).then((createRes) => {
            expect(createRes.status).to.eq(201);

            const updatedQuestion = {
                title: question.title,
                text: 'Updated content',
                authorName: AUTHOR,
                status: 'RECEIVED',
                tags: []
            };

            cy.request({
                method: 'PUT',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                body: updatedQuestion,
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.be.oneOf([200, 204]);

                cy.request('GET', `${BASE}/title/${encodeURIComponent(question.title)}`)
                    .then((getRes) => {
                        expect(getRes.status).to.eq(200);
                        expect(getRes.body.text).to.eq('Updated content');
                    });
            });
        });

    });
    it('DELETE /questions/title/:title — delete question by title', () => {
        const question = makeQuestion();

        cy.request('POST', BASE, question).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request('DELETE', `${BASE}/title/${encodeURIComponent(question.title)}`)
                .then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body).to.contain(question.title);
                });

            cy.request({
                method: 'GET',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.eq(404);
            });
        });
    });

});