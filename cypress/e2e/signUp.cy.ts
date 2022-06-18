//please change email before run test case

// create account Test Case
it('works', () => {
    cy.visit('http://localhost:19006/login')
    cy.get('[data-testid=loginSignup]').click()
    cy.get('[data-testid=signUpEmail]').type('om.sharma@yahoo.in')  
    cy.get('[data-testid=signUpPassword]').type('123456')
    cy.get('[data-testid=signUpBtn]').click()
  })

