import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import IconBtn from '../../common/IconBtn';

const VideoDetailsSidebar = ({setReviewModal}) => {

    const [activeStatus, setActiveStatus] = useState("");
    const [videoBarActive, setVideoBarActive] = useState("");
    const navigate = useNavigate();
    const {sectionId, subSectionId} = useParams();
    const location = useLocation();
    const {
        courseSectionData,
        courseEntireData,
        totalNoOfLectures,
        completedLectures,
    } = useSelector((state) => state.viewCourse);
    

    useEffect(()=> {
        ;(()=> {
            if(!courseSectionData.length){
                return;
            }
            // Find the index of clicked section
            const currentSectionIndex = courseSectionData.findIndex(
                (data) => data._id === sectionId
            )
            // find the index of clicked subsection inside section
            const currentSubSectionIndex = courseSectionData?.[currentSectionIndex]?.subSection.findIndex(
                (data) => data._id === subSectionId
            )
            // find the activeSubsextionid 
            const activeSubSectionId = courseSectionData[currentSectionIndex]?.
            subSection?.[currentSubSectionIndex]?._id;

            // set current section here
            setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);
            // set sub-section here
            setVideoBarActive(activeSubSectionId)

        })()
    }, [courseSectionData, courseEntireData, location.pathname])

    return (
        <div>
            {/* for buttons and headings */}
            <div>
                {/* for buttons */}
                <div>
                    <div 
                        onClick={() => {
                            navigate('/dashboard/enrolled-courses')
                        }}
                    >
                        Back
                    </div>

                    <div>
                        <IconBtn 
                            text="Add Review"
                            onClick={() => setReviewModal(true)}
                        />
                    </div>
                </div>
                {/* for headings or title */}
                <div>
                    <p>{courseEntireData?.courseName}</p>
                    <p>{completedLectures?.length} / {totalNoOfLectures}</p>
                </div>
            </div>

            {/* for sections and subsections */}
            <div>
                {
                    courseSectionData.map((section, index) => (
                        <div
                            onClick={() => setActiveStatus(section?.id)}
                            key={index}
                        >
                            {/* Section */}
                            <div>
                                <div>
                                    {section?.sectionId}
                                </div>
                                {/* HW- ADD arrow icon and handle rotate logic */}
                            </div>

                            {/* Subsections */}
                            <div>
                                {
                                    activeStatus === section._id && (
                                        <div>
                                            {
                                                section.subSection.map((topic, index) => (
                                                    <div
                                                        className={`flex gap-5 p-5 ${
                                                            videoBarActive === topic._id
                                                            ? "bg-yellow-200 text-richblack-900"
                                                            : "bg-richblack-900 text-white"
                                                        }`}
                                                        key={index}
                                                        onClick={() => {
                                                            navigate(
                                                                `view-course/${courseEntireData?._id}/
                                                                section/${section?._id}/
                                                                sub-section/${topic?._id}`
                                                            )
                                                            setVideoBarActive(topic?._id)
                                                        }}
                                                    >
                                                        <input 
                                                            type="checkbox"
                                                            checked={completedLectures.includes(topic._id)}
                                                            onChange={() => {}}
                                                        />
                                                        <span >
                                                            {topic.title}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default VideoDetailsSidebar