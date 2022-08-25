const AWS = require("aws-sdk")

const SES_CONFIG = {
  accessKeyId: process.env.SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
}

const AWS_SES = new AWS.SES(SES_CONFIG)

// 회원가입 이메일
const sendWelcomeEmail = (recipientEmail, name) => {
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
          Data: `반갑습니다. ${name}님!<br>
          Coding Together에 가입 하신걸 환영합니다.<br>
          자유롭게 사용해주세요.`,
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

// 템플릿 이메일 (나중에 사용)
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
  sendNewPasswordEmail,
  sendTemplateEmail,
}
