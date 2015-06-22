Package.describe({
  name: 'mjr:level-two',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use(['minimongo', 'mongo', 'templating'], 'client');
  api.use(['mongo', 'livedata'], ['server']);
  api.addFiles(['common.js']);
  api.addFiles(['level-two.js'], 'server');
  api.export(['Bids', 'Asks']);
  api.export('level_two_writer', 'server');

});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('mjr:level-two');
  api.addFiles('level-two-tests.js');
});
Npm.depends({websocket: "1.0.19"});