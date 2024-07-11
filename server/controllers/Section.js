const Section  = require('../models/Section');
const Course = require('../models/Course');
// const { default: SubSectionModal } = require('../../src/components/core/Dashboard/AddCourses/CourseBuilder/SubSectionModal');
const SubSection  = require('../models/SubSection');

exports.createSection = async (req, res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course wiht section object id
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        )
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();  //hw: use populate to replace section/subsecton both in updatedCourseDetails

        //return response
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create section, please try again',
            error:error.message,
        });
    }
}


exports.updateSection = async (req,res) => {
    try{
        //data input
        const {sectionName, sectionId, courseId} = req.body;

        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        } 

        //update data 
        const section  = await Section.findByIdAndUpdate(
            sectionId, 
            {sectionName}, 
            {new:true}
        );

        const course = await Course.findById(courseId)
        .populate({
            path: "courseContent",
            populate:{
                path:"subSection",
            }
        }).exec();

        //return ressponse
        return res.status(200).json({
            success:true,
            data: course,
            message:`${section}: Section Updated successfully `,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to update section, please try again',
            error:error.message,
        });
    }
};

exports.deleteSection = async (req, res) => {
    try{
        //get id - assuming that we are sending ID in params
        const {sectionId, courseId} = req.body;
        
        // course me jakr section ko hata denge
        await Course.findByIdAndUpdate(courseId, {
            $pull:{
                courseContent:sectionId,
            }
        })

        const section = await Section.findById(sectionId);
        console.log(sectionId, courseId);
        if(!section){
            return res.status(404).json({
                success:false,
                message: " Section not found",
            })
        }
        // delete sub section
        await SubSection.deleteMany({_id : {$in: section.subSection}});

        //use findbyidanddelete
        await Section.findByIdAndDelete(sectionId);
        
        //TODO::Tesing: do we need to delete the entry from the course schema??  -; Completed and ans is yes
        
        //find the updated courseans return
        const course = await Course.findById(courseId).populate({
            path:'courseContent',
            populate: {
                path: "subSection"
            }
        }).exec();

        return res.status(200).json({
            success:true,
            message:'Section deleted successfully',
            data:course
        });
    }
    catch(error){
        console.error("Error deleting section:", error);
        return res.status(500).json({
            success:false,
            message:'Unable to delete section, please try again',
            error:error.message,
        });
    }
}
