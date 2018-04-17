module.exports = {

  // Amount of water (liters) absorbed by 1 kg of grain (average, emprical value)
  // Source: https://byo.com/bock/item/410-calculating-water-usage-advanced-brewing
  grain_absorption : 1.04,

  // Volume in l occupied by 1 kg of grains
  // Source: https://byo.com/bock/item/410-calculating-water-usage-advanced-brewing
  grain_volume : 0.67,

  // CO2 produced by fermenting sugar (percentage of weight)
  // source: http://braukaiser.com/wiki/index.php?title=Accurately_Calculating_Sugar_Additions_for_Carbonation
  sucrose_to_CO2_conversion  : 0.51,
  dextrose_to_CO2_conversion : 0.51 * 0.91,
  extract_to_CO2_conversion  : 0.51 * 0.82 * 0.80,

  // Color adjustment in EBC during wort production
  // source:
  color_adjustment : 3

};
