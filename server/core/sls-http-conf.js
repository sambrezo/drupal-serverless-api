module.exports = {
  request: function(req, event, context) {
    // https://docs.atlas.mongodb.com/best-practices-connecting-to-aws-lambda/
    context.callbackWaitsForEmptyEventLoop = false;

    // Pass Lambda event to Express request
    req.event = event;
  }
};
