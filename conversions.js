module.exports = {

  // temperature from Celsius to Fahrenheit
  // example: 0˚C >> 32F
  c2f : function (temp) {
    return temp * 9/5 + 32;
  },

  // temperature from Fahrenheit to Celsius
  // example: 32F >> 0˚C
  f2c : function (temp) {
    return (temp - 32) * 5/9;
  },

  // volume from gallons to liters
  // example: 5 gal >> 7,57 l
  gal2l : function (vol) {
    return vol * 3.78541;
  },

  // volume from liters to gallons
  // example: 10 l >> 2,64 gal
  l2gal : function (vol) {
    return vol / 3.78541;
  },

  // ounces to grams
  // example: 1 oz >> 28.35 g
  oz2g : function (qty) {
    return qty * 28.3495;
  },

  // grams to ounces
  // example: 50 g >> 1.76 oz
  g2oz : function (qty) {
    return qty / 28.3495;
  },

  // pound to kg
  // example: 5 lbs >> 2.27 kg
  lbs2kg : function (qty) {
    return qty * 0.453592;
  },

  // kg to pound
  // example: 10 kg >> 22.05 lbs
  kg2lbs : function (qty) {
    return qty / 0.453592;
  },

  // specific gravity to degrees Plato
  // source: https://www.brewersfriend.com/plato-to-sg-conversion-chart/
  // example: 1.050 SG >> 12.4˚P
  sg2p : function (sg) {
    //return -205.347*sg*sg + 668.72*sg - 463.37;
    return -616.868 + 1111.14*sg - 630.272*sg*sg + 135.997*sg*sg*sg;
  },

  // degrees Plato to specific gravity
  // source: https://www.brewersfriend.com/plato-to-sg-conversion-chart/
  // example: 15˚P >> 1.061 SG
  p2sg : function (p) {
    return 1 + p / (258.6 - p/258.2*227.1);
  },

  // transform Brix values of non fermented wort, given the refractometer's correction factor
  // source: https://byo.com/malt/item/1313-refractometers
  obrix2sg : function (obrix, correction) {
    var brix = obrix / correction;
    return 1.000019 + 0.003865613*brix + 0.00001296425*brix*brix + 0.00000005701128*brix*brix*brix;  // CHECK POWERS!!!
  },

  // transform Brix values of fermenting/fermented wort
  // source: http://digitaleditions.walsworthprintgroup.com/publication/frame.php?i=415999&p=1&pn=&ver=html5
  fbrix2sg : function (fbrix, correction, obrix) {
    return 1 - 0.002349*obrix/correction + 0.006276*fbrix/correction;
  },

  // calculate ABW from Brix readings
  // source: http://digitaleditions.walsworthprintgroup.com/publication/frame.php?i=415999&p=1&pn=&ver=html5
  get_ABW : function (obrix, fbrix, correction) {
    return 0.67062*obrix / correction - 0.66091*fbrix/correction;
  },

  // calculate ABV from SG and ABW
  // source: http://digitaleditions.walsworthprintgroup.com/publication/frame.php?i=415999&p=1&pn=&ver=html5
  ABW2ABV : function (sg, abw) {
    return sg * abw / 0.791;
  }

};


// transformations to be checked and published
/*      'og': function() {
      this.obrix = ((143.254*this.og*this.og*this.og - 648.670*this.og*this.og + 1125.805*this.og - 620.389)* this.refractometer.correction).toFixed(1); // approximation to be checked
      this.oplato = homebrewlib.sg2p(this.og).toFixed(1);
    },
    'oplato': function() {
      this.og = homebrewlib.p2sg(this.oplato).toFixed(3);
      this.obrix = ((143.254*this.og*this.og*this.og - 648.670*this.og*this.og + 1125.805*this.og - 620.389)* this.refractometer.correction).toFixed(1); // approximation to be checked
    }, */
/*      'fg': function() {
      this.fbrix = ((this.fg - 1 + 0.002349*this.obrix/this.refractometer.correction) / 0.006276 * this.refractometer.correction).toFixed(1);
      this.fplato = homebrewlib.sg2p(this.fg).toFixed(1);
    },
    'fplato': function() {
      this.fg = homebrewlib.p2sg(this.fplato).toFixed(3);
      this.fbrix = ((this.fg - 1 + 0.002349*this.obrix/this.refractometer.correction) / 0.006276 * this.refractometer.correction).toFixed(1);
    }, */
