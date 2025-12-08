const prisma = require ('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');



exports.register = async(req,res) => {
    //Code
    try{
        //code
        const { email, password} = req.body
       

        // 1 Validate body
        if(!email){
            //Code
            return res.status(400).json({ massage : 'Email is require!!!!'});
        }
        if(!password){
            //code
            return res.status(400).json({ massage : 'Password is require!!!'});
        }

        // 2 Check Email in DB already ?
        const user = await prisma.user.findFirst({
            where:{
                    email: email
            }
        }) 
        if(user){
            return res.status(400).json({ message : "Email already Exits!!!"});
        }
        
        // 3 HashPassword
        const hashPassword = await bcrypt.hash(password,10);
        


        // 4 Register
        await prisma.user.create({
            data:{
                email : email,
                password : hashPassword
            }
        });


        res.status(201).json({ success: true, message: "Register Success" });
    }catch (err) {
        //Error
        console.log (err);6
        res.status(500).json({ message : "Server Error" })   
    }

}

exports.login = async(req,res) => { 
    try{
        //code
        const { email,password } = req.body

        // 1 Check Email
            const user = await prisma.user.findFirst({
                where : {email : email}
            })
            if(!user || !user.enable) {
                return res.status(400).json({ message : 'User Not found or not Enabled'});
            }
        // 2 Check password
            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch){
                return res.status(500).json({ message : 'Password Invalid!!!'});
            }
        // 3 Check Payload
        const payload = {
            id : user.id,
            email : user.email,
            role : user.role
        } 
        // 4 Generate Token //.env
        jwt.sign(payload,process.env.SECRET,{expiresIn : '1d'},   
            (err,token) =>{
              if(err){
                return res.status(500).json({ message : " Generate Token Error "})
              }  
              res.json({payload,token});

            }) ;
        
    }catch (err) {
        //Error
        console.log (err);6
        res.status(500).json({ message : "Server Error" })   
    }
}

exports.currentUser = async (req,res) => {
    try {
        //code
        // console.log(req.user);
        const user = await prisma.user.findUnique({
            where : { email: req.user.email},
            select:{
                id:true,
                email:true,
                name:true,
                role:true, 
            }
        });
        res.json({ user });
       
    } catch (err){
        //err
        res.status(500).json({ message : "Sever Error" })
    }
}

// -------------------- Forgot Password --------------------
exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) return res.status(400).json({ message: "Email is required" });
  
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
  
      // สร้าง token สำหรับ reset
      const resetToken = crypto.randomBytes(32).toString("hex");
  
      // hash token เก็บใน DB ป้องกันโจมตี
      const hashToken = await bcrypt.hash(resetToken, 10);
  
      // เก็บ hashToken และ expire 15 นาที
      await prisma.user.update({
        where: { email },
        data: {
          resetToken: hashToken,
          resetTokenExpire: new Date(Date.now() + 15 * 60 * 1000), 
        }
      });
  
      // สร้างลิงก์ reset
      const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
  
      // ส่งอีเมล (ใช้ nodemailer)
      const transporter = nodemailer.createTransport({
        service: "gmail", // คุณอาจเปลี่ยนเป็น SMTP ของ hosting/cloud
        auth: {
          user: process.env.EMAIL_USER, // email ของคุณ
          pass: process.env.EMAIL_PASS  // app password หรือ token
        }
      });
  
      await transporter.sendMail({
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset",
        html: `
          <p>คุณได้ร้องขอรีเซ็ตรหัสผ่าน</p>
          <p>คลิกลิงก์ด้านล่างเพื่อรีเซ็ต (ภายใน 15 นาที):</p>
          <a href="${resetLink}">${resetLink}</a>
        `
      });
  
      res.json({ message: "Reset link sent to email" });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  // -------------------- Reset Password --------------------
  exports.resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
  
      if (!password) return res.status(400).json({ message: "Password required" });
  
      // หาผู้ใช้ที่มี resetToken (ต้องวนเช็คทุก user)
      const users = await prisma.user.findMany({
        where: {
          resetToken: { not: null }
        }
      });
  
      // เช็ค token ว่าตรงกับ hash หรือไม่
      let matchedUser = null;
      for (let u of users) {
        const isMatch = await bcrypt.compare(token, u.resetToken);
        if (isMatch && u.resetTokenExpire > new Date()) {
          matchedUser = u;
          break;
        }
      }
  
      if (!matchedUser) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      // hash password ใหม่
      const hashPassword = await bcrypt.hash(password, 10);
  
      await prisma.user.update({
        where: { id: matchedUser.id },
        data: {
          password: hashPassword,
          resetToken: null,
          resetTokenExpire: null
        }
      });
  
      res.json({ message: "Password has been reset successfully" });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };