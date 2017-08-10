# homebrewlib
A JavaScript library for homebrew recipe calculations.

**Attention:** The library is still work in progress and will change considerably in the near future (April 2, 2017).

# For node.js

## Installation
Use [npm](https://www.npmjs.com/) in your local folder to add homebrewlib
to your project:
```
npm install homebrewlib
```

## Usage
```
var homebrewlib = require('homebrewlib');
console.log(homebrewlib.grain_absorption);  // prints the value of the variable
console.log(homebrewlib.c2f(0)); // transforms Celsius into Fahrenheit
```

# For your browser

## Installation
Include the minified version of the library (`homebrewlib.min.js`) you can
find in the subfolder `dist` of this module:
```
<script src="homebrewlib.min.js"></script>
```
In order to make this work, you do not need to install first the library in
node.js. Just download the referenced `homebrewlib.min.js` and add it to the
source files of your application.

## Usage
Once the JavaScript file has been loaded, homebrewlib is globally accessible
through the object `homebrewlib`. For instance, `homebrewlib.grain_absorption`
will provide you access the the variable, and `homebrewlib.c2f()` will provide
you access to the function transforming Celsius temperatures into Fahrenheit.

# Generate your own browser-friendly version
If you make changes to the node module, you may want to re-generate a
browser-friently version as well for your personal use.
You'll need [uglifyjs](https://github.com/mishoo/UglifyJS2) and
[browserify](http://browserify.org/). If you did not yet install them,
do so by following the instructions you can find on their websites. Note:
you'll have to install both modules as **global** modules.

Now, first **uglify** the library as follows:
```
uglifyjs index.js -o ugly.js
```
`ugly.js` is just a temporary name; you can use here what aver you want,
as long as you use it also in the next instruction that you'll use to make
the library ready for your browser, that is you **browserify** it:
```
browserify ugly.js --standalone homebrewlib > homebrewlib.min.js
```
You see, `ugly.js` is the input file we want to process. The option
`--standalone` makes homebrewlib available in browser through a
global object. `homebrewlib` is the name of the object and `homebrewlib.min.js`
the name of the JavaScript file to be created. This is the file you can include
in your HTML code as shown above.
