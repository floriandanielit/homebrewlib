/* homebrewlib

A beer recipe is a workflow model that represents the respective brewing process.
The model contains:
- flows (the water/wort being transformed) and
- activities (the brewing activities transforming the wort).
An empty process model contains at least one initial flow of water, the mash water.
Adding a new activity also adds a respective outflow.
Activities can be configured using the params property; the run property links the respective brewing logic.
The funciton brew() traverses the model from the start and runs all calculations.

*/


var cons  = require('./constants.js');
var conv       = require('./conversions.js');
var model      = require('./model.js');

// beer recipe object. allows construction of brewing process model
function Recipe() {

  // enable setting custom brew equipment
  this.set_equipment = function (equipment) {
    this.equipment = JSON.parse(JSON.stringify(equipment)); // copy input by value
    // NEED TO UPDATE/RE-BREW FULL MODEL HERE?
  };

  // load default equipment settings
  this.set_equipment(model.equipment);


  // creates empty process model
  this.reset = function () {
    this.process = [];
    this.process[0] = JSON.parse(JSON.stringify(model.flow));
  }

  // initialize process model
  this.reset();


  // add brewing activity to model (see model.js for options)
  this.add = function (activity, position) {

    // add  activity either at position or at the end of the current process
    if (typeof position === 'undefined') // assign default value
      position = this.process.length;
    else if (position < -1 || position >= this.process.length) {
      console.log("Illegal position for current model.");
      return;
    }

    this.process.splice (position, 0,
      JSON.parse(JSON.stringify(activity)),
      JSON.parse(JSON.stringify(model.flow)));
    this.process[position].run = activity.run;

    return this;
  };


  // split a given flow over two recipies
  this.split = function (position, target_recipe) {

    // check if target recipe is specified
    if (!target_recipe) {
      console.log("No target recipe specified."); return; }

    // check of position is compatible with current model
    if (typeof position === 'undefined' || position < 0 || position >= this.process.length) {
      console.log("Illegal position of split in source recipe."); return; }
    if (this.process[position].name) {
      console.log("Source node to be split is not a flow node."); return; }

    // add split activity to current recipce + reference target recipe
    this.process.splice (position+1, 0,
      JSON.parse(JSON.stringify(model.split)),
      JSON.parse(JSON.stringify(model.flow)));
    this.process[position+1].run = model.split.run;
    this.process[position+1].target_recipe = target_recipe;

    // copy equipment and activites before split to target recipe
    target_recipe.equipment = this.equipment;  // SUPPORT DIFFERENT EQUIPMENTS IN FUTURE??
    for (var i=0; i<=position; i++)
      target_recipe.process[i] = this.process[i];

    // add split activity to target recipe + reference source split
    target_recipe.process.splice (position+1, 0,
      JSON.parse(JSON.stringify(model.split)),
      JSON.parse(JSON.stringify(model.flow)));
    this.process[position+1].run = model.split.run;
    target_recipe.process[position+1].source_split = this.process[position+1];

    return this;
  };



  // merge to flows of two recipes; the source recipe will have an empty outflow
  this.merge = function (source_position, target_recipe, target_position) {

    // check if target recipe is specified
    if (!target_recipe) {
      console.log("No target recipe specified."); return; }

      // check of positions are compatible with current models
    if (typeof source_position === 'undefined' || source_position < 0 || source_position >= this.process.length) {
      console.log("Illegal position of merge in source recipe."); return; }
    if (typeof target_position === 'undefined' || target_position < 0 || target_position >= target_recipe.process.length) {
      console.log("Illegal position of merge in target recipe."); return; }
    if (this.process[source_position].name) {
      console.log("Source node to be merged is not a flow node."); return; }
    if (target_recipe.process[target_position].name) {
      console.log("Target node to be merged is not a flow node."); return; }

      // add merge activity to current recipce (to be merged into target recipe)
    this.process.splice (source_position+1, 0,
      JSON.parse(JSON.stringify(model.merge)),
      JSON.parse(JSON.stringify(model.flow)));
    this.process[position+1].run = model.merge.run;

    // add merge activity to target recipe (accepting the final flow of current recipe)
    target_recipe.process.splice (target_position+1, 0,
      JSON.parse(JSON.stringify(model.merge)),
      JSON.parse(JSON.stringify(model.flow)));
    this.process[position+1].run = model.merge.run;
    target_recipe.process[target_position+1].source_flow   = this.process[source_position];
    target_recipe.process[target_position+1].source_recipe = this;

    return this;
  };


  // deletes an activity from the recipe
  this.delete = function (position) {

    if (typeof position === 'undefined' || position < 0 || position >= this.process.length) {
      console.log("Illegal position for current recipe."); return; }
    if (this.process[position].type != "activity") {
      console.log("Position must point an activity node."); return; }

    if (this.process[position].params.target_process)
      this.process[position].params.target_process.delete(this.process[position].params.target_position);
    this.process.splice (position, 2);
  }


  // brews the recipe according to its configuration
  this.brew = function () {

    for (var i=0; i<this.process.length; i++)
      if (this.process[i].name && this.process[i].name == "Split" && this.process[i].target_recipe)
        this.process[i].target_recipe.brew();

    for (var i=0; i<this.process.length; i++)
      if (this.process[i].name)
        this.process[i].run(this.process[i-1], this.process[i], this.equipment, this.process[i+1]);
  };

  return this;
};


module.exports = {

  conv  : conv,   // generic brewing-related conversion functions
  cons  : cons,   // generic brewing constants
  model : model,  // schemas of inputs/outputs/equipment

  new : function () { // returns the recipe object to work with
    return new Recipe(); }

};
