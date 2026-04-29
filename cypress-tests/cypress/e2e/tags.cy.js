// =============================================================
// Tags API - End-to-End Tests
// =============================================================
// Tests the TagController endpoints:
//   POST   /api/tags                → addTag
//   GET    /api/tags                → getAllTags
//   GET    /api/tags/label/{label}  → getTagByLabel
//   PUT    /api/tags/{id}           → updateTag
//   DELETE /api/tags/label/{label}  → deleteTag
// =============================================================

describe('Tags API E2E Tests', () => {

    const testTag = {
        label: 'cypress-e2e-tag'
    };

    // Clean up test tag before each test
    beforeEach(() => {
        cy.request({
            method: 'DELETE',
            url: `/api/tags/label/${testTag.label}`,
            failOnStatusCode: false
        });
    });

    afterEach(() => {
        cy.request({
            method: 'DELETE',
            url: `/api/tags/label/${testTag.label}`,
            failOnStatusCode: false
        });
        // Also clean up any "updated" tags
        cy.request({
            method: 'DELETE',
            url: '/api/tags/label/cypress-updated-tag',
            failOnStatusCode: false
        });
    });

    // ─── CREATE ──────────────────────────────────────────────

    it('POST /api/tags → should create a new tag (201)', () => {
        cy.request('POST', '/api/tags', testTag).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('label', testTag.label);
            expect(response.body).to.have.property('id');
            expect(response.body.id).to.be.a('number');
        });
    });

    it('POST /api/tags → should return 409 when label already exists', () => {
        cy.request('POST', '/api/tags', testTag);

        cy.request({
            method: 'POST',
            url: '/api/tags',
            body: testTag,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(409);
        });
    });

    // ─── READ ALL ────────────────────────────────────────────

    it('GET /api/tags → should return an array of tags (200)', () => {
        cy.request('GET', '/api/tags').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/tags → should include newly created tag', () => {
        cy.request('POST', '/api/tags', testTag);

        cy.request('GET', '/api/tags').then((response) => {
            expect(response.status).to.eq(200);
            const found = response.body.find(t => t.label === testTag.label);
            expect(found).to.not.be.undefined;
            expect(found.id).to.be.a('number');
        });
    });

    // ─── READ BY LABEL ───────────────────────────────────────

    it('GET /api/tags/label/{label} → should return tag by label (200)', () => {
        cy.request('POST', '/api/tags', testTag);

        cy.request('GET', `/api/tags/label/${testTag.label}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('label', testTag.label);
            expect(response.body).to.have.property('id');
        });
    });

    it('GET /api/tags/label/{label} → should return 404 for non-existent label', () => {
        cy.request({
            method: 'GET',
            url: '/api/tags/label/non-existent-tag-xyz',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    // ─── UPDATE ──────────────────────────────────────────────

    it('PUT /api/tags/{id} → should update tag label (200)', () => {
        cy.request('POST', '/api/tags', testTag).then((createRes) => {
            const tagId = createRes.body.id;

            const updatedData = {
                id: tagId,
                label: 'cypress-updated-tag'
            };

            cy.request('PUT', `/api/tags/${tagId}`, updatedData).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('label', 'cypress-updated-tag');
                expect(response.body).to.have.property('id', tagId);
            });
        });
    });

    it('PUT /api/tags/{id} → should return 400 for non-existent tag ID', () => {
        cy.request({
            method: 'PUT',
            url: '/api/tags/999999',
            body: { id: 999999, label: 'new-label' },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });

    it('PUT /api/tags/{id} → should return 400 when updating to an existing label', () => {
        // Create two tags
        cy.request('POST', '/api/tags', { label: 'tag-alpha' });
        cy.request('POST', '/api/tags', testTag).then((createRes) => {
            const tagId = createRes.body.id;

            // Try to update testTag's label to 'tag-alpha' (which already exists)
            cy.request({
                method: 'PUT',
                url: `/api/tags/${tagId}`,
                body: { id: tagId, label: 'tag-alpha' },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
            });
        });

        // Cleanup
        cy.request({ method: 'DELETE', url: '/api/tags/label/tag-alpha', failOnStatusCode: false });
    });

    // ─── DELETE ──────────────────────────────────────────────

    it('DELETE /api/tags/label/{label} → should delete tag (200)', () => {
        cy.request('POST', '/api/tags', testTag);

        cy.request('DELETE', `/api/tags/label/${testTag.label}`).then((response) => {
            expect(response.status).to.eq(200);
        });

        // Verify tag is gone
        cy.request({
            method: 'GET',
            url: `/api/tags/label/${testTag.label}`,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

    it('DELETE /api/tags/label/{label} → should return 404 for non-existent tag', () => {
        cy.request({
            method: 'DELETE',
            url: '/api/tags/label/non-existent-tag-xyz',
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.eq(404);
        });
    });

});
