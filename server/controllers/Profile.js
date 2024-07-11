const Profile = require('../models/Profile');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader')

// Method for updating a profile
exports.updateProfile = async (req, res) => {
    try{
        //fetch data
        const {dateOfBirth="",about="",contactNumber, gender=null} = req.body;

        //get userId
        const id = req.user.id;

        //validate
        if(!contactNumber || !id){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //find profile by id
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const ProfileDetails = await Profile.findById(profileId);

        //update profile
        ProfileDetails.dateOfBirth = dateOfBirth;
        ProfileDetails.about = about;
        ProfileDetails.gender = gender;
        ProfileDetails.contactNumber = contactNumber;
        
        // create entry in db/ save the updated profile
        await ProfileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            ProfileDetails,
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};

//delete account 
exports.deleteProfile = async (req, res) => {
    try{
        //get id 
        const id = req.user.id;

        //validation
        const userDetails = await User.findById({_id:id});
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        // TODO: Unenroll User From All the Enrolled Courses
		// Now Delete User

        //delete user
        await User.findByIdAndDelete({_id:id});

        
        // return response
        return res.status(200).json({
            success:true,
            message:'User deleted Successfully',
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User can not be deleted successfully',
        });
    }
}

exports.getAllUserDetails = async (req, res) => {
    try{
        //get id
        const id = req.user.id;

        //validstion and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        console.log(userDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:'User Data fetched successfully',
            data: userDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      console.log('User id',userId);
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )

      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )

     return res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({_id: userId,})
                                        .populate("courses")
                                        .exec();
     
                                        
       if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
        })
      }

      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.instructorDashboard = async (req, res) => {
    try{
        const courseDetails = await Course.find({instructor: req.body.id});

        const courseData = courseDetails.msp((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length;
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            // create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated,
            }
            return courseDataWithStats
        })

        return res.status(200).json({courses:courseData});

    } catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message: "Internal Server Error",
        })
    }
}