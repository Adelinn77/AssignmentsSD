describe('QuestionController — Unit Tests', () => {

    const BASE = '/api/questions';
    const AUTHOR = `test_author_${Date.now()}`;
    const TEST_PASSWORD = 'TestPassword123!'; // Added a password for registration

    const makeQuestion = () => ({
        title: `Test Question ${Date.now()} ${Math.floor(Math.random() * 100000)}`,
        text: 'Test content',
        authorName: AUTHOR,
        status: 'RECEIVED',
        tags: []
    });

    before(() => {
        // We skip the DELETE step here. Since AUTHOR uses Date.now(),
        // it is always unique, so there is no need to delete it first.

        // 1. Create the test user using the PUBLIC register endpoint
        cy.request({
            method: 'POST',
            url: '/api/auth/register', // Updated to the permitAll() route
            body: {
                username: AUTHOR,
                password: TEST_PASSWORD, // Added password for HTTP Basic Auth
                email: `${AUTHOR}@test.com`,
                phone: '0000000001',
                firstName: 'Test',
                lastName: 'User'
            }
        }).then((res) => {
            // Your Spring controller might return 200 or 201, adjusting assertion to accept both
            expect([200, 201]).to.include(res.status);
        });
    });

    it('POST /questions — create question', () => {
        const question = makeQuestion();

        // 2. Use Cypress 'auth' object for protected routes
        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body).to.exist;
            expect(res.body.title).to.eq(question.title);
            expect(res.body.text).to.eq(question.text);
            expect(res.body.authorName).to.eq(AUTHOR);
            expect(res.body.status).to.eq('RECEIVED');
        });
    });

    it('GET /questions — list questions', () => {
        cy.request({
            method: 'GET',
            url: BASE,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');
        });
    });

    it('GET /questions/title/:title — get one question by title', () => {
        const question = makeQuestion();

        // 1. Create the question (needs auth)
        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            // 2. Fetch the newly created question (needs auth)
            cy.request({
                method: 'GET',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                auth: {
                    user: AUTHOR,
                    pass: TEST_PASSWORD
                }
            }).then((res) => {
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

        // 1. Create the question (needs auth)
        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            const updatedQuestion = {
                title: question.title,
                text: 'Updated content',
                authorName: AUTHOR,
                status: 'RECEIVED',
                tags: []
            };

            // 2. Update the question (needs auth)
            cy.request({
                method: 'PUT',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                body: updatedQuestion,
                failOnStatusCode: false,
                auth: {
                    user: AUTHOR,
                    pass: TEST_PASSWORD
                }
            }).then((res) => {
                expect(res.status).to.be.oneOf([200, 204]);

                // 3. Verify the update (needs auth)
                cy.request({
                    method: 'GET',
                    url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                    auth: {
                        user: AUTHOR,
                        pass: TEST_PASSWORD
                    }
                }).then((getRes) => {
                    expect(getRes.status).to.eq(200);
                    expect(getRes.body.text).to.eq('Updated content');
                });
            });
        });
    });

    it('DELETE /questions/title/:title — delete question by title', () => {
        const question = makeQuestion();

        // 1. Create the question (needs auth)
        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            // 2. Delete the question (needs auth)
            cy.request({
                method: 'DELETE',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                auth: {
                    user: AUTHOR,
                    pass: TEST_PASSWORD
                }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.contain(question.title);
            });

            // 3. Try to fetch the deleted question to verify it is gone (needs auth)
            cy.request({
                method: 'GET',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                failOnStatusCode: false,
                auth: {
                    user: AUTHOR,
                    pass: TEST_PASSWORD
                }
            }).then((res) => {
                expect(res.status).to.eq(404);
            });
        });
    });

});