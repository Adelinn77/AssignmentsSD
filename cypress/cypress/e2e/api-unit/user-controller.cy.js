// =============================================================
// UNIT TESTS — UserController
// =============================================================
// Tested class : UserController.java
// Service layer : UserService.java
// DTO           : UserDTO (username, email, phone, firstName, lastName)
//
// Each "it" block tests ONE unit of behaviour in isolation.
// =============================================================

describe('UserController — Unit Tests', () => {

    // ── Test data ────────────────────────────────────────────
    const BASE = '/api/users';
    const USER_A = {
        username: 'unit_user_a',
        email: 'unit_a@test.com',
        phone: '0711000001',
        firstName: 'UnitA',
        lastName: 'TestA'
    };
    const USER_B = {
        username: 'unit_user_b',
        email: 'unit_b@test.com',
        phone: '0711000002',
        firstName: 'UnitB',
        lastName: 'TestB'
    };

    // Cleanup helpers
    const cleanup = () => {
        cy.deleteUser(USER_A.username);
        cy.deleteUser(USER_B.username);
        cy.deleteUser('updated_by_put');
    };

    beforeEach(cleanup);
    afterEach(cleanup);

    // ==========================================================
    // POST /api/users  →  createUser()
    // ==========================================================
    describe('POST /api/users — createUser()', () => {

        it('should return 201 and the created user DTO', () => {
            cy.request('POST', BASE, USER_A).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body).to.have.property('username', USER_A.username);
                expect(res.body).to.have.property('email', USER_A.email);
                expect(res.body).to.have.property('phone', USER_A.phone);
                expect(res.body).to.have.property('firstName', USER_A.firstName);
                expect(res.body).to.have.property('lastName', USER_A.lastName);
            });
        });

        it('should persist the user (readable via GET afterwards)', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('GET', `${BASE}/${USER_A.username}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.username).to.eq(USER_A.username);
            });
        });

        it('should return 409 when username already exists', () => {
            cy.request('POST', BASE, USER_A);
            cy.request({ method: 'POST', url: BASE, body: USER_A, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(409);
                    expect(res.body).to.be.a('string');
                    expect(res.body).to.include('already exists');
                });
        });

        it('should return 409 when email already exists (different username)', () => {
            cy.request('POST', BASE, USER_A);
            const duplicateEmail = { ...USER_B, email: USER_A.email };
            cy.request({ method: 'POST', url: BASE, body: duplicateEmail, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(409);
                    expect(res.body).to.include('already exists');
                });
        });

        it('should accept user with minimal fields (username + email only)', () => {
            const minimal = { username: USER_A.username, email: USER_A.email };
            cy.request('POST', BASE, minimal).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body.username).to.eq(USER_A.username);
            });
        });

        it('should handle special characters in username', () => {
            const special = { ...USER_A, username: 'user_with-special.chars123' };
            cy.request('POST', BASE, special).then((res) => {
                expect(res.status).to.eq(201);
            });
            cy.deleteUser('user_with-special.chars123');
        });
    });

    // ==========================================================
    // GET /api/users  →  getAllUsers()
    // ==========================================================
    describe('GET /api/users — getAllUsers()', () => {

        it('should return 200 with an array', () => {
            cy.request('GET', BASE).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
            });
        });

        it('should return all created users in the list', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('POST', BASE, USER_B);
            cy.request('GET', BASE).then((res) => {
                const usernames = res.body.map(u => u.username);
                expect(usernames).to.include(USER_A.username);
                expect(usernames).to.include(USER_B.username);
            });
        });

        it('should return user objects with all DTO fields', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('GET', BASE).then((res) => {
                const user = res.body.find(u => u.username === USER_A.username);
                expect(user).to.have.all.keys('username', 'email', 'phone', 'firstName', 'lastName');
            });
        });

        it('should reflect deletions (user removed from list after DELETE)', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('DELETE', `${BASE}/${USER_A.username}`);
            cy.request('GET', BASE).then((res) => {
                const found = res.body.find(u => u.username === USER_A.username);
                expect(found).to.be.undefined;
            });
        });
    });

    // ==========================================================
    // GET /api/users/{username}  →  getUserByUsername()
    // ==========================================================
    describe('GET /api/users/:username — getUserByUsername()', () => {

        it('should return 200 and the correct user', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('GET', `${BASE}/${USER_A.username}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.username).to.eq(USER_A.username);
                expect(res.body.email).to.eq(USER_A.email);
                expect(res.body.phone).to.eq(USER_A.phone);
                expect(res.body.firstName).to.eq(USER_A.firstName);
                expect(res.body.lastName).to.eq(USER_A.lastName);
            });
        });

        it('should return 404 for a non-existent username', () => {
            cy.request({ method: 'GET', url: `${BASE}/ghost_user_xyz`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should return exactly the updated data after PUT', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('PUT', `${BASE}/${USER_A.username}`, {
                email: 'changed@test.com', phone: '0799999999',
                firstName: 'Changed', lastName: 'Name'
            });
            cy.request('GET', `${BASE}/${USER_A.username}`).then((res) => {
                expect(res.body.email).to.eq('changed@test.com');
                expect(res.body.firstName).to.eq('Changed');
            });
        });
    });

    // ==========================================================
    // GET /api/users/email/{email}  →  getUserByEmail()
    // ==========================================================
    describe('GET /api/users/email/:email — getUserByEmail()', () => {

        it('should return 200 and match the user', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('GET', `${BASE}/email/${USER_A.email}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.username).to.eq(USER_A.username);
                expect(res.body.email).to.eq(USER_A.email);
            });
        });

        it('should return 404 for a non-existent email', () => {
            cy.request({ method: 'GET', url: `${BASE}/email/nobody@nowhere.com`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });
    });

    // ==========================================================
    // PUT /api/users/{username}  →  updateUser()
    // ==========================================================
    describe('PUT /api/users/:username — updateUser()', () => {

        it('should return 200 with updated fields', () => {
            cy.request('POST', BASE, USER_A);
            const patch = { email: 'new_email@test.com', phone: '0700000000', firstName: 'New', lastName: 'Person' };
            cy.request('PUT', `${BASE}/${USER_A.username}`, patch).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.email).to.eq(patch.email);
                expect(res.body.firstName).to.eq(patch.firstName);
                expect(res.body.lastName).to.eq(patch.lastName);
                expect(res.body.username).to.eq(USER_A.username); // username stays the same
            });
        });

        it('should persist the update (verified by GET)', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('PUT', `${BASE}/${USER_A.username}`, {
                email: 'persisted@test.com', phone: '0700000000',
                firstName: 'Persisted', lastName: 'Data'
            });
            cy.request('GET', `${BASE}/${USER_A.username}`).then((res) => {
                expect(res.body.email).to.eq('persisted@test.com');
                expect(res.body.firstName).to.eq('Persisted');
            });
        });

        it('should return 400 when user does not exist', () => {
            cy.request({
                method: 'PUT', url: `${BASE}/ghost_user_xyz`,
                body: { email: 'x@x.com', phone: '0', firstName: 'X', lastName: 'Y' },
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.eq(400);
            });
        });

        it('should allow updating only the email', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('PUT', `${BASE}/${USER_A.username}`, { email: 'only_email@test.com' })
                .then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body.email).to.eq('only_email@test.com');
                });
        });
    });

    // ==========================================================
    // DELETE /api/users/{username}  →  deleteUser()
    // ==========================================================
    describe('DELETE /api/users/:username — deleteUser()', () => {

        it('should return 200 with success message', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('DELETE', `${BASE}/${USER_A.username}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.include('deleted successfully');
            });
        });

        it('should make the user unreachable via GET', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('DELETE', `${BASE}/${USER_A.username}`);
            cy.request({ method: 'GET', url: `${BASE}/${USER_A.username}`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should return 404 when user does not exist', () => {
            cy.request({ method: 'DELETE', url: `${BASE}/ghost_user_xyz`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should not affect other users when deleting one', () => {
            cy.request('POST', BASE, USER_A);
            cy.request('POST', BASE, USER_B);
            cy.request('DELETE', `${BASE}/${USER_A.username}`);
            cy.request('GET', `${BASE}/${USER_B.username}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.username).to.eq(USER_B.username);
            });
        });
    });

});
