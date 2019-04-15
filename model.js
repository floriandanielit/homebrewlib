// schemas of all inputs/output/equipment configuration

var logic = require("./logic.js");

module.exports = {

  // default brew equipment properties
  equipment : {
    name: "8 liter equipment",

    mash_max_volume : 12.0,
    mash_efficiency_weight : 0.72,
    mash_false_bottom_volume: 2.0,
    mash_loss : 1.0,

    sparge_max_volume : 8.0,

    boil_max_volume : 15.0,
    boil_evaporation_rate : 2.3,
    boil_loss : 0.5,

    whirlpool_loss : 0.0,

    fermentation_max_volume: 12.0,
    fermentation_loss: 0.5,

    bottling_loss: 0.0,
  },

  // structure of liquid flows between brew activities (water, wort, beer)
  flow : {
    vol  : 0.0, // volume in liters
    og   : 1.0, // original specific gravity in kg/l
    fg   : 1.0, // final specific gravity in kg/l
    abv  : 0.0, // alcohol by volume in %
    ebc  : 0.0, // European beer color
    ibu  : 0.0, // international bitter units
    co2  : 0.0  // CO2 content in g/l
  },

  // configuration of mash step
  mash : {
    name  : "Mash",     // name of activity
    run   : logic.mash, // name of function implementing activity
    malts : [],         // list of malts to be mashed, see internal model below
    water : 0.0,        // sparge water in l
  },

  // structure of malt additions
  malt : {
    name   : '',  // unique name of malt variety
    weight : 0.0, // weight in kg
    ebc    : 0.0  // EBC of malt
  },

  // configuration of boil step
  boil : {
    name : "Boil",
    run  : logic.boil,
    time      : 0.0, // boil time in minutes
    whirlpool : 0.0, // whirlpool time in minutes
    hops      : [],  // hop list with elements as defined below
    water     : 0.0, // water added during boiling in l
    sucrose   : 0.0, // sucrose (table sugar) additions during boiling in kg
    dextrose  : 0.0, // dextrose addition in kg
    dry_malt  : 0.0, // dry malt addition in kg
    speise    : 0.0, // volume of speise used for priming
  },

  // structure of hop additions
  hop : {
    name : '',       // unique name of hop variety
    form : 'pellet', // allowed values: 'pellet' | 'cone' | 'cryo'
    weight : 0.0,    // weight in g
    alpha : 0.0,     // alpha acid content in %
    time : 0,        // time of contact with wort
    usage: ''        // allowed values: 'forward' | 'after hot break' | 'whirlpool'
  },

  // configuration of fermentation step
  ferment : {
    name : "Ferment",
    run  : logic.ferment,
    temp     : 0.0, // primary fermentation temperature in °C
    max_temp : 0.0, // maximum fermentation temperature in °C
    yeast    : { name: '',           // unique name of yeast strain
                 type : '',          // possible values: 'liquid' | 'dry' | 'slurry'
                 attenuation : 0.0}, // attenation in % (typically between 70-85%)
    water    : 0.0, // water added during boiling in liters
    sucrose  : 0.0, // sugar addition during boiling in kg
    dextrose : 0.0, // dextrose addition in kg
    dry_malt : 0.0, // dry malt addition in kg
    hops     : [],  // dry hop list with elements as defined above
  },

  // configuration of priming and bottling step
  bottle : {
    name : "Bottle",
    run  : logic.bottle,
    loss  : 0.0,    // loss of beer during bottling
    sucrose  : 0.0, // sugar addition for priming in g/l
    dextrose : 0.0, // dextrose addition for priming in g/l
    dry_malt : 0.0, // sugar additions for priming in g/l
    speise   : 0.0, // speise (wort) addition for priming in l
  },

  // configuration of wort split activities
  split : {
    name : "Split",
    run  : logic.split,
    target_recipe : {}, // target recipe of split (for source recipe)
    source_split  : {}, // source split of split action (for target recipe)
    vol    : 0.0        // volume in l transferred from source to target
  },

  // configuration of wort merge activities
  merge : {
    name : "Merge",
    run  : logic.merge,
    source_flow   : {}, // source flow to be merged
    source_recipe : {}  // source recipe containing source flow
  },

};
