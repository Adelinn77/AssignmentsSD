describe('UserProfile Component — Unit/End-to-End Tests', () => {

    const frontendUrl = 'http://localhost:4200';

    // Generăm un utilizator unic pentru acest test
    const AUTHOR = `profile_user_${Date.now()}`;
    const TEST_PASSWORD = 'TestPassword123!';
    const TEST_EMAIL = `${AUTHOR}@test.com`;

    // Datele profilului pe care le vom verifica pe ecran
    const FIRST_NAME = 'John';
    const LAST_NAME = 'Doe';

    const generateUniquePhone = () => {
        return `07${Math.floor(10000000 + Math.random() * 90000000)}`;
    };

    const TEST_PHONE = generateUniquePhone();

    before(() => {
        // 1. Înregistrăm utilizatorul prin API pentru a avea ce date să testăm pe profil
        cy.request({
            method: 'POST',
            url: '/api/auth/register',
            body: {
                username: AUTHOR,
                password: TEST_PASSWORD,
                email: TEST_EMAIL,
                phone: TEST_PHONE,
                firstName: FIRST_NAME,
                lastName: LAST_NAME
            }
        }).then((res) => {
            expect([200, 201]).to.include(res.status);
        });
    });

    beforeEach(() => {
        // 2. Logare prin interfață, exact ca la testul precedent
        cy.visit(`${frontendUrl}/auth/login`);
        cy.get('#username').type(AUTHOR);
        cy.get('#password').type(TEST_PASSWORD);
        cy.get('#btn-login').click();

        // Ne asigurăm că logarea s-a terminat cu succes
        cy.url().should('eq', `${frontendUrl}/questions`);

        // 3. Navigăm pe pagina de profil a utilizatorului pe care tocmai l-am creat
        cy.visit(`${frontendUrl}/users/${AUTHOR}`);
    });

    it('should render the profile header correctly (Name and Username)', () => {
        // Verificăm dacă H1 afișează Numele și Prenumele
        cy.get('.profile-header h1').should('contain', `${FIRST_NAME} ${LAST_NAME}`);

        // Verificăm dacă tag-ul de username conține @ și numele de utilizator
        cy.get('.profile-header .username-tag').should('contain', `@${AUTHOR}`);

        // Verificăm dacă badge-ul de scor există (ar trebui să fie 0 la un cont nou)
        cy.get('.profile-header .score-badge').should('contain', 'Reputation Score: 0');
    });

    it('should display the correct contact information', () => {
        cy.get('.contact-info').within(() => {
            cy.get('h3').should('contain', 'Contact Information');
            cy.get('p').should('contain', `Email: ${TEST_EMAIL}`);
            cy.get('p').should('contain', `Phone: ${TEST_PHONE}`);
        });
    });

    it('should render the questions section with empty state for a new user', () => {
        cy.get('.user-questions-section').within(() => {
            cy.get('h3').should('contain', 'My Questions');

            // Deoarece abia am creat utilizatorul, nu are nicio întrebare postată
            cy.get('i').should('contain', 'The list of questions authored by this user is empty.');
        });
    });

    it('should render the JSON debug section', () => {
        cy.get('.json-debug-section h4').should('contain', 'Debug Data');
        cy.get('.json-debug-section pre').should('exist');
    });
});