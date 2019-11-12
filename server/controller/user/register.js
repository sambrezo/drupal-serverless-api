const generator = require('generate-password');
const { encryptToEncoded } = require('../../../lib/aws/kms');
const { getServiceApiClient } = require('../../../lib/drupal');
const { sendWelcomeMessage } = require('../../../lib/email');

// We generate the user password automatically on the server
// and send it to the user via email upon registration
// Not exactly best pratice, so change to meet your needs
module.exports.userRegisterPost = async (req, res, next) => {
  try {
    var axiosAdmin = await getServiceApiClient();
    // TODO: https://express-validator.github.io/docs/
    const { email, fullname } = req.body;
    const password = generator.generate({
      length: 10,
      numbers: true,
      excludeSimilarCharacters: true
    });
    const data = {
      // Custom user field
      "field_fullname": { "value": fullname },
      // Drupal user name required
      "name": { "value": email },
      "mail": { "value": email },
      "pass": { "value": password },
      "status": { "value": true }
    };
    const url = '/entity/user';
    var responseUser = await axiosAdmin.post(url, data, { params: { _format: "json" } });
    const passwordEncrypted = await encryptToEncoded(password);
    await sendWelcomeMessage({ user: responseUser.data, passwordEncrypted });
    // TODO: Send token instead of password or change altogether
    return res.json({
      user: responseUser.data,
      password
    })
  } catch (error) {
    next(error);
    if (axiosAdmin && responseUser && responseUser.status == 201) {
      // If error occured after user registration, rollback!
      await axiosAdmin.delete(`/user/${responseUser.data.uid[0].value}`)
    }
  }
};
