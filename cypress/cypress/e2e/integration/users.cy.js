// =============================================================
// Users API - End-to-End Tests
// =============================================================

describe('Users API E2E Tests', () => {
    let runner;
    let authConfig;

    const makeUser = () => {
        const unique = Date.now() + '_' + Math.floor(Math.random() * 100000);
        return {
            username: `e2e_user_${unique}`,
            password: Cypress.env('defaultPassword'),
            email: `e2e_user_${unique}@test.com`,
            phone: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
            firstName: 'E2E',
            lastName: 'User'
        };
    };

    before(() => {
        cy.registerUser({ username: `e2e_runner_${Date.now()}` }).then((user) => {
            runner = user;
            authConfig = user.auth;
        });
    });

    it('POST /api/users → should create a new user (201)', () => {
        const user = makeUser();

        cy.request({ method: 'POST', url: '/api/users', body: user, auth: authConfig }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('username', user.username);
        });
    });

    it('POST /api/users → should return 409 when username already exists', () => {
        const user = makeUser();

        cy.request({ method: 'POST', url: '/api/users', body: user, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'POST', url: '/api/users', body: { ...makeUser(), username: user.username }, auth: authConfig, failOnStatusCode: false }).then((response) => {
                expect(response.status).to.eq(409);
            });
        });
    });

    it('GET /api/users → should return an array of users (200)', () => {
        cy.request({ method: 'GET', url: '/api/users', auth: authConfig }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/users/{username} → should return a specific user (200)', () => {
        cy.request({ method: 'GET', url: `/api/users/${runner.username}`, auth: authConfig }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('email', runner.email);
        });
    });

    it('GET /api/users/email/{email} → should return user by email (200)', () => {
        cy.request({ method: 'GET', url: `/api/users/email/${runner.email}`, auth: authConfig }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('username', runner.username);
        });
    });

    it('PUT /api/users/{username} → should update user data (200)', () => {
        const user = makeUser();
        const updatedEmail = `updated_${Date.now()}@test.com`;

        cy.request({ method: 'POST', url: '/api/users', body: user, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `/api/users/${user.username}`, auth: authConfig, body: { email: updatedEmail, phone: user.phone, firstName: 'A', lastName: 'B' } })
              .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('email', updatedEmail);
            });
        });
    });

    it('DELETE /api/users/{username} → should delete user (200)', () => {
        const user = makeUser();

        cy.request({ method: 'POST', url: '/api/users', body: user, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'DELETE', url: `/api/users/${user.username}`, auth: authConfig }).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });
});
