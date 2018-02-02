/* eslint-disable no-undef */
// eslint-disable-next-line
'use strict';

// @see: https://nicolas.perriault.net/code/2013/testing-frontend-javascript-code-using-mocha-chai-and-sinon/

// just some random test to check proper configuration of packages mocha and mochawesome

describe('Cow', () => {
  describe('constructor', () => {
    it('should have a default name', () => {
      const cow = new Cow();
      expect(cow.name).to.equal('Anon cow');
    });

    it("should set cow's name if provided", () => {
      const cow = new Cow('Kate');
      expect(cow.name).to.equal('Kate');
    });
  });

  describe('#greets', () => {
    it('should throw if no target is passed in', () => {
      expect(() => {
        (new Cow()).greets();
      }).to.throw(Error);
    });

    it('should greet passed target', () => {
      const greetings = (new Cow('Kate')).greets('Baby');
      expect(greetings).to.equal('Kate greets Baby');
    });
  });
});
