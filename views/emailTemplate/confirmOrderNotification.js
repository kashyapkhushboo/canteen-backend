const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

confirmOrder = async (email, data) => {

  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Order Confirmed ",
      html: `
  
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>order confirmation </title>
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
                                style="line-height: 5px"
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
                                    ${data.fullName}</span
                                  >
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                        
                    
                  
                          <tr>
                            <td
                              style="
                                opacity: 1;
                                color: rgb(76, 173, 76);
                                font-size: 20px;
                                font-weight: 700;
                                font-style: normal;
                                letter-spacing: 0px;
                                text-align: center;
                           
                              "
                            >
                            Your Order is Confirmed    
                            <p style="text-align: center; color: #007BFF;">Your EmployeeId ${
                                data.emp_id
                              }</p>        
                              <p style="text-align: center;">Order Details</p>             
                        </tr>
                          </td>
                        </tr>

                        <tr>
                          <td>
                            <div align="center" class="x_alignment">
                                <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
                                    <thead>
                                      <tr style="background-color: #f2f2f2;">
                                        <th style="border: 1px solid #dddddd; text-align: center; padding: 8px;">Item Name</th>
                                        <th style="border: 1px solid #dddddd; text-align: center; padding: 8px;">Quantity</th>
                                        <th style="border: 1px solid #dddddd; text-align: center; padding: 8px;">Price</th>
                                        <th style="border: 1px solid #dddddd; text-align: center; padding: 8px;">Total Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${data.order_rec
                                        .map(
                                          (item, index) => `
                                            <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                                              <td style="border: 1px solid #dddddd; text-align:center; padding: 8px;">${item.item_name}</td>
                                              <td style="border: 1px solid #dddddd; text-align:center; padding: 8px;">${item.quantity}</td>
                                              <td style="border: 1px solid #dddddd; text-align:center; padding: 8px;">${item.price}</td>
                                              <td style="border: 1px solid #dddddd; text-align:center; padding: 8px;">${item.totalPrice}</td>
                                            </tr>
                                          `
                                        )
                                        .join("")}
                                    </tbody>
                                  </table>
                                  
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
                            <p style="text-align: center; font-size: 24px;">Your Total Amount Is : ${
                                data.totalBalance
                              }</p>
                   
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


    `,
    };

    const result = await transporter.sendMail(mailOptions);

    return result;
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = { confirmOrder };
