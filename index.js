var aws = require('aws-sdk')
var async = require('async')
var JSZip = require('node-zip')

exports.handler = function (event, context) {

	var logger = new EventLogger();
	logger.logEvent(event);
	
	var s3ZipReader = new S3ZipReader();
	s3ZipReader.readZip(event, context);
	
	var zipCreator = new ZipCreator();
	zipCreator.createZip(event, context);
};

function EventLogger() {
    this.logEvent = function(event) {
        event.file_names.forEach(function(entry) {
            console.log(entry);
        });
        event.tags.forEach(function(entry) {
            console.log(entry);
        });
    }
}

function ZipCreator() {
	this.createZip = function(event, context) {
		// TODO: create zip file based on files and tags in the event
		// See the EventLogger for how to iterate over each of them
	}
}
function S3ZipReader() {
	this.readZip = function(event, context) {
		var s3 = new aws.S3();  

		async.waterfall(
		[  
			function download(next) {
				
				console.log("download");
				
				s3.getObject(
				{
					Bucket: "brianroster",
					Key: "test.zip"
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
	}
}
