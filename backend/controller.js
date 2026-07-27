const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (req, res) => {
  try {
    const { email, name } = req.body;

    const info = await transporter.sendMail({
      from: `"Hall Maintenance" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Hall Maintenance",
      html: `
        <h2>Hello ${name},</h2>

        <p>You have been successfully added to the Hall Maintenance system.</p>

        <p>You can now log in using your registered email.</p>

        <br/>

        <b>Hall Maintenance Team</b>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully.",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);
module.exports = {
  sendMail,
};