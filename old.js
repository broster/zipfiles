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
					};
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
};


	
	this.createZipOnS3 = function(event, bucket, zipFileName) {

		var s3 = new aws.S3();
		var zip = new JSZip();
	
		async.waterfall(
		[
			function(next) {
				
				console.log('calling generateZipInMemory');

				this.generateZipInMemory(event, bucket, s3, zip);
				
				next(null);
			},
			function(next) {
				
				console.log('saveInMemoryZipToS3');
				
				//this.saveInMemoryZipToS3(bucket, zipFileName, zip);
			}
		],
		function(e, r) {
			if (e) {
				throw e;
			};
		});
	};
	
	this.generateZipInMemory = function(event, bucket, s3, zip) {
		
		console.log('generateZipInMemory');

        event.file_names.forEach(function(entry) {
			async.waterfall(
			[  
				function getFromS3(next) {
					
					console.log('getFromS3: ' + entry);
					
					s3.getObject(
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

					zip.file(zipFileName, response.Body)
				}
			],
			function(e, r) {
				if (e) {
					throw e;
				};
			});
        });
	};
	
	this.saveInMemoryZipToS3 = function(bucket, zipFileName) {
	
		var content = zip.generate({
			type: 'nodebuffer',
			compression: 'DEFLATE'
		});
	};