const { useReducer } = require("react");
const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");


exports.updateCourseProgress = async (req, res) => {
    // fetch courseId, subsectionId ans userId
    const {courseId, subSectionId} = req.body;
    const userId = req.user.id;

    try{
        // check if subsection is valid or not
        const subSection = await SubSection.findById(subSectionId);

        if(!subSection){
            return res.status(404).json({
                success: false,
                error: "Invalid Subsection"
            })
        }

        // check for old entry
        let courseProgress = await CourseProgress.findOne({
            courseId: courseId,
            userId: userId
        });

        if(!courseProgress) {
            return res.status(404).json({
                success:false,
                message: "Course Progress does not exist"
            });
        } else{
            // check for re-completing video/ subsection
            if(courseProgress.completedVideos.includes(subSectionId)){
                return res.status(400).json({
                    error: "Subsection already completed",
                });
            }

            // push into completed video
            courseProgress.completedVideos.push(subSectionId);
        }

        await CourseProgress.save();

        return res.status(200).json({
            success:true,
            message: "Course Progress Updated Successfully",
        })
    } catch(error){
        return res.status(400).json({
            error: "Internal Server Error",
        })
    }
}