const SubSection  = require('../models/SubSection');
const Section = require('../models/Section');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
require('dotenv').config();

//create subsection
exports.createSubsection = async (req, res) => {
    try{
        //fetch data from req body
        const {sectionId, title,  description} = req.body;

        //extract file/video
        const video = req.files.video;

        // const timeDuration = req.body;
        //validation
        if(!sectionId || !title || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        console.log(video);

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        console.log(uploadDetails);

        //create a subsection
        const subsectionDetails = await SubSection.create({
            title:title,
            timeDuration:`${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })

        //update section with this subsection objectid
        const updatedSection = await Section.findByIdAndUpdate(
          {_id:sectionId},
          {
            $push: {
              subSection:subsectionDetails._id,
            }},
          {new:true},
        ).populate("subSection");   //Hw: log updated section here, after adding populate 
        
        //return  response
        return res.status(200).json({
            success:true,
            message:'Sub secton created successfully',
            data:updatedSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Internal Server error',
            error:error.message,
        });
    }
};

//Hw: update subsection
exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId ,title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }

      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()

      const updatedSection = await Section.findById(sectionId).populate("sebSection")
  
      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
}

//hw: delete subsection

exports.deleteSubSection = async (req, res) => {
    try {
      // Fetch sectionId and SubsectionId from req.body

      const { subSectionId, sectionId } = req.body
      // delete subsection entry from section
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      // delete subsection
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      // find the updated section
      const updatedSection = await Section.findById(sectionId).populate("sebSection")
  
      // return response
      return res.json({
        success: true,
        data: updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }