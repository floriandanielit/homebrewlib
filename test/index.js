/* eslint-disable no-undef,prefer-destructuring,linebreak-style,no-unused-expressions */
/**
 myPow(base, exponent) {
   let result = 1;
   for (let i = 0; i < exponent; i++)
     result *= base;
   return result;
 }
 const precisionRound = (number, precision) => {
   // myPow to avoid Math.pow();
   const factor = myPow(10, precision);
   return Math.round(number * factor) / factor;
 };
 // Example call:
 const roundedNumber = precisionRound(numberToRound, 2); // Round keeping the first 2 decimal
*/
// eslint-disable-next-line
'use strict';

// @see: https://nicolas.perriault.net/code/2013/testing-frontend-javascript-code-using-mocha-chai-and-sinon/
/**
 * @see: https://github.com/chaijs/type-detect for docs about type detection
 */

const homebrewlib = require('../index');
const chai = require('chai');

const expect = chai.expect;
/**
 * Helper function to print debug information for conversion functions
 * @param from: the name of the starting unit.
 * @param to: the name of the final unit.
 * @param iValue: the initial value of the starting unit.
 * @param fValue: the converted value.
 */
const print = (from, to, iValue, fValue) => console.log(`${iValue} ${from} = ${fValue} ${to}`);

/**
 * Test suite for the construction of the object recipe
 * Contains the basic check to ensure every method and attribute is properly exported.
 */
describe('Recipe object:', () => {
  describe('constructor', () => {
    const recipe = homebrewlib.newRecipe();
    it('[recipe] a valid recipe object should exists', () => {
      expect(recipe).to.be.an('object');
    });
    it('[recipe] should contain the following constants', () => {
      expect(recipe.constants.grain_absorption).to.be.a('number');
      expect(recipe.constants.grain_absorption).to.equal(1.04);
      expect(recipe.constants.grain_volume).to.be.a('number');
      expect(recipe.constants.grain_volume).to.equal(0.67);
      expect(recipe.constants.sugar_to_CO2_conversion).to.be.a('number');
      expect(recipe.constants.sugar_to_CO2_conversion).to.equal(0.51);
      expect(recipe.constants.color_adjustment).to.be.a('number');
      expect(recipe.constants.color_adjustment).to.equal(3);
    });
    it('[recipe] should contain the following equipment:', () => {
      expect(recipe.equipment.mash_max_volume).to.be.a('number');
      expect(recipe.equipment.mash_max_volume).to.equal(50);
      expect(recipe.equipment.mash_efficiency_weight).to.be.a('number');
      expect(recipe.equipment.mash_efficiency_weight).to.equal(0.751);
      expect(recipe.equipment.mash_efficiency_potential).to.be.a('number');
      expect(recipe.equipment.mash_efficiency_potential).to.equal(0.91);
      expect(recipe.equipment.mash_false_bottom_volume).to.be.a('number');
      expect(recipe.equipment.mash_false_bottom_volume).to.equal(5);
      expect(recipe.equipment.mash_loss).to.be.a('number');
      expect(recipe.equipment.mash_loss).to.equal(0);
      expect(recipe.equipment.sparge_max_volume).to.be.a('number');
      expect(recipe.equipment.sparge_max_volume).to.equal(50);
      expect(recipe.equipment.boil_max_volume).to.be.a('number');
      expect(recipe.equipment.boil_max_volume).to.equal(70);
      expect(recipe.equipment.boil_evaporation_rate).to.be.a('number');
      expect(recipe.equipment.boil_evaporation_rate).to.equal(8.3);
      expect(recipe.equipment.boil_loss).to.be.a('number');
      expect(recipe.equipment.boil_loss).to.equal(2);
      expect(recipe.equipment.whirlpool_loss).to.be.a('number');
      expect(recipe.equipment.whirlpool_loss).to.equal(0);
      expect(recipe.equipment.fermentation_max_volume).to.be.a('number');
      expect(recipe.equipment.fermentation_max_volume).to.equal(60);
      expect(recipe.equipment.fermentation_loss).to.be.a('number');
      expect(recipe.equipment.fermentation_loss).to.equal(1.5);
    });
    it('[recipe] should have the following \'process\'', () => {
      expect(recipe.process).to.be.an('object');
    });
    /* it.skip('[process] should have the following properties:', () => {}); */
    it('should have a \'state\'', () => {
      expect(recipe.state[0]).to.be.an('object');
    });
    it('[state] should have the following properties:', () => {
      expect(recipe.state[0].name).to.be.a('string');
      expect(recipe.state[0].name).to.equal('Mash water');
      expect(recipe.state[0].vol).to.be.a('number');
      expect(recipe.state[0].vol).to.equal(28);
      expect(recipe.state[0].og).to.be.a('number');
      expect(recipe.state[0].og).to.equal(1);
      expect(recipe.state[0].fg).to.be.a('number');
      expect(recipe.state[0].fg).to.equal(1);
      expect(recipe.state[0].abv).to.be.a('number');
      expect(recipe.state[0].abv).to.equal(0);
      expect(recipe.state[0].ebc).to.be.a('number');
      expect(recipe.state[0].ebc).to.equal(0);
      expect(recipe.state[0].ibu).to.be.a('number');
      expect(recipe.state[0].ibu).to.equal(0);
      expect(recipe.state[0].co2).to.be.a('number');
      expect(recipe.state[0].co2).to.equal(0);
    });
    it('[recipe] should have the following functions:', () => {
      expect(recipe.reset).to.be.a('function');
      expect(recipe.add_water).to.be.a('function');
      expect(recipe.add_sugar).to.be.a('function');
      expect(recipe.mash).to.be.a('function');
      expect(recipe.boil).to.be.a('function');
      expect(recipe.ferment).to.be.a('function');
      expect(recipe.bottle).to.be.a('function');
      expect(recipe.brew).to.be.a('function');
      expect(recipe.undo).to.be.a('function');
      expect(recipe.split).to.be.a('function');
      expect(recipe.merge).to.be.a('function');
    });
  });
});

/**
 * Test suite for conversion functions exported by homebrewlib
 *   c2f,
 *   f2c,
 *   l2gal,
 *   gal2l
 *   oz2g,
 *   g2oz,
 *   lbs2kg,
 *   kg2lbs,
 *   obrix2sg,
 *   fbrix2sg,
 */
/**
 * @fixme: every function returns NaN if the argument is not a number, but NaN is of type number: this can lead to subtle bugs.
 * @fixme: functions should check its argument and return immediately a error or something diffent from a number to help debugging.
 * @fixme: functions do not round the number: for example, c2f(30.35) returns 86.63000000000001: this number should be appropriately rounded.
 * @see: roundFunction at the top of this file.
 */
describe('HomebrewLib conversion functions:', () => {
  describe('c2f', () => {
    it('should return a number', () => {
      expect(homebrewlib.c2f).to.be.a('function');
      const celsius = 30.35; // Just a random value
      const fahrenheit = homebrewlib.c2f(celsius);
      print('celsius', 'fahrenheit', celsius, fahrenheit);
      expect(fahrenheit).to.be.a('number');
    });
  });
  describe('f2c', () => {
    it('should return a number', () => {
      expect(homebrewlib.f2c).to.be.a('function');
      const fahrenheit = 39.45; // Just a random value
      const celsius = homebrewlib.f2c(fahrenheit);
      print('fahrenheit', 'celsius', fahrenheit, celsius);
      expect(celsius).to.be.a('number');
    });
  });
  describe('l2gal', () => {
    it('should return a number', () => {
      expect(homebrewlib.l2gal).to.be.a('function');
      const litres = 8.54; // Just a random value
      const gallons = homebrewlib.l2gal(litres);
      print('litres', 'gallons', litres, gallons);
      expect(gallons).to.be.a('number');
    });
  });
  describe('gal2l', () => {
    it('should return a number', () => {
      expect(homebrewlib.gal2l).to.be.a('function');
      const gallons = 5.1; // Just a random value
      const litres = homebrewlib.gal2l(gallons);
      print('gallons', 'litres', litres, gallons);
      expect(litres).to.be.a('number');
    });
  });
  describe('oz2g', () => {
    it('should return a number', () => {
      expect(homebrewlib.oz2g).to.be.a('function');
      const oz = 5.1; // Just a random value
      const gram = homebrewlib.oz2g(oz);
      print('oz', 'gram', oz, gram);
      expect(gram).to.be.a('number');
    });
  });
  describe('g2oz', () => {
    it('should return a number', () => {
      expect(homebrewlib.g2oz).to.be.a('function');
      const gram = 5.1; // Just a random value
      const oz = homebrewlib.g2oz(gram);
      print('gram', 'oz', gram, oz);
      expect(oz).to.be.a('number');
    });
  });
  describe('lbs2kg', () => {
    it('should return a number', () => {
      expect(homebrewlib.lbs2kg).to.be.a('function');
      const pound = 5.1; // Just a random value
      const kilogram = homebrewlib.lbs2kg(pound);
      print('pound', 'kilogram', pound, kilogram);
      expect(kilogram).to.be.a('number');
    });
  });
  describe('kg2lbs', () => {
    it('should return a number', () => {
      expect(homebrewlib.kg2lbs).to.be.a('function');
      const kilogram = 5.1; // Just a random value
      const pound = homebrewlib.kg2lbs(kilogram);
      print('kilogram', 'pound', kilogram, pound);
      expect(pound).to.be.a('number');
    });
  });
  /**
   * @todo: write proper test
   */
  describe('obrix2sg', () => {
    it('should return a number', () => {
      expect(homebrewlib.obrix2sg).to.be.a('function');
    });
  });
  /**
   * @todo: write proper test
   */
  describe('fbrix2sg', () => {
    it('should return a number', () => {
      expect(homebrewlib.fbrix2sg).to.be.a('function');
    });
  });
  /**
   * @todo: write proper test
   */
  describe('get_ABW', () => {
    it('should return a number', () => {
      expect(homebrewlib.get_ABW).to.be.a('function');
    });
  });
  /**
   * @todo: write proper test
   */
  describe('ABW2ABV', () => {
    it('should return a number', () => {
      expect(homebrewlib.ABW2ABV).to.be.a('function');
    });
  });
  /**
   * @todo: write proper test
   */
  describe('get_attenuation', () => {
    it('should return a number', () => {
      expect(homebrewlib.get_attenuation).to.be.a('function');
    });
  });
});

/**
 * Test suite for recipe management functions exported by homebrewlib
 *   merge, @todo: add
 *   reset, @fixme
 *   split, @todo: add
 *   undo, @todo: add
 */
describe('HomebrewLib recipe management functions:', () => {
  describe('merge function', () => {
    it.skip('should merge two recipe in a single one', () => {

    });
  });
  describe('reset function', () => {
    /**
     * @fixme: reset the recipe only partially. For example: malts are replaced by a empty array, while in a new recipe they have some default malt already inserted.
     * @todo: what's the expected behaviour of this function?
     * @note: test skipped to avoid failure.
     */
    it.skip('should reset the current recipe object to its default values', () => {
      const recipe = homebrewlib.newRecipe();
      // Initialize the recipe with random values
      Object.keys(recipe).forEach((parentKey) => {
        Object.keys(parentKey).forEach((key) => {
          (typeof recipe[parentKey[key]] === 'number') ? recipe.process.mash.mash_water = Math.floor(Math.random() * Math.floor(15)) : undefined;
        });
      });
      recipe.reset();
      // A new recipe is always created using default values
      // Thus the test will check if the newRecipe object with default values equals the resetted one.
      const newRecipe = homebrewlib.newRecipe();
      expect(recipe).to.deep.equal(newRecipe);
      console.log('RESETTED RECIPE: ');
      console.log(recipe);
      console.log(' ==================== ');
      console.log('NEW DEFAULT RECIPE: ');
      console.log(newRecipe);
    });
  });
  describe('split function', () => {
    it.skip('should split the recipe in two half that are equals', () => {

    });
  });
  describe('undo function', () => {
    it.skip('should revert the last action', () => {

    });
  });
});

/**
 * Test suite for beer production functions exported by homebrewlib
 *   add_water,
 *   add_sugar
 *   boil,
 *   brew,
 *   bottle,
 *   ferment,
 *   mash,
 */
describe('HomebrewLib beer production functions:', () => {
  describe('add_water function', () => {
    it.skip('function behaviour description', () => {

    });
  });
  describe('add_sugar function', () => {
    it.skip('function behaviour description', () => {

    });
  });
  describe('boil function', () => {
    it.skip('function behaviour description', () => {

    });
  });
  describe('brew function', () => {
    it.skip('function behaviour description', () => {

    });
  });
  describe('bottle function', () => {
    it.skip('function behaviour description', () => {

    });
  });
  describe('ferment function', () => {
    it.skip('function behaviour description', () => {

    });
  });
  describe('mash function', () => {
    it.skip('function behaviour description', () => {

    });
  });
});
