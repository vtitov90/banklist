describe('Loan and Sort Functionality', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/');
    // Login as Jonas (account1)
    cy.get('.login__input--user').type('js');
    cy.get('.login__input--pin').type('1111');
    cy.get('.login__btn').click();
  });

  // Tests for Loan Functionality
  describe('Loan Functionality', () => {
    it('should grant a loan when conditions are met', () => {
      let initialBalance;
      cy.get('.balance__value')
        .invoke('text')
        .then(text => {
          initialBalance = parseFloat(
            text.replace(/[€\s]/g, '').replace(',', '.')
          );
        });

      const loanAmount = 1000;
      cy.get('.form__input--loan-amount').type(loanAmount);
      cy.get('.form__btn--loan').click();

      // Wait for the loan to be processed (2.5 seconds in your code)
      cy.wait(2500);

      // Check if balance is updated correctly
      cy.get('.balance__value').should($el => {
        const newBalance = parseFloat(
          $el.text().replace(/[€\s]/g, '').replace(',', '.')
        );
        expect(newBalance).to.be.closeTo(initialBalance + loanAmount, 0.1);
      });

      // Check if new transaction appears in the movement list
      cy.get('.movements__row')
        .first()
        .should('contain', 'deposit')
        .and('contain', loanAmount);
    });

    it('should not grant a loan when conditions are not met', () => {
      let initialBalance;
      cy.get('.balance__value')
        .invoke('text')
        .then(text => {
          initialBalance = parseFloat(
            text.replace(/[€\s]/g, '').replace(',', '.')
          );
        });

      // Try to request a loan that's more than 10 times any deposit
      const loanAmount = 1000000;
      cy.get('.form__input--loan-amount').type(loanAmount);
      cy.get('.form__btn--loan').click();

      // Wait for potential processing
      cy.wait(2500);

      // Check that balance hasn't changed
      cy.get('.balance__value').should($el => {
        const newBalance = parseFloat(
          $el.text().replace(/[€\s]/g, '').replace(',', '.')
        );
        expect(newBalance).to.equal(initialBalance);
      });

      // Check that no new transaction appears in the movement list
      cy.get('.movements__row').first().should('not.contain', loanAmount);
    });
  });

  // Tests for Sort Functionality
  describe('Sort Functionality', () => {
    it('should sort movements in ascending order when clicked once', () => {
      // Click the sort button
      cy.get('.btn--sort').click();

      // Check if movements are sorted in ascending order
      cy.get('.movements__value').then($movements => {
        const amounts = $movements
          .map((i, el) =>
            parseFloat(el.innerText.replace(/[€\s]/g, '').replace(',', '.'))
          )
          .get();
        const sortedAmounts = [...amounts].sort((a, b) => a - b);
        expect(amounts.reverse()).to.deep.equal(sortedAmounts);
      });
    });

    it('should revert to original order when clicked twice', () => {
      // Store the original order
      let originalOrder;
      cy.get('.movements__value').then($movements => {
        originalOrder = $movements
          .map((i, el) =>
            parseFloat(el.innerText.replace(/[€\s]/g, '').replace(',', '.'))
          )
          .get();
      });

      // Click the sort button twice
      cy.get('.btn--sort').click().click();

      // Check if movements are back to the original order
      cy.get('.movements__value').then($movements => {
        const currentOrder = $movements
          .map((i, el) =>
            parseFloat(el.innerText.replace(/[€\s]/g, '').replace(',', '.'))
          )
          .get();
        expect(currentOrder).to.deep.equal(originalOrder);
      });
    });
  });
});
