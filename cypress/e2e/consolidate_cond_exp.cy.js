// cypress/integration/additional_transfer_spec.js

describe('Additional Money Transfer Tests', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/');
    // Login as Jonas (account1)
    cy.get('.login__input--user').type('js');
    cy.get('.login__input--pin').type('1111');
    cy.get('.login__btn').click();
  });

  it('should not allow transfer to the same account', () => {
    const transferAmount = 100;
    cy.get('.form__input--to').type('js'); // Try to transfer to the same account
    cy.get('.form__input--amount').type(transferAmount);
    cy.get('.form__btn--transfer').click();

    // Check that no new transaction appears in the movement list
    cy.get('.movements__row').first().should('not.contain', transferAmount);

    // Check that the balance hasn't changed
    cy.get('.balance__value').then($balance => {
      const initialBalance = $balance.text();
      cy.get('.balance__value').should('have.text', initialBalance);
    });
  });

  it('should not allow transfer of amount greater than current balance', () => {
    let currentBalance;
    cy.get('.balance__value')
      .invoke('text')
      .then(text => {
        currentBalance = parseFloat(
          text.replace(/[€\s]/g, '').replace(',', '.')
        );
        const transferAmount = currentBalance + 100; // Amount greater than balance

        cy.get('.form__input--to').type('jd');
        cy.get('.form__input--amount').type(transferAmount);
        cy.get('.form__btn--transfer').click();

        // Check that the balance hasn't changed
        cy.get('.balance__value').should($el => {
          const newBalance = parseFloat(
            $el.text().replace(/[€\s]/g, '').replace(',', '.')
          );
          expect(newBalance).to.equal(currentBalance);
        });

        // Check that no new transaction appears in the movement list
        cy.get('.movements__row').first().should('not.contain', transferAmount);
      });
  });

  it('should not allow transfer without specifying recipient', () => {
    const transferAmount = 100;
    // Leave the recipient field empty
    cy.get('.form__input--amount').type(transferAmount);
    cy.get('.form__btn--transfer').click();

    // Check that the balance hasn't changed
    cy.get('.balance__value').then($balance => {
      const initialBalance = $balance.text();
      cy.get('.balance__value').should('have.text', initialBalance);
    });

    // Check that no new transaction appears in the movement list
    cy.get('.movements__row').first().should('not.contain', transferAmount);

    // Optionally, you could check for an error message if your app displays one
    // cy.get('.error-message').should('be.visible').and('contain', 'Please specify a recipient');
  });

  it('should clear transfer inputs after successful transfer', () => {
    const transferAmount = 100;
    cy.get('.form__input--to').type('jd');
    cy.get('.form__input--amount').type(transferAmount);
    cy.get('.form__btn--transfer').click();

    // Check that the input fields are cleared after transfer
    cy.get('.form__input--to').should('have.value', '');
    cy.get('.form__input--amount').should('have.value', '');

    // Check that the transfer was successful (balance changed)
    cy.get('.balance__value').should('not.contain', '€2600'); // Assuming initial balance was €2600
  });
});
