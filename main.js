var bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;

var TransferCharacteristic = require('./ble');

console.log('bleno - echo');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    console.log("Staring to advertise")
    bleno.startAdvertising('Federeto', ['13333333-3333-3333-3333-333333333337']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: '13333333-3333-3333-3333-333333333337',
        characteristics: [
          new TransferCharacteristic()
        ]
      })
    ]);
  }
});