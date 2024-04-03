describe('cypress works!', () => {
  it('Student List was found successfully--for sure', () => {
    cy.wait(4000)
    cy.get(".text-2xl").contains("Students List")
  })


  it('Student List will not be found and will fail', () => {
    cy.wait(4000)
    
    
    cy.get(".text-2xl").contains("Students List")
  })
})