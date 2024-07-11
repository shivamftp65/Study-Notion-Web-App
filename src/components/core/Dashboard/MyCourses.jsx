import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchInstructorCourses } from "../../../services/opeeations/courseDetailsAPI";
import IconBtn from "../../common/IconBtn";
import CourseTable from "./InstructorCourses/CourseTable";
import { VscAdd } from 'react-icons/vsc'

const MyCourses = () => {

    const {token} = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);

    useEffect(()=> {
        const fetchCourses = async () => {  
            const result = await fetchInstructorCourses(token);
            if(result){
                setCourses(result)
            }
            console.log("instructor courses inside My courses:courses ",courses);
        }
        

        fetchCourses();
    },[])


    return (
        <div>
            <div className="mb-14 flex items-center justify-between">
                <h1 className="text-3xl font-medium text-richblack-5">
                    My Courses
                </h1>
                <IconBtn 
                    text={"Add Course"}
                    onClick={()=> navigate("/dashboard/add-course")}
                    // TODO : ADD icon here
                >
                    <VscAdd/>
                </IconBtn>
            </div>

            {
                courses && <CourseTable courses={courses} setCourses={setCourses} />
            }
        </div>
    )
}

export default MyCourses