const Course = require('../models/Course');
const Category = require('../models/Category');
const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
require('dotenv').config();

//create course
exports.createCourse = async (req, res) => {
    try{
        // Get user ID from request object
		const userId = req.user.id;

        //fetch data
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: _tag,
            category,
            status,
            instructions: _instructions, 
        } = req.body;
        console.log("Printing the req.body inside course: ", req)

        //// Get thumbnail image from request files
        console.log("Printing thumbnail umage inside course controller" , req.file)
        const thumbnail = req.files.thumbnailImage;
        

        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)
      
        // Check if any of the required fields are missing
        if (
			!courseName ||
			!courseDescription ||
			!whatYouWillLearn ||
			!price ||
			!tag.length ||
			!thumbnail ||
			!category ||
            !instructions.length
		) {
			return res.status(400).json({
				success: false,
				message: "All Fields are Mandatory",
			});
		}
        if (!status || status === undefined) {
			status = "Draft";
		}

        //check for intructot
        // Check if the user is an instructor
		const instructorDetails = await User.findById(userId, {
			accountType: "Instructor",
		});
        console.log("Hello this is instructor details",instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor details not Found',
            });
        }

        //check given tag is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:'Category details not Found',
            });
        }

        //upload the thumbnail to cloudinary
        const thumbnailImage =await uploadImageToCloudinary(
            thumbnail, 
            process.env.FOLDER_NAME
        );

        console.log("Thumbnail : ", thumbnailImage);

        //create an entry for new course with the given details
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tag,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status:status,
            instructions:instructions,
        })
        
        //add the new course to the user schema of the instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        // Add the new course to the Categories
		const categoryDetails2 = await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					courses: newCourse._id,
				},
			},
			{ new: true }
		);
         
        console.log("HEREEEEEEEE", categoryDetails2)

        //return the new course and a success message
        return res.status(200).json({
            success:true,
            message:'Course created Successfully',
            data:newCourse,
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error:error.message,
        })
    }
};

// Edit course Details
exports.editCourse = async (req,res) => {
    try{
        // courseid honi chahiye
        const {courseId} = req.body;
        const updates = req.body;
        // course find karlo jisme updates karna hai
        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404)
            .json({
                error: "Course Not Found"
            })
        }

        // If thumbnail Image was found , update is
        if(req.files) {
            console.log("Thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if(updates.hasOwnProperty(key)){
                if(key === "tag" || key === "instructions"){
                    course[key] = JSON.parse(updates[key])
                } else{
                    course[key] = updates[key]
                }
            }
        }

        await course.save();

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
        .populate({
            path:"instructor",
            populate:{
                path: "additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        }).exec()

        res.json({
            success:true,
            message: "Course Updated Succesfully",
            data: updatedCourse,
        })

    } catch(error){
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

//getAllcourse
exports.showAllCourses = async (req , res) => {
    try{
        const allCourses = await Course.find(
            {
                status: "Published"
            },
            { 
                courseName:true,
                price:true,
                thumbnail:true,
                instructor:true,
                ratingAndReviews:true,
                studentsEnrolled:true,
            }
        )
        .populate("instructor")
        .exec();

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })
                                                
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }
}

//get Course details
exports.getCourseDetails = async (req, res) => {
    try{
        //get id
        const {courseId} = req.body;
        //find course details
        const courseDetails = await Course.find(
            {_id:courseId},
        )
        .populate(
            {
                path:"instructor",
                populate:{
                    path:"additionalDetails",
                }
            }
        )
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
                select: "-videoUrl"
            }
        })
        .exec();

        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with id:  ${courseId}`,
            });
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        console.log("Course Details Inside course Details controller: ", courseDetails);
        // let totalDurationInSeconds = 0
        // courseDetails.courseContent.forEach((content) => {
        //     content.subSection.forEach((subSection) => {
        //         const timeDurationInSeconds = parseInt(subSection.timeDuration)
        //         totalDurationInSeconds += timeDurationInSeconds
        //     })
        // })

        // const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        //return response
        return res.status(200).json({
            success:true,
            message:'Course Details Fetched Successfully',
            data:{
                courseDetails,
                // totalDuration
            }
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body

      const userId = req.user.id

      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}


// Get a list of course for a given instructor
exports.getInstructorCourses = async (req, res) => {
    try{
        // get the instructor id from the authenticated user or request body
        const instructorId = req.user.id

        // find all courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructor : instructorId,
        }).sort({ createdAt: -1})

        // return the instructors courses
        res.status(200).json({
            success: true,
            data: instructorCourses
        })

    } catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieved instruction courses",
            error: error.message,
        })
    }
}

// Delete the course

exports.deleteCourse = async (req, res) => {
    try{
        // CourseId
        const {courseId} = req.body;

        // find the course 
        const course = await Course.find(courseId)
        if(!course){
            return res.status(404)
            .json({
                success:false,
                message: "Course Not Found"
            })
        }

        // unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled;
        for(const studentId of studentsEnrolled){
            await User.findByIdAndUpdate(studentId, {
                $pull : {courses : courseId},
            })
        }

        // Delete Section ans Subsection 
        const courseSections = course.courseContent
        for(const sectionId of courseSections){
            // Delete sub-sections of section
            const subSections = Section.subSection
            for(const subSectionId of subSection){
                await SubSection.findByIdAndDelete(subSectionId)
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

    } catch(error) {
        console.error(error);
        return res.statud(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        })
    }
}