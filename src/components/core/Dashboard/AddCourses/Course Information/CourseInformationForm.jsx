import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import RequirementField from "./RequirementField";
import IconBtn from '../../../../common/IconBtn'
import {setStep, setCourse} from '../../../../../slices/courseSlice'
import {COURSE_STATUS} from '../../../../../utils/constansts'
import {toast} from 'react-hot-toast'
import { addCourseDetails, editCourseDetails, fetchCourseCategories } from "../../../../../services/opeeations/courseDetailsAPI";
import { MdNavigateNext } from "react-icons/md"
import Upload from "../Upload";
import ChipInput from "./ChipInput";

const CourseInformationForm = () => {

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState:{errors}
    } = useForm();
    
    const dispatch = useDispatch();
    const {token} = useSelector((state) => state.auth)
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNoeWFtZnRwNjVAZ21haWwuY29tIiwiaWQiOiI2NTg5MmVjZDNkNTlkYmFhYzJlMTBhMjgiLCJhY2NvdW50VHlwZSI6Ikluc3RydWN0b3IiLCJpYXQiOjE3MDM0OTAyNDYsImV4cCI6MTcwMzU3NjY0Nn0.3s78suXncU763Yzlt9pg6nBK6pFHkQhbnWd3J-V6wOM"
    const {course, editCourse} = useSelector((state)=>state.course);
    const [loading,setLoading] = useState(false);
    const [courseCategories,setCourseCategories] = useState([]);
 
    useEffect(() => {
        const getCategories = async () => {
            setLoading(true);
            const categories = await fetchCourseCategories();
            if(categories) {
                setCourseCategories(categories);
            }
            setLoading(false);
        }
        // console.log("List of Categories", courseCategories);

        // if form is in edit mode

        if(editCourse) {
            console.log("data populated", editCourse)
            setValue("courseTitle", course.courseName)
            setValue("courseShortDesc", course.courseDescription)
            setValue("coursePrice", course.price)
            setValue("courseTags", course.tag)
            setValue("courseBenifits", course.whatYouWillLearn)
            setValue("courseCategory", course.category)
            setValue("courseRequirements", course.instructions)
            setValue("courseImage", course.thumbnail)
        }

        getCategories();
    },[])

    const isFormUpadted = () => {
        const currentValues = getValues();
        console.log("changes after editing form values:", currentValues)
        if( currentValues.courseTitle !== course.courseName ||
            currentValues.courseShortDesc !== course.courseDescription ||
            currentValues.coursePrice !== course.price ||
            currentValues.courseTags.toString() !== course.tag.toString() ||
            currentValues.courseBenifits !== course.whatYouWillLearn ||
            currentValues.courseCategory._id !== course.category._id ||
            currentValues.courseImage !== course.thumbnail || 
            currentValues.courseRequirements.toString() !== course.instructions.toString()
        )  return true;
        else return false;
    }

    const onSubmit = async (data) => {

        console.log("Printing the data inside form",data)
        if(editCourse){
            // const currentValues = getValues()
            // console.log("changes after editing form values:", currentValues)
            // console.log("now course:", course)
            // console.log("Has Form Changed:", isFormUpdated())

            // edit course details
            if(isFormUpadted){
                const currentValues = getValues();
                const formData = new FormData();
                console.log("Data Printing",data)
                // append all the data in fromData
                formData.append("courseId", course._id);

                //appent only those jo ki change hui hai
                if(currentValues.courseTitle !== course.courseName){
                    formData.append("courseName", data.courseTitle)
                }

                if(currentValues.courseShortDesc !== course.courseDescription){
                    formData.append("courseDescription", data.courseShortDesc)
                }

                if(currentValues.coursePrice !== course.price){
                    formData.append("price", data.coursePrice)
                }

                if (currentValues.courseTags.toString() !== course.tag.toString()) {
                    formData.append("tag", JSON.stringify(data.courseTags))
                }

                if(currentValues.courseBenifits !== course.whatYouWillLearn){
                    formData.append("whatYouWillLearn", data.courseBenifits)
                }

                if(currentValues.courseCategory._id !== course.category._id){
                    formData.append("category", data.courseCategory)
                }

                if(currentValues.courseRequirements.toString() !== course.instructions.toString()){
                    formData.append("instructions", JSON.stringify(data.courseRequirements))
                }

                if (currentValues.courseImage !== course.thumbnail) {
                    formData.append("thumbnailImage", data.courseImage)
                }
                console.log("Printing FormData  ", formData);
                console.log("Printing Result  ", result);

                setLoading(true);
                const result = await editCourseDetails(formData, token);
                setLoading(false);
                if(result){
                    dispatch(setStep(2))
                    dispatch(setCourse(result))
                }
            }
            else{
                toast.error("No changes made so the form");
            }
            
            return;
        }

        // create a new course 
        const formData = new FormData();
        // console.log("Printing data before creating course",data)
        // console.log("course benifits",data.coursebenifits)
        // console.log("type course benifits", typeof(data.courseBenifits))
        // console.log("thumbnail image : ", data.CourseImage)
        // console.log("type of thumnail: ", typeof(data.courseImage))

        formData.append("courseName", data.courseTitle);
        formData.append("courseDescription", data.courseShortDesc);
        formData.append("price", data.coursePrice);
        formData.append("tag", JSON.stringify(data.courseTags))
        formData.append("whatYouWillLearn", data.courseBenifits);
        formData.append("category", data.courseCategory);
        formData.append("instructions", JSON.stringify(data.courseRequirements));
        formData.append("status", COURSE_STATUS.DRAFT);
        formData.append("thumbnailImage", data.CourseImage
        );

        setLoading(true);
        // console.log("BEFORE add course API call");
        // console.log("PRINTING FORMDATA", formData);
        const result = await addCourseDetails(formData,token);
        // console.log("PRINTING result", result);
        // console.log("PRINTING FORMDATA", formData);
        if(result) {
            dispatch(setStep(2))
            dispatch(setCourse(result));
            // console.log("Now moving to step 2")
        }

        setLoading(false);

    }

    return (
        <form 
           onSubmit={handleSubmit(onSubmit)}
           className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6"
        >
            {/* Course Title */}
            <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="courseTitle">Course Title<sup>*</sup></label>
                <input
                    id="courseTitle"
                    placeholder="Enter Course Title"
                    {...register("courseTitle",{required:true})}
                    className="form-style w-full"
                />
                {
                    errors.courseTitle && (
                        <span className="ml-2 text-xs tracking-wide text-pink-200">
                            Course Title is required
                        </span>
                    )
                }
            </div>

            {/* Course Short Descrption */}
            <div  className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="courseShortDesc">Course Short Description <sup>*</sup></label>
                <textarea
                    id="courseShortDesc"
                    placeholder="Enter Description"
                    {...register("courseShortDesc",{required:true})}
                    className="form-style resize-x-none min-h-[130px] w-full"
                />
                {
                    errors.courseShortDesc && (
                        <span className="ml-2 text-xs tracking-wide text-pink-200">
                            Course Description is required 
                        </span>
                    )
                }
            </div>

            {/* Course Price */}
            <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="coursePrice">Course Price<sub>*</sub></label>
                <input
                    id="coursePrice"
                    placeholder="Enter Course Price"
                    {...register("coursePrice",
                    {
                        required:true,
                        valueAsNumber:true,
                        pattern: {
                            value: /^(0|[1-9]\d*)(\.\d+)?$/,
                        },
                    })}
                    className="form-style w-full !pl-12"
                />
                <HiOutlineCurrencyRupee className=" absolute left-3 top-1/2 inline-block -translate-y-1/2 text-2xl text-richblack-400" />
                {
                    errors.coursePrice && (
                        <span className="ml-2 text-xs tracking-wide text-pink-200">
                            Course Price is required 
                        </span>
                    )
                }
            </div>
            
            {/* Course Category */}
            <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="courseCategory">Course Category <sub className="text-pink-200">*</sub></label>
                <select 
                    id="courseCategory"
                    defaultValue=""
                    {...register("courseCategory", {required:true})}
                    className=" form-style w-full"
                >
                    <option value="" disabled>Chose a Category</option>
                    {
                        !loading && courseCategories.map((category,index) => (
                            <option key={index} value={category?._id}>
                                {category?.name}
                            </option>
                        ))
                    }
                </select>
                {
                    errors.courseCategory && (
                        <span>Course Category is Required</span>
                    )
                }
            </div>

            {/* create a custom component for handling tags input */}

            <ChipInput 
                label="Tags"
                name="courseTags"
                placeholder="Enter Tags and Press Enter"
                register={register}
                errors={errors}
                setValue = {setValue}
                getValue={getValues}
            />

            {/* create component for uploading and showing of media  */} 
            <Upload 
                name = "CourseImage"
                label = "Course Thumbnail"
                register={register}
                errors = {errors}
                setValue={setValue}
                editData = {editCourse ? course?.thumbnail : null}
            />

            {/* Benifits of the Course */}
            <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="courseBenifits" >
                    Benifits of the Course <sub className="text-pink-200">*</sub>
                </label>
                <textarea 
                    id="courseBenifits"
                    placeholder="Enter Beniftis of the course"
                    {...register("courseBenifits", {required:true})}
                    className="form-style resize-x-none min-h-[130px] w-full"
                />
                {
                    errors.coursebenifits && (
                        <span className="ml-2 text-xs tracking-wide text-pink-200">
                            Benifits of the course are required
                        </span>
                    )
                }
            </div>

            {/* Requirement  field */}
            <RequirementField 
                name="courseRequirements"
                label="Requirements/Instructions"
                register={register}
                errors={errors}
                setValue={setValue}
                getValues= {getValues}
            />

             {/* Next Button */}
            <div className="flex justify-end gap-x-2">
                {
                    editCourse && (
                        <button
                            onClick={() => dispatch(setStep(2))}
                            className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
                        >
                            Continue Without saving
                        </button>
                    )
                }

                <IconBtn 
                    disabled={loading}
                    text={!editCourse ? "Next" : "Save Changes"}
                >
                    <MdNavigateNext />
                </IconBtn>
            </div>

        </form>
    )
}

export default CourseInformationForm