require.config({
  baseUrl: "scripts/",
  urlArgs: "bust=" + (new Date()).getTime()
});

require(['AccessBase', 'model/EffectConfiguration', 'tools/random'], function(AccessBase, EffectConfiguration, random) {
  var accessBase = AccessBase.mock();
  var program = random.element(accessBase.programs());

  accessBase.addListener('programChanged', function(a,b) {
    console.log(arguments);
  });

  var config = EffectConfiguration.effects(['loop omhoog'], accessBase);
  var newProgram = program.withConfiguration(config);

  console.log(config.getUnusedComponents());

  accessBase.updateProgram(program, newProgram);
});


require(['AccessBase', 'model/EffectConfiguration', 'tools/random'], function(AccessBase, EffectConfiguration, random) {
  var accessBase = AccessBase.mock();

  var program = random.element(accessBase.programs()).toJSON();

  $.ajax({
    url: '/api/program',
    type: 'POST',
    data: JSON.stringify(program),
    contentType: 'text/javascript'});
});
