# homebrewlib
A JavaScript library for homebrew recipe calculations

# Node.js

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

# In your browser

## Installation
Include the minified version of the library (`homebrewlib.min.js`) you can
find in the subfolder `browser/` of module:
```
<script src="homebrewlib.min.js"></script>
```

## Usage
Once the JavaScript file has been loaded, homebrewlib is globally accessible
through the object `homebrewlib`. For instance, `homebrewlib.grain_absorption`
will provide you access the the variable, and `homebrewlib.c2f()` will provide
you access to the function transforming Celsius temperatures into Fahrenheit.

# Generation of browser-friendly version
You'll need [uglifyjs](https://github.com/mishoo/UglifyJS2) and
[browserify](http://browserify.org/). If you did not yet install them,
do so by following the instructions you can find on their websites. Note:
you'll have to install both modules as **global** modules.

Now, first uglify the library as follows:
```
uglifyjs index.js -o ugly.js
```
`ugly.js` is just a temporary name; you can use here what aver you want,
as long as you use it also in the next instruction that we use to make the
library ready for your browser:
```
browserify ugly.js --standalone homebrewlib > homebrewlib.min.js
```
You see, `ugly.js` is the input file we want to process. The option
`--standalone` makes the homebrewlib available in browser through a
global object. `homebrewlib` is the name of the object and `homebrewlib.min.js`
the name of the JavaScript file to be created. This is the file you can include
in your HTML code as shown above.
