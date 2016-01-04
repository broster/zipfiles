Project Description
--------------------------------------------

I wanted to implement the serverless architecture using API Gateway, Lambda, and S3. For the project I chose to do a simple zipping service. You pass it the name of any number of files currently on S3 and it will ZIP them and send you a link back that can be used to download the ZIP file.

Repository
--------------------------------------------

You can clone the project at https://github.com/broster/zipfiles.git

Running the code
--------------------------------------------

There is no web site, it is just an API endpoint so a POST has to be sent to the endpoint with the correct JSON and API key. A tool like Postman makes this easy. 

The endpoint is https://cnmc034tjj.execute-api.us-east-1.amazonaws.com/mbo

Here is some example JSON. At the moment the only valid file names are file1.txt, file2.txt, file3.txt, and file4.txt.

{
  "project_id": "1234",
  "file_names": [
    "file1.txt",
    "file4.txt"
  ],
  "tags": [
    "textfiles",
    "mbo"
  ]
}

Here are the headers that need to be specified

content-type application/json
x-api-key 3YVNZuEit47r5OsH7aUz98W42IpVrjhh3bWLDMia

Development Environment
--------------------------------------------

I wanted to stay close to the metal on this project so didn't attempt to use Visual Studio for anything.

-> Prerequisites: 

Git: Used GitHub and command line Git. Yup, no pretty UI for Git for this project. Was actually not bad at all using the command line.

Node - Runtime for Node

NPM - Node Package Manager. Installs dependencies that your code needs. This takes care of the role that "Add Reference" in Visual Studio would do for a .NET project.

Grunt - Packager like Gulp which we use in Rosetta UI. Seems to be more popular than Gulp when doing server side stuff. This puts all the source files and dependencies into a ZIP that can be uploaded to Lamba

grunt-aws-lambda - Very cool package that simulates Lambda for you. So you can actually write and test your code locally without having to deploy to Lambda. If it runs locally it is going to do the exact same thing in Lambda. This was a life saver.

s3 files - Just had to create a few source files on S3 that the Lambda function had access to. These become in the input specified in the JSON above.

-> Language: Node.js

Just Javascript for the server.

-> Editor: Notepad++

This actually had pretty nice syntax highlighting for Node.

Architecture
--------------------------------------------

-> API Gateway

There is just a single endpoint. The interesting thing about API Gateway is how it interacts with Lambda. It is actually very loosly coupled with Lambda and just exchanges information via text requests and responses.

Here is roughly the steps of a request as it goes through API Gateway

1. Request comes in from client and enters the "Method Request" step of the execution. In this step, the query string parameters, headers, and body are mapped by the Gateway into internal variables that can be used in subsequent stages. Also, the body can be validated with a "model" to make sure it conforms to what the method expects

2. Request is sent to the "Integration Request" step of the execution. Here you specify where the request gets routed (Lambda, other HTTP server, mock). You are also able to define a mapping template here that transforms the headers, query string parameters, and body into a text document that is suitable to pass over to Lambda. Lambda doesn't know anything about HTTP so you have to package it up as text (usually JSON).

...Now Lambda does its magic and then sends a text response to the next step...

3. Request comes from Lambda to the "Integration Response" step. This step lets you specify a regular expression to use to parse the Lambda response for error codes. You can map different regular expressions onto HTTP response codes and specify a mapping template for each code that will transform the Lambda text into the components (body, headers, query string) necessary for the next step.

4. Finally, the "Method Response" can take the values for body, headers, and query string and turn it into the actual HTTP response that goes back to the client.

-> Lambda

This is the Node.js script. This was a pretty interesting part of the project. I was not that familiar with async programming in Javascript so it took some getting used to. You can still declare the equivalent of classes that have methods. All of the AWS calls are asynchronous so you have to really embrace that in your methods and classes you define.

In order to make this easier, there is a library for Node called "async" that has a "series" function in it that will make sure a sequenece of asynchronous calls get called in series and only when all the calls are complete will the final method get called. There is also a "waterfall" function that does the same thing but passes the results of the previous call to the next call. You kind of have to see the code to get what I am talking about.

At some point in your script you have to tell Lambda whether you succeeded or failed and specify an error string. That gets put in some JSON and passed back as text to API Gateway.

The zipping is done with a library called "node-zip". Pretty easy to use. Not asynchrnous like S3. I think we would have memory problems if we tried to ZIP very large files. You get charged for every GB-second of memory used in Lamba. Probably something we would want to improve on to reduce cost to make this production ready.

-> S3

Not much to say here. Just a few small files on S3 that act as the source for the ZIP files. In order to get the generated link to work I had to open up those files to everyone because I didn't specify a more strict policy that would only allow Lambda access to the files. This would be an improvement that would need to be made to make this code more real.

Since we are serving up the ZIP from S3 we don't have to worry about streaming bytes or handling scaling. Just happens for you.





