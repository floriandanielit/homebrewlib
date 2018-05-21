var constants = require('./constants.js');
var conv      = require('./conversions.js');

// calculates the fermentation attenuation from Plato readings
get_attenuation = function (oplato, fplato) {
  if (oplato != 0)
    return 100 - fplato/oplato*100;
  return 0;
}

// calculates the IBUs for one hop addition according to Tinseth
// source: http://realbeer.com/hops/research.html
// example: hop addition with 5.0% AA, 50g, 60mins, 60l, 1.035 SG >> 31 IBUs
get_IBU = function (aa, weight, minutes, volume, sg, form, usage) {

  var alpha_acids = aa/100 * weight * 1000 / volume;
  var bigness_factor = 1.65 * Math.pow( 0.000125, sg-1 );
  var boil_time_factor = (1 - Math.exp(-0.04 * minutes))/4.15;
  var utilization = bigness_factor * boil_time_factor;
  var increment = 1;
  if (form === 'pellet') increment += 0.1;
  if (usage == "afterhotbreak" || usage == "whirlpool") increment += 0.1
  return alpha_acids * utilization * increment;
}


// dilutes wort with water
add_water = function (wort, water_addition) {

  var dilution_factor = wort.vol / (wort.vol + water_addition);

  wort.og = 1 + (wort.og - 1) * dilution_factor;
  wort.fg = 1 + (wort.fg - 1) * dilution_factor;
  wort.abv *= dilution_factor;
  wort.ebc *= dilution_factor;
  wort.ibu *= dilution_factor;
  wort.co2 *= dilution_factor;
  wort.vol += water_addition;
}


add_sugar = function (wort, quantity, type) {

  var correction = 1.0; // correction compared to spure ucrose
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
mash = function (inflow, params, outflow) {

  var ebc = 0;
  var total_grain_weigth = 0;
  for (var i = 0; i < params.malts.length; i++) {
    total_grain_weigth += params.malts[i].weight;
    ebc += params.malts[i].ebc * params.malts[i].weight;
  }
  ebc = ebc / total_grain_weigth + inflow.plan.ebc + constants.color_adjustment;
  if (isNaN(ebc)) ebc = 0;

  var extract = total_grain_weigth * params.mash_efficiency_weight;

  var volume = params.mash_water + params.sparge_water - total_grain_weigth * constants.grain_absorption;

  var a = 258.6;
  var b = 227.1/258.2;
  var eff = params.mash_efficiency_weight*100;
  var extract_plato = ( -(a+b*eff*total_grain_weigth/volume) +
                      Math.sqrt(Math.pow(a+b*eff*total_grain_weigth/volume,2) +
                      4*a*(1-b)*eff*total_grain_weigth/volume)) / (2-2*b);
  var sg = conv.p2sg(extract_plato);

  outflow.plan = {
    vol  : volume - params.mash_loss,
    og   : sg,
    fg   : sg,
    abv  : inflow.plan.abv,
    ebc  : ebc,
    ibu  : inflow.plan.ibu,
    co2  : inflow.plan.co2
  };
};


// boil wort
// supported ingredients: hops, water additions
boil = function (inflow, params, outflow) {

  // todo: calculare boil-off using boiling power not %
  // change of volume due to evaporation
  var post_boil_volume = inflow.plan.vol - params.boil_evaporation_rate * params.time/60;

  // specific gravity at end of boil
  var sg = 1 + (inflow.plan.og - 1) * inflow.plan.vol/post_boil_volume;

  // IBUs at end of boil
  var ibu = inflow.plan.ibu;
  for (i=0; i<params.hops.length; i++)
    ibu += get_IBU (params.hops[i].alphaAcids, params.hops[i].weight, params.hops[i].time + params.whirlpool,
      post_boil_volume, (inflow.plan.og + sg)/2.0, params.hops[i].form, params.hops[i].usage);

  outflow.plan = {
    vol  : post_boil_volume - params.boil_loss,
    og   : sg,
    fg   : sg,
    abv  : inflow.plan.abv,
    ebc  : inflow.plan.ebc,
    ibu  : ibu,
    co2  : inflow.plan.co2
  };

  // water addition during boil
  if (params.water_addition)
    add_water(outflow.plan, params.water_addition);

  // sugar addition during boil
  if (params.sugar_addition.qty)
    add_sugar(outflow.plan, params.sugar_addition.qty, params.sugar_addition.type);

    // drop possible wort use for carbonation with speise
    if (params.speise_volume)
      outflow.plan.vol -= params.speise_volume;
};



ferment = function (inflow, params, outflow) {

  var original_extract = conv.sg2p(inflow.plan.og);
  var final_extract = original_extract;
  if (params.yeast.attenuation)
    final_extract -= original_extract * params.yeast.attenuation/100;
  var fg = conv.p2sg(final_extract);

  var co2 = 1.013 * Math.pow(2.71828182845904, -10.73797+2617.25/(params.max_temperature+273.15)) * 10;

  // source: http://www.cotubrewing.com/homebrewing/alcohol-content-formula/
  var abv = (1.05/0.79) * ((inflow.plan.og - fg) / fg) * 100;
  if (abv < 0) abv = 0.0;

  outflow.plan = {
    vol  : inflow.plan.vol - params.fermentation_loss,
    og   : inflow.plan.og,
    fg   : fg,
    abv  : inflow.plan.abv + abv,
    ebc  : inflow.plan.ebc,
    ibu  : inflow.plan.ibu,
    co2  : co2
  };

  // take into account possible water addition during fermentation
  if (params.water_addition)
    add_water(outflow.plan, params.ferment.water_addition);

  // sugar addition during fermentation
  if (params.sugar_addition.qty)
    add_sugar(outflow.plan, params.sugar_addition.qty, params.sugar_addition.type);
};


bottle = function (inflow, params, outflow) {

  var prime_co2 = 0.0;
  var speise_volume = 0.0;
  var prime_abw = 0.0

  if (params.prime) {
    for (var i = 0; i < params.prime.length; i++) {

      if (params.prime[i].type == "Sucrose") {
        prime_co2 += params.prime[i].qty * constants.sucrose_to_CO2_conversion;
        prime_abw += params.prime[i].qty * (1 - constants.sucrose_to_CO2_conversion);
      }
      if (params.prime[i].type == "Dextrose") {
        prime_co2 += params.prime[i].qty * constants.dextrose_to_CO2_conversion;
        prime_abw += params.prime[i].qty * (1 - constants.sucrose_to_CO2_conversion);
      }
      if (params.prime[i].type == "Extract") {
        prime_co2 += params.prime[i].qty * constants.extract_to_CO2_conversion;
        prime_abw += params.prime[i].qty * (1 - constants.sucrose_to_CO2_conversion);
      }
      if (params.prime[i].type == "Speise") {
        speise_volume = params.prime[i].qty;
        prime_co2 += 0.5 * 0.82 * speise_volume * inflow.plan.og * conv.sg2p(inflow.plan.og)*10 *
                   (inflow.plan.og - inflow.plan.fg) / (inflow.plan.og -1) /
                   (inflow.plan.vol + speise_volume);
      }
    }
  }

  var prime_abv = prime_abw / 0.794 / 10;

  outflow.plan = {
    vol : inflow.plan.vol - params.bottling_loss + speise_volume,
    og  : inflow.plan.og,
    fg  : inflow.plan.fg,
    abv : inflow.plan.abv + prime_abv,
    ebc : inflow.plan.ebc,
    ibu : inflow.plan.ibu,
    co2 : inflow.plan.co2 + prime_co2
  };
};


module.exports = {
  mash    : mash,
  boil    : boil,
  ferment : ferment,
  bottle  : bottle,
  get_IBU : get_IBU
};
