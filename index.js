/* homebrewlib

A beer recipe is a process model that represents the respective brewing process.
The process model contains:
- flows (the water/wort being transformed) and
- activities (the brewing activities transforming the wort).
An empty process model contains at least one initial flow of water, the mash water.
Adding a new activity also adds a respective output flow.
Activities can be configured using the params property; the run propert links the respective brewing logic.
The funciton brew() traverses the process model from the start and runs all calculations

*/


// @todo: this file can be re-written using the new ECMAScript6 syntax, and transpiled using babel to ensure compatibily with older browser
// @todo: even though ECMA6 is already compatible with almost everything except Internet Explorer 11 (of course...)

var constants = require('./constants.js');
var conv      = require('./conversions.js');
var equipment = require('./equipment.js');
var brew      = require('./brew.js');
var flow      = require('./flow.js');




// beer recipe object. allows construction of brewing process model
function Recipe() {

  this.equipment = {}; // brew equipment properties

  this.process = []; // starting process model
  this.process[0] = flow.create('Mash water');


  // configure brew equipment
  this.set_equipment = function (equipment) {

    this.equipment = JSON.parse(JSON.stringify(equipment)); // copy by value

    for (i=0; i<this.process.length; i++)
      if (this.process[i].type == "activity")
        if (this.process[i].name == "Mash") {
          this.process[i].params.mash_efficiency_weight = equipment.mash_efficiency_weight;
          this.process[i].params.mash_loss = equipment.mash_loss;
        }
        else if (this.process[i].name == "Boil") {
          this.process[i].params.boil_evaporation_rate = equipment.boil_evaporation_rate;
          this.process[i].params.boil_loss = equipment.boil_loss;
          this.process[i].params.whirlpool_loss = equipment.whirlpool_loss;
        }
        else if (this.process[i].name == "Ferment") {
          this.process[i].params.fermentation_loss = equipment.fermentation_loss;
        }
        else if (this.process[i].name == "Bottle") {
          // nothing to do so far
        }
  };

  // add mash step to model
  this.add_mash = function (position) {

    // add  activity either at position or at the end of the current process
    if (typeof position === 'undefined') // assign default value
      position = this.process.length;
    else if (position < -1 || position >= this.process.length) {
      console.log("Illegal position for current model."); return; }

    var efficiency_weight = 0.0; // percentage in decimal points, e.g., 70% = 0.70
    var loss = 0.0; // loss of wort at end of mashing in liters

    if (this.equipment.mash_efficiency_weight) efficiency_weight = this.equipment.mash_efficiency_weight;
    if (this.equipment.mash_loss) loss = this.equipment.mash_loss;

    this.process.splice (position, 0, // add description of production activity
    {
      type   : "activity",
      name   : "Mash",
      run    : brew.mash,
      params : {
        mash_efficiency_weight : efficiency_weight,
        malts : [], // entries like { name : 'Maris Otter', weight : 6.2, ebc : 3.2 }
        mash_water: 0.0, // mash water in liters
        sparge_water : 0.0, // sparge water in liters
        mash_loss : loss,
      }
    }, flow.create('Post-mash wort')); // add output flow

    return this;
  };

  // add boil step to model
  this.add_boil = function (position) {

    // add  activity either at position or at the end of the current process
    if (typeof position === 'undefined') // assign default value
      position = this.process.length;
    else if (position < -1 || position >= this.process.length) {
      console.log("Illegal position for current model."); return; }

    var evaporation_rate = 0.0; // liters per hour
    var boil_loss = 0; // loss in liters
    var whirlpool_loss = 0; // loss of wort in whirlpool

    if (this.equipment.boil_evaporation_rate) evaporation_rate = this.equipment.boil_evaporation_rate;
    if (this.equipment.boil_loss) boil_loss = this.equipment.boil_loss;
    if (this.equipment.whirlpool_loss) whirlpool_loss = this.equipment.whirlpool_loss;

    this.process.splice (position, 0, // add description of production activity
    {
      type   : "activity",
      name   : "Boil",
      run    : brew.boil,
      params : {
        time : 0, // boil time in minutes
        whirlpool : 0, // whirlpool time in minutes
        hops : [], // hop list with elements like {name : 'EKG', type : 'Pellet', weight : 55, aa : 5.9, time : 60, after_hot_break : true}
        water_addition : 0, // water added during boiling in liters
        sugar_addition : {qty : 0.0, type : 'Sucrose'}, // sugar additions during boiling in kg
        boil_evaporation_rate : evaporation_rate, // liters per hour
        boil_loss : boil_loss, // loss in liters
        whirlpool_loss : whirlpool_loss, // loss of wort in whirlpool
      }
    }, flow.create('Post-boil wort'));

    return this;
};

  // add fermentation step to model
  this.add_ferment = function (position) {

    // add  activity either at position or at the end of the current process
    if (typeof position === 'undefined') // assign default value
      position = this.process.length;
    else if (position < -1 || position >= this.process.length) {
      console.log("Illegal position for current model."); return; }

    var loss = 0.0; // loss in liters

    if (this.equipment.fermentation_loss) loss = this.equipment.fermentation_loss;

    this.process.splice (position, 0, // add description of production activity
    {
      type   : "activity",
      name   : "Ferment",
      run    : brew.ferment,
      params : {
        temperature : 0, // fermentation temperature in °C
        yeast : { name: 'WYeast London ESB', type : 'liquid', attenuation : 83}, // single yeast per fermentation
        water_addition : 0, // water added during boiling in liters
        sugar_addition : {qty : 0.0, type : 'Sucrose'}, // sugar additions during boiling in kg
        hops : [], // dry hop list with elements like {name : 'EKG', type : 'Pellet', weight : 55, aa : 5.9, time : 60, after_hot_break : true}
        fermentation_loss: loss // loss in liters
      }
    }, flow.create('Flat beer'));

    return this;
  };

  // add bottling step to model
  this.add_bottle = function (position) {

    // add  activity either at position or at the end of the current process
    if (typeof position === 'undefined') // assign default value
      position = this.process.length;
    else if (position < -1 || position >= this.process.length) {
      console.log("Illegal position for current model."); return; }

    this.process.splice (position, 0, // add description of production activity
    {
      type   : "activity",
      name   : "Bottle",
      run    : brew.bottle,
      params : {
        prime : [], // priming sugards in g/l ({ type: 'Sucrose', qty: 5.0})
      }
    }, flow.create('Carbonated beer'));

    return this;
  };

  // split a given flow over two recipies
  this.add_split = function (position, target_recipe) {

    if (!target_recipe) {
      console.log("No target recipe specified."); return; }
    if (typeof position === 'undefined' || position < 0 || position >= this.process.length) {
      console.log("Illegal position of split in source recipe."); return; }
    if (this.process[position].type != "flow") {
      console.log("Source node to be split is not a flow node."); return; }

    this.process.splice (position+1, 0,
    {
      type   : "activity",
      name   : "Split",
      run    : flow.split,
      params : {
        target_recipe : target_recipe,
        vol : 0
      }
    }, flow.create('Split flow'));

    target_recipe.equipment = this.equipment; // share same equipment
    for (var i=0; i<=position; i++) // share some activities up to split node (excluded)
      target_recipe.process[i] = this.process[i];

    target_recipe.process.splice (position+1, 0,
    {
      type   : "activity",
      name   : "Split",
      run    : flow.split,
      params : {
        source_split : this.process[position+1]
      }
    }, flow.create('Start flow')); // add outflow

    return this;
  };

  // merge to flows of two recipes; the source recipe will have an empty outflow
  this.add_merge = function (source_position, target_recipe, target_position) {

    if (!target_recipe) {
      console.log("No target recipe specified."); return; }
    if (typeof source_position === 'undefined' || source_position < 0 || source_position >= this.process.length) {
      console.log("Illegal position of merge in source recipe."); return; }
    if (typeof target_position === 'undefined' || target_position < 0 || target_position >= target_recipe.process.length) {
      console.log("Illegal position of merge in target recipe."); return; }
    if (this.process[source_position].type != "flow") {
      console.log("Source node to be merged is not a flow node."); return; }
    if (target_recipe.process[target_position].type != "flow") {
      console.log("Target node to be merged is not a flow node."); return; }

    this.process.splice (source_position+1, 0,
    {
      type   : "activity",
      name   : "Merge",
      run    : flow.merge,
      params : {
        source_flow : null,
      }
    }, flow.create('Empty flow'));

    target_recipe.process.splice (target_position+1, 0,
    {
      type   : "activity",
      name   : "Merge",
      run    : flow.merge,
      params : {
        source_flow : this.process[source_position]
      }
    }, flow.create('Merged flow'));

    return this;
  };


  // empties the recipe
  this.reset = function () {
    this.process = [];
    this.process[0] = flow.create('Mash water');
  }

  // deletes an activity from the recipe
  this.delete = function (position) {

    if (typeof position === 'undefined' || position < 0 || position >= this.process.length) {
      console.log("Illegal position for current recipe."); return; }
    if (this.process[position].type != "activity") {
      console.log("Position must point an activity node."); return; }

    this.process.splice (position, 2);
  }

  // brews the recipe according to its configuration
  this.brew = function () {

    for (var i=0; i<this.process.length; i++)
      if (this.process[i].name == "Split" && this.process[i].params.target_recipe)
        this.process[i].params.target_recipe.brew();

    for (var i=0; i<this.process.length; i++)
      if (this.process[i].type == "activity")
        this.process[i].run(this.process[i-1], this.process[i].params, this.process[i+1]);
  };

};


module.exports = {

  conversion : conv,        // generic brewing-related conversion functions
  constants  : constants,   // generic brewing constants
  equipment  : equipment,   // example configuration of brew equipment

  newRecipe : function () { // returns the recipe object to work with
    return new Recipe(); }

};


/*  {

    mash : {
      malts : [
        { name : 'Maris Otter', weight : 6.2, ebc : 3.2 },
        { name : 'Crystal', weight : 0.4, ebc  : 160 },
        { name : 'Brown Malt', weight : 0.2, ebc  : 200 }
      ],
      mash_water: 28,
      sparge_water : 41
    },

    boil : {
      time : 75,
      whirlpool : 0,
      hops : [
        {name : 'EKG', type : 'Pellet', weight : 55, aa : 5.9, time : 60, after_hot_break : true},
        {name : 'EKG', type : 'Pellet', weight : 25, aa : 5.9, time : 30, after_hot_break : true},
        {name : 'EKG', type : 'Pellet', weight : 20, aa : 5.9, time :  1, after_hot_break : true},
      ],
      water_addition : 0,
      sugar_addition : {qty : 0.0, type : 'Sucrose'}
    },

    ferment : {
      yeast : { name: 'WYeast London ESB', type : 'liquid', attenuation : 83},
      temperature : 20,
      water_addition : 0,
      sugar_addition : {qty : 0.0, type : 'Sucrose'}
    },

    bottle : {
      prime : [
        { type: 'Sucrose', qty: 5.0},
        { type: 'Speise', qty: 2.0},
      ]
    }

  };
  */
