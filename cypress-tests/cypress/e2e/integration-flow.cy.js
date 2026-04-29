// =============================================================
// Full Integration Flow - End-to-End Test
// =============================================================
// Tests a complete user journey across all API resources:
//   1. Create a user
//   2. Create tags
//   3. Create a question (with author and tags)
//   4. Create an answer for the question
//   5. Update the question
//   6. Update the answer
//   7. Verify all data is consistent
//   8. Delete everything in reverse order
// =============================================================

describe('Full Integration Flow E2E Test', () => {

    const user = {
        username: 'integration_user',
        email: 'integration@test.com',
        phone: '0733333333',
        firstName: 'Integration',
        lastName: 'Test'
    };

    const question = {
        title: 'Integration Test: How does Hibernate work?',
        text: 'Explain the internal workings of Hibernate ORM.',
        authorName: 'integration_user',
        status: 'RECEIVED',
        tags: ['hibernate', 'orm']
    };

    // Full cleanup before and after
    before(() => {
        cy.cleanupDatabase();
        cy.request({ method: 'DELETE', url: `/api/users/${user.username}`, failOnStatusCode: false });
        cy.request({ method: 'DELETE', url: '/api/tags/label/hibernate', failOnStatusCode: false });
        cy.request({ method: 'DELETE', url: '/api/tags/label/orm', failOnStatusCode: false });
    });

    after(() => {
        cy.cleanupDatabase();
        cy.request({ method: 'DELETE', url: `/api/users/${user.username}`, failOnStatusCode: false });
        cy.request({ method: 'DELETE', url: '/api/tags/label/hibernate', failOnStatusCode: false });
        cy.request({ method: 'DELETE', url: '/api/tags/label/orm', failOnStatusCode: false });
    });

    it('should complete a full CRUD lifecycle across all resources', () => {

        // ── STEP 1: Create User ──────────────────────────────
        cy.log('**Step 1: Create User**');
        cy.request('POST', '/api/users', user).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body.username).to.eq(user.username);
            cy.log(`✅ User "${user.username}" created`);
        });

        // ── STEP 2: Verify User exists ───────────────────────
        cy.log('**Step 2: Verify User exists**');
        cy.request('GET', `/api/users/${user.username}`).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.email).to.eq(user.email);
            expect(res.body.firstName).to.eq(user.firstName);
            cy.log(`✅ User "${user.username}" verified`);
        });

        // ── STEP 3: Create Question with tags ────────────────
        cy.log('**Step 3: Create Question**');
        cy.request('POST', '/api/questions', question).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body.title).to.eq(question.title);
            expect(res.body.authorName).to.eq(question.authorName);
            expect(res.body.tags).to.be.an('array');
            cy.log(`✅ Question "${question.title}" created`);
        });

        // ── STEP 4: Verify Question via GET by title ─────────
        cy.log('**Step 4: Verify Question by title**');
        cy.request('GET', `/api/questions/title/${encodeURIComponent(question.title)}`)
            .then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.title).to.eq(question.title);
                expect(res.body.text).to.eq(question.text);
                cy.log(`✅ Question verified by title`);
            });

        // ── STEP 5: Verify Question via GET by author ────────
        cy.log('**Step 5: Verify Question by author**');
        cy.request('GET', `/api/questions/author/${user.username}`).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
            expect(res.body[0].authorName).to.eq(user.username);
            cy.log(`✅ Question found for author "${user.username}"`);
        });

        // ── STEP 6: Create Answer ────────────────────────────
        cy.log('**Step 6: Create Answer**');
        cy.request('POST', '/api/answers', {
            text: 'Hibernate uses session and transaction management with lazy loading.'
        }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body).to.have.property('answerId');
            cy.log(`✅ Answer created with ID ${res.body.answerId}`);

            const answerId = res.body.answerId;

            // ── STEP 7: Verify Answer by ID ──────────────────
            cy.log('**Step 7: Verify Answer by ID**');
            cy.request('GET', `/api/answers/${answerId}`).then((getRes) => {
                expect(getRes.status).to.eq(200);
                expect(getRes.body.answerId).to.eq(answerId);
                cy.log(`✅ Answer verified by ID`);
            });

            // ── STEP 8: Update Answer ────────────────────────
            cy.log('**Step 8: Update Answer**');
            cy.request('PUT', `/api/answers/${answerId}`, {
                text: 'UPDATED: Hibernate provides ORM mapping with caching support.'
            }).then((updateRes) => {
                expect(updateRes.status).to.eq(200);
                cy.log(`✅ Answer updated`);
            });

            // ── STEP 9: Delete Answer ────────────────────────
            cy.log('**Step 9: Delete Answer**');
            cy.request('DELETE', `/api/answers/${answerId}`).then((delRes) => {
                expect(delRes.status).to.eq(200);
                cy.log(`✅ Answer deleted`);
            });

            // Verify answer is gone
            cy.request({
                method: 'GET',
                url: `/api/answers/${answerId}`,
                failOnStatusCode: false
            }).then((verifyRes) => {
                expect(verifyRes.status).to.eq(404);
                cy.log(`✅ Answer deletion verified`);
            });
        });

        // ── STEP 10: Update Question ─────────────────────────
        cy.log('**Step 10: Update Question**');
        const updatedQuestion = {
            title: 'RESOLVED: How does Hibernate work?',
            text: 'Hibernate ORM explained with session management.',
            authorName: user.username,
            status: 'RESOLVED',
            tags: ['hibernate', 'resolved']
        };

        cy.request('PUT', `/api/questions/title/${encodeURIComponent(question.title)}`, updatedQuestion)
            .then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.title).to.eq(updatedQuestion.title);
                expect(res.body.status).to.eq('RESOLVED');
                cy.log(`✅ Question updated to "${updatedQuestion.title}"`);
            });

        // ── STEP 11: Delete Question ─────────────────────────
        cy.log('**Step 11: Delete Question**');
        cy.request('DELETE', `/api/questions/title/${encodeURIComponent(updatedQuestion.title)}`)
            .then((res) => {
                expect(res.status).to.eq(200);
                cy.log(`✅ Question deleted`);
            });

        // ── STEP 12: Delete User ─────────────────────────────
        cy.log('**Step 12: Delete User**');
        cy.request('DELETE', `/api/users/${user.username}`).then((res) => {
            expect(res.status).to.eq(200);
            cy.log(`✅ User deleted`);
        });

        // Verify user is gone
        cy.request({
            method: 'GET',
            url: `/api/users/${user.username}`,
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(404);
            cy.log(`✅ Full integration lifecycle completed successfully!`);
        });
    });

});
