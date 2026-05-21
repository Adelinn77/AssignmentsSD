describe('Question List Component — End-to-End Tests', () => {
    let user;
    let currentQuestionTitle = '';

    before(() => {
        cy.registerUser({ username: `ui_question_user_${Date.now()}`, firstName: 'UI', lastName: 'Test' }).then((created) => {
            user = created;
        });
    });

    beforeEach(() => {
        currentQuestionTitle = `UI Unit Test Q ${Date.now()} ${Math.floor(Math.random() * 10000)}`;

        cy.createQuestionAs(user.auth, {
            title: currentQuestionTitle,
            text: 'This is a UI test question.',
            authorName: user.username,
            status: 'RECEIVED',
            tags: []
        }).then((response) => {
            expect(response.status).to.eq(201);
        });

        cy.intercept('GET', '**/api/questions**').as('getQuestions');
        cy.loginByUi(user.username, user.password);
        cy.wait('@getQuestions').its('response.statusCode').should('eq', 200);
    });

    it('should display the component title', () => {
        cy.get('h2').should('contain', 'Questions List');
    });

    it('should render the questions table', () => {
        cy.get('table.questions-table').should('exist');
        cy.get('thead tr th').should('have.length.at.least', 5);
    });

    it('should display question data in rows', () => {
        cy.contains('a.question-title-link', currentQuestionTitle).should('be.visible');
        cy.contains('td.author-info a.author-link', user.username).should('be.visible');

        cy.contains('tr', currentQuestionTitle).within(() => {
            cy.get('.author-link').should('contain', user.username);
            cy.get('.score').should('contain', '0');
        });
    });

    it('should display the score counter for the question', () => {
        cy.contains('tr', currentQuestionTitle).within(() => {
            cy.get('.score').should('be.visible').and('contain', '0');
        });
    });

    it('should filter questions by title', () => {
        cy.get('#searchTitle').clear().type(currentQuestionTitle);
        cy.contains('a.question-title-link', currentQuestionTitle).should('be.visible');
        cy.contains('tr', currentQuestionTitle).should('be.visible');
    });
});