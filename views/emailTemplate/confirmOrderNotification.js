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
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #000; 
            padding: 8px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div style="background-color: #f1f1f1; padding: 20px;">
        <h1 style="text-align: center; font-size: 24px;">Seasia Infotech</h1>
        <h1 style="text-align: center; font-size: 24px;">Hi ${email}</h1>
        <h2 style="text-align: center;color: rgb(76, 173, 76)">Your Order is Confirmed</h2>
        <h2 style="text-align: center; color: #007BFF;">Your EmployeeId ${
          data.emp_id
        }</h2>
        <p style="text65279d5bcf5fcc3eeb7ed19c-align: center;">Order Details</p>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${data.order_rec
                .map(
                  (item) => `
                    <tr>
                      <td>${item.item_name}</td>
                      <td>${item.quantity}</td>
                      <td>${item.price}</td>
                      <td>${item.totalPrice}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
          <h1 style="text-align: center; font-size: 24px;">Your Total Amount Is : ${
            data.totalBalance
          }</h1>
          <p style="text-align: center;">Thank you for Ordering.</p>
          <p style="text-align: center;">
          Your Seasia Team
          </p>
          <h6 style="text-align: center;">©Seasiainfotech</h6>
        </div>
   
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
