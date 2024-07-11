const { default: mongoose } = require('mongoose');
const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const {paymentSuccessEmail} = require("../mail/templates/paymentSuccessEmail");
const { useInsertionEffect } = require('react');
const CourseProgress = require('../models/CourseProgress');



// initiate the razorpay order
exports.capturePayment = async (req, res) => {
    // get userId and courseId

    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0){
        return res.json({
            success: false,
            message: "Please Provide Course Id"
        })
    }

    let totalAmount = 0;
    // calculate the total amount
    for(const course_id of courses){
        let course ;
        try{
            // find the course using course_id
            course = await Course.findById(course_id);
            if(!course){
                return res.status(200).json({
                    success:false,
                    message: "Could not find the course"
                })
            }

            // check if student is alrady enrolled the course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message: "Students is already Enrolled"
                })
            }

            totalAmount += course.price;
        } catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }

    const currency = "INR";
    const options = {
        amount:  totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success: true,
            message: paymentResponse,
        }) 
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:true,
            message: "Could not initiate Order"
        })
    }
}

// Verify the Payment
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    // validation
    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({
                success: false,
                message: "Payment Failed",
            })
    }

    // validate the expected signature and razorpay_signature
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if(expectedSignature === razorpay_signature) {
        // enroll karwao student ko
        await enrollStudents(courses, userId, res);
        //return res
        return res.status(200).json({
            success: true,
            message: "Paymeny Verified"
        })
    }
}


const enrollStudents = async (courses , userId, res) => {
    if(!courses || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please provide Data for Courses or UserId"
        })
    }

    for(const courseId of courses){
        try{
            // find the course and enroll the student in the course
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {$push:{studentsEnrolled: userId}},
                {new: true},
            )

            if(!enrolledCourse){
                return res.status(500).json({
                    success: true,
                    message:"Course Not Found",
                })
            }

            const courseProgress = await CourseProgress.create({
                courseId: courseId,
                userId: userId,
                completedVideos: [],
            })

            // find the student and add the course id to their list of enrolledCourses 

            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    }
                },
                {new: true}
            )
            // sent the mail to the students
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            )
            console.log("Email Sent SuccessFully", emailResponse.response);
        } catch(error){
            console.log(error);
            return res.status(500).json({
                success: true,
                message: error.message
            })
        }
    } 
}

exports.sendPaymentSuccessEmail = async (req, res) => {
    const {orderId , paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId){
        return res.status(400).json({
            success:false,
            message: "Please provide all the fields"
        })
    }

    try{
        // find the student using userId
        const enrolledStudent = await User.findById(userId);
        // send the payment success email to the student 
        await mailSender(
            enrolledStudent.email,
            `payment Recieved`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`,
                amount/100, orderId, paymentId
            )
        )
    } catch(error){
        console.log("Error in sending mail", error)
        return res.status(500).json({
            success: false,
            message: "Could not send the email"
        })
    }
}












//cpature the payment and initiate the razorpay order
// exports.capturePayment = async (req, res) => {
//         //get userid and courseid
//         const {course_id} = req.body;
//         const userId = req.user.id;
//         //validation
//         //valid courseid
//         if(!course_id){
//             return res.json({
//                 success:false,
//                 message:"Please provide valid course id",
//             })
//         };

//         //valid courseDetails
//         let course;
//         try{
//             course = await Course.findById(course_id);
//             if(!course){
//                 return res.json({
//                     success:false,
//                     message:'Could not find the course',
//                 });
//             }
//             // user already pay for the same course  // uid = userid
//             const uid = new mongoose.Types.ObjectId(userId);
//             if(course.studentsEnrolled.includes(uid)){
//                 return res.status(200).json({
//                     success:false,
//                     message:'Student is already enrolled',
//                 });
//             }
//         }
//         catch(error){
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
       
//         //order create
//         const amount = course.price;
//         const currency = "INR";

//         const options = {
//             amount: amount*100,
//             currency,
//             receipt:Math.random(Date.now()).toString(),
//             notes:{
//                 courseId:course_id,
//                 userId,
//             }
//         };

//         try{
//             //initiate the payment using the razorpay
//             const paymentResponse = await instance.orders.create(options);
//             console.log(paymentResponse);
//             //return response
//             return res.status(200).json({
//                 success:true,
//                 courseName:course.courseName,
//                 courseDescription :course.courseDescription,
//                 thumbnail:course.thumbnail,
//                 orderId: paymentResponse.id,
//                 currency:paymentResponse.currency,
//                 amount:paymentResponse.amount,
//             });
//         }
//         catch(error){
//             console.log(error);
//             return res.json({
//                 success:false,
//                 message:'Could not initiate the order',
//             })
//         }
// };


// //verify Signature of razorpay and server

// exports.verifySignature = async (req, res) => {
//     const webhookSecret = "12345678";

//     const signature = req.header("x-razorpay-signature");
     
//     //depth padhna hai
//     const shasum = crypto.createHmac('sha256',webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if(signature === digest){
//         console.log('Payment is authorised');
        
//         const {userId, courseId} = req.body.payload.payment.entity.notes;

//         try{
//             //fullfill action

//             //find the course and enroll the student
//             const enrolledCourses = await Course.findOneAndUpdate(
//                 {_id:courseId},
//                 {$push:{studentsEnrolled:userId}},
//                 {new:true},
//             );
//             if(!enrolledCourses){
//                 return res.status(500).json({
//                     success:false,
//                     message:"Course Not found",
//                 });
//             }
//             console.log(enrolledCourses);

//             //find the student and add the course to their list enrolled me
//             const enrolledStudent = await User.findOneAndUpdate(
//                 {_id:userId},
//                 {$push:{courses:courseId}},
//                 {new:true},
//             );

//             console.log(enrolledStudent);

//             //mail send karna conifirmation wala
//             const emailResponse = await mailSender(
//                 enrolledStudent.email,
//                 "Congratulations from codehelp",
//                 "congratulations, you are onboarded into new codehelp course",
//             );

//             console.log(emailResponse);

//             return res.status(200).json({
//                 success:true,
//                 message:"Signature verified and course added",
//             })
//         }
//         catch(error){
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
//     }
//     else {
//         return res.status(400).json({
//             success:false,
//             message:"Invalid request",
//         });
//     }

// };