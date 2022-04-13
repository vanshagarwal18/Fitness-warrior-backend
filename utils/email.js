const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //1 Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2 Define the email options
  const mailoptions = {
    from: `Fitness Warrior<${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };

  //3 Actually send the email
  await transporter.sendMail(mailoptions, (err) => {
    if (err) {
      return console.log(err.message);
    } else {
      return console.log("Email sent successfully");
    }
  });
};
module.exports = sendEmail;
