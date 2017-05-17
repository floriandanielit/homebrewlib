//// basic conversion/brewing functions

// temperature from Celsius to Fahrenheit
// example: 0˚C >> 32F
c2f = function (temp) {
  return temp * 9/5 + 32;
};

// temperature from Fahrenheit to Celsius
// example: 32F >> 0˚C
f2c = function (temp) {
  return (temp - 32) * 5/9;
};

// specific gravity to degrees Plato
// source: https://www.brewersfriend.com/plato-to-sg-conversion-chart/
// example: 1.050 SG >> 12.4˚P
sg2p = function (sg) {
  //return -205.347*sg*sg + 668.72*sg - 463.37;
  return -616.868 + 1111.14*sg - 630.272*sg*sg + 135.997*sg*sg*sg;
};

// degrees Plato to specific gravity
// source: https://www.brewersfriend.com/plato-to-sg-conversion-chart/
// example: 15˚P >> 1.061 SG
p2sg = function (p) {
  return 1 + p / (258.6 - p/258.2*227.1);
};
