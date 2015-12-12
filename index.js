exports.handler = function (event, context) {
    console.log('OK ' + event.name);
    context.done(null, 'complete');
};