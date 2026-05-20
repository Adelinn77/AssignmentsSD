// =============================================================
// COMPONENT UNIT/END-TO-END TESTS — Question List Page
// =============================================================

describe('Question List Component — End-to-End Tests', () => {

    const frontendUrl = 'http://localhost:4200';
    const backendUrl = 'http://localhost:8080';

    const AUTHOR = `ui_user_${Date.now()}`;
    const TEST_PASSWORD = 'TestPassword123!';

    // Use a variable that will be updated before every test
    let currentQuestionTitle = '';

    const generateUniquePhone = () => {
        return `07${Math.floor(10000000 + Math.random() * 90000000)}`;
    };

    before(() => {
        // 1. Register the test user once for the whole suite
        cy.request({
            method: 'POST',
            url: `${backendUrl}/api/auth/register`,
            body: {
                username: AUTHOR,
                password: TEST_PASSWORD,
                email: `${AUTHOR}@test.com`,
                phone: generateUniquePhone(),
                firstName: 'UI',
                lastName: 'Test'
            }
        }).then((res) => {
            expect([200, 201]).to.include(res.status);
        });
    });

    beforeEach(() => {
        // Generate a new, unique title for THIS specific test run
        currentQuestionTitle = `UI Unit Test Q ${Date.now()} ${Math.floor(Math.random() * 10000)}`;

        // 2. Log in via the User Interface (UI)
        cy.visit(`${frontendUrl}/auth/login`);
        cy.get('#username').type(AUTHOR);
        cy.get('#password').type(TEST_PASSWORD);
        cy.get('#btn-login').click();

        cy.url().should('eq', `${frontendUrl}/questions`);

        // 3. Create a test question via the API using HTTP Basic Authentication
        cy.request({
            method: 'POST',
            url: `${backendUrl}/api/questions`,
            body: {
                title: currentQuestionTitle, // <-- Uses the newly generated title
                text: 'This is a UI test question.',
                authorName: AUTHOR,
                status: 'RECEIVED',
                tags: []
            },
            auth: {
                user: AUTHOR,
                pass: TEST_PASSWORD
            }
        });

        // 4. Reload the page to ensure the newly created question is fetched and displayed
        cy.visit(`${frontendUrl}/questions`);
    });

    it('should display the component title', () => {
        cy.get('h2').should('contain', 'Questions List');
    });

    it('should render the questions table with 4 columns', () => {
        cy.get('table.questions-table').should('exist');
        cy.get('thead tr th').should('have.length', 4);
    });

    it('should display question data in rows', () => {
        cy.get('tbody tr').should('have.length.at.least', 1);

        // Use the current dynamically generated title to verify the row
        cy.get('.title').should('contain', currentQuestionTitle);
        cy.get('.text-preview').should('contain', 'This is a UI test question.');
        cy.get('.name').should('contain', AUTHOR);
    });

    it('should display likes and dislikes counters', () => {
        cy.get('.likes').should('contain', '👍');
        cy.get('.dislikes').should('contain', '👎');
    });

});