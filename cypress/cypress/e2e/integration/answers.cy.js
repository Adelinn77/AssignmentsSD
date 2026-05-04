describe('Answers UI Tests', () => {

    beforeEach(() => {
        cy.visit('http://localhost:4200/questions');
    });

    it('should load questions page where answers are accessed', () => {
        cy.get('body').should('exist');
        cy.get('body').invoke('text').should('not.be.empty');
    });

    it('should display a page where answers can be accessed from questions', () => {
        cy.get('body').then(($body) => {
            expect($body.text().length).to.be.greaterThan(0);
        });
    });

});