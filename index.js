var async = require('async'); 
var aws = require('aws-sdk');
var JSZip = require('node-zip');

exports.handler = function (event, context) {
	var logger = new EventLogger(event);
	logger.logEvent();
	
	var s3 = new aws.S3();
	var zip = new JSZip();

	var zipCreator = new ZipCreator(event, s3, zip, 'brianroster', 'download.zip');
	zipCreator.createZipOnS3(function(err, url) {
		if (err) {
			context.fail('fail');
		}
		else {
			context.succeed({ Location: url });		
		}
	});
};

function EventLogger(event) {
	this._event = event;
	
	this.logEvent = function(event) {
		this._event.file_names.forEach(function(entry) {
			console.log(entry);
		});
		this._event.tags.forEach(function(entry) {
			console.log(entry);
		});
	};
};

function ZipCreator(event, s3, zip, bucket, zipFileName) {
	this.event = event;
	this.bucket = bucket;
	this.s3 = s3;
	this.zip = zip;
	this.zipFileName = zipFileName;

	this.createZipOnS3 = function(callback) {
		console.log('createZipOnS3');
		var self = this;
 		async.waterfall(
		[
			function(next) {
				console.log('calling generateZipInMemory');
				self.generateZipInMemory(function(err) {
					if (err) return next(err);
					next(null, null);
				});
			},
			function(response, next) {
				console.log('calling saveInMemoryZipToS3');
				self.saveInMemoryZipToS3(function(err, url) {
					if (err) return next(err);
					next(null, url);
				});
			}
		],
		function(err, url) {
			console.log('createZipOnS3 final callback: ' + url);
			if (err) return callback(err);
			callback(null, url);
		});
	};

	this.generateZipInMemory = function(callback) {
		console.log('generateZipInMemory');
		var self = this;
        async.eachSeries(event.file_names, function(entry, next) {
			self.generateZipInMemoryHelper(entry, function(err) {
				if (err) return next(err);
				next();
			});
        },
		function(err) {
			console.log('createZipOnS3 final callback: ' + err);
			if (err) return callback(err);
			callback();
		});
	};
	
	this.generateZipInMemoryHelper = function(entry, callback) {
		console.log('generateZipInMemoryHelper');
		var self = this;
		async.waterfall(
		[  
			function getFromS3(next) {
				console.log('getFromS3: ' + entry);
				var params = { Bucket: self.bucket, Key: entry };
				self.s3.getObject(params, function(err, response) {
					if (err) return next(err);
					next(null, response);
				});
			},
			function addToZip(response, next) {
				console.log('addToZip: ' + entry);
				// TODO: How to handle errors for a non-async method?
				self.zip.file(entry, response.Body);
				next();
			}
		],
		function(err) {
			console.log('generateZipInMemoryHelper final callback for ' + entry + ': ' + err);
			if (err) return callback(err);
			callback();
		});
	};
	
	this.saveInMemoryZipToS3 = function(callback) {
		console.log('saveInMemoryZipToS3');
		var self = this;
 		async.waterfall(
		[
			function(next) {
				console.log('generating final zip...');
				// TODO: How to handle errors for a non-async method?
				var options = { type: 'nodebuffer' };
				var content = self.zip.generate(options);
				next(null, content);
			},
			function(content, next) {
				console.log('saving to S3...');
				var params = {Bucket: self.bucket, Key: self.zipFileName, Body: content};
				var options = {partSize: 10 * 1024 * 1024, queueSize: 1};
				self.s3.upload(params, options, function(err, response) {
					if (err) return next(err);
					next(null, response);
				});
			}
		],
		function(err, response) {
			console.log('saveInMemoryZipToS3 final callback: ' + response.Location);
			if (err) return callback(err);
			callback(null, response.Location);
		});
	};
};
