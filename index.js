console.log('Loading function');

exports.handler = function (event, context) {

    var async = require("async");
/*     var sdk = require('aws-sdk'); 
    var s3 = new sdk.S3(); 

    var zlib = require('zlib');
    var gzip = zlib.createGzip();
    
    var params = {
        Bucket: 'brianroster',
        Key: 'Sunset.jpg'
    };

    var req = s3.getObject(params, function(err, data) {
        if (err) {
            console.log('error');
            console.log(err, err.stack); // an error occurred
        }
        else {
            console.log('ok');
            console.log(data.ContentLength);           // successful response
        }
    }); */

    context.succeed('ok');
};