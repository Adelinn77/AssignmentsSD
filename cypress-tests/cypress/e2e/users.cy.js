// =============================================================
// Users API - End-to-End Tests
// =============================================================
// Tests the UserController endpoints:
//   POST   /api/users              → createUser
//   GET    /api/users              → getAllUsers
//   GET    /api/users/{username}   → getUserByUsername
//   GET    /api/users/email/{email}→ getUserByEmail
//   PUT    /api/users/{username}   → updateUser
//   DELETE /api/users/{username}   → deleteUser
// =============================================================

describe('Users API E2E Tests', () => {

    const testUser = {
        username: 'e2e_user_test',
        email: 'e2e_user_test@test.com',
        phone: '0712345678',
        firstName: 'E2E',
        lastName: 'TestUser'
    };

    // Clean up test user before each test (ignore errors if not found)
    beforeEach(() => {
        cy.request({
            method: 'DELETE',
            url: `/api/users/${testUser.username}`,
            failOnStatusCode: false
        });
    });

    afterEach(() => {
        cy.request({
            method: 'DELETE',
            url: `/api/users/${testUser.username}`,
            failOnStatusCode: false
        });
    });

    // ─── CREATE ──────────────────────────────────────────────

    it('POST /api/users → should create a new user (201)', () => {
        cy.request('POST', '/api/users', testUser).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('username', testUser.username);
            expect(response.body).to.have.property('email', testUser.email);
            expect(response.body).to.have.property('phone', testUser.phone);
            expect(response.body).to.have.property('firstName', testUser.firstName);
            expect(response.body).to.have.property('lastName', testUser.lastName);
        });
    });

    it('POST /api/users → should return 409 when username already exists', () => {
        // Create the user first
        cy.request('POST', '/api/users', testUser);

        // Try to create again with same username
        cy.request({
            method: 'POST',
            url: '/api/users',
            body: testUser,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(409);
        });
    });

    it('POST /api/users → should return 409 when email already exists', () => {
        // Create the user first
        cy.request('POST', '/api/users', testUser);

        // Try to create a different user with the same email
        cy.request({
            method: 'POST',
            url: '/api/users',
            body: {
                username: 'different_username',
                email: testUser.email,
                phone: '0799999999',
                firstName: 'Other',
                lastName: 'User'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(409);
        });
    });

    // ─── READ ALL ────────────────────────────────────────────

    it('GET /api/users → should return an array of users (200)', () => {
        cy.request('GET', '/api/users').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/users → should include newly created user', () => {
        cy.request('POST', '/api/users', testUser);

        cy.request('GET', '/api/users').then((response) => {
            expect(response.status).to.eq(200);
            const found = response.body.find(u => u.username === testUser.username);
            expect(found).to.not.be.undefined;
            expect(found.email).to.eq(testUser.email);
        });
    });

    // ─── READ BY USERNAME ────────────────────────────────────

    it('GET /api/users/{username} → should return a specific user (200)', () => {
        cy.request('POST', '/api/users', testUser);

        cy.request('GET', `/api/users/${testUser.username}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('username', testUser.username);
            expect(response.body).to.have.property('email', testUser.email);
        });
    });

    it('GET /api/users/{username} → should return 404 for non-existent user', () => {
        cy.request({
            method: 'GET',
            url: '/api/users/non_existent_user_xyz',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    // ─── READ BY EMAIL ───────────────────────────────────────

    it('GET /api/users/email/{email} → should return user by email (200)', () => {
        cy.request('POST', '/api/users', testUser);

        cy.request('GET', `/api/users/email/${testUser.email}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('email', testUser.email);
            expect(response.body).to.have.property('username', testUser.username);
        });
    });

    it('GET /api/users/email/{email} → should return 404 for non-existent email', () => {
        cy.request({
            method: 'GET',
            url: '/api/users/email/nonexistent@nowhere.com',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    // ─── UPDATE ──────────────────────────────────────────────

    it('PUT /api/users/{username} → should update user data (200)', () => {
        cy.request('POST', '/api/users', testUser);

        const updatedData = {
            email: 'updated_email@test.com',
            phone: '0799888777',
            firstName: 'Updated',
            lastName: 'Name'
        };

        cy.request('PUT', `/api/users/${testUser.username}`, updatedData).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('username', testUser.username);
            expect(response.body).to.have.property('email', updatedData.email);
            expect(response.body).to.have.property('firstName', updatedData.firstName);
            expect(response.body).to.have.property('lastName', updatedData.lastName);
        });
    });

    it('PUT /api/users/{username} → should return 400 for non-existent user', () => {
        cy.request({
            method: 'PUT',
            url: '/api/users/non_existent_user_xyz',
            body: { email: 'test@test.com', phone: '0711111111', firstName: 'A', lastName: 'B' },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });

    // ─── DELETE ──────────────────────────────────────────────

    it('DELETE /api/users/{username} → should delete user (200)', () => {
        cy.request('POST', '/api/users', testUser);

        cy.request('DELETE', `/api/users/${testUser.username}`).then((response) => {
            expect(response.status).to.eq(200);
        });

        // Verify user is gone
        cy.request({
            method: 'GET',
            url: `/api/users/${testUser.username}`,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    it('DELETE /api/users/{username} → should return 404 for non-existent user', () => {
        cy.request({
            method: 'DELETE',
            url: '/api/users/non_existent_user_xyz',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

});
