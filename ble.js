var util = require('util');
var bleno = require('bleno');
var strbyte = require('convert-string')
var data = require('./data.json');
var fs = require('fs')

var BlenoCharacteristic = bleno.Characteristic;

var TransferCharacteristic = function () {
  TransferCharacteristic.super_.call(this, {
    uuid: '13333333-3333-3333-3333-333333330001',
    properties: ['read', 'write', 'notify'],
    value: null
  });
  this._students = data["students"]
  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

util.inherits(TransferCharacteristic, BlenoCharacteristic);
TransferCharacteristic.prototype.onReadRequest = function (offset, callback) {
  if (offset == 0)
    student = this._students[Math.floor(Math.random() * this._students.length)]
  data = JSON.stringify(student)
  result = this.RESULT_SUCCESS;
  if (offset > data.length) {
    result = this.RESULT_INVALID_OFFSET
    data = null
  } else {
    data = data.slice(offset)
  }
  console.log('TransferCharacteristic - onReadRequest: sending ' + data);
  callback(result, Buffer.from(data));
};

TransferCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  if (data.toString('utf-8') == "FIN") {
    parsedData = JSON.parse(this._value)
    fs.readFile('./data.json', 'utf-8', function (err, data) {
      if (err) throw err;

      var arrayOfObjects = JSON.parse(data);
      arrayOfObjects.students.push(parsedData);


      fs.writeFile('./data.json', JSON.stringify(arrayOfObjects), 'utf-8', function (err) {
        if (err) throw err;
        console.log('Data written');
        this._students = arrayOfObjects.students
      })
    })
    this._value = ""
  } else {
    if (offset > data.length) {
      result = this.RESULT_INVALID_OFFSET
      this._value = null
    } else {
      this._value += data
    }
    console.log('TransferCharacteristic - onWriteRequest: value = ' + this._value.toString('utf-8'));
  }

  if (this._updateValueCallback) {
    console.log('TransferCharacteristic - onWriteRequest: notifying');

    this._updateValueCallback("200 OK");
  }

  callback(this.RESULT_SUCCESS, this._value);
};

TransferCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  console.log('TransferCharacteristic - onSubscribe');

  this._updateValueCallback = updateValueCallback;
};

TransferCharacteristic.prototype.onUnsubscribe = function () {
  console.log('TransferCharacteristic - onUnsubscribe');

  this._updateValueCallback = null;
};

module.exports = TransferCharacteristic;
