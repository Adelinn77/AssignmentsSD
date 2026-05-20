/// <reference types="cypress" />
import { Login } from './login';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

describe('Login Component', () => {

  beforeEach(() => {

    // @ts-ignore
    cy.mount(Login, {
      providers: [
        provideHttpClient(),
        provideRouter([
          { path: 'questions', component: DummyComponent }
        ])
      ]
    });
  });

  it('1. Ar trebui să randeze corect formularul de login', () => {
    // Verificăm vizual că elementele există în pagină
    cy.get('h1.login-title').should('contain', 'Login');
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('#btn-login').should('be.visible').and('not.be.disabled');
  });

  it('2. Ar trebui să afișeze o eroare dacă datele nu sunt completate', () => {
    // Apăsăm direct pe buton fără să scriem nimic
    cy.get('#btn-login').click();

    // Verificăm logica din login.ts care setează errorMsg
    cy.get('.error-banner')
      .should('be.visible')
      .and('contain', 'Your username and password are required.');
  });

});
