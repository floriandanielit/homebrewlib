module.exports = {

//// variable declarations

  // amount of water (liters) absorbed by 1 kg of grain (average, emprical value)
  // source: https://byo.com/bock/item/410-calculating-water-usage-advanced-brewing
  grain_absorption: 1.0,


//// private function declarations

  // transforms temperature from Celsius to Fahrenheit
  c2f: function (temp) {
    return temp * 9/5 + 32;
  },

  // transforms temperature from Fahrenheit to Celsius
  f2c: function (temp) {
    return (temp - 32) * 5/9;
  }

};
