const nodemailer = require("nodemailer");
const otp = require("otp-generator");
const smtpPool = require("nodemailer-smtp-pool");

const transporter = nodemailer.createTransport(
  smtpPool({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
);

const sendEmail = async (email) => {
  try {
    const generatedOTP = generateOTP();
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Email Verification",
      html: generateEmailContent(email, generatedOTP),
    };
    const result = await transporter.sendMail(mailOptions);
    return { otp: generatedOTP };
  } catch (error) {
    return { error: error.message };
  }
};

const generateOTP = () => {
  return otp.generate(6, { upperCase: false, specialChars: false });
};

const generateEmailContent = (email, generatedOTP) => {
  return `
 
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
  </head>
  <body
    marginheight="0"
    topmargin="0"
    marginwidth="0"
    style="
      background-color: #f2f3f8;
      margin: 0px;
      padding: 0px;
      text-align: center;
    "
  >
    <table
      cellspacing="0"
      border="0"
      cellpadding="0"
      width="100%"
      bgcolor="#f2f3f8"
      align="center"
      style="margin: auto"
    >
      <tbody>
      
        <tr>
          <td style="padding-top: 1rem; text-align: center; width: 100%">
            <table
              width="80%"
              cellpadding="0"
              cellspacing="0"
              style="
                background: #fff;
                border-radius: 10px;
                text-align: center;
                -webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                -moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                margin: auto;
              "
            >
              <tbody>
                <tr>
                  <td>
                    <table style="margin: 0px auto">
                      <tbody>
                        <tr>
                          <td
                            style="text-align: center; padding-top: 1rem"
                          ></td>
                        </tr>
                        <tr>
                            <td class="x_pad">
                              <div
                                align="center"
                                class="x_alignment"
                                style="line-height: 10px"
                              >
                                <img
                                  src=" https://seasia.prodacker.com/static/media/logo-new.4a5f48de786a28690944e35048da410a.svg"
                                  alt="Your Logo"
                                  title="Your Logo"
                                  width="136"
                                />
                              </div>
                            </td>
                          </tr>
                        <tr>
                          <td
                            style="
                              opacity: 1;
                              color: rgba(20, 15, 38, 1);
                              font-size: 20px;
                              font-weight: 700;
                              font-style: normal;
                              letter-spacing: 0px;
                              text-align: center;
                              padding-top: 1rem;
                              padding-bottom: 1rem;
                            "
                          >
                            Email verification
                          </td>
                        </tr>
                        <tr>
                          <td
                            class="x_pad"
                            style="
                              padding-bottom: 15px;
                              padding-left: 15px;
                              padding-right: 15px;
                              padding-top: 0px;
                            "
                          >
                            <div
                              style="font-family: sans-serif, serif, EmojiFont"
                            >
                              <div
                                class=""
                                style="
                                  font-size: 14px;
                                  color: rgb(29, 167, 255);
                                  line-height: 1.5;
                                  font-family: sans-serif, serif, EmojiFont;
                                "
                              >
                                <p
                                  style="
                                    margin: 0;
                                    font-size: 16px;
                                    text-align: center;
                                    font-weight: 400;
                                  "
                                >
                                  Dear<span
                                    style="font-size: 16px; font-weight: 600"
                                  >
                                    ${email}</span
                                  >
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            class="x_pad"
                            style="
                              padding-bottom: 5px;
                              padding-left: 20px;
                              padding-right: 20px;
                              padding-top: 0px;
                            "
                          >
                            <div
                              style="
                                color: rgb(33, 33, 33);
                                direction: ltr;
                                font-family: sans-serif, serif, EmojiFont;
                                font-size: 14px;
                                font-weight: 400;
                                letter-spacing: 0px;
                                line-height: 150%;
                                text-align: center;
                              "
                            >
                              <p style="margin: 0">
                                Thank you for requesting to Email verification .
                                <br />
                                Please use the following OTP to get your Email
                                verification :
                              </p>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <div align="center" class="x_alignment">
                              <span
                                style="
                                  text-decoration: none;
                                  color: rgb(0, 0, 0);
                                  background-color: transparent;
                                  border-radius: 4px;
                                  width: auto;
                                  border-width: 1px;
                                  border-style: solid;
                                  border-color: rgb(97, 97, 97);
                                  font-weight: 700;
                                  padding: 5px 30px;
                                  font-family: sans-serif, serif, EmojiFont;
                                  text-align: center;
                                  word-break: keep-all;
                                  font-size: 18px;
                                  display: inline-block;
                                  letter-spacing: normal;
                                "
                                ><span
                                  dir="ltr"
                                  style="
                                    word-break: break-word;
                                    line-height: 32px;
                                  "
                                  >${generatedOTP}</span
                                ></span
                              >
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            class="x_pad"
                            style="
                              padding-bottom: 5px;
                              padding-left: 20px;
                              padding-right: 20px;
                              padding-top: 5px;
                            "
                          >
                            <div
                              style="
                                color: rgb(33, 33, 33);
                                direction: ltr;
                                font-family: sans-serif, serif, EmojiFont;
                                font-size: 14px;
                                font-weight: 400;
                                letter-spacing: 0px;
                                line-height: 150%;
                                text-align: center;
                                margin-bottom: 40px;
                              "
                            >
                              <p style="margin: 0">
                                The OTP valid for the next 5 minutes only.
                              </p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            class="x_pad"
                            style="
                              padding-bottom: 5px;
                              padding-left: 20px;
                              padding-right: 20px;
                              padding-top: 5px;
                            "
                          >
                            <div
                              style="
                                color: rgb(33, 33, 33);
                                direction: ltr;
                                font-family: sans-serif, serif, EmojiFont;
                                font-size: 14px;
                                font-weight: 400;
                                letter-spacing: 0px;
                                line-height: 150%;
                                text-align: center;
                              "
                            >
                              <p style="margin: 0">
                                Thank you for choosing our service.
                              </p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              opacity: 1;
                              padding-top: 1rem;
                              padding-bottom: 1rem;
                              color: rgba(20, 15, 38, 1);
                              font-size: 12px;
                              font-weight: 400;
                              font-style: normal;
                              letter-spacing: 0px;
                              text-align: center;
                              line-height: 24px;
                            "
                          >
                            If you didn’t make this request, ignore this email.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-size: 12px; padding: 10px">
            ©Seasiainfotech
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>

  `
};

module.exports = { sendEmail };
