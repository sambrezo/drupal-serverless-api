/**
 * Send emails with AWS SES
 * Messages are relayed to seperate Lambda application via AWS SQS
 * Email templates are stored in S3 Bucket
 */
const { sendMessage } = require('../aws/sqs');

module.exports.sendWelcomeMessage = async ({ user, passwordEncrypted }) => {
  return sendMessage(process.env["SQS_MAIL_SEND_QUEUE_URL"], JSON.stringify({
    template: 'welcome',
    mailTo: user.mail[0].value,
    locals: {
      kundenName: user.field_fullname[0].value,
      kundenEmail: user.mail[0].value,
      kundenNr: `${user.field_kundennr_station[0].value}${user.uid[0].value}`
    },
    localsEncrypted: {
      kundenKennwort: passwordEncrypted
    },
    user
  }));
}
