describe('AnswerController — Unit Tests', () => {

    const BASE = '/api/answers';
    const AUTHOR = `test_author_${Date.now()}`;
    const TEST_PASSWORD = 'TestPassword123!'; // Added a password for registration

    const makeAnswer = () => ({
        title: `Test Answer ${Date.now()} ${Math.floor(Math.random() * 100000)}`,
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

    it('POST /answers — create answer', () => {
        const answer = makeAnswer();

        // 2. Use Cypress 'auth' object for protected routes
        cy.request({
            method: 'POST',
            url: BASE,
            body: answer,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body).to.exist;
            expect(res.body.title).to.eq(answer.title);
            expect(res.body.text).to.eq(answer.text);
            expect(res.body.authorName).to.eq(AUTHOR);
            expect(res.body.status).to.eq('RECEIVED');
        });
    });

    it('GET /answers — list answers', () => {
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

    it('GET /answers/title/:title — get one answer by title', () => {
        const answer = makeAnswer();

        // 1. Create the answer (needs auth)
        cy.request({
            method: 'POST',
            url: BASE,
            body: answer,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            // 2. Fetch the newly created answer (needs auth)
            cy.request({
                method: 'GET',
                url: `${BASE}/title/${encodeURIComponent(answer.title)}`,
                auth: {
                    user: AUTHOR,
                    pass: TEST_PASSWORD
                }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.exist;
                expect(res.body.title).to.eq(answer.title);
                expect(res.body.text).to.eq(answer.text);
                expect(res.body.authorName).to.eq(AUTHOR);
                expect(res.body.status).to.eq('RECEIVED');
            });
        });
    });

    it('PUT /answers/title/:title — update answer', () => {

        const unique = Date.now() + '_' + Math.floor(Math.random() * 100000);

        const answer = {
            title: `Test Answer ${unique}`,
            text: 'Test content',
            authorName: AUTHOR,
            status: 'RECEIVED',
            tags: []
        };

        // 1. Create the answer (needs auth)
        cy.request({
            method: 'POST',
            url: BASE,
            body: answer,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            const updatedAnswer = {
                title: answer.title,
                text: 'Updated content',
                authorName: AUTHOR,
                status: 'RECEIVED',
                tags: []
            };

            // 2. Update the answer (needs auth)
            cy.request({
                method: 'PUT',
                url: `${BASE}/title/${encodeURIComponent(answer.title)}`,
                body: updatedAnswer,
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
                    url: `${BASE}/title/${encodeURIComponent(answer.title)}`,
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

    it('DELETE /answers/title/:title — delete answer by title', () => {
        const answer = makeAnswer();

        // 1. Create the answer (needs auth)
        cy.request({
            method: 'POST',
            url: BASE,
            body: answer,
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            // 2. Delete the answer (needs auth)
            cy.request({
                method: 'DELETE',
                url: `${BASE}/title/${encodeURIComponent(answer.title)}`,
                auth: {
                    user: AUTHOR,
                    pass: TEST_PASSWORD
                }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.contain(answer.title);
            });

            // 3. Try to fetch the deleted answer to verify it is gone (needs auth)
            cy.request({
                method: 'GET',
                url: `${BASE}/title/${encodeURIComponent(answer.title)}`,
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