const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        console.log('This is transporter', transporter)

        let info = await transporter.sendMail({
            from:'Study Notion || codehelp - by Shivam',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        })
        
        console.log('this is information related to mail',info);
        return info;
    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = mailSender;