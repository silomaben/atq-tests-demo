describe('cypress works and i can now delete stuff', () => {
  it('Student List was found successfully--for sure', () => {
    cy.wait(4000)
    cy.visit('/')
    cy.get(".text-2xl").contains("Students List")
  })


  it('Student List will not be found and will pass demo day', () => {
    cy.wait(4000)
    cy.visit('/')
    
    cy.get(".text-2xl").contains("Students List")
  })
})

