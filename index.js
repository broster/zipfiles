var aws = require('aws-sdk')
var async = require('async')

exports.handler = function (event, context) {
    console.log(event.name);
	console.log(event.key);
	
	var s3 = new aws.S3();  

	async.waterfall(
	[  
		function download(next) {
			console.log("download");
			
			s3.getObject(
			{
				Bucket: event.name,
				Key: event.key
			},
			function(err, data) {
				console.log("download error");
				next(err, data);
			});
		},
		function gunzip(response, next) {
			console.log("gunzip");
			
			var buffer = new Buffer(response.Body);

			zlib.gunzip(buffer, function(err, decoded) {
				next(err, decoded && decoded.toString());
			});
		},
		function doSomething(data, next) {
			// `data` is raw data, ready for use.
			console.log("doSomething");
		}
	],
	function(e, r) {
		console.log("error");
		if (e) throw e;
	});
	
    context.done(null, 'complete');
};
