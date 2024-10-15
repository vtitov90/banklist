describe('Login Functionality', () => {
  beforeEach(() => {
    // Assuming your app is served at localhost:3000
    cy.visit('http://127.0.0.1:5500/');
  });

  it('should log in with correct credentials', () => {
    // Type in correct username
    cy.get('.login__input--user').type('js');

    // Type in correct PIN
    cy.get('.login__input--pin').type('1111');

    // Click the login button
    cy.get('.login__btn').click();

    // Assert that the welcome message is displayed correctly
    cy.get('.welcome').should('contain', 'Welcome back, Jonas');

    // Assert that the app container is visible (opacity is 100)
    cy.get('.app').should('have.css', 'opacity', '1');

    // Assert that the balance is displayed
    cy.get('.balance__value').should('be.visible');

    // Optional: Check if the logout timer starts
    cy.get('.timer').should('be.visible');
  });

  it('should not log in with incorrect credentials', () => {
    // Type in incorrect username
    cy.get('.login__input--user').type('wronguser');

    // Type in incorrect PIN
    cy.get('.login__input--pin').type('9999');

    // Click the login button
    cy.get('.login__btn').click();

    // Assert that the welcome message is not changed
    cy.get('.welcome').should('not.contain', 'Welcome back');

    // Assert that the app container is not visible (opacity is 0)
    cy.get('.app').should('have.css', 'opacity', '0');
  });
});

// cypress/integration/transfer_spec.js

describe('Money Transfer Functionality', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/');
    // Login as Jonas (account1)
    cy.get('.login__input--user').type('js');
    cy.get('.login__input--pin').type('1111');
    cy.get('.login__btn').click();
  });

  it('should transfer money to another account', () => {
    // Store initial balance
    let initialBalance;
    cy.get('.balance__value')
      .invoke('text')
      .then(text => {
        initialBalance = parseFloat(
          text.replace(/[€\s]/g, '').replace(',', '.')
        );
      });

    // Perform transfer
    const transferAmount = 100;
    cy.get('.form__input--to').type('jd'); // Jessica Davis's username
    cy.get('.form__input--amount').type(transferAmount);
    cy.get('.form__btn--transfer').click();

    // Check if balance is updated correctly
    cy.get('.balance__value').should($el => {
      const newBalance = parseFloat(
        $el.text().replace(/[€\s]/g, '').replace(',', '.')
      );
      expect(newBalance).to.be.closeTo(initialBalance - transferAmount, 0.01);
    });

    // Check if new transaction appears in the movement list
    cy.get('.movements__row')
      .first()
      .should('contain', 'withdrawal')
      .and('contain', transferAmount);

    // Check if transaction date is today
    const today = new Date().toLocaleDateString('pt-PT');
    cy.get('.movements__date').first().should('contain', 'Today');

    // Logout
    cy.get('.login__input--user').clear();
    cy.get('.login__input--pin').clear();

    // Login as Jessica (account2)
    cy.get('.login__input--user').type('jd');
    cy.get('.login__input--pin').type('2222');
    cy.get('.login__btn').click();

    // Check if Jessica received the money
    cy.get('.movements__row')
      .first()
      .should('contain', 'deposit')
      .and('contain', transferAmount);
  });

  it('should not allow transfer if insufficient funds', () => {
    // Attempt to transfer more money than available
    cy.get('.balance__value')
      .invoke('text')
      .then(text => {
        const balance = parseFloat(
          text.replace(/[€\s]/g, '').replace(',', '.')
        );
        const transferAmount = balance + 1000;

        cy.get('.form__input--to').type('jd');
        cy.get('.form__input--amount').type(transferAmount);
        cy.get('.form__btn--transfer').click();

        // Check that balance hasn't changed
        cy.get('.balance__value').should('contain', text);
      });

    // Check that no new transaction appears in the movement list
    cy.get('.movements__row').first().should('not.contain', 'withdrawal');
  });
});
