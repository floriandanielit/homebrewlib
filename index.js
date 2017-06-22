//// basic conversion/brewing functions

// temperature from Celsius to Fahrenheit
// example: 0˚C >> 32F
c2f = function (temp) {
  return temp * 9/5 + 32;
}

// temperature from Fahrenheit to Celsius
// example: 32F >> 0˚C
f2c = function (temp) {
  return (temp - 32) * 5/9;
}

// volume from gallons to liters
// example: 5 gal >> 7,57 l
gal2l = function (vol) {
  return vol * 3.78541;
}

// volume from liters to gallons
// example: 10 l >> 2,64 gal
l2gal = function (vol) {
  return vol / 3.78541;
}

// ounces to grams
// example: 1 oz >> 28.35 g
oz2g = function (qty) {
  return qty * 28.3495;
}

// grams to ounces
// example: 50 g >> 1.76 oz
g2oz = function (qty) {
  return qty / 28.3495;
}

// pound to kg
// example: 5 lbs >> 2.27 kg
lbs2kg = function (qty) {
  return qty * 0.453592;
}

// kg to pound
// example: 10 kg >> 22.05 lbs
kg2lbs = function (qty) {
  return qty / 0.453592;
}

// specific gravity to degrees Plato
// source: https://www.brewersfriend.com/plato-to-sg-conversion-chart/
// example: 1.050 SG >> 12.4˚P
sg2p = function (sg) {
  //return -205.347*sg*sg + 668.72*sg - 463.37;
  return -616.868 + 1111.14*sg - 630.272*sg*sg + 135.997*sg*sg*sg;
}

// degrees Plato to specific gravity
// source: https://www.brewersfriend.com/plato-to-sg-conversion-chart/
// example: 15˚P >> 1.061 SG
p2sg = function (p) {
  return 1 + p / (258.6 - p/258.2*227.1);
}


// calculates the IBUs for one hop addition according to Tinseth
// source: http://realbeer.com/hops/research.html
// example: hop addition with 5.0% AA, 50g, 60mins, 60l, 1.035 SG >> 31 IBUs
get_IBU = function (aa, weight, minutes, volume, sg, type, after_hot_break) {

  var alpha_acids = aa/100 * weight * 1000 / volume;
  var bigness_factor = 1.65 * Math.pow( 0.000125, sg-1 );
  var boil_time_factor = (1 - Math.exp(-0.04 * minutes))/4.15;
  var utilization = bigness_factor * boil_time_factor;
  var increment = 1;
  if (type === 'Pellet') increment += 0.1;
  if (after_hot_break) increment += 0.1
  return alpha_acids * utilization * increment;
}




function Recipe() {

//// variable declarations

  // contains constants needed in calculations
  this.constants = {

    // amount of water (liters) absorbed by 1 kg of grain (average, emprical value)
    // source: https://byo.com/bock/item/410-calculating-water-usage-advanced-brewing
//    grain_absorption : 1.04,
    grain_absorption : 1.00,

    // volume in l occupied by 1 kg of grains
    // source:
    grain_volume : 0.75,

    // CO2 produced by fermenting sugar (percentage of weight)
    // source:
    sugar_to_CO2_conversion : 0.51,

    // Color adjustment in EBC during wort production
    // source:
    color_adjustment : 3

  };

  // contains equipment settings to be overwritten with custom values
  this.equipment = {

    mash_max_volume : 50,
    mash_efficiency_weight : 0.751,
    mash_efficiency_potential : 0.91,
    mash_false_bottom_volume: 5,
    mash_loss : 0,

    sparge_max_volume : 50,

    boil_max_volume : 70,
    boil_evaporation_rate : 0.133,
    boil_loss : 2,

    whirlpool_loss : 0,

    fermentation_max_volume: 60,
    fermentation_loss: 1.5,

  };

  // object containing the ingredients of the recipe
  // should contain only those ingredients effectively used in the calculations
  // (important for split recipes)
  this.process = {

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
      temperature : 20
    },

    prime : {
      sugar : 250
    }

  };

  // stores the wort properties at each stage of the production
  // (e.g., mash_water, pre_boil, post_boil)
  // the last entry in the array is the output of the last production step
  // the first entry is by default the mash water
  this.state = [
    { name : 'Mash water',
      vol  : this.process.mash.mash_water,
      og   : 1,
      fg   : 1,
      abv  : 0,
      ebc  : 0,
      ibu  : 0,
      co2  : 0
    }
  ];


//// ingredients management functions


//// brewing functions


  // empties the current recipe
  this.reset = function () {
    this.process = {
      mash : {
        malts : [],
        mash_water: 0,
        sparge_water : 0
      },
      boil : {
        time : 0,
        hops : [],
        water_addition : 0,
        sugar_addition : {},
      },
      ferment : {
        yeast : {},
        temperature : 0
      },
      prime : {
        sugar : 0
      }
    };
    this.state = [
      { name : 'Mash water',
        vol  : 0,
        og   : 1,
        fg   : 1,
        abv  : 0,
        ebc  : 0,
        ibu  : 0,
        co2  : 0
      }
    ];
  }

  // dilutes wort with water
  this.add_water = function (water_addition) {

    var wort = this.state[this.state.length - 1];

    var dilution_factor = wort.vol / (wort.vol + water_addition);

    wort.og = 1 + (wort.og - 1) * dilution_factor;
    wort.fg = 1 + (wort.fg - 1) * dilution_factor;
    wort.abv *= dilution_factor;
    wort.ebc *= dilution_factor;
    wort.ibu *= dilution_factor;
    wort.co2 *= dilution_factor;
    wort.vol += water_addition;
  }


  this.add_sugar = function (quantity, type) {

    var wort = this.state[this.state.length - 1];

    var correction = 1.0; // correction compared to spure ucrose
    switch (type) {
      case 'Dextrose'            : correction = 1.0; /// TBD !!!!
      case 'Dry malt extract'    : correction = 1.0;
      case 'Liquid malt extract' : correction = 1.0;
    }

    var new_sugar = quantity * correction;
    var total_sugar = wort.vol * wort.og * sg2p(wort.og)/100 + new_sugar;

    var a = 258.6;
    var b = 227.1/258.2;
    var extract_plato = ( -(a+b*total_sugar*100/wort.vol) +
                        Math.sqrt(Math.pow(a+b*total_sugar*100/wort.vol,2) +
                        4*a*(1-b)*total_sugar*100/wort.vol)) / (2-2*b);
    var sg = p2sg(extract_plato);

    wort.og  = sg;
    wort.fg  = wort.fg;  // tbd
    wort.abv = wort.abv; // tbd
    wort.ebc = wort.ebc; // tbd
    wort.ibu = wort.ibu;
    wort.co2 = wort.co2;
    wort.vol = wort.vol;
  }


  // calculates the properties of the wort in the mash tun, before lautering
  // source: https://byo.com/hops/item/761-hitting-target-original-gravity-and-volume-advanced-homebrewing
  this.mash = function () {

    var mash_water = this.state[this.state.length - 1];

    var ebc = 0;
    var total_grain_weigth = 0;
    var malts = this.process.mash.malts;
    for (var i = 0; i < malts.length; i++) {
      total_grain_weigth += malts[i].weight;
      ebc += malts[i].ebc * malts[i].weight;
    }
    ebc = ebc / total_grain_weigth + mash_water.ebc + this.constants.color_adjustment;

    var extract = total_grain_weigth * this.equipment.mash_efficiency_weight;

    var volume = mash_water.vol + this.process.mash.sparge_water - total_grain_weigth * this.constants.grain_absorption;

    var a = 258.6;
    var b = 227.1/258.2;
    var eff = this.equipment.mash_efficiency_weight*100;
    var extract_plato = ( -(a+b*eff*total_grain_weigth/volume) +
                        Math.sqrt(Math.pow(a+b*eff*total_grain_weigth/volume,2) +
                        4*a*(1-b)*eff*total_grain_weigth/volume)) / (2-2*b);
    var sg = p2sg(extract_plato);

    this.state.push ({
      name : 'Post-mash wort',
      vol  : volume - this.equipment.mash_loss,
      og   : sg,
      fg   : sg,
      abv  : mash_water.abv,
      ebc  : ebc,
      ibu  : mash_water.ibu,
      co2  : 0
    });

    return this;
  };

  // boil wort
  // supported ingredients: hops, water additions
  this.boil = function () {

    var wort = this.state[this.state.length - 1];
    var boil = this.process.boil;

    // todo: calculare boil-off using boiling power not %
    // change of volume due to evaporation
    var post_boil_volume = wort.vol * (1 - this.equipment.boil_evaporation_rate * boil.time/60);

    // specific gravity at end of boil
    var sg = 1 + (wort.og - 1) * wort.vol/post_boil_volume;

    // IBUs at end of boil
    var ibu = wort.ibu;
    for (i=0; i<boil.hops.length; i++)
      ibu += get_IBU (boil.hops[i].aa, boil.hops[i].weight, boil.hops[i].time, post_boil_volume,
              (wort.og + sg)/2.0, boil.hops[i].type, boil.hops[i].after_hot_break);
//              for (let hop of boil.hops)
  //              ibu += get_IBU (hop.aa, hop.weight, hop.time, post_boil_volume,
    //                    (wort.og + sg)/2.0, hop.type, hop.after_hot_break);

    this.state.push ({
      name : 'Post-boil wort',
      vol  : post_boil_volume - this.equipment.boil_loss,
      og   : sg,
      fg   : sg,
      abv  : wort.abv,
      ebc  : wort.ebc,
      ibu  : ibu,
      co2  : 0
    });

    // water addition during boil
    if (boil.water_addition)
      this.add_water(boil.water_addition);

    // sugar addition during boil
    if (boil.sugar_addition.qty)
      this.add_sugar(boil.sugar_addition.qty, boil.sugar_addition.type);

    return this;
  };

  this.ferment = function () {

    var wort = this.state[this.state.length - 1];
    var original_extract = sg2p(wort.og);
    var final_extract = original_extract;
    if (this.process.ferment.yeast.attenuation)
      final_extract -= original_extract * this.process.ferment.yeast.attenuation/100;
    var fg = p2sg(final_extract);

    var co2 = 1.013 * Math.pow(2.71828182845904, -10.73797+2617.25/(this.process.ferment.temperature+273.15)) * 10;

    // source: http://www.cotubrewing.com/homebrewing/alcohol-content-formula/
    var abv = (1.05/0.79) * ((wort.og - fg) / fg) * 100;

    this.state.push ({
      name : 'Fermented wort',
      vol  : wort.vol - this.equipment.fermentation_loss,
      og   : wort.og,
      fg   : fg,
      abv  : wort.abv + abv,
      ebc  : wort.ebc,
      ibu  : wort.ibu,
      co2  : co2
    });

    // take into account possible water addition during fermentation
    if (this.process.ferment.water_addition)
      this.add_water(this.process.ferment.water_addition);

    return this;
  };

  this.bottle = function () {

    var wort = this.state[this.state.length - 1];

    var prime_co2 = 0;
    if (this.process.prime.sugar) {
      prime_co2 = this.process.prime.sugar * this.constants.sugar_to_CO2_conversion;
    }
    // todo: add other priming methods
    // todo: add volume of possible priming solutions

    var prime_abv = (this.process.prime.sugar - prime_co2) / wort.vol / 0.794 / 10;

    this.state.push ({
      name : 'Beer',
      vol  : wort.vol,
      og   : wort.og,
      fg   : wort.fg,
      abv  : wort.abv + prime_abv,
      ebc  : wort.ebc,
      ibu  : wort.ibu,
      co2  : wort.co2 + prime_co2/wort.vol
    });

    return this;
  };

  // shortcut function to "brew" a full recipe in one shot
  this.brew = function () {
    while (this.state.length > 1)
      this.state.pop();
    return this.mash().boil().ferment().bottle();
  }

  // drops the last productin step from the state of the production
  this.undo = function () {
    if ( this.state.length > 1 )
      this.state.pop();
    return this;
  }

  // splits a given recipe in two by dropping volume from its current
  // volume and returning a new recipe object with volumne of wort added
  this.split = function ( volume ) {

    var branch = new Recipe();

    branch.constants   = JSON.parse(JSON.stringify(this.constants));
    branch.equipment   = JSON.parse(JSON.stringify(this.equipment));
    branch.process = JSON.parse(JSON.stringify(this.process));
    // split also all ingredients?

    branch.state = JSON.parse(JSON.stringify(this.state));
    while (branch.state.length > 1)
      branch.state.shift();
    branch.state[0].vol = volume;

    var wort = this.state[this.state.length - 1];
    this.state.push ({
      name : 'Split of ' + wort.name,
      vol  : wort.vol - volume,
      og   : wort.og,
      fg   : wort.og,
      abv  : wort.abv,
      ebc  : wort.ebc,
      ibu  : wort.ibu,
      co2  : wort.co2
    });

    return branch;
  };

  // merges a given wort into the current recipe
  this.merge = function ( merge_recipe ) {

    var wort = this.state[this.state.length - 1];
    var merge_wort = merge_recipe.state[merge_recipe.state.length - 1];

    this.state.push ({
      name : 'Merge of worts',
      vol  : wort.vol + merge_wort.vol,
      og   : (wort.og * wort.vol + merge_wort.og * merge_wort.vol) / (wort.vol + merge_wort.vol),
      fg   : (wort.fg * wort.vol + merge_wort.fg * merge_wort.vol) / (wort.vol + merge_wort.vol),
      abv  : (wort.abv * wort.vol + merge_wort.abv * merge_wort.vol) / (wort.vol + merge_wort.vol),
      ebc  : (wort.ebc * wort.vol + merge_wort.ebc * merge_wort.vol) / (wort.vol + merge_wort.vol),
      ibu  : (wort.ibu * wort.vol + merge_wort.ibu * merge_wort.vol) / (wort.vol + merge_wort.vol),
      co2  : (wort.co2 * wort.vol + merge_wort.co2 * merge_wort.vol) / (wort.vol + merge_wort.vol)
    });

    return this;
  };

};



module.exports = {

//// basic conversion functions

  c2f: c2f,
  f2c: f2c,
  sg2p: sg2p,
  p2sg: p2sg,
  gal2l: gal2l,
  l2gal: l2gal,
  oz2g: oz2g,
  g2oz: g2oz,
  lbs2kg: lbs2kg,
  kg2lbs: kg2lbs,


/// recipe management functions

  // returns a recipe object to work with
  newRecipe : function () {
    return new Recipe();
  }

};
