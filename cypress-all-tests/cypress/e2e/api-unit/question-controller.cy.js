// =============================================================
// UNIT TESTS — QuestionController
// =============================================================
// Tested class : QuestionController.java
// Service layer : QuestionService.java
// DTO           : QuestionDTO (title, text, likes, dislikes, date,
//                 status, authorName, tags, imageUrls)
// Status enum   : RECEIVED | IN_PROGRESS | RESOLVED
//
// Each "it" block tests ONE unit of behaviour in isolation.
// =============================================================

describe('QuestionController — Unit Tests', () => {

    const BASE = '/api/questions';

    // A user is required as author for every question
    const AUTHOR = {
        username: 'q_unit_author',
        email: 'q_unit_author@test.com',
        phone: '0720000001',
        firstName: 'QUnit',
        lastName: 'Author'
    };

    const Q1 = {
        title: 'Unit Q1 — Spring Boot basics',
        text: 'Explain Spring Boot auto-configuration.',
        authorName: AUTHOR.username,
        status: 'RECEIVED',
        tags: ['spring-boot']
    };

    const Q2 = {
        title: 'Unit Q2 — Hibernate mapping',
        text: 'How to set up OneToMany correctly?',
        authorName: AUTHOR.username,
        status: 'IN_PROGRESS',
        tags: ['hibernate', 'jpa']
    };

    // Global setup — create the author user once
    before(() => {
        cy.cleanupDatabase();
        cy.deleteUser(AUTHOR.username);
        cy.request('POST', '/api/users', AUTHOR);
    });

    // Each test starts with a clean questions table
    beforeEach(() => {
        cy.cleanupDatabase();
    });

    after(() => {
        cy.cleanupDatabase();
        cy.deleteUser(AUTHOR.username);
    });

    // ==========================================================
    // POST /api/questions  →  createQuestion()
    // ==========================================================
    describe('POST /api/questions — createQuestion()', () => {

        it('should return 201 with the full question DTO', () => {
            cy.request('POST', BASE, Q1).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body).to.have.property('title', Q1.title);
                expect(res.body).to.have.property('text', Q1.text);
                expect(res.body).to.have.property('authorName', Q1.authorName);
                expect(res.body).to.have.property('status', Q1.status);
                expect(res.body).to.have.property('likes');
                expect(res.body).to.have.property('dislikes');
                expect(res.body).to.have.property('tags');
                expect(res.body.tags).to.be.an('array');
            });
        });

        it('should persist the question (retrievable by title)', () => {
            cy.request('POST', BASE, Q1);
            cy.request('GET', `${BASE}/title/${encodeURIComponent(Q1.title)}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.title).to.eq(Q1.title);
            });
        });

        it('should initialise likes and dislikes to 0', () => {
            cy.request('POST', BASE, Q1).then((res) => {
                expect(res.body.likes).to.eq(0);
                expect(res.body.dislikes).to.eq(0);
            });
        });

        it('should save tags and return them', () => {
            cy.request('POST', BASE, Q1).then((res) => {
                expect(res.body.tags).to.include('spring-boot');
            });
        });

        it('should save multiple tags', () => {
            cy.request('POST', BASE, Q2).then((res) => {
                expect(res.body.tags).to.include('hibernate');
                expect(res.body.tags).to.include('jpa');
            });
        });

        it('should return 409 when title is a duplicate', () => {
            cy.request('POST', BASE, Q1);
            cy.request({ method: 'POST', url: BASE, body: Q1, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(409);
                    expect(res.body).to.include('already used');
                });
        });

        it('should return error when authorName does not exist', () => {
            const ghost = { ...Q1, title: 'Ghost Author Q', authorName: 'ghost_author_xyz' };
            cy.request({ method: 'POST', url: BASE, body: ghost, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.be.oneOf([400, 409]);
                });
        });

        it('should accept a question without tags', () => {
            const noTags = { title: 'No Tags Q', text: 'Q without tags', authorName: AUTHOR.username, status: 'RECEIVED' };
            cy.request('POST', BASE, noTags).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body.tags).to.be.an('array');
            });
        });

        it('should accept all three Status values', () => {
            ['RECEIVED', 'IN_PROGRESS', 'RESOLVED'].forEach((status, i) => {
                const q = { title: `Status Q ${i}`, text: 'test', authorName: AUTHOR.username, status };
                cy.request('POST', BASE, q).then((res) => {
                    expect(res.status).to.eq(201);
                    expect(res.body.status).to.eq(status);
                });
            });
        });
    });

    // ==========================================================
    // GET /api/questions  →  getAllQuestions()
    // ==========================================================
    describe('GET /api/questions — getAllQuestions()', () => {

        it('should return 200 with an empty array when no questions exist', () => {
            cy.request('GET', BASE).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
            });
        });

        it('should return all created questions', () => {
            cy.request('POST', BASE, Q1);
            cy.request('POST', BASE, Q2);
            cy.request('GET', BASE).then((res) => {
                const titles = res.body.map(q => q.title);
                expect(titles).to.include(Q1.title);
                expect(titles).to.include(Q2.title);
            });
        });

        it('should return objects with all QuestionDTO fields', () => {
            cy.request('POST', BASE, Q1);
            cy.request('GET', BASE).then((res) => {
                const q = res.body.find(x => x.title === Q1.title);
                expect(q).to.have.property('title');
                expect(q).to.have.property('text');
                expect(q).to.have.property('likes');
                expect(q).to.have.property('dislikes');
                expect(q).to.have.property('status');
                expect(q).to.have.property('authorName');
                expect(q).to.have.property('tags');
            });
        });
    });

    // ==========================================================
    // GET /api/questions/title/{title}  →  getQuestionByTitle()
    // ==========================================================
    describe('GET /api/questions/title/:title — getQuestionByTitle()', () => {

        it('should return 200 with the matching question', () => {
            cy.request('POST', BASE, Q1);
            cy.request('GET', `${BASE}/title/${encodeURIComponent(Q1.title)}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.title).to.eq(Q1.title);
                expect(res.body.text).to.eq(Q1.text);
                expect(res.body.authorName).to.eq(Q1.authorName);
            });
        });

        it('should return 404 for a non-existent title', () => {
            cy.request({ method: 'GET', url: `${BASE}/title/NoSuchTitle999`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should return the question with correct status', () => {
            cy.request('POST', BASE, Q2);
            cy.request('GET', `${BASE}/title/${encodeURIComponent(Q2.title)}`).then((res) => {
                expect(res.body.status).to.eq('IN_PROGRESS');
            });
        });
    });

    // ==========================================================
    // GET /api/questions/author/{username}  →  getQuestionsByAuthor()
    // ==========================================================
    describe('GET /api/questions/author/:username — getQuestionsByAuthor()', () => {

        it('should return 200 with questions by the author', () => {
            cy.request('POST', BASE, Q1);
            cy.request('GET', `${BASE}/author/${AUTHOR.username}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.greaterThan(0);
                res.body.forEach(q => {
                    expect(q.authorName).to.eq(AUTHOR.username);
                });
            });
        });

        it('should return only questions from the specified author', () => {
            // Create a second author
            const author2 = { username: 'q_unit_author2', email: 'q2@test.com', phone: '0720000002', firstName: 'Q2', lastName: 'Auth' };
            cy.createUser(author2);
            cy.request('POST', BASE, Q1); // by AUTHOR
            cy.request('POST', BASE, { ...Q2, authorName: author2.username }); // by author2

            cy.request('GET', `${BASE}/author/${AUTHOR.username}`).then((res) => {
                expect(res.body.length).to.eq(1);
                expect(res.body[0].title).to.eq(Q1.title);
            });

            cy.deleteUser(author2.username);
        });

        it('should return 404 for a non-existent author', () => {
            cy.request({ method: 'GET', url: `${BASE}/author/ghost_xyz`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });
    });

    // ==========================================================
    // PUT /api/questions/title/{currentTitle}  →  updateQuestion()
    // ==========================================================
    describe('PUT /api/questions/title/:title — updateQuestion()', () => {

        it('should return 200 with updated data', () => {
            cy.request('POST', BASE, Q1);
            const updated = {
                title: 'Updated Title',
                text: 'Updated text content',
                authorName: AUTHOR.username,
                status: 'RESOLVED',
                tags: ['updated-tag']
            };
            cy.request('PUT', `${BASE}/title/${encodeURIComponent(Q1.title)}`, updated)
                .then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body.title).to.eq('Updated Title');
                    expect(res.body.text).to.eq('Updated text content');
                    expect(res.body.status).to.eq('RESOLVED');
                });
        });

        it('should persist the update (verified by GET)', () => {
            cy.request('POST', BASE, Q1);
            const updated = { ...Q1, title: 'Persisted Update', text: 'Persisted text', status: 'RESOLVED' };
            cy.request('PUT', `${BASE}/title/${encodeURIComponent(Q1.title)}`, updated);
            cy.request('GET', `${BASE}/title/${encodeURIComponent('Persisted Update')}`).then((res) => {
                expect(res.body.title).to.eq('Persisted Update');
                expect(res.body.text).to.eq('Persisted text');
            });
        });

        it('should return 400 when the original title does not exist', () => {
            cy.request({
                method: 'PUT', url: `${BASE}/title/NoSuchTitle`,
                body: { title: 'X', text: 'X', authorName: AUTHOR.username, status: 'RECEIVED' },
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.eq(400);
            });
        });

        it('should return 400 when the new title conflicts with an existing question', () => {
            cy.request('POST', BASE, Q1);
            cy.request('POST', BASE, Q2);
            cy.request({
                method: 'PUT', url: `${BASE}/title/${encodeURIComponent(Q1.title)}`,
                body: { ...Q1, title: Q2.title }, // conflict!
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.eq(400);
                expect(res.body).to.include('already used');
            });
        });

        it('should allow keeping the same title (no conflict with self)', () => {
            cy.request('POST', BASE, Q1);
            const sameTitleUpdate = { ...Q1, text: 'New text, same title' };
            cy.request('PUT', `${BASE}/title/${encodeURIComponent(Q1.title)}`, sameTitleUpdate)
                .then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body.text).to.eq('New text, same title');
                });
        });

        it('should update tags correctly', () => {
            cy.request('POST', BASE, Q1);
            const withNewTags = { ...Q1, tags: ['new-tag-1', 'new-tag-2'] };
            cy.request('PUT', `${BASE}/title/${encodeURIComponent(Q1.title)}`, withNewTags)
                .then((res) => {
                    expect(res.body.tags).to.include('new-tag-1');
                    expect(res.body.tags).to.include('new-tag-2');
                });
        });
    });

    // ==========================================================
    // DELETE /api/questions/title/{title}  →  deleteQuestionByTitle()
    // ==========================================================
    describe('DELETE /api/questions/title/:title — deleteQuestionByTitle()', () => {

        it('should return 200 with success message', () => {
            cy.request('POST', BASE, Q1);
            cy.request('DELETE', `${BASE}/title/${encodeURIComponent(Q1.title)}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.include('deleted successfully');
            });
        });

        it('should make the question unreachable via GET', () => {
            cy.request('POST', BASE, Q1);
            cy.request('DELETE', `${BASE}/title/${encodeURIComponent(Q1.title)}`);
            cy.request({ method: 'GET', url: `${BASE}/title/${encodeURIComponent(Q1.title)}`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should return 404 when title does not exist', () => {
            cy.request({ method: 'DELETE', url: `${BASE}/title/NoSuchTitle`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should not affect other questions', () => {
            cy.request('POST', BASE, Q1);
            cy.request('POST', BASE, Q2);
            cy.request('DELETE', `${BASE}/title/${encodeURIComponent(Q1.title)}`);
            cy.request('GET', `${BASE}/title/${encodeURIComponent(Q2.title)}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.title).to.eq(Q2.title);
            });
        });
    });

});
