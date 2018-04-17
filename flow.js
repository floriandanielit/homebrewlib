// functions for flow management

// create generic, named flow
create = function (name) {
  return {
    type   : 'flow',
    name   : name,
    plan : { vol: 0, og: 1, fg: 1, abv: 0, ebc: 0, ibu: 0, co2: 0 },
    real : { vol: 0, og: 1, fg: 1, abv: 0, ebc: 0, ibu: 0, co2: 0 }
  };
};

// split flow into two: user-defined volume is moved to new recipe,
// the rest of the volume is kept in current recipe
split = function (inflow, params, outflow) {

  outflow.plan = JSON.parse(JSON.stringify(inflow.plan)); // copy inflow to outflow by value

  if (!params.source_split)
    outflow.plan.vol = outflow.plan.vol - params.vol; // source recipe
  else
    outflow.plan.vol = params.source_split.params.vol; // target recipe
}

// merges two flows: calculates merged properties only for target recipe
merge = function (inflow, params, outflow) {

  if (params.source_flow) {
    var wort = inflow.plan;
    var merge_wort = params.source_flow.plan;

    outflow.plan = {
      vol : wort.vol + merge_wort.vol,
      og  : (wort.og * wort.vol + merge_wort.og * merge_wort.vol) / (wort.vol + merge_wort.vol),
      fg  : (wort.fg * wort.vol + merge_wort.fg * merge_wort.vol) / (wort.vol + merge_wort.vol),
      abv : (wort.abv * wort.vol + merge_wort.abv * merge_wort.vol) / (wort.vol + merge_wort.vol),
      ebc : (wort.ebc * wort.vol + merge_wort.ebc * merge_wort.vol) / (wort.vol + merge_wort.vol),
      ibu : (wort.ibu * wort.vol + merge_wort.ibu * merge_wort.vol) / (wort.vol + merge_wort.vol),
      co2 : (wort.co2 * wort.vol + merge_wort.co2 * merge_wort.vol) / (wort.vol + merge_wort.vol)
    };
  }
};



module.exports = {
  create : create,
  split  : split,
  merge  : merge,
};
