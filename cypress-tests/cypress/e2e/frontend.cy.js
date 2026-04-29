// =============================================================
// Frontend E2E Tests (Angular UI)
// =============================================================
// Tests the Angular frontend pages:
//   /questions       → QuestionList page
//   /auth/login      → Login page
//   /users/:username → UserProfile page
//   Navigation       → Navbar links
//
// Prerequisites: Both backend (port 8080) and frontend (port 4200)
// must be running.
//
// Note: For these tests, change baseUrl to http://localhost:4200
// or run with: cypress run --config baseUrl=http://localhost:4200
// =============================================================

describe('Frontend UI E2E Tests', () => {

    const frontendUrl = 'http://localhost:4200';

    // ─── QUESTIONS LIST PAGE ─────────────────────────────────

    describe('Questions List Page', () => {

        it('should load the questions page at /questions', () => {
            cy.visit(`${frontendUrl}/questions`);
            cy.contains('Questions List').should('be.visible');
        });

        it('should display the questions table with correct headers', () => {
            cy.visit(`${frontendUrl}/questions`);
            cy.get('.questions-table').should('exist');
            cy.get('.questions-table thead th').should('have.length.at.least', 3);
            cy.contains('th', 'Subject').should('be.visible');
            cy.contains('th', 'Author').should('be.visible');
        });

        it('should display question data (title, text, author, likes/dislikes)', () => {
            // First ensure we have test data in the backend
            const testUser = {
                username: 'fe_test_user',
                email: 'fe_test@test.com',
                phone: '0711111111',
                firstName: 'Frontend',
                lastName: 'Tester'
            };

            cy.request({ method: 'DELETE', url: `http://localhost:8080/api/users/${testUser.username}`, failOnStatusCode: false });
            cy.request({ method: 'DELETE', url: 'http://localhost:8080/api/testing/cleanup', failOnStatusCode: false });

            cy.request('POST', 'http://localhost:8080/api/users', testUser);
            cy.request('POST', 'http://localhost:8080/api/questions', {
                title: 'Frontend Test Question',
                text: 'Testing question display in UI.',
                authorName: 'fe_test_user',
                status: 'RECEIVED',
                tags: ['frontend-test']
            });

            cy.visit(`${frontendUrl}/questions`);

            // Wait for data to load
            cy.get('.questions-table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);

            // Verify question content is displayed
            cy.contains('.title', 'Frontend Test Question').should('be.visible');
            cy.contains('.text-preview', 'Testing question display in UI.').should('be.visible');
            cy.contains('.name', 'fe_test_user').should('be.visible');

            // Verify like/dislike icons exist
            cy.get('.likes').should('exist');
            cy.get('.dislikes').should('exist');

            // Cleanup
            cy.request({ method: 'DELETE', url: 'http://localhost:8080/api/testing/cleanup', failOnStatusCode: false });
            cy.request({ method: 'DELETE', url: `http://localhost:8080/api/users/${testUser.username}`, failOnStatusCode: false });
        });
    });

    // ─── LOGIN PAGE ──────────────────────────────────────────

    describe('Login Page', () => {
        it('should load the login page at /auth/login', () => {
            cy.visit(`${frontendUrl}/auth/login`);
            cy.contains('login works!').should('be.visible');
        });

        it('LoginPage', function() {});
    });

    // ─── USER PROFILE PAGE ───────────────────────────────────

    describe('User Profile Page', () => {

        const profileUser = {
            username: 'profile_test_user',
            email: 'profile_test@test.com',
            phone: '0722222222',
            firstName: 'Profile',
            lastName: 'TestUser'
        };

        before(() => {
            cy.request({ method: 'DELETE', url: `http://localhost:8080/api/users/${profileUser.username}`, failOnStatusCode: false });
            cy.request('POST', 'http://localhost:8080/api/users', profileUser);
        });

        after(() => {
            cy.request({ method: 'DELETE', url: `http://localhost:8080/api/users/${profileUser.username}`, failOnStatusCode: false });
        });

        it('should load user profile page and display user data', () => {
            cy.visit(`${frontendUrl}/users/${profileUser.username}`);

            // Wait for profile to load
            cy.get('.profile-container', { timeout: 10000 }).should('exist');

            // Verify user information is displayed
            cy.contains(`${profileUser.firstName} ${profileUser.lastName}`).should('be.visible');
            cy.contains(`@${profileUser.username}`).should('be.visible');
            cy.contains(profileUser.email).should('be.visible');
            cy.contains(profileUser.phone).should('be.visible');
        });

        it('should show error for non-existent user', () => {
            cy.visit(`${frontendUrl}/users/non_existent_user_xyz_12345`);

            // Should display error message
            cy.get('.error-msg', { timeout: 10000 }).should('be.visible');
            cy.contains('Failed to load user profile').should('be.visible');
        });

        it('should display "My Questions" section', () => {
            cy.visit(`${frontendUrl}/users/${profileUser.username}`);

            cy.get('.user-questions-section', { timeout: 10000 }).should('exist');
            cy.contains('My Questions').should('be.visible');
        });

        it('should display debug JSON section with user data', () => {
            cy.visit(`${frontendUrl}/users/${profileUser.username}`);

            cy.get('.json-debug-section', { timeout: 10000 }).should('exist');
            cy.contains('Debug Data').should('be.visible');
            // Verify the JSON contains user data
            cy.get('.json-debug-section pre').should('contain', profileUser.username);
        });
    });

    // ─── NAVIGATION ──────────────────────────────────────────

    describe('Navigation (Navbar)', () => {

        it('should navigate to questions page via navbar', () => {
            cy.visit(`${frontendUrl}/auth/login`);
            cy.contains('a', 'Home (Questions)').click();
            cy.url().should('include', '/questions');
            cy.contains('Questions List').should('be.visible');
        });

        it('should navigate to login page via navbar', () => {
            cy.visit(`${frontendUrl}/questions`);
            cy.contains('a', 'Login').click();
            cy.url().should('include', '/auth/login');
            cy.contains('login works!').should('be.visible');
        });

        it('should navigate to profile page via navbar', () => {
            cy.visit(`${frontendUrl}/questions`);
            cy.contains('a', 'Profile').click();
            cy.url().should('include', '/users/ion_pop');
        });

        it('should redirect unknown routes to /questions', () => {
            cy.visit(`${frontendUrl}/some-random-page`);
            cy.url().should('include', '/questions');
        });

        it('should redirect root path to /questions', () => {
            cy.visit(frontendUrl);
            cy.url().should('include', '/questions');
        });
    });

});
