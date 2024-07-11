import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import ReactStars from 'react-rating-stars-component'
import IconBtn from "../../common/IconBtn";
import {createRating} from '../../../services/opeeations/courseDetailsAPI'

const CourseReviewModal = ({setReviewModal}) => {

    const {user} = useSelector((state) => state.profile);
    const {token} = useSelector((state) => state.auth);
    const {courseEntireData} = useSelector((state) => state.viewCourse)
    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors}
    } = useForm();

    useEffect(() => {
        setValue("courseExperience","");
        setValue("courseRating", 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const ratingChanged = (newRating) => {
        setValue("courseRating", newRating)
    }

    const onSubmit = async (data) => {
        await createRating(
            {
                courseId: courseEntireData._id,
                rating: data.courseRating,
                review: data.courseExperience,
            },
            token
        );

        setReviewModal(false);
    }


    return (
        <div>

            <div>
                 {/* Modal Header */}
                <div>
                    <p>Add Review</p>
                    <button
                        onClick={() => setReviewModal(false)}
                    >
                        close
                        {/* Icon  */}
                    </button>
                </div>

                {/* Modal Body */}
                <div>
                    <div>
                        <img 
                            src={user?.image}
                            alt="user Image"
                            className=" aspect-square w-[50px] rounded-full object-cover" 
                        />

                        <div>
                            <p>{user?.firstName} {user?.lastName}</p>
                            <p>Posting Publicly</p>
                        </div>
                    </div>

                    <form
                        className="mt-6 flex flex-col items-center"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <ReactStars 
                            count={5}
                            onChange={ratingChanged}
                            size={24}
                            activeColor="#ffd700"
                        />

                        <div>
                            <label htmlFor="courseExperience">
                                Add Your Experience
                            </label>
                            <textarea
                                id="courseExperience"
                                placeholder="Add your experience here"
                                {...register("courseExperience",{ required: true})}
                                className="form-style min-h-[130px] w-full"
                            >
                                {
                                    errors.courseExperience && (
                                        <span>
                                            Please add your experience
                                        </span>
                                    )
                                }
                            </textarea>
                        </div>

                        <div>
                            {/* Cancel and save button */}
                            <button 
                                onClick={() => setReviewModal(false)}
                            >
                                Cancel
                            </button>

                            <IconBtn 
                                text="save"
                            /> 
                        </div>
                    </form>

                </div>

            </div>
        </div>
    )
}

export default CourseReviewModal