// implementation of brewing activities

var constants = require('./constants.js');
var conv      = require('./conversions.js');

// calculates the fermentation attenuation from Plato readings
get_attenuation = function (oplato, fplato) {
  if (oplato != 0)
    return 100 - fplato / oplato * 100;
  return 0;
}

// calculates the IBUs for one hop addition according to Tinseth
// source: http://realbeer.com/hops/research.html
// example: hop addition with 5.0% AA, 50g, 60mins, 60l, 1.035 SG >> 31 IBUs
get_ibu = function (alpha, weight, minutes, volume, sg, form, usage) {

  var alpha_acids = alpha/100.0 * weight * 1000.0 / volume;
  var bigness_factor = 1.65 * Math.pow( 0.000125, sg-1.0 );
  var boil_time_factor = (1.0 - Math.exp(-0.04 * minutes))/4.15;
  var utilization = bigness_factor * boil_time_factor;

  var increment = 1.0;
  if (form === 'pellet') increment += 0.1;
  if (usage === "after hot break") increment += 0.1 // CHECK WHIRLPOOL HERE

  return alpha_acids * utilization * increment;
}


// dilutes wort with water
add_water = function (wort, water_addition) {

  var dilution_factor = wort.vol / (wort.vol + water_addition);

  wort.og   = 1.0 + (wort.og - 1.0) * dilution_factor;
  wort.fg   = 1.0 + (wort.fg - 1.0) * dilution_factor;
  wort.abv *= dilution_factor;
  wort.ebc *= dilution_factor;
  wort.ibu *= dilution_factor;
  wort.co2 *= dilution_factor;
  wort.vol += water_addition;
}


add_sugar = function (wort, quantity, type) {

  var correction = 1.0; // correction compared to spure sucrose
  switch (type) {
    case 'Dextrose'            : correction = 1.0; /// TBD !!!!
    case 'Dry malt extract'    : correction = 1.0;
    case 'Liquid malt extract' : correction = 1.0;
  }

  var new_sugar = quantity * correction;
  var total_sugar = wort.vol * wort.og * conv.sg2p(wort.og)/100 + new_sugar;

  var a = 258.6;
  var b = 227.1/258.2;
  var extract_plato = ( -(a+b*total_sugar*100/wort.vol) +
                      Math.sqrt(Math.pow(a+b*total_sugar*100/wort.vol,2) +
                      4*a*(1-b)*total_sugar*100/wort.vol)) / (2-2*b);
  var sg = conv.p2sg(extract_plato);

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
mash = function (inflow, activity, equipment, outflow) {

  var ebc = 0.0;
  var total_grain_weigth = 0.0;

  for (var i = 0; i < activity.malts.length; i++) {
    total_grain_weigth += activity.malts[i].weight;
    ebc += activity.malts[i].ebc * activity.malts[i].weight;
  }
  ebc = ebc / total_grain_weigth; // CHECK HOW TO TAKE INTO ACCOUNT WORT VOLUME!!
  if (isNaN(ebc)) ebc = 0.0;

  var extract = total_grain_weigth * equipment.mash_efficiency_weight;

  var volume = inflow.vol + activity.water - total_grain_weigth * constants.grain_absorption;

  var a = 258.6;
  var b = 227.1 / 258.2;
  var eff = equipment.mash_efficiency_weight * 100;
  var extract_plato = ( -(a+b*eff*total_grain_weigth/volume) +
                      Math.sqrt(Math.pow(a+b*eff*total_grain_weigth/volume,2) +
                      4*a*(1-b)*eff*total_grain_weigth/volume)) / (2-2*b);
  var sg = conv.p2sg(extract_plato);
  if (isNaN(sg)) sg = 1.0;

  outflow.vol = volume - equipment.mash_loss;
  outflow.og  = sg;
  outflow.fg  = sg;
  outflow.abv = inflow.abv;
  outflow.ebc = inflow.ebc + ebc;
  outflow.ibu = inflow.ibu;
  outflow.co2 = inflow.co2;
};


// boil wort
// supported ingredients: hops, water additions
boil = function (inflow, activity, equipment, outflow) {

  // todo: calculate boil-off using boiling power not %
  // change of volume due to evaporation
  var post_boil_volume = inflow.vol - equipment.boil_evaporation_rate * activity.time/60;

  // specific gravity at end of boil
  var sg = 1 + (inflow.og - 1) * inflow.vol/post_boil_volume;

  // IBUs at end of boil
  var ibu = 0.0;
  for (i=0; i<activity.hops.length; i++)
    ibu += get_ibu (activity.hops[i].alpha, activity.hops[i].weight, activity.hops[i].time + activity.whirlpool,
      post_boil_volume, (inflow.og + sg)/2.0, activity.hops[i].form, activity.hops[i].usage);

  outflow.vol = post_boil_volume - equipment.boil_loss;
  outflow.og  = sg;
  outflow.fg  = sg;
  outflow.abv = inflow.abv;
  outflow.ebc = inflow.ebc + constants.color_adjustment; // CHECK HOW TO TAKE INTO ACCOUNT WORT VOLUME!!
  outflow.ibu = inflow.ibu + ibu;
  outflow.co2 = inflow.co2;

  // water addition during boil
  add_water(outflow, activity.water);

  // sugar additions during boil
  add_sugar(outflow, activity.sucrose,  "Sucrose");
  add_sugar(outflow, activity.dextrose, "Dextrose");
  add_sugar(outflow, activity.dry_malt, "Dry malt extract");

  // drop possible wort use for carbonation with speise
  outflow.vol -= activity.speise;
};



ferment = function (inflow, activity, equipment, outflow) {

  var original_extract = conv.sg2p(inflow.og);
  var final_extract = original_extract;
  if (activity.yeast.attenuation)
    final_extract -= original_extract * activity.yeast.attenuation/100;
  var fg = conv.p2sg(final_extract);

  var co2 = 1.013 * Math.pow(2.71828182845904, -10.73797+2617.25/(activity.max_temp+273.15)) * 10;

  // source: http://www.cotubrewing.com/homebrewing/alcohol-content-formula/
  var abv = (1.05/0.79) * ((inflow.og - fg) / fg) * 100;
  if (abv < 0) abv = 0.0;

  outflow.vol = inflow.vol - equipment.fermentation_loss;
  outflow.og  = inflow.og;
  outflow.fg  = fg;
  outflow.abv = inflow.abv + abv;
  outflow.ebc = inflow.ebc;
  outflow.ibu = inflow.ibu;
  outflow.co2 = co2;

  // water addition
  add_water(outflow, activity.water);

  // sugar additions
  add_sugar(outflow, activity.sucrose,  "Sucrose");
  add_sugar(outflow, activity.dextrose, "Dextrose");
  add_sugar(outflow, activity.dry_malt, "Dry malt extract");

};


bottle = function (inflow, activity, equipment, outflow) {

  var prime_co2 = 0.0;
  var speise_volume = 0.0;
  var prime_abw = 0.0

  prime_co2 += activity.sucrose * constants.sucrose_to_CO2_conversion;
  prime_abw += activity.sucrose * (1 - constants.sucrose_to_CO2_conversion);

  prime_co2 += activity.dextrose * constants.dextrose_to_CO2_conversion;
  prime_abw += activity.dextrose * (1 - constants.dextrose_to_CO2_conversion);

  prime_co2 += activity.dry_malt * constants.extract_to_CO2_conversion;
  prime_abw += activity.dry_malt * (1 - constants.extract_to_CO2_conversion);

  speise_volume = activity.speise;
  prime_co2 += 0.5 * 0.82 * speise_volume * inflow.og * conv.sg2p(inflow.og)*10 *
             (inflow.og - inflow.fg) / (inflow.og -1) / (inflow.vol + speise_volume);

  var prime_abv = prime_abw / 0.794 / 10.0;

  outflow.vol = inflow.vol - equipment.bottling_loss + speise_volume;
  outflow.og  = inflow.og;
  outflow.fg  = inflow.fg;
  outflow.abv = inflow.abv + prime_abv;
  outflow.ebc = inflow.ebc;
  outflow.ibu = inflow.ibu;
  outflow.co2 = inflow.co2 + prime_co2;
};


// split flow into two: user-defined volume is moved to new recipe,
// the rest of the volume is kept in current recipe
split = function (inflow, activity, outflow) {

 outflow = JSON.parse(JSON.stringify(inflow)); // copy inflow to outflow by value

 if (jQuery.isEmptyObject(activity.source_split))
   outflow.vol = outflow.vol - activity.vol; // source recipe
 else
   outflow.vol = activity.source_split.vol; // target recipe
}

// merges two flows: calculates merged properties only for target recipe
merge = function (inflow, activity, outflow) {

 if (!jQuery.isEmptyObject(activity.source_flow)) {
   var wort = inflow;
   var merge_wort = activity.source_flow;

   outflow.vol = wort.vol + merge_wort.vol;
   outflow.og  = (wort.og * wort.vol + merge_wort.og * merge_wort.vol) / (wort.vol + merge_wort.vol);
   outflow.fg  = (wort.fg * wort.vol + merge_wort.fg * merge_wort.vol) / (wort.vol + merge_wort.vol);
   outflow.abv = (wort.abv * wort.vol + merge_wort.abv * merge_wort.vol) / (wort.vol + merge_wort.vol);
   outflow.ebc = (wort.ebc * wort.vol + merge_wort.ebc * merge_wort.vol) / (wort.vol + merge_wort.vol);
   outflow.ibu = (wort.ibu * wort.vol + merge_wort.ibu * merge_wort.vol) / (wort.vol + merge_wort.vol);
   outflow.co2 = (wort.co2 * wort.vol + merge_wort.co2 * merge_wort.vol) / (wort.vol + merge_wort.vol);
 }
};

module.exports = {
//  get_ibu : get_ibu,
  mash    : mash,
  boil    : boil,
  ferment : ferment,
  bottle  : bottle,
  split   : split,
  merge   : merge,
};
