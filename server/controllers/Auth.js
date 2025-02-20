const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();


// Send OTP For Email Verification
exports.sendOTP = async (req, res) => {
    try{
        //ftech email from req ki body
        const {email} = req.body;

        //check if user already exists
        //find user with provided email
        const checkUserPresent = await User.findOne({email});
 
        //if user already exist, then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User is already registered',
            });
        }

        //generate otp
        var  otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log("OTP generated: ",otp);

        //check unique otp or not
        let result = await OTP.findOne({otp:otp});
        console.log("Result", result);
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp};

        //create an entity for otp in DB
        const otpBody = await OTP.create(otpPayload);
        
        console.log("Otp Body",otpBody);

        //return response successful
        return res.status(200).json({
            success:true,
            message:"OTP Sent Successfully",
            otp,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//signup controller for registered users
exports.signUp = async (req,res) => {
    try{
        // Destructure fields from the request body
        const { 
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        //Check if All Details are there or not
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:'All fields are required',
            })
        }

        //2 pswd match karlo
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message:'Password and confirm password value does not match, please try again',
            });
        }

        //check user already exists or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User already exists. Please sign in to continue.',
            });
        }

        //find most recent otp for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        //validate the otp
        if(recentOtp.length === 0){
            //otp mot found
            return res.status(400).json({
                success:false,
                message:'The OTP is not valid',
            })
        }else if(otp !== recentOtp[0].otp){
            //invalid otp
            return res.status(400).json({
                success:false,
                message:'The Otp is Not OTP',
            });
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create the user
        let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);
        // Create the Additional Profile For User
        const ProfileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });
        //create entry in db
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType:accountType,
            approved: approved,
            additionalDetails:ProfileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        //return the response
        return res.status(200).json({
            success:true,
            user,
            message:'User is registered Successfully',
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again",
        })
    }
}

//login
exports.login = async (req,res) => {
    try{
        //Get email and password from request body
        const {email, password} = req.body;
        // Check if email or password is missing
        // Return 400 Bad Request status code with error message
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'Please Fill up All the Required Fields',
            });
        }
        
        // Find user with provided email
        const user = await User.findOne({email}).populate("additionalDetails");
        //user check exist or not
        if(!user){
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success:false,
                message:'User is not registered, please Signup to Continue',
            }) 
        }

        // Generate JWT token and Compare Password 
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email:user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"24h",
            });
            // Save token to user document in database
            user.token = token;
            user.password = undefined;
            //Set cookie for token and return success
            //create cookie and sent  response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            return res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'User Logged in Successfully',
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }
        
    }
    catch(error){
        console.log(error);
        // Return 500 Internal Server Error status code with error message
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
}

//change password : HOME WORK
// exports.changePassword = async (req,res) => {
    //get the data from req ki body
    //get oldpassword, newpassword, confirmpassword
    //validation

    //update pswd in db
    //send mail - password updated
    //return response
// }

// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({
                success: false, 
                message: "The password is incorrect" 
            });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res.status(200).json({
            success: true,
            message: "Password updated successfully" 
        });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};