import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchInstructorCourses } from '../../../../services/opeeations/courseDetailsAPI';
import { getInstructorData } from "../../../../services/opeeations/profileAPI";
import { Link } from "react-router-dom";
import InstructorChart from "./InstructorChart";

const Instructor = () => {

    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [instrcutorData, setInstructorData] = useState(null);
    const [courses, setCourses] = useState([]);
    const { user } = useSelector((state) => state.profile);

    useEffect(() => {
        const getCourseDataWthStats = async () => {
            setLoading(true);

            // pending 
            const instructorApiData = await getInstructorData(token);
            const result = await fetchInstructorCourses(token);

            console.log(instructorApiData);

            if (instructorApiData.length) {
                setInstructorData(instructorApiData);
            }
            if (result) {
                setCourses(result);
            }
            setLoading(false);
        }

        getCourseDataWthStats();
    }, [])

    const totalAmount = instrcutorData?.reduce((acc, curr) => acc + curr.totalAmountGenearted, 0);
    const totalStudents = instrcutorData?.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0);

    return (
        <div>
            <div>
                <h1>Hi {user?.firstName}</h1>
                <p>Let's start something new</p>
            </div>

            {
                loading ? (<div className="spinner"></div>)
                    : courses.length > 0
                        ? (
                            <div>
                                <div>
                                    <div>
                                        <InstructorChart courses={instrcutorData} />
                                        <div>
                                            <p>Statistics</p>
                                            <div>
                                                <p>Total Courses</p>
                                                <p>{courses.length}</p>
                                            </div>

                                            <div>
                                                <p>Total Students</p>
                                                <p>{totalStudents}</p>
                                            </div>

                                            <div>
                                                <p>Total Income</p>
                                                <p>{totalAmount}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    {/* Render 3 courese */}
                                    <div>
                                        <p>Your Courses</p>
                                        <Link to={"/dashboard/my-course"}>
                                            <p>View All</p>
                                        </Link>
                                    </div>
                                    <div>
                                        {
                                            courses.slice(0,3).map((course) => (
                                                <div>
                                                    <img src={course.thumbnail} alt="course Image" />
                                                    <div>
                                                        <p>{course.courseName}</p>
                                                        <div>
                                                            <p>{course.StudentsEnrolled.length} students</p>
                                                            <p> | </p>
                                                            <p>RS {course.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        ) : (<div>
                            <p>You have not created any courses yet</p>
                            <Link to={"/dashboard/addCourse"}>
                                Create a Course
                            </Link>
                        </div>)
            }
        </div>
    )
}

export default Instructor