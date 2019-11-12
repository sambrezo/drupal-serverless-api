module.exports = (req, res, next) => {
  // From Lambda tokenValidator authorizer
  const authorizerRequestContext = req.event.requestContext.authorizer;
  if (authorizerRequestContext &&
      'permissions' in authorizerRequestContext &&
      'user' in authorizerRequestContext &&
      'scopes' in authorizerRequestContext) {
    res.locals.permissions = JSON.parse(authorizerRequestContext.permissions);
    res.locals.user = JSON.parse(authorizerRequestContext.user);
    res.locals.scopes = JSON.parse(authorizerRequestContext.scopes);
  } else {
    res.locals.permissions = []
    res.locals.user = null;
    res.locals.scopes = [];
  }
  next();
}
