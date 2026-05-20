// =============================================================
// Questions API - End-to-End Tests (Authenticated)
// =============================================================

describe('Questions API E2E Tests', () => {

    const BASE = '/api/questions';
    const AUTHOR = `q_test_user_${Date.now()}`;
    const TEST_PASSWORD = 'TestPassword123!';

    // Reusable auth config to keep the requests clean
    const authConfig = {
        user: AUTHOR,
        pass: TEST_PASSWORD
    };

    // Helper to generate dynamic question data to prevent 409 collisions
    const makeQuestion = (titlePrefix = 'What is Spring Boot?') => ({
        title: `${titlePrefix} - ${Date.now()} ${Math.floor(Math.random() * 100000)}`,
        text: 'Explain Spring Boot architecture.',
        authorName: AUTHOR,
        status: 'RECEIVED',
        tags: ['spring-boot']
    });

    before(() => {
        // Register the test user programmatically before running any tests
        cy.request({
            method: 'POST',
            url: '/api/auth/register',
            body: {
                username: AUTHOR,
                password: TEST_PASSWORD,
                email: `${AUTHOR}@test.com`,
                phone: '0700000001',
                firstName: 'Question',
                lastName: 'Tester'
            }
        }).then((res) => {
            expect([200, 201]).to.include(res.status);
        });
    });

    // NOTE: cy.cleanupDatabase() is intentionally omitted here so we don't
    // accidentally wipe the user we just registered in the before() block.

    it('POST /api/questions → should create a new question (201)', () => {
        const question = makeQuestion();

        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: authConfig
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('title', question.title);
            expect(response.body.authorName).to.eq(AUTHOR);
        });
    });

    it('POST /api/questions → should return 409 when title already exists', () => {
        const question = makeQuestion('Duplicate Title Test');

        // 1. Create the initial question
        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: authConfig
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            // 2. Try to create the exact same question again
            cy.request({
                method: 'POST',
                url: BASE,
                body: question,
                failOnStatusCode: false,
                auth: authConfig
            }).then((response) => {
                expect(response.status).to.eq(409);
            });
        });
    });

    it('POST /api/questions → should return error for non-existent author', () => {
        const question = makeQuestion();
        question.authorName = 'non_existent_xyz'; // Override to a fake author

        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            failOnStatusCode: false,
            auth: authConfig // Request is authenticated, but the payload author is wrong
        }).then((response) => {
            // Depending on backend logic, this could be 400 (Bad Request), 403 (Forbidden), or 409
            expect(response.status).to.be.oneOf([400, 403, 409]);
        });
    });

    it('GET /api/questions → should return an array of questions (200)', () => {
        cy.request({
            method: 'GET',
            url: BASE,
            auth: authConfig
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/questions/title/{title} → should return question by title (200)', () => {
        const question = makeQuestion();

        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: authConfig
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({
                method: 'GET',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                auth: authConfig
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('title', question.title);
            });
        });
    });

    it('GET /api/questions/author/{username} → should return questions by author (200)', () => {
        const question = makeQuestion();

        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: authConfig
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({
                method: 'GET',
                url: `${BASE}/author/${AUTHOR}`,
                auth: authConfig
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.an('array');
                expect(response.body[0].authorName).to.eq(AUTHOR);
            });
        });
    });

    it('PUT /api/questions/title/{title} → should update question (200)', () => {
        const question = makeQuestion();

        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: authConfig
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            const updatedData = {
                ...question,
                title: `Updated: ${question.title}`,
                status: 'IN_PROGRESS'
            };

            cy.request({
                method: 'PUT',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                body: updatedData,
                auth: authConfig
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('title', updatedData.title);
                expect(response.body).to.have.property('status', 'IN_PROGRESS');
            });
        });
    });

    it('DELETE /api/questions/title/{title} → should delete question (200)', () => {
        const question = makeQuestion();

        cy.request({
            method: 'POST',
            url: BASE,
            body: question,
            auth: authConfig
        }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            // Delete the question
            cy.request({
                method: 'DELETE',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                auth: authConfig
            }).then((response) => {
                expect(response.status).to.eq(200);
            });

            // Verify it was deleted
            cy.request({
                method: 'GET',
                url: `${BASE}/title/${encodeURIComponent(question.title)}`,
                failOnStatusCode: false,
                auth: authConfig
            }).then((response) => {
                expect(response.status).to.be.oneOf([404, 500]);
            });
        });
    });
});