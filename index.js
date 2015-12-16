var aws = require('aws-sdk')
var async = require('async')
var JSZip = require('node-zip')

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
			function(err, response) {
				if (err) {
					console.log("download error");
					console.log(response);
					context.fail('error in download: ' + err);
				}
				else {
					next(null, response);
				}
			});
		},
		function unzip(response, next) {
			
			console.log("unzip");
			console.log(response);

			var zip = new JSZip();
			
			zip.load(response.Body);

			var text = zip.file("test.txt").asText();

			next(null, text);
		},
		function doSomething(response, next) {
			
			console.log("doSomething: " + response);
			
			context.done(null, 'complete');
		}
	],
	function(e, r) {
		console.log("error");
		if (e) throw e;
	});
};
