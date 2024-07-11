import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createSubSection, updateSubSection } from "../../../../../services/opeeations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import { RxCross2} from 'react-icons/rx'
import IconBtn from "../../../../common/IconBtn";
import Upload from "../Upload";

const SubSectionModal = ({
    modalData,
    setModalData,
    add= false,
    view= false,
    edit=false
}) => {

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
        getValues,
    } = useForm()

    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false);
    const {course} = useSelector((state) => state.course)
    const {token} = useSelector((state) => state.auth)

    useEffect(() => {
        if(view || edit){
            setValue("lectureTitle", modalData.title);
            setValue("lectureDesc", modalData.description);
            setValue("lectureVideo", modalData.videoUrl);
        }
    }, [])

    // detect whether form is updated or not
    const isFormUpdated = () => {
        const currentValues = getValues();
        // console.log("changes after editing form values:", currentValues)
        if(currentValues.lectureTitle !== modalData.title ||
            currentValues.lectureDesc !== modalData.description ||
            currentValues.lectureVideo !== modalData.videoUrl 
            ) {
            return true; 
        } else{
            return false
        }

    }

    const handleEditSubSection =async () => {
        const currentValues = getValues();
        // console.log("changes after editing form values:", currentValues)
        const formData = new FormData();
        // console.log("Values After Editing form values:", currentValues)
        formData.append("sectionId", modalData.sectionId);
        formData.append("subSectionId", modalData._id);

        if(currentValues.lectureTitle !== modalData.title){
            formData.append("title",currentValues.lectureTitle);
        }

        if(currentValues.lectureDesc !== modalData.description){
            formData.append("description",currentValues.lectureDesc);
        }

        if(currentValues.lectureVideo !== modalData.videoUrl){
            formData.append("video",currentValues.lectureVideo);
        }

        setLoading(true);
        // Api class
        const result = await updateSubSection(formData, token);

        if(result){
            // TODO: same check (did we need to do anything)
            // console.log("result inside subsection modal: ", result)
            // Update the structure of course
            const updatedCourseContent = course.courseContent.map((section) => 
                section._id == modalData.sectionId ? result : section
            );
            const updatedCourse = {...course, courseContent: updatedCourseContent}
            dispatch(setCourse(updatedCourse));
        }

        setModalData(null);
        setLoading(false);
    }

    const onSubmit =async (data) => {
        // console.log("data inside the subsection modal: ", data);
        if(view){
            return;
        } 

        if(edit){
            if(!isFormUpdated) {
                toast.error("No changes made to the form")
            }
            else {
                // edit krdo store me
                handleEditSubSection();
            }
            return
        }

        const formData = new FormData();
        formData.append("sectionId", modalData)
        formData.append("title", data.lectureTitle)
        formData.append("description", data.lectureDesc)
        formData.append("video", data.lectureVideo)

        setLoading(true);

        //Api call
        const result = await createSubSection(formData, token);

        if(result){
            // TODO: check for updation -> update the structure of the course
            const updatedCourseContent = course.courseContent.map((section) => 
                section._id == modalData ? result : section
            );
            const updatedCourse = {...course, courseContent: updatedCourseContent}
            dispatch(setCourse(updatedCourse));
        }

        setModalData(null)
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm" >
            <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
                    <p className="text-xl font-semibold text-richblack-5">
                        {view && "Viewing"} 
                        {add && "Adding"}
                        {edit && "Editing"}
                        Lecture
                    </p>
                    <button onClick={() => (!loading? setModalData(null) : {})}>
                        <RxCross2 className="text-2xl text-richblack-5"/>
                    </button>
                </div>

                {/* Modal Form */}
                <form 
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-8 px-8 py-10"
                >
                    {/* Lecture Video Upload */}
                    <Upload 
                        name="lectureVideo"
                        label = "Lecture Video"
                        register={register}
                        setValue = {setValue}
                        errors = {errors}
                        video={true}
                        viewData = {view ? modalData.videoUrl : null}
                        editData = {edit ? modalData.videoUrl : null}
                    />

                    {/* Lecture Title */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="lectureTitle" className="text-sm text-richblack-5" >
                            Lecture Title {!view && <sup className="text-pink-200">*</sup>}
                        </label>
                        <input 
                            disabled={view || loading}
                            id="lectureTitle"
                            placeholder="Enter Lecture Title"
                            {...register("lectureTitle", {required:true})}
                            className="form-style w-full"

                        />

                        {errors.lectureTitle && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                Lecture Title is required
                            </span>
                        )}
                    </div>

                    {/* Lecture Description */}
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="lectureDesc" className="text-sm text-richblack-5">
                            Lecture Description{" "}
                            {!view && <sup className="text-pink-200">*</sup>}
                        </label>
                        <textarea 
                            disabled={view || loading}
                            id="lectureDesc"
                            placeholder="Enter lecture Description"
                            {...register("lectureDesc", {required:true})}
                            className="form-style resize-x-none min-h-[130px] w-full"
                        />

                        {
                            errors.lectureDesc && (
                                <span className="ml-2 text-xs tracking-wide text-pink-200">
                                    Lecture Description is required
                                </span>
                            )
                        }

                    </div>

                    {
                        !view && (
                            <div className="flex justify-end">
                                <IconBtn 
                                    text={loading ? "Loading..." : edit? "Save Changes" : "Save"}
                                />
                            </div>
                        )
                    }
                </form>
            </div>
        </div>
    )
}

export default SubSectionModal