/* homebrewlib
   by Florian Daniel

A beer recipe is a workflow model that specifies the brewing process.
The model contains (see model.js):
- flows (the water/wort being transformed);
- activities (the brewing activities transforming the wort); and
- optional split/merge activities of flows.

An empty process model contains at least one initial flow of water, the mash water.
Adding a new activity automatically also adds a respective outflow.
Activities can be configured using their properties.
Activities can be deleted; flows cannot be deleted directly.
The run function of activities references the respective brewing logic (see logic.js).
The funciton brew() traverses the model from the start and runs all calculations.

*/


var cons  = require('./constants.js');
var conv  = require('./conversions.js');
var model = require('./model.js');


// beer recipe object. allows construction of brewing process model
function Recipe() {

  // enable setting custom brew equipment
  this.set_equipment = function (equipment) {
    this.equipment = JSON.parse(JSON.stringify(equipment)); // copy input by value
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
    target_recipe.process[position+1].run = model.split.run;
    target_recipe.process[position+1].source_split = this.process[position+1];

    return this;
  };



  // merge two flows of two recipes; the source recipe will have an empty outflow
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
    this.process[source_position+1].run = model.merge.run;

    // add merge activity to target recipe (accepting the final flow of current recipe)
    target_recipe.process.splice (target_position+1, 0,
      JSON.parse(JSON.stringify(model.merge)),
      JSON.parse(JSON.stringify(model.flow)));
    target_recipe.process[target_position+1].run = model.merge.run;
    target_recipe.process[target_position+1].merge_flow   = this.process[source_position];

    return this;
  };


  // deletes an activity from the recipe
  // attention: if a split activiy is deleted, the connection with possible
  // dependent recipies is lost
  this.delete = function (position) {

    if (typeof position === 'undefined' || position < 0 || position >= this.process.length) {
      console.log("Illegal position for current recipe."); return; }
    if (this.process[position].type != "activity") {
      console.log("Position must point an activity node."); return; }

    this.process.splice(position, 2); // delete activity
  };


  // identifies all connected recipies and initializes their flows to 'tbd'
  this.init = function(buffer) {

    buffer.push(this); // add current recipe to buffer for brewing

    // mark all flows as tbd, except first flow
    this.process[0].status = 'ready';
    for (var i=1; i<this.process.length; i++) {
      // search for splits in model and add target recipies to buffer
      if (this.process[i].name && this.process[i].name == "Split" && this.process[i].target_recipe.process)
        this.process[i].target_recipe.init(buffer);
      // initialize flows for brewing
      if (!this.process[i].name) // no name attribute >> flow element
        this.process[i].status = 'tbd';
    }
  };

  // brew single recipe as long as all necessary input flows are ready
  this.calculate = function() {

    // go through all activities and run them if input flows are ready
    for (var i=1; i<this.process.length; i++) {

      if (this.process[i].name) { // name attribute exists >> activitiy element

        // input flow not ready >> interrupt calculation
        if (this.process[i-1].status != "ready") break;
        // if merge activity and source flow not ready >> interrupt calculation
        if (this.process[i].name == "Merge" && this.process[i].merge_flow.status && this.process[i].merge_flow.status != "ready") break;

        // run activity and mark outflow as ready
        this.process[i].run(this.process[i-1], this.process[i], this.equipment, this.process[i+1]);
        this.process[i+1].status = "ready";
      }
    }

    if (i == this.process.length) return 1;  // recipe successfully brewed
    return 0; // recipe not fully brewed due to a merge with not ready inflows
  };
/*


// split + merge back to recipe
h=require('homebrewlib')
r=h.new()
e=h.new()
r.split(0,e)
r.process[0].vol=10
r.process[1].vol=4
r.add(h.model.mash)
e.merge(2,r,4)
r.process[3].malts[0] = {name:'', form:'grain', weight:2.0, ebc:3}
r.brew()
r.process
e.process

// split + merge to new recipe
h=require('homebrewlib')
r=h.new()
e=h.new()
r.split(0,e)
r.process[0].vol=10
r.process[1].vol=4
r.add(h.model.mash)
r.process[3].malts[0] = {name:'', form:'grain', weight:2.0, ebc:3}
r.merge(4,e,2)
r.brew()
r.process
e.process


// simple split, no merge, one full recipe
h=require('homebrewlib')
r=h.new()
e=h.new()

r.add(h.model.mash)
r.process[0].vol=8
r.process[1].water=7
r.process[1].malts[0] = {name:'Pilsner', form:'grain', weight:2.0, ebc:3}

r.add(h.model.boil)
r.process[3].time=60
r.process[3].hops[0] = {name:'', form:'pellets', weight:10.0, alpha:8.5, time:60, usage:'forward'}

r.add(h.model.ferment)
r.process[5].yeast = {name:'', type:'liquid', attenuation: 78.0}

r.add(h.model.bottle)
r.process[7].sucrose = 5.0

r.split(2,e)
r.process[3].vol=3.0

e.add(h.model.boil)
e.process[5].time=90

e.add(h.model.ferment)
e.process[7].yeast = {name:'', type:'dry', attenuation: 70}

r.brew()
r.process
e.process


*/

  // brews all connected recipies starting from given recipe
  this.brew = function() {

    // find all connected recipies for brewing and initialize flows
    var recipies = [];
    this.init(recipies);

    // brew all recipes until all activites of all recipes are completed
    // (a recipe may not be brewable if there is a merge with an inflow that is 
    // not yet ready for futher processing: status = 'tbd')
    while (recipies.length > 0)
      for (var i=0; i<recipies.length; i++)
        if (recipies[i].calculate()) { // if recipe can successfully be brewed...
          recipies.splice(i,1); // ...drop it from pending recipies
          i--; // adjust index to account for dropped recipe
        }
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
