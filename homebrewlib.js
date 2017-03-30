var homebrewlib = (function () {

//// private variable declarations

  const myGrades = [93, 95, 88, 0, 55, 91];


//// private function declarations

  var average = function () {
    var total = myGrades.reduce(function (accumulator, item) {
      return accumulator + item;
    }, 0);

    return 'Your average grade is ' + total / myGrades.length + '.';
  };


  var failing = function (level=90) {
    var failingGrades = myGrades.filter (function(item) {
        return item < level;
      });

    return 'You failed ' + failingGrades.length + ' times.';
  };


//// Reveal pointers to the private functions to be revealed publicly

  return {
    average: average,
    failing: failing
  }

})();
