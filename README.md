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

# Testing
## Setting UP
Run:

`npm install`

To install the package needed for testing.

*While homebrewLib works in a browser environment (without nodeJS), tests
require some npm packages to work.*
## Running test
Run:

`npm run test` 

Open the generated file `mochawesome-report/mochawesome.html` in your favourite browser to check tests output.

The test script is located in the script section of `package.json`. Edit it according to your needs.

Mocha timeout can be changed using the flag `--timeout XXX` where `XXX` is a number in millisecond:
some test may require a higher timeout depending on the code tested.

## How to write a test
Create a file *.js containing the code for the test in the directory `./test`. This file should have the same name of
the file which contains the code you're testing (but it's not mandatory). Include this new file in `./test/index.html`
using the HTML `script` tag:

`<script href="path_to_your_file.js">`

after the line 

`<script>mocha.setup('bdd')</script>`

and before the `<script>` tag containing `mocha.run()`

Then run the test using the instructions provided above.


*If your test script uses libraries, remember to load these before including file containing the tests*
