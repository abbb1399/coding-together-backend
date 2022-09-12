const AWS = require("aws-sdk")

const SES_CONFIG = {
  accessKeyId: process.env.SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
}

const AWS_SES = new AWS.SES(SES_CONFIG)

// 웰컴 이메일
const sendWelcomeEmail = (recipientEmail,userName) => {
  const params = {
    Source: "Coding Together <admin@coding-together.com>",
    Template: "welcome-email",
    Destination: {
      ToAddresses: [recipientEmail],
    },
    TemplateData: `{ \"name\":\"${userName}\"}`
  }
  return AWS_SES.sendTemplatedEmail(params).promise()
}

// 비밀번호 찾기 이메일(해당 이메일로 새로운 비밀번호 발송)
const sendNewPasswordEmail = (recipientEmail, newPassword) => {
  const params = {
    Source: "Coding Together <admin@coding-together.com>",
    Destination: {
      ToAddresses: [recipientEmail],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `회원님의 새로운 비밀번호는 ${newPassword} 입니다.<br>
          로그인 후, 비밀번호를 바꿔 사용해주세요.`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Coding Together 비밀번호 찾기 이메일`,
      },
    },
  }
  return AWS_SES.sendEmail(params).promise()
}

module.exports = {
  sendWelcomeEmail,
  sendNewPasswordEmail
}
