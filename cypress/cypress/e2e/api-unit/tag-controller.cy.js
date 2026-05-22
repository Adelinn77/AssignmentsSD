// =============================================================
// API UNIT TESTS — TagController (backend-second, port 8081)
// =============================================================

// Tags are served by the second backend, not by the main backend.
// Because backend-second protects /api/tags with HTTP Basic Auth,
// every request in this spec must send its own tag auth credentials.

describe('TagController — Unit Tests', () => {
    const BASE = `${Cypress.env('tagApiUrl') || 'http://localhost:8081'}/api/tags`;

    const tagAuth = () => ({
        user: Cypress.env('tagAuthUser') || 'admin',
        pass: Cypress.env('tagAuthPassword') || 'admin',
    });

    const makeTag = () => ({
        label: `cypress-tag-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    });

    const tagRequest = (options) => cy.request({
        auth: tagAuth(),
        failOnStatusCode: false,
        ...options,
        headers: {
            accept: 'application/json',
            ...(options.headers || {}),
        },
    });

    const expectAuthorized = (res) => {
        expect(res.status, 'backend-second auth failed; check tagAuthUser/tagAuthPassword in cypress.config.js').to.not.eq(401);
        expect(res.status, 'backend-second auth has no permission; check role/credentials for tag backend').to.not.eq(403);
    };

    it('POST /tags — create tag', () => {
        const tag = makeTag();

        tagRequest({ method: 'POST', url: BASE, body: tag }).then((res) => {
            expectAuthorized(res);
            expect(res.status).to.eq(201);
            expect(res.body).to.have.property('id');
            expect(res.body.label).to.eq(tag.label);
        });
    });

    it('POST /tags — duplicate label returns 409', () => {
        const tag = makeTag();

        tagRequest({ method: 'POST', url: BASE, body: tag }).then((createRes) => {
            expectAuthorized(createRes);
            expect(createRes.status).to.eq(201);

            tagRequest({ method: 'POST', url: BASE, body: tag }).then((res) => {
                expectAuthorized(res);
                expect(res.status).to.eq(409);
            });
        });
    });

    it('GET /tags — list tags', () => {
        tagRequest({ method: 'GET', url: BASE }).then((res) => {
            expectAuthorized(res);
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array');
        });
    });

    it('GET /tags/label/:label — get tag by label', () => {
        const tag = makeTag();

        tagRequest({ method: 'POST', url: BASE, body: tag }).then((createRes) => {
            expectAuthorized(createRes);
            expect(createRes.status).to.eq(201);

            tagRequest({ method: 'GET', url: `${BASE}/label/${encodeURIComponent(tag.label)}` }).then((res) => {
                expectAuthorized(res);
                expect(res.status).to.eq(200);
                expect(res.body.label).to.eq(tag.label);
            });
        });
    });

    it('PUT /tags/:id — update tag', () => {
        const tag = makeTag();
        const newLabel = `updated-${tag.label}`;

        tagRequest({ method: 'POST', url: BASE, body: tag }).then((createRes) => {
            expectAuthorized(createRes);
            expect(createRes.status).to.eq(201);

            tagRequest({
                method: 'PUT',
                url: `${BASE}/${createRes.body.id}`,
                body: { id: createRes.body.id, label: newLabel },
            }).then((res) => {
                expectAuthorized(res);
                expect(res.status).to.eq(200);
                expect(res.body.id).to.eq(createRes.body.id);
                expect(res.body.label).to.eq(newLabel);
            });
        });
    });

    it('DELETE /tags/label/:label — delete tag', () => {
        const tag = makeTag();

        tagRequest({ method: 'POST', url: BASE, body: tag }).then((createRes) => {
            expectAuthorized(createRes);
            expect(createRes.status).to.eq(201);

            tagRequest({ method: 'DELETE', url: `${BASE}/label/${encodeURIComponent(tag.label)}` }).then((res) => {
                expectAuthorized(res);
                expect(res.status).to.eq(200);
            });

            tagRequest({ method: 'GET', url: `${BASE}/label/${encodeURIComponent(tag.label)}` }).then((res) => {
                expectAuthorized(res);
                expect(res.status).to.eq(404);
            });
        });
    });
});
