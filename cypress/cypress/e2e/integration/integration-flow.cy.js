// =============================================================
// Full API Integration Flow
// =============================================================

describe('Forum Integration Flow', () => {
    let questionAuthor;
    let answerAuthor;
    let voter;
    let question;
    let answer;

    before(() => {
        cy.registerUser({ username: `flow_question_author_${Date.now()}` }).then((user) => { questionAuthor = user; });
        cy.registerUser({ username: `flow_answer_author_${Date.now()}` }).then((user) => { answerAuthor = user; });
        cy.registerUser({ username: `flow_voter_${Date.now()}` }).then((user) => { voter = user; });
    });

    it('creates a question, adds answer, votes, accepts answer, and deletes data', () => {
        cy.createQuestionAs(questionAuthor.auth, {
            authorName: questionAuthor.username,
            title: `Flow Question ${Date.now()}`,
            text: 'Question from full flow.',
            status: 'RECEIVED',
            tags: []
        }).then((questionRes) => {
            expect(questionRes.status).to.eq(201);
            question = questionRes.body;

            return cy.createAnswerAs(answerAuthor.auth, {
                questionId: question.questionId,
                authorName: answerAuthor.username,
                text: 'Flow answer.'
            });
        }).then((answerRes) => {
            expect(answerRes.status).to.eq(201);
            answer = answerRes.body;

            cy.request({ method: 'GET', url: `/api/answers/question/${question.questionId}`, auth: questionAuthor.auth }).then((listRes) => {
                expect(listRes.status).to.eq(200);
                expect(listRes.body.some((a) => a.answerId === answer.answerId)).to.eq(true);
            });

            cy.request({ method: 'PUT', url: `/api/questions/${question.questionId}/like?username=${voter.username}`, auth: voter.auth }).then((likeQuestionRes) => {
                expect(likeQuestionRes.status).to.eq(200);
                expect(likeQuestionRes.body.likes).to.eq(1);
            });

            cy.request({ method: 'PUT', url: `/api/answers/${answer.answerId}/like?username=${voter.username}`, auth: voter.auth }).then((likeAnswerRes) => {
                expect(likeAnswerRes.status).to.eq(200);
                expect(likeAnswerRes.body.likes).to.eq(1);
            });

            cy.request({ method: 'PUT', url: `/api/answers/${answer.answerId}/accept?username=${questionAuthor.username}`, auth: questionAuthor.auth }).then((acceptRes) => {
                expect(acceptRes.status).to.eq(200);
                expect(acceptRes.body.accepted).to.eq(true);
            });

            cy.request({ method: 'GET', url: `/api/questions/${question.questionId}`, auth: questionAuthor.auth }).then((questionGetRes) => {
                expect(questionGetRes.status).to.eq(200);
                expect(questionGetRes.body.status).to.eq('RESOLVED');
            });

            cy.request({ method: 'DELETE', url: `/api/questions/title/${encodeURIComponent(question.title)}`, auth: questionAuthor.auth }).then((deleteRes) => {
                expect(deleteRes.status).to.eq(200);
            });
        });
    });
});
