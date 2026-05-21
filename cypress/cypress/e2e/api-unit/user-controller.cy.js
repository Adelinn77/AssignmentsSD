describe('UserController — Unit Tests', () => {
    const BASE = '/api/users';
    const TEST_PASSWORD = Cypress.env('defaultPassword');

    let owner;
    let authConfig;

    const makeUser = () => {
        const unique = Date.now() + '_' + Math.floor(Math.random() * 100000);
        return {
            username: `api_user_${unique}`,
            password: TEST_PASSWORD,
            email: `api_user_${unique}@test.com`,
            phone: `07${Math.floor(10000000 + Math.random() * 90000000)}`,
            firstName: 'API',
            lastName: 'User'
        };
    };

    before(() => {
        cy.registerUser({ username: `api_owner_${Date.now()}` }).then((user) => {
            owner = user;
            authConfig = user.auth;
        });
    });

    it('POST /users — create user', () => {
        const user = makeUser();

        cy.request({ method: 'POST', url: BASE, body: user, auth: authConfig }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body).to.have.property('username', user.username);
            expect(res.body).to.have.property('email', user.email);
            expect(res.body).to.not.have.property('password');
        });
    });

    it('POST /users — duplicate username returns 409', () => {
        const user = makeUser();

        cy.request({ method: 'POST', url: BASE, body: user, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'POST', url: BASE, body: { ...makeUser(), username: user.username }, auth: authConfig, failOnStatusCode: false }).then((res) => {
                expect(res.status).to.eq(409);
            });
        });
    });

    it('GET /users — list users', () => {
        cy.request({ method: 'GET', url: BASE, auth: authConfig }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');
        });
    });

    it('GET /users/:username — get one user', () => {
        cy.request({ method: 'GET', url: `${BASE}/${owner.username}`, auth: authConfig }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.have.property('username', owner.username);
            expect(res.body).to.have.property('email', owner.email);
        });
    });

    it('GET /users/email/:email — get user by email', () => {
        cy.request({ method: 'GET', url: `${BASE}/email/${owner.email}`, auth: authConfig }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.have.property('username', owner.username);
        });
    });

    it('PUT /users/:username — update user', () => {
        const user = makeUser();
        const updatedEmail = `updated_${Date.now()}@test.com`;

        cy.request({ method: 'POST', url: BASE, body: user, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({
                method: 'PUT',
                url: `${BASE}/${user.username}`,
                auth: authConfig,
                body: { email: updatedEmail, phone: user.phone, firstName: 'Updated', lastName: 'Name' }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.have.property('email', updatedEmail);
                expect(res.body).to.have.property('firstName', 'Updated');
            });
        });
    });

    it('DELETE /users/:username — delete user', () => {
        const user = makeUser();

        cy.request({ method: 'POST', url: BASE, body: user, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'DELETE', url: `${BASE}/${user.username}`, auth: authConfig }).then((res) => {
                expect(res.status).to.eq(200);
            });

            cy.request({ method: 'GET', url: `${BASE}/${user.username}`, auth: authConfig, failOnStatusCode: false }).then((res) => {
                expect(res.status).to.eq(404);
            });
        });
    });

    it('PUT /users/:username/block — normal user is forbidden', () => {
        const user = makeUser();

        cy.request({ method: 'POST', url: BASE, body: user, auth: authConfig }).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'PUT', url: `${BASE}/${user.username}/block`, auth: authConfig, failOnStatusCode: false }).then((res) => {
                expect(res.status).to.eq(403);
            });
        });
    });

    it('GET /users/:username/score — returns score', () => {
        cy.request({ method: 'GET', url: `${BASE}/${owner.username}/score`, auth: authConfig }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.a('number');
        });
    });
});
