// =============================================================
// Users API - End-to-End Tests
// =============================================================

describe('Users API E2E Tests', () => {

    const testUser = {
        username: 'e2e_user_test', email: 'e2e_user_test@test.com', phone: '0712345678', firstName: 'E2E', lastName: 'TestUser'
    };

    beforeEach(() => { cy.deleteUser(testUser.username); });
    afterEach(() => { cy.deleteUser(testUser.username); });

    it('POST /api/users → should create a new user (201)', () => {
        cy.request('POST', '/api/users', testUser).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('username', testUser.username);
        });
    });

    it('POST /api/users → should return 409 when username already exists', () => {
        cy.createUser(testUser);
        cy.request({ method: 'POST', url: '/api/users', body: testUser, failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(409);
        });
    });

    it('POST /api/users → should return 409 when email already exists', () => {
        cy.createUser(testUser);
        cy.request({
            method: 'POST', url: '/api/users', body: { ...testUser, username: 'diff_username' }, failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(409);
        });
    });

    it('GET /api/users → should return an array of users (200)', () => {
        cy.request('GET', '/api/users').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/users → should include newly created user', () => {
        cy.createUser(testUser);
        cy.request('GET', '/api/users').then((response) => {
            const found = response.body.find(u => u.username === testUser.username);
            expect(found).to.not.be.undefined;
        });
    });

    it('GET /api/users/{username} → should return a specific user (200)', () => {
        cy.createUser(testUser);
        cy.request('GET', `/api/users/${testUser.username}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('email', testUser.email);
        });
    });

    it('GET /api/users/{username} → should return 404 for non-existent user', () => {
        cy.request({ method: 'GET', url: '/api/users/non_existent_user_xyz', failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    it('GET /api/users/email/{email} → should return user by email (200)', () => {
        cy.createUser(testUser);
        cy.request('GET', `/api/users/email/${testUser.email}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('username', testUser.username);
        });
    });

    it('GET /api/users/email/{email} → should return 404 for non-existent email', () => {
        cy.request({ method: 'GET', url: '/api/users/email/nonexistent@nowhere.com', failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    it('PUT /api/users/{username} → should update user data (200)', () => {
        cy.createUser(testUser);
        cy.request('PUT', `/api/users/${testUser.username}`, { email: 'updated@test.com', phone: '000', firstName: 'A', lastName: 'B' })
          .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('email', 'updated@test.com');
        });
    });

    it('PUT /api/users/{username} → should return 400 for non-existent user', () => {
        cy.request({ method: 'PUT', url: '/api/users/non_existent', body: { email: 'a@a.com', phone: '0', firstName: 'A', lastName: 'B' }, failOnStatusCode: false })
          .then((response) => { expect(response.status).to.eq(400); });
    });

    it('DELETE /api/users/{username} → should delete user (200)', () => {
        cy.createUser(testUser);
        cy.request('DELETE', `/api/users/${testUser.username}`).then((response) => {
            expect(response.status).to.eq(200);
        });
        cy.request({ method: 'GET', url: `/api/users/${testUser.username}`, failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    it('DELETE /api/users/{username} → should return 404 for non-existent user', () => {
        cy.request({ method: 'DELETE', url: '/api/users/non_existent', failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });
});
