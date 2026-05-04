// =============================================================
// UNIT TESTS — TagController
// =============================================================
// Tested class : TagController.java
// Service layer : TagService.java
// DTO           : TagDTO (id, label)
//
// Each "it" block tests ONE unit of behaviour in isolation.
// =============================================================

describe('TagController — Unit Tests', () => {

    const BASE = '/api/tags';

    const TAG_A = { label: 'unit-tag-alpha' };
    const TAG_B = { label: 'unit-tag-beta' };

    const cleanup = () => {
        cy.deleteTagByLabel(TAG_A.label);
        cy.deleteTagByLabel(TAG_B.label);
        cy.deleteTagByLabel('unit-tag-updated');
        cy.deleteTagByLabel('unit-tag-special_chars-123');
    };

    beforeEach(cleanup);
    afterEach(cleanup);

    // ==========================================================
    // POST /api/tags  →  addTag()
    // ==========================================================
    describe('POST /api/tags — addTag()', () => {

        it('should return 201 with the created tag (id + label)', () => {
            cy.request('POST', BASE, TAG_A).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body).to.have.property('id');
                expect(res.body.id).to.be.a('number');
                expect(res.body).to.have.property('label', TAG_A.label);
            });
        });

        it('should persist the tag (retrievable by label)', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('GET', `${BASE}/label/${TAG_A.label}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.label).to.eq(TAG_A.label);
            });
        });

        it('should return 409 when label already exists', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request({ method: 'POST', url: BASE, body: TAG_A, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(409);
                    expect(res.body).to.include('already exists');
                });
        });

        it('should generate unique IDs for different tags', () => {
            cy.request('POST', BASE, TAG_A).then((rA) => {
                cy.request('POST', BASE, TAG_B).then((rB) => {
                    expect(rA.body.id).to.not.eq(rB.body.id);
                });
            });
        });

        it('should handle special characters in label', () => {
            const special = { label: 'unit-tag-special_chars-123' };
            cy.request('POST', BASE, special).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body.label).to.eq(special.label);
            });
        });
    });

    // ==========================================================
    // GET /api/tags  →  getAllTags()
    // ==========================================================
    describe('GET /api/tags — getAllTags()', () => {

        it('should return 200 with an array', () => {
            cy.request('GET', BASE).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.be.an('array');
            });
        });

        it('should include all created tags', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('POST', BASE, TAG_B);
            cy.request('GET', BASE).then((res) => {
                const labels = res.body.map(t => t.label);
                expect(labels).to.include(TAG_A.label);
                expect(labels).to.include(TAG_B.label);
            });
        });

        it('should return objects with both id and label', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('GET', BASE).then((res) => {
                const tag = res.body.find(t => t.label === TAG_A.label);
                expect(tag).to.have.all.keys('id', 'label');
            });
        });

        it('should reflect deletions (tag gone after DELETE)', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('DELETE', `${BASE}/label/${TAG_A.label}`);
            cy.request('GET', BASE).then((res) => {
                const found = res.body.find(t => t.label === TAG_A.label);
                expect(found).to.be.undefined;
            });
        });
    });

    // ==========================================================
    // GET /api/tags/label/{label}  →  getTagByLabel()
    // ==========================================================
    describe('GET /api/tags/label/:label — getTagByLabel()', () => {

        it('should return 200 with the matching tag', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('GET', `${BASE}/label/${TAG_A.label}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.label).to.eq(TAG_A.label);
                expect(res.body.id).to.be.a('number');
            });
        });

        it('should return 404 for a non-existent label', () => {
            cy.request({ method: 'GET', url: `${BASE}/label/ghost-tag-xyz`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });
    });

    // ==========================================================
    // PUT /api/tags/{id}  →  updateTag()
    // ==========================================================
    describe('PUT /api/tags/:id — updateTag()', () => {

        it('should return 200 with updated label', () => {
            cy.request('POST', BASE, TAG_A).then((createRes) => {
                const id = createRes.body.id;
                cy.request('PUT', `${BASE}/${id}`, { id, label: 'unit-tag-updated' })
                    .then((res) => {
                        expect(res.status).to.eq(200);
                        expect(res.body.id).to.eq(id);
                        expect(res.body.label).to.eq('unit-tag-updated');
                    });
            });
        });

        it('should persist the update (verified by GET)', () => {
            cy.request('POST', BASE, TAG_A).then((createRes) => {
                const id = createRes.body.id;
                cy.request('PUT', `${BASE}/${id}`, { id, label: 'unit-tag-updated' });
                cy.request('GET', `${BASE}/label/unit-tag-updated`).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.body.id).to.eq(id);
                });
            });
        });

        it('should make old label unreachable after rename', () => {
            cy.request('POST', BASE, TAG_A).then((createRes) => {
                const id = createRes.body.id;
                cy.request('PUT', `${BASE}/${id}`, { id, label: 'unit-tag-updated' });
                cy.request({ method: 'GET', url: `${BASE}/label/${TAG_A.label}`, failOnStatusCode: false })
                    .then((res) => {
                        expect(res.status).to.eq(404);
                    });
            });
        });

        it('should return 400 when tag ID does not exist', () => {
            cy.request({
                method: 'PUT', url: `${BASE}/999999`,
                body: { id: 999999, label: 'x' },
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.eq(400);
            });
        });

        it('should return 400 when new label conflicts with another tag', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('POST', BASE, TAG_B).then((createRes) => {
                const id = createRes.body.id;
                cy.request({
                    method: 'PUT', url: `${BASE}/${id}`,
                    body: { id, label: TAG_A.label }, // conflict!
                    failOnStatusCode: false
                }).then((res) => {
                    expect(res.status).to.eq(400);
                    expect(res.body).to.include('already exists');
                });
            });
        });

        it('should allow keeping the same label (no self-conflict)', () => {
            cy.request('POST', BASE, TAG_A).then((createRes) => {
                const id = createRes.body.id;
                cy.request('PUT', `${BASE}/${id}`, { id, label: TAG_A.label })
                    .then((res) => {
                        expect(res.status).to.eq(200);
                        expect(res.body.label).to.eq(TAG_A.label);
                    });
            });
        });
    });

    // ==========================================================
    // DELETE /api/tags/label/{label}  →  deleteTag()
    // ==========================================================
    describe('DELETE /api/tags/label/:label — deleteTag()', () => {

        it('should return 200 with success message', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('DELETE', `${BASE}/label/${TAG_A.label}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body).to.include('deleted successfully');
            });
        });

        it('should make the tag unreachable via GET', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('DELETE', `${BASE}/label/${TAG_A.label}`);
            cy.request({ method: 'GET', url: `${BASE}/label/${TAG_A.label}`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should return 404 for a non-existent tag', () => {
            cy.request({ method: 'DELETE', url: `${BASE}/label/ghost-tag-xyz`, failOnStatusCode: false })
                .then((res) => {
                    expect(res.status).to.eq(404);
                });
        });

        it('should not affect other tags', () => {
            cy.request('POST', BASE, TAG_A);
            cy.request('POST', BASE, TAG_B);
            cy.request('DELETE', `${BASE}/label/${TAG_A.label}`);
            cy.request('GET', `${BASE}/label/${TAG_B.label}`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.label).to.eq(TAG_B.label);
            });
        });
    });

});
