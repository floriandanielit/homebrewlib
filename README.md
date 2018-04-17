# homebrewlib
A JavaScript library for homebrew recipe calculations.

Hombrewlib is a **model-driven design instrument for beer recipes**. You need to have basic knowledge of brewing, e.g., you are a home or professional brewer, to be able to profitably use the library. If you have this knowledge, the library will provide you with **unprecedented flexibility** in the design of your recipes, compared to conventional brewing software.

You can easily set up a brew process in which you diverge from the classical mash-boil-ferment-bottle process and, for example, add a double mash step (mash1-mash2-boil-ferment-bottle) to make your extra-strong, triple, imperial version of a beer where you use the wort produced by the first mash step as "mash water" of the second mash step. You can also split recipes, process the respective wort differently, and merge the result again. The more creative your are, the more fun it will be.

**Attention:** The library is still work in progress and may change over the next months.


# Installation
## In node

Use [npm](https://www.npmjs.com/) in your local folder to add homebrewlib
to your project:
```
npm install homebrewlib
```


## In your browser

Include the minified version of the library (`homebrewlib.min.js`) you can
find in the subfolder `dist` of this repository:
```
<script src="homebrewlib.min.js"></script>
```
If you are only interested in using homebrewlib in your browser without modifying its code, you do not need to install the library using node. Just download the referenced `homebrewlib.min.js` and add it to the
source files of your application.


## Generate your own browser-friendly version
If instead you make changes to the node module, you may want to re-generate a
browser-friently version as well for your personal use.
You'll need [uglifyjs](https://github.com/mishoo/UglifyJS2) and
[browserify](http://browserify.org/). If you did not yet install them,
do so by following the instructions you can find on their websites. Note:
you'll have to install both modules as **global** modules.

Now, first **uglify** the library as follows:
```
uglifyjs index.js -o ugly.js
```
`ugly.js` is just a temporary name; you can use here whatever you want,
as long as you use it also in the next instruction that you'll use to make
the library ready for your browser, that is you **browserify** it:
```
browserify ugly.js --standalone homebrewlib > homebrewlib.min.js
```
You see, `ugly.js` is the input file we want to process. The option
`--standalone` makes homebrewlib available in the browser through a
global object. `homebrewlib` is the name of the object and `homebrewlib.min.js`
the name of the JavaScript file to be created. This is the file you can include
in your HTML code as shown above.


# Usage: calculating a beer recipe

A beer recipe is expressed by providing (i) the **ingredients** that will go into the beer and (ii) the **brew process** that will use these ingredients and transform water into beer. This is different from how brewing software usually works: there is no need to describe the brewing process, as that is already hard-coded in the software (brew-boil-ferment-bottle); you merely follow this process and configure the ingredients you want to use. Well, the purpose of homebrewlib is exactly to enable you to configure your very own brew process and to get creative with your brewing.

The following lines creates an **empty process model**:

```
var hb = require('homebrewlib'); // loads the library
var recipe = hb.newRecipe();     // creates a new recipe object
```

If you work inside your browser and use the browserified version of homebrewlib, after including it in the HTML code of your page you will have a new JavaScript environment variable called ```homebrewlib``` at your disposal. This variable will behave exactly like the variable ```hb``` just created in node. So, consider them interchangeable depending on which environment you are working in.


## Modeling the brew steps

The brew process is configured by assembling a set of brewing activities (also called steps). Process definition starts from an input **flow** (the mash water) to which one can add an **activity** to process it. Adding an activity also adds a new flow to the process model. The flow before the activity represents the water/wort in input to the activity; the flow after the activity represents the water/wort as produced by the activity. Each activity must be configured with the ingredients to use and some process parameters, such as the quantity of sparge water or the boil time. Each activity may be different. Concrete usage examples are commented in the code.

Let's add a mash and a boil step to the recipe created before and inspect the resulting process model:

```
recipe.add_mash(); // add steps
recipe.add_boil();

recipe.process; // process stores the model of the brew process
```

The result will be a JSON-formatted array of the form ```[flow, activity, flow,...]```. Flows are characterized, among others, by a volume in liters, the original gravity reading of the wort, its EBC color, etc. Activities are characterized by the ingredients they use and the configurations of the activity. The full list of activities can be found in the code (index.js).

As of now, flow properties should only be read, while activity properties are to be written. This will change in the future, in order to support also the live editing of a recipe during brew day without however modifying the initial plan.


## Splitting and merging wort

A recipe may be **split** in two and, if needed, merged again. For example, if you want to compare the flavors of two different yeast strains or two different dry hopping configurations starting from a same wort, you can proceed as follows (I continue using the variables defined above):

```
var branch = hb.newRecipe(); // create a second recipe for the branch

recipe.split(2, branch); // split in position 2 (after mashing)

branch.add_boil(); // configure your branch like any other recipe
```

If you have a look at the internal process models of the two recipes, you will see that a new activity Split has been introduced into the model and that the two recipes link each other. The reason for this is that ```branch``` now depends on ```recipe``` for all the activities preceding the Split (depending means its activities and flows are pointer references to the respective activities and flows of ```recipe```). Splitting a recipe works only on flow nodes.

Similarly, **merging** two recipes requires two flow nodes. If we assume the two recipes ```recipe``` and ```branch``` have been configured with other activities and that we want to merge the flow at position 5 of the latter with the flow at position 7 of the former, we can proceed like this:

```
branch.merge(5, recipe, 7);
```

After this instruction, ```branch``` will be left with an empty output flow (volume of 0 liters), and ```recipe``` will have increased the volume of its output flow and updated its properties accordingly.


## Brewing a recipe

So far, this was all about modeling the brewing process and setting up each activity with ingredients and configurations. Let's now understand how to actually **brew a recipe**, that is, how to calculate the properties of the final beer given a ready recipe. This is actually very simple:

```
recipe.brew();
```

The function ```brew()``` starts from the first flow (the mash water) of the process and incrementally enacts brewing activities, each time updating the respective output flows. If a recipe has a split, like in the case of ```recipe``` which has a ```branch``` recipe, it is enough to enact the ```brew()``` function on the parent recipe ```recipe``` to brew also all dependent recipes.

Enacting an activity means calling the actual brew function associated with the activity implemented in the file ```brew.js```. Each activity has an own implementation that processes in the input flow and produces an updated output flow.


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
