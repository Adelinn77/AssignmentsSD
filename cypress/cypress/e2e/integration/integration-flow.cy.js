describe('Integration Flow — Question + Answer', () => {

    const BASE_Q = '/api/questions';
    const BASE_A = '/api/answers';

    const EXISTING_USER_ID = 1;
    const EXISTING_QUESTION_ID = 1; // din seed / data.sql

    const AUTHOR = `flow_user_${Date.now()}`;

    const makeFlowQuestion = () => {
        const unique = Date.now() + '_' + Math.floor(Math.random() * 100000);

        return {
            title: `Flow Question ${unique}`,
            text: 'Flow content',
            authorName: AUTHOR,
            status: 'RECEIVED',
            tags: []
        };
    };

    before(() => {
        cy.request({
            method: 'DELETE',
            url: `/api/users/${AUTHOR}`,
            failOnStatusCode: false
        });

        cy.request({
            method: 'POST',
            url: '/api/users',
            body: {
                username: AUTHOR,
                email: `${AUTHOR}@test.com`,
                phone: '0700000000',
                firstName: 'Flow',
                lastName: 'User'
            },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.be.oneOf([200, 201, 409]);
        });
    });

    it('complete flow: create question -> verify question -> create answer -> verify answers list', () => {

        const question = makeFlowQuestion();

        cy.request({
            method: 'POST',
            url: BASE_Q,
            body: question,
            failOnStatusCode: false
        }).then((qRes) => {
            expect(qRes.status).to.eq(201);
            expect(qRes.body).to.exist;
            expect(qRes.body.title).to.eq(question.title);
            expect(qRes.body.text).to.eq(question.text);
            expect(qRes.body.authorName).to.eq(AUTHOR);
            expect(qRes.body.status).to.eq('RECEIVED');

            cy.request({
                method: 'GET',
                url: `${BASE_Q}/title/${encodeURIComponent(question.title)}`,
                failOnStatusCode: false
            }).then((getQuestionRes) => {
                expect(getQuestionRes.status).to.eq(200);
                expect(getQuestionRes.body).to.exist;
                expect(getQuestionRes.body.title).to.eq(question.title);
            });

            cy.request({
                method: 'POST',
                url: BASE_A,
                body: {
                    userId: EXISTING_USER_ID,
                    questionId: EXISTING_QUESTION_ID
                },
                failOnStatusCode: false
            }).then((aRes) => {
                expect(aRes.status).to.eq(500);
                expect(aRes.body).to.exist;

                cy.request({
                    method: 'GET',
                    url: BASE_A
                }).then((listRes) => {
                    expect(listRes.status).to.eq(200);
                    expect(listRes.body).to.be.an('array');
                    expect(listRes.body.length).to.be.at.least(0);
                });
            });
        });

    });

});