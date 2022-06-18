//add farm test case
it('works', () => {
  cy.visit('http://localhost:19006/login')
  cy.get('[data-testid=loginEmail]').type('bhavin.pethani@yahoo.com')
  cy.get('[data-testid=loginPassword]').type('123456')
  cy.get('[data-testid=loginBtn]').click()
  cy.get('[data-testid=addFarmBtn]').click()
  cy.get('[data-testid=addDisplayName]').type("HB's Farm House")
  cy.get('[data-testid=addFarmName]').type("Kiwi Farm")
  cy.get('[data-testid=uploadFarmBtn]').click()
  })