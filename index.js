var aws = require('aws-sdk')
var async = require('async')

exports.handler = function (event, context) {
    console.log('OK ' + event.name);
    context.done(null, 'complete');
};
