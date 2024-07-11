import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { updateCompletedLectures } from '../../../slices/viewCourseSlice'
import { markLectureAsComplete } from '../../../services/opeeations/courseDetailsAPI.js';

import { Player } from 'video-react';
import 'video-react/dist/video-react.css';
import {AiFillPlayCircle} from 'react-icons/ai';

import IconBtn from '../../common/IconBtn.jsx';

const VideoDetails = () => {

    const {courseId, sectionId, subSectionId} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const playerRef = useRef();
    const {token} = useSelector((state) => state.auth);
    const {courseSectionData, courseEntireData, completedLectures} = useSelector((state)=> state.viewCourses);
    const location = useLocation();

    const [videoData, setVideoData] = useState([]);
    const [videoEnded , setVideoEnded] = useState(false);
    const [previewSource, setPreviewSourse] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const setVideoSpecificDetails = async () => {
            if(!courseSectionData.length){
                return;
            }
            if(!courseId && !sectionId && !subSectionId){
                navigate("/dashboard/enrolled-courses");
            } else{
                // let's assume all three fields are present

                const filteredData = courseSectionData.filter(
                    (course) => course._id === sectionId
                )

                const filteredVideoData = filteredData?.[0].subsection.filter(
                    (data) => data._id === subSectionId                
                )

                setVideoData(filteredVideoData[0]);
                setPreviewSourse(courseEntireData.thumbnail);
                setVideoEnded(false);
            }
        }
        setVideoSpecificDetails();
    },[courseSectionData, courseEntireData, location.pathname]);

    // check if the lecture is the first video of the course
    const isFirstVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
            (data) => data._id === subSectionId
        )

        if(currentSectionIndex === 0 && currentSubSectionIndex === 0){
            return true;
        } else{
            return false;
        }
    }

    // check if the lecture is the last video of the course
    const isLastVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
            (data) => data._id === subSectionId
        )

        if(currentSectionIndex === courseSectionData.length - 1 &&
            currentSubSectionIndex === noOfSubSections - 1
        ){
            return true;
        } else{
            return false;
        }
    }

    const goToNextVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
            (data) => data._id === subSectionId
        )

        if(currentSubSectionIndex !== noOfSubSections - 1){
            // same section next video me jana hai
            const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex + 1]
            ._id

            // next video par jao
            navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
        } else{
            // different section ki first video
            const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
            const nextSubSectionId = courseSectionData[currentSectionIndex+1].subSection[0]._id;

            // iss video par jao
            navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
        }
    }

    const goTOPrevVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
            (data) => data._id === subSectionId
        )

        if(currentSectionIndex !== 0){
            // same section , prev video
            const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex - 1]._id;
            // is video par chale jao
            navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)
        } else{
            // different section , last video
            const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
            const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
            const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSection[prevSubSectionLength - 1]._id;

            navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)
        }
    }

    const handleLectureCompletion = async () => {
        // Pending
        // dummy code, baad me we will replace it with actual code
        setLoading(true);
        const result = await markLectureAsComplete({courseId: courseId, subSectionId: subSectionId}, token);
        // state update
        if(result){
            dispatch(updateCompletedLectures(subSectionId))
        }
        setLoading(false);
    }

    return (
        <div>
            {
                !videoData ? (
                    <div>
                        No Data Found
                    </div>
                ) : (
                    <Player 
                        ref={playerRef}
                        aspectRatio="16:9"
                        playsInline
                        onEnded={() => setVideoEnded(true)}
                        src={videoData?.videoUrl}
                    >
                        {/* <source src={videoData?.videoUrl} /> */}
                        <AiFillPlayCircle />
                        {
                            videoEnded && (
                                <div>
                                    {
                                        !completedLectures.includes(subSectionId) && (
                                            <IconBtn 
                                                disabled={loading}
                                                onClick={() => handleLectureCompletion()}
                                                text={!loading ? "Mark As Completed" : "Loading..."}

                                            />
                                        )
                                    }

                                    <IconBtn 
                                        disabled={loading}
                                        onClick={() => {
                                            if(playerRef?.current){
                                                Player.current?.seek(0);
                                                setVideoEnded(false);
                                            }                                        
                                        }}
                                        text={"Rewatch"}
                                        custonClasses={"text-xl"}
                                    />

                                    <div>
                                        { !isFirstVideo() && (
                                            <button
                                                disabled={loading}
                                                onClick={goTOPrevVideo}
                                                className="blackButton"
                                            >
                                                Prev
                                            </button>
                                        )}
                                        {
                                            !isLastVideo() && (
                                                <button
                                                    disabled={loading}
                                                    onClick={goToNextVideo}
                                                    className="blackButton"
                                                >
                                                    Next
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </Player>
                )
            }

            <h1>
                {videoData?.title}
            </h1>
            <p>
                {videoData?.description}
            </p>
        </div>
    )
}

export default VideoDetails