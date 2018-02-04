/* eslint-disable no-undef,prefer-destructuring */
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
 * Test suite for the functions exported by homebrewlib
 * @todo: divide into smaller test suites if this becomes too big
 */
describe('Homebrewlib functions:', () => {
  describe('c2f', () => {
    /**
     * @fixme: the function returns NaN if the argument is not of type number, but NaN is of type number, this can lead to subtle bugs.
     * @fixme: the function should check its argument and return immediately a error or something diffent from a number to help the debug procedures.
     * @fixme: c2f does not round the number: for example, given 30.35 as input, its output will be: 86.63000000000001: this number should be rounded.
     * @see: roundFunction at the top of this file.
     */
    it('should return a number', () => {
      const celsius = 30.35; // Just a random value
      const fahrenheit = homebrewlib.c2f(celsius);
      console.log(fahrenheit);
      console.log(Math.ceil(fahrenheit));
      expect(fahrenheit).to.be.an('number');
    });
  });
  describe('f2c', () => {
    it('should return a number', () => {

    });
  });
});
