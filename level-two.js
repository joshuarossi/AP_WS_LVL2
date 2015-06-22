Meteor.publish('bid_feed', function(){
  return Bids.find(
			{
		},
		{
			'sort': {'Price': -1},
      'limit': 200
		});
	});
Meteor.publish('ask_feed', function(){
  return Asks.find(
			{
		},
		{
			'sort': {'Price': 1},
      'limit': 200
		});
	});
level_two_enum = {
        UpdateID: 0,
        NumberOfAccounts: 1,
        UpdateDateTime: 2,
        ActionType: 3,
        LastTradePrice: 4,
        NumberOfOrders: 5,
        Price: 6,
        ProductPairCode: 7,
        Quantity: 8,
        Side: 9
}
Handler = function (frame) {
  frame = JSON.parse(frame.utf8Data);
  switch(frame.n) {
    case 'SubscribeLevel2': 
      frame = JSON.parse(frame.o);    
      frame.forEach(function(level_two_item){
        var price_level = {};
        Object.keys(level_two_enum).forEach(function(key){
          price_level[key] = level_two_item[level_two_enum[key]];
        });
        price_level['class'] = 'new';
        if (price_level.Side == 0){
          Bids.insert(price_level);
        }
        else {
          Asks.insert(price_level);
        }
        });
      break;
    case 'Level2UpdateEvent':
      frame = JSON.parse(frame.o);
      frame.forEach(function(level_two_update){
          if (level_two_update[level_two_enum.ActionType] == 0) {
            var price_level = {};
            Object.keys(level_two_enum).forEach(function(key){
              price_level[key] = level_two_update[level_two_enum[key]];
            });
            price_level['class'] = 'new';
            if (price_level.Side == 0){
              Bids.insert(price_level);
            }
            else {
              Asks.insert(price_level);
            }
          };
          if (level_two_update[level_two_enum.ActionType] == 1){
            var price_level = {};
            Object.keys(level_two_enum).forEach(function(key){
              price_level[key] = level_two_update[level_two_enum[key]];
            });
              price_level['class'] = 'changed';
              if (price_level.Side == 0){
                Bids.update({'Price': level_two_update[level_two_enum['Price']]}, {
                  $set: price_level
              });
              }
              else {
                Asks.update({'Price': level_two_update[level_two_enum['Price']]}, {
                  $set: price_level
              });
              }
            }
          if (level_two_update[level_two_enum.ActionType] == 2) {
            if (level_two_update[level_two_enum['Price']] == 0) {
              Bids.update({'Price': level_two_update[level_two_enum['Price']]}, {$set: {'class': 'remove'}});
              Meteor.setTimeout(function(){Bids.remove({'Price': level_two_update[level_two_enum['Price']]})}, 500);
            }
            else {
              Asks.update({'Price': level_two_update[level_two_enum['Price']]}, {$set: {'class': 'remove'}});
              Meteor.setTimeout(function(){Asks.remove({'Price': level_two_update[level_two_enum['Price']]})}, 500);
            }
            
          };
        });
        break;
    default:
        console.log(frame);
  }
};
LevelTwoWriter = function(){
	this.url = 'ws://websocket.bitfinex.com:8086/WSGateway/';
	this.WebSocketClient = Npm.require('websocket').client;
	this.client = new this.WebSocketClient();
  this.messageHandler = Meteor.bindEnvironment(Handler);
  this.client.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
  });
  var _this = this;
	this.client.on('connect', function(connection) {
      this.connection = connection;
      console.log('WebSocket Client Connected');
      connection.on('error', function(error) {
          console.log("Connection Error: " + error.toString());
      });
      connection.on('close', function() {
          console.log('echo-protocol Connection Closed');
          _this.connect(_this.url);
      });
      connection.on('message', function(message) {
          _this.messageHandler(message);
      });
  });
  this.subscribe = function () {
    var frame = {};
    frame.m = 0;
    frame.i = 2;
    frame.n = "SubscribeLevel2";
    frame.o = JSON.stringify(
    	{
        	"ExchangeID":"0",
          "ProductPairID":"1"
      });
    console.log('Subscribing to Level Two websocket feed...');
    _this.client.connection.send(JSON.stringify(frame));
    console.log('Subscribed successfully');
  };
  this.connect = function (){
    _this.client.connect(_this.url);
    };
};
Bids.remove({});
Asks.remove({});
console.log("DB cleared");
level_two_writer = new LevelTwoWriter();
level_two_writer.connect();
Meteor.setTimeout(level_two_writer.subscribe, 1000);