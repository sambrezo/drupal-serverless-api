const moment = require('moment-timezone');
const { param, validationResult } = require('express-validator/check');

const { getLufthansaApiClient } = require('../../../lib/lufthansa');

// https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery/35413963#35413963
function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if(!dateString.match(regEx)) return false;  // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0,10) === dateString;
}

module.exports.lufthansaFlightStatusGet = [
  param('flightNumber').isAlphanumeric(),
  param('date').custom(isValidDate),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const departureDate = moment.tz(req.params.date, 'Europe/Berlin')
    const dateRangeStart = moment();
    const dateRangeEnd = moment(dateRangeStart).add(5, 'days');
    // The available date range is from 7 days in the past until 5 days in the future.
    // https://momentjs.com/docs/#/query/is-between/
    if (!departureDate.isBetween(dateRangeStart, dateRangeEnd, 'day', '[]')) {
      return res.status(400).json({
        error: 'DateOutOfRangeError'
      })
    }
    next()
  },
  async (req, res, next) => {
    try {
      const axiosLufthansa = await getLufthansaApiClient();

      const response = await axiosLufthansa.get('/operations/flightstatus/' +
        req.params.flightNumber + '/' + req.params.date)

      return res.json(response.data)
    } catch (error) {
      //console.log(error.response)
      next(error)
    }
  }
];
