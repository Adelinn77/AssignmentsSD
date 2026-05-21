describe('Login & Navbar Components — Unit/End-to-End Tests', () => {

    const frontendUrl = 'http://localhost:4200';
    const AUTHOR = `test_user_${Date.now()}`;
    const TEST_PASSWORD = 'TestPassword123!';

    const generateUniquePhone = () => {
        return `07${Math.floor(10000000 + Math.random() * 90000000)}`;
    };

    before(() => {
        // Înregistrăm userul prin API înainte de a rula testele
        cy.request({
            method: 'POST',
            url: '/api/auth/register',
            body: {
                username: AUTHOR,
                password: TEST_PASSWORD,
                email: `${AUTHOR}@test.com`,
                phone: generateUniquePhone(),
                firstName: 'Navbar',
                lastName: 'Tester'
            }
        }).then((res) => {
            expect([200, 201]).to.include(res.status);
        });
    });

    describe('Login Component', () => {
        it('should render the login form correctly', () => {
            cy.visit(`${frontendUrl}/auth/login`);

            // Verificăm titlul bazat pe clasa și textul exact din HTML-ul tău
            cy.get('h1.login-title').should('contain', 'Login');

            // Verificăm dacă inputurile și butoanele există
            cy.get('#username').should('exist');
            cy.get('#password').should('exist');
            cy.get('#btn-login').should('exist');
        });
    });

    describe('Navbar Component — Logged In State', () => {
        beforeEach(() => {
            // 1. Mergem pe pagina de login
            cy.visit(`${frontendUrl}/auth/login`);

            // 2. Completăm datele folosind id-urile din login.html
            cy.get('#username').type(AUTHOR);
            cy.get('#password').type(TEST_PASSWORD);

            // 3. Dăm click pe butonul de login
            cy.get('#btn-login').click();

            // 4. login.ts face redirect către /questions pe succes.
            // Așteptăm acest URL pentru a ne asigura că suntem logați!
            cy.url().should('eq', `${frontendUrl}/questions`);
        });

        it('should render all three navigation links for an authenticated user', () => {
            cy.get('nav a').should('have.length', 3);
            cy.get('nav').should('contain', 'Home (Questions)');
            cy.get('nav').should('contain', 'Users');
            cy.get('nav').should('contain', 'Profile');
        });

        it('should render the Logout button', () => {
            cy.get('nav button').should('contain', 'Logout');
        });

        it('should have correct href attributes for routing', () => {
            cy.contains('a', 'Home (Questions)').should('have.attr', 'href', '/questions');
            cy.contains('a', 'Users').should('have.attr', 'href', '/users');
            cy.contains('a', 'Profile').should('have.attr', 'href', `/users/${AUTHOR}`);
        });
    });

    describe('Navbar Component — Logged Out State', () => {
        beforeEach(() => {
            // Curățăm sesiunea pentru a testa starea de delogare
            cy.clearCookies();
            cy.clearLocalStorage();
            cy.visit(frontendUrl);
        });

        it('should NOT render navigation links or logout button when logged out', () => {
            // Din cauza directivei *ngIf="authService.isLoggedIn()", elementele nu ar trebui să existe
            cy.get('nav a').should('have.length', 0);
            cy.get('nav button').should('not.exist');
        });
    });

});