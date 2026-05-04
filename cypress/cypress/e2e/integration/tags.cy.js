// =============================================================
// Tags API - End-to-End Tests
// =============================================================

describe('Tags API E2E Tests', () => {

    const testTag = { label: 'cypress-e2e-tag' };

    beforeEach(() => { cy.deleteTagByLabel(testTag.label); });
    afterEach(() => { cy.deleteTagByLabel(testTag.label); cy.deleteTagByLabel('cypress-updated-tag'); });

    it('POST /api/tags → should create a new tag (201)', () => {
        cy.request('POST', '/api/tags', testTag).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('label', testTag.label);
        });
    });

    it('POST /api/tags → should return 409 when label already exists', () => {
        cy.createTag(testTag);
        cy.request({ method: 'POST', url: '/api/tags', body: testTag, failOnStatusCode: false }).then((response) => {
            expect(response.status).to.eq(409);
        });
    });

    it('GET /api/tags → should return an array of tags (200)', () => {
        cy.request('GET', '/api/tags').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/tags/label/{label} → should return tag by label (200)', () => {
        cy.createTag(testTag);
        cy.request('GET', `/api/tags/label/${testTag.label}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('label', testTag.label);
        });
    });

    it('PUT /api/tags/{id} → should update tag label (200)', () => {
        cy.request('POST', '/api/tags', testTag).then((createRes) => {
            cy.request('PUT', `/api/tags/${createRes.body.id}`, { id: createRes.body.id, label: 'cypress-updated-tag' }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('label', 'cypress-updated-tag');
            });
        });
    });

    it('DELETE /api/tags/label/{label} → should delete tag (200)', () => {
        cy.createTag(testTag);
        cy.request('DELETE', `/api/tags/label/${testTag.label}`).then((response) => {
            expect(response.status).to.eq(200);
        });
    });
});
