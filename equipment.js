// contains constants needed in calculations
// The equipment settings describe the properties of the brew equipment.
// The proposed values refer to my own 50l brew equipment and are meant
// to be overwritten with custom values by the user

module.exports = {

  mash_max_volume : 50,
  mash_efficiency_weight : 0.751,
  mash_efficiency_potential : 0.91,
  mash_false_bottom_volume: 5,
  mash_loss : 0,

  sparge_max_volume : 50,

  boil_max_volume : 70,
  boil_evaporation_rate : 8.3,
  boil_loss : 2,

  whirlpool_loss : 0,

  fermentation_max_volume: 60,
  fermentation_loss: 1.5,

};
