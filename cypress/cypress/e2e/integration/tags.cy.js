// =============================================================
// Tags API - End-to-End Tests
// =============================================================

describe('Tags API E2E Tests', () => {
    const BASE = `${Cypress.env('tagApiUrl')}/api/tags`;

    const makeTag = () => ({
        label: `cypress-e2e-tag-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    });

    it('POST /api/tags → should create a new tag (201)', () => {
        const tag = makeTag();

        cy.request('POST', BASE, tag).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('label', tag.label);
        });
    });

    it('POST /api/tags → should return 409 when label already exists', () => {
        const tag = makeTag();

        cy.request('POST', BASE, tag).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request({ method: 'POST', url: BASE, body: tag, failOnStatusCode: false }).then((response) => {
                expect(response.status).to.eq(409);
            });
        });
    });

    it('GET /api/tags → should return an array of tags (200)', () => {
        cy.request('GET', BASE).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('GET /api/tags/label/{label} → should return tag by label (200)', () => {
        const tag = makeTag();

        cy.request('POST', BASE, tag).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request('GET', `${BASE}/label/${encodeURIComponent(tag.label)}`).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('label', tag.label);
            });
        });
    });

    it('PUT /api/tags/{id} → should update tag label (200)', () => {
        const tag = makeTag();
        const updatedLabel = `updated-${tag.label}`;

        cy.request('POST', BASE, tag).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request('PUT', `${BASE}/${createRes.body.id}`, { id: createRes.body.id, label: updatedLabel }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('label', updatedLabel);
            });
        });
    });

    it('DELETE /api/tags/label/{label} → should delete tag (200)', () => {
        const tag = makeTag();

        cy.request('POST', BASE, tag).then((createRes) => {
            expect(createRes.status).to.eq(201);

            cy.request('DELETE', `${BASE}/label/${encodeURIComponent(tag.label)}`).then((response) => {
                expect(response.status).to.eq(200);
            });
        });
    });
});
