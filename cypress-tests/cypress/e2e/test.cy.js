describe('cypress works!', () => {
    it('second', () => {
      cy.wait(4000)
      cy.get(".text-2xl").contains("Students List")
    })
  
  
    it('second test', () => {
      cy.wait(4000)
      
      
      cy.get(".text-2xl").contains("Students List")
    })
  })