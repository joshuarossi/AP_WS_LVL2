Package.describe({
  name: 'mjr:ap-ws-lvl2',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: "API client to access Bitfinex Level 2 (Orderbook) Market Data via Alphapoint's Websocket Feed",
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/joshuarossi/AP_WS_LVL2.git',
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
  api.use('mjr:ap-ws-lvl2');
  api.addFiles('level-two-tests.js');
});
Npm.depends({websocket: "1.0.19"});