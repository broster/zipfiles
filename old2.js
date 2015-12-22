var async = require('async');
var aws = require('aws-sdk');
var JSZip = require('node-zip');

exports.handler = function (event, context) {

	var logger = new EventLogger(event);
	logger.logEvent();

	//var s3ZipReader = new S3ZipReader();
	//s3ZipReader.readZip(event, context);
	
	var s3 = new aws.S3();
	var zip = new JSZip();
	
	var zipCreator = new ZipCreator(event, s3, zip, 'brianroster', 'download.zip');
	zipCreator.createZipOnS3();
	
	//var success = zipCreator.createZipOnS3(event, "brianroster", "download.zip");
};

function EventLogger(event) {
	this._event = event;
};

EventLogger.prototype.logEvent = function(event) {
	this._event.file_names.forEach(function(entry) {
		console.log(entry);
	});
	this._event.tags.forEach(function(entry) {
		console.log(entry);
	});
};

function ZipCreator(event, s3, zip, bucket, zipFileName) {
	this.event = event;
	this.bucket = bucket;
	this.s3 = s3;
	this.zip = zip;
	this.zipFileName = zipFileName;

	this.createZipOnS3 = function() {
		console.log('createZipOnS3');
		var self = this;
 		async.series(
		[
			function(next) {
				console.log('calling generateZipInMemory');
				self.generateZipInMemory(next);
			},
			function(next) {
				console.log('calling saveInMemoryZipToS3');
				self.saveInMemoryZipToS3(next);
			}
		],
		function(err) {
			if (err) {
				throw e;
			};
		});
	};

	this.generateZipInMemory = function() {
		console.log('generateZipInMemory');
		var self = this;
        event.file_names.forEach(function(entry) {
			async.waterfall(
			[  
				function getFromS3(next) {
					console.log('getFromS3: ' + entry);
					self.s3.getObject(
					{
						Bucket: bucket,
						Key: entry
					},
					function(err, response) {
						if (err) {
							throw err
						}
						else {
							next(null, response);
						}
					});
				},
				function addToZip(response, next) {
					console.log('addToZip: ' + entry);
					self.zip.file(zipFileName, response.Body)
				}
			],
			function(e, r) {
				if (e) {
					throw e;
				};
			});
        });
	};
	
	this.saveInMemoryZipToS3 = function() {
		console.log('saveInMemoryZipToS3');
		var self = this;
		var content = self.zip.generate({
			type: 'nodebuffer',
			compression: 'DEFLATE'
		});
	};
};
