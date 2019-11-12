module.exports = (req, res, next) => {
  const drupalLanguages = process.env['DRUPAL_LANGUAGES'].split('|');
  if (drupalLanguages.includes(req.query.lang)) {
    res.locals.lang = req.query.lang;
  } else {
    res.locals.lang = drupalLanguages[0];
  }
  next();
}
