import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {RxDropdownMenu} from 'react-icons/rx'
import {MdEdit} from 'react-icons/md'
import {RiDeleteBin6Line} from 'react-icons/ri'
// import {BiSolidDownArrow} from 'react-icons/bi'
import {AiFillCaretDown} from 'react-icons/ai'
import SubSectionModal from './SubSectionModal'
import ConfirmationModal from '../../../../common/ConfirmationModal'
import { deleteSection, deleteSubSection } from '../../../../../services/opeeations/courseDetailsAPI'
import { setCourse } from '../../../../../slices/courseSlice'
import {FaPlus} from 'react-icons/fa'


const NestedView = ({handleChangeSectionName}) => {

    const {course} = useSelector((state) => state.course)
    const {token} = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    const [addSubSection, setAddSubSection] = useState(null)
    const [viewSubSection, setViewSubSection] = useState(null)
    const [editSubSection, setEditSubSection] = useState(null)

    const [confirmationModal, setConfirmationModal] = useState(null)
    
    const handleDeleteSection =async (sectionId) => {
        console.log("course id inside nested view", course._id);
        const result = await deleteSection({
            sectionId,
            courseId:course._id,
            token
        })

        if(result){
            console.log("delete section inside nested view: ", result)
            dispatch(setCourse(result))
        }

        setConfirmationModal(null);
    }

    const handleDeleteSubSection =async (subSectionId, sectionId) => {
        const result = await deleteSubSection({
            subSectionId,
            sectionId,
            token
        })

        if(result) {
            // TODO : is anything psbl, think extra
            console.log("Delete Subsection inside nested view: ", result);

            const updatedCourseContent = course.courseContent.map((section) => 
                section._id === sectionId? result : section 
            )
            const updatedCourse = {...course, courseContent : updatedCourseContent}

            dispatch(setCourse(updatedCourse))
        }

        setConfirmationModal(null)

    }
    

    return (
        <div>
            <div 
                className='rounded-lg bg-richblack-700 p-6 px-8'
                id='nestedViewContainer'
            >
                {course?.courseContent?.map((section) => (
                    // Section dropdown
                    <details key={section._id} open>
                        {/* Section Dropdown Content */}
                        <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
                            <div className="flex items-center gap-x-3">
                                <RxDropdownMenu className="text-2xl text-richblack-50"/>
                                <p className="font-semibold text-richblack-50">
                                    {section.sectionName}
                                </p>
                            </div>

                            <div className='flex items-center gap-x-3'>
                                <button onClick={() => handleChangeSectionName(section._id, section.sectionName)}>
                                    <MdEdit className="text-xl text-richblack-300" />
                                </button>

                                <button onClick={() => {
                                    setConfirmationModal({
                                        text1: "Delete this section",
                                        text2:"All the lecture in this section will be deleted",
                                        btn1Text: "Delete",
                                        btn2Text: "Cancel",
                                        btn1Handler: () => handleDeleteSection(section._id),
                                        btn2Handler: () => setConfirmationModal(null),
                                    })
                                }}>
                                    <RiDeleteBin6Line  className="text-xl text-richblack-300"/>
                                </button>
                                <span className="font-medium text-richblack-300">|</span>

                                <AiFillCaretDown className={`text-xl text-richblack-300`} />

                            </div>
                        </summary>

                        <div className="px-6 pb-4">
                            {/* Render All Sub Sections Within a Section */}
                            {
                                section.subSection.map((data) => (
                                    <div 
                                        key={data?._id}
                                        onClick={() => setViewSubSection(data)}
                                        className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                                    >
                                        <div className="flex items-center gap-x-3 py-2 ">
                                            <RxDropdownMenu className="text-2xl text-richblack-50"/>
                                            <p>{data.title}</p>
                                        </div>

                                        {/*  hame onclick ki propagation ko stop karna padega */}
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className='flex items-center gap-x-3'
                                        >
                                            <button
                                                onClick={() => setEditSubSection({...data, sectionId:section._id})}
                                            >
                                                <MdEdit className="text-xl text-richblack-300" />
                                            </button>
                                            <button
                                                onClick={() => setConfirmationModal({
                                                    text1: "Delete this sub section",
                                                    text2: "selected lecture will be deleted",
                                                    btn1Text: "Delete",
                                                    btn2Text : "Cancel",
                                                    btn1Handler: () => handleDeleteSubSection(data._id, section._id),
                                                    btn2Handler : () => setConfirmationModal(null)})
                                                }
                                            >
                                                <RiDeleteBin6Line className="text-xl text-richblack-300" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                            {/* Add new lecture to section */}
                            <button 
                                onClick={() => setAddSubSection(section._id)}
                                className="mt-3 flex items-center gap-x-1 text-yellow-50"
                            >
                                <FaPlus className="text-lg"/>
                                <p>Add Lecture</p>
                            </button>
                        </div>
                    </details>
                ))}
            </div> 
            
            {/* Modal Data */}
            {
                addSubSection ? (<SubSectionModal
                    modalData={addSubSection}
                    setModalData= {setAddSubSection}
                    add={true}
                />
                ) : viewSubSection ? (<SubSectionModal
                    modalData={viewSubSection}
                    setModalData= {setViewSubSection}
                    view={true}
                />
                ) : editSubSection ? (<SubSectionModal
                    modalData={editSubSection}
                    setModalData= {setEditSubSection}
                    edit={true}
                />
                ) : (<div></div>)
            }

            {/* Confirmation Modal */}
            {
                confirmationModal ? (
                    <ConfirmationModal modalData={confirmationModal} />
                ) : (<div></div>)
            }

        </div>
    )
}

export default NestedView