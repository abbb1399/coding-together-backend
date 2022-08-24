const AWS = require("aws-sdk")

const SES_CONFIG = {
  accessKeyId: process.env.SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
}

const AWS_SES = new AWS.SES(SES_CONFIG)

const sendWelcomeEmail = (recipientEmail, name) => {
  const params = {
    Source: "coding-together <admin@coding-together.com>",
    Destination: {
      ToAddresses: [recipientEmail],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `${name}님 Coding Together에 회원가입하신걸 감사드립니다.`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `반갑습니다. ${name}님!`,
      },
    },
  }
  return AWS_SES.sendEmail(params).promise()
}

const sendTemplateEmail = (recipientEmail) => {
  const params = {
    Source: "coding-together <admin@coding-together.com>",
    Template: "<name of your template>",
    Destination: {
      ToAddresse: [recipientEmail],
    },
    TemplateData: "{ \"name':'John Doe'}",
  }
  return AWS_SES.sendTemplatedEmail(params).promise()
}

module.exports = {
  sendWelcomeEmail,
  sendTemplateEmail,
}
