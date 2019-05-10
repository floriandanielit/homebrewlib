# homebrewlib
A JavaScript library for homebrew recipe calculations.

Hombrewlib is a **model-driven design instrument for beer recipes**. You need to have basic knowledge of brewing, e.g., you are a home or professional brewer, to be able to profitably use the library. If you have this knowledge, the library will provide you with **unprecedented flexibility** in the design of your recipes, compared to conventional brewing software.

You can easily set up a brew process in which you diverge from the classical mash-boil-ferment-bottle process and, for example, add a double mash step (mash1-mash2-boil-ferment-bottle) to make your extra-strong, triple, imperial version of a beer where you use the wort produced by the first mash step as "mash water" of the second mash step. You can also split recipes, process the respective wort differently, and merge the result again. Or you may just want to split your wort after boiling, try different dry hopping options during fermentation, and have an integrated view of your experimental setting for documentation.

Homebrewlib allows you to do just that. The more creative your are, the more fun it will be.

**Attention:** The library is work in progress and may change over the next months.


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

The following lines create an **empty process model**:

```
var hb = require('homebrewlib'); // loads the library
var recipe = hb.new();           // creates a new recipe object
```

If you work inside your browser and use the browserified version of homebrewlib, after including it in the HTML code of your page you will have a new JavaScript environment variable called ```homebrewlib``` at your disposal. This variable will behave exactly like the variable ```hb``` just created in node. So, consider them interchangeable depending on which environment you are working in.


## Modeling the brew steps

The brew process is configured by assembling a set of brewing activities (also called steps). Process definition starts from an input **flow** (the mash water) to which one can add an **activity** to process it. Adding an activity also adds a new flow to the process model. The flow before the activity represents the water/wort in input to the activity; the flow after the activity represents the water/wort as produced by the activity. Each activity must be configured with the ingredients to use and some process parameters, such as the quantity of sparge water or the boil time. Each activity may be different. Concrete usage examples are commented in the code.

See the file ```model.js``` for the list of available brewing activities that are supported by the library. As of now, the supported activities are: mash, boil, ferment, bottle. The set of activities can easily be extended by implementing suitable model structured and according brewing functions (implemented in ```logic.js```).

Let's add a mash and a boil step to the recipe created before and inspect the resulting process model:

```
recipe.add(hb.model.mash); // add steps
recipe.add(hb.model.boil);

recipe.process; // process stores the model of the brew process
```

The first two instructions add a mash and a boil step to the brew process. Technically, the ```add()``` function copies by value the referenced data structures of ```hb.model```, which provides access to the model elements contained in ```model.js```.

In addition, after each new brew activity added to the model, the function also adds a corresponding outflow to the model. The internal result is thus a JSON-formatted array of the form ```[flow, activity, flow,...]```. Flows are characterized, among others, by a volume in liters, the original gravity reading of the wort, its EBC color, etc. Activities are characterized by the ingredients they use and the configurations of the activity.

The model of the brew process after the two lines above will thus have the following form: ```[flow, mash, flow, boil, flow]```.



## Configuring brew activities

The previous instructions just created the model of our brewing process by concatenating activities. This model is accessible via the ```process``` property of the recipe. In order for a model to be ready for brewing, i.e., for computation, it is now necessary to properly configure each of the inserted brewing activities.

Let's have a look at the structure of the activity ```mash``` as specified in ```model.js```:

```
mash : {
  name  : "Mash",     // name of activity
  run   : logic.mash, // name of function implementing activity
  malts : [],         // list of malts to be mashed, see internal model below
  water : 0.0,        // sparge water in l
},
```

The name of the activity is given, as is the connection with the function that implements the mashing logic in ```logic.js```. You may change the name if you wish, but you should not change the function associated with the activity as this would prevent the recipe from correctly interpreting the activity.

What you can add in order to specify your very own beer recipe are the malts you want to use and the amount of sparge water. The amount of mash water we set by adjusting the ```vol``` property of the inflow. The mashing of our beer can thus be configured as follows (adding two different malts to the recipe):

```
recipe.process[0].vol = 40; // sets the mash water in liters

recipe.process[1].water = 30; // sets the sparge water in liters
recipe.process[1].malts[0] = {
  name : 'Pilsner',
  form : "grain",
  weight : 9.0,
  ebc : 4 };
recipe.process[1].malts[1] = {
  name : 'Munich',
  form : "grain",
  weight : 2.0,
  ebc : 30 };
```

The configuration of the other brewing activites proceeds analogously: name and function are given, the rest are properties to be set by the user.



## Splitting and merging wort

A recipe may be **split** in two and, if needed, merged again. For example, if you want to compare the flavors of two different yeast strains or two different dry hopping configurations starting from a same wort, you can proceed as follows (I continue using the variables defined above):

```
var branch = hb.newRecipe(); // create a second recipe for the branch

recipe.split(2, branch); // split in position 2 (after mashing)

branch.add(hb.model.boil); // configure your branch like any other recipe
```

If you have a look at the internal process models of the two recipes, you will see that a new activity "Split" has been introduced into the model and that the two recipes link each other. The reason for this is that ```branch``` now depends on ```recipe``` for all the activities preceding the split (depending means its activities and flows are pointer references to the respective activities and flows of ```recipe```). Splitting a recipe works only on flow nodes.

Similarly, **merging** two recipes requires two flow nodes. If we assume the two recipes ```recipe``` and ```branch``` have been configured with other activities and that we want to merge the flow at position 6 of the latter with the flow at position 8 of the former, we can proceed like this:

```
branch.merge(6, recipe, 8);
```

After this instruction, ```branch``` will be left with an empty output flow (volume of 0 liters), and ```recipe``` will have increased the volume of its output flow and updated its properties accordingly.

**Attention**: when splitting or merging a recipe, the respective functions automatically add suitable "Split" or "Merge" activities to the process model. As a recipe is essentially an array of activities and flows, this means that splitting or merging inserts two new elements into the array (activitiy plus new outflow) and shifts to the right possible other activities and flows after the position where the split/merge is to be inserted.


## Brewing a recipe

So far, this was all about modeling the brewing process and setting up each activity with ingredients and configurations. Let's now understand how to actually **brew a recipe**, that is, how to calculate the properties of the final beer given a ready recipe. This is actually very simple:

```
recipe.brew();
```

The function ```brew()``` starts from the first flow (the mash water) of the process and incrementally enacts brewing activities, each time updating the respective outflows. If a recipe has a split, like in the case of ```recipe``` which has a ```branch``` recipe, it is enough to enact the ```brew()``` function on the parent recipe ```recipe``` to brew also all dependent recipes.

Enacting an activity means calling the actual brew function associated with the activity implemented in the file ```logic.js```. Each activity has an own implementation that processes the inflow and produces an updated outflow.


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
