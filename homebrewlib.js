var homebrewlib = (function () {

//// private variable declarations

  // amount of water (liters) absorbed by by 1 kg of grain (emprical value)
  // source:
  var grain_absorption = 1.0;


//// private function declarations

  // transforms temperature from Celsius to Fahrenheit
  var celsius_to_fahrenheit = function (temp) {
    return temp * 9/5 + 32;
  };

  // transforms temperature from Fahrenheit to Celsius
  var fahrenheit_to_celsius = function (temp) {
    return (temp - 32) * 5/9;
  };



//// Reveal pointers to the private functions to be revealed publicly

  return {
    grain_absorption: grain_absorption,
    celsius_to_fahrenheit: celsius_to_fahrenheit,
    fahrenheit_to_celsius: fahrenheit_to_celsius
  }

})();
