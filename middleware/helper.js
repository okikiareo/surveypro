const nodemailer = require('nodemailer')
const User = require('../model/user')


const domain = "https://nasty-marrissa-surveypro-991645a4.koyeb.app/"

async function sendNotification(email, owner, text, title) {

    console.log(email, text)
   
    // Set up email content
    const htmlContent = `
  
        <h3>Hello ${owner}, </h3> <br>
  
        <p>${text}</p>
        <p>Login to your account here: <a href=""> sth here </a> </p><br><br>
  
        <p>Sincerely,</p>
        <p>From Omega.</p>
        <a class="navbar-brand brand-logo-mini" style="size: 40px;" href=""><img src="https://i.ibb.co/6BH7h6Q/20230904-062051-0000-removebg-preview.png" alt="logo"/></a>
        
    `;
  
    // send the reset email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: "tech.digitalomega",
            pass: process.env.EMAIL_PASSWORD
        }
    })
  
    const mailOptions = {
        from: 'tech.digitalomega@gmail.com',
        to: email,
        subject: title,
        html: htmlContent,
    };
  
    const transport = await transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent')
        }
    })
  
    return {transport: transport}
}


const generateID_users = (length) => {
    const charset = "0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      token += charset[randomIndex];
    }
  
    return token;
  };


  // send verification email
const getVerification = async (userid) => {
    // redirect to home if verified
    const user = await User.findOne({id: userid})
    if (user.verified == true){
        return {verified: true}
    }
  
    // Generate a 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log('Generated OTP:', otp);
  
    const user_ = await User.findOneAndUpdate({id: userid}, {code: otp}, {new: true})
  
    // send otp
    await sendNotification(user.email, user.fullname, otp, "OTP Verification mail") 

    return {verified: false}
}
module.exports = {
    sendNotification,
    generateID_users,
    getVerification,
    url: domain
}