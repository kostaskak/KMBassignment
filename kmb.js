describe('Wikipedia search', () => {
  //This function uses the search bar to search for an input and asserts that input is contained in results
  function search(input) {
    //Intercept GET request to wikipedia
    cy.intercept(
      'GET',
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${input}&format=json&callback=%3F&callback=callback`,
      (req) => {
        req.reply({
          statusCode: 200,
          delay: 5000,
        });
      }
    ).as('wikipedia');
    //Type input on wikipedia search and click search button
    cy.get('.wikipedia-search-input').clear().type(input);
    cy.get('.wikipedia-search-button').click();
    //Wait for request to finish
    cy.wait('@wikipedia');
    //Assert that results contain input
    cy.get('.wikipedia-search-results').then((result) => {
      cy.wrap(result).each((result) => {
        expect(result).to.contain(input, { matchCase: false });
      });
    });
  }

  beforeEach('Visit website', () => {
    cy.visit('https://testautomationpractice.blogspot.com/');
  });

  context('Search for valid terms', () => {
    let validTerms = ['Tiger', 'lion', 'zEBrA'];
    //Search for all valid terms
    validTerms.forEach((term) => {
      it(`Search for ${term}`, () => {
        search(term);
      });
    });
  });

  context('Other tests', () => {
    it('Search for empty text', () => {
      //Search using Enter key
      cy.get('.wikipedia-search-input').clear().type('{enter}');
      //Assert error message
      cy.get('.wikipedia-search-results').should('contain', 'Please enter text to search.');
    });

    it('Search for invalid text', () => {
      //Intercept GET request to wikipedia
      cy.intercept(
        'GET',
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=dfgh324udf&format=json&callback=%3F&callback=callback`,
        (req) => {
          req.reply({
            statusCode: 200,
            delay: 5000,
          });
        }
      ).as('wikipedia');
      //Type input on wikipedia search and hit enter to search
      cy.get('.wikipedia-search-input').clear().type('dfgh324udf').type('{enter}');
      //Wait for request to finish
      cy.wait('@wikipedia');
      //Assert error message
      cy.get('.wikipedia-search-results').should('contain', 'No results found.');
    });
  });
});
