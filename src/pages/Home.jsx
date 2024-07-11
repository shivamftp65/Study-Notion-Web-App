import React from "react";
import { Link } from "react-router-dom";
import { FaArrowCircleRight, FaArrowRight } from "react-icons/fa";
import HightlightText from "../components/core/Homepage/HighlightText";
import CTAButton from '../components/core/Homepage/Button'
import Banner from '../assets/Images/banner.mp4'
import CodeBlocks from "../components/core/Homepage/CodeBlocks";
import TimelineSection from "../components/core/Homepage/TimelineSection";
import LearningLanguageSection from "../components/core/Homepage/LearningLanguageSection";
import InstructorSection from "../components/core/Homepage/InstructorSection";
import ExploreMore from "../components/core/Homepage/ExploreMore";
import Footer from "../components/common/Footer";
import ReviewSlider from "../components/common/ReviewSlider";

const Home = () =>{
    return (
        <div>
            {/* section 1 */}
            <div className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between">
                <Link to={"/signup"}>
                    <div className=" group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit">
                        <div className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px] group-hover:bg-richblack-900">
                            <p>Become an Instructor</p>
                            <FaArrowCircleRight/>
                        </div>
                    </div>
                </Link>

                <div className="text-center text-4xl font-semibold mt-7">
                    Empower Your Future with  
                    <HightlightText text={"Coding Skills"} />
                </div>

                <div className="mt-4 w-[90%] text-center text-lg font-bold text-richblack-300">
                    With our online coding courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, including hands-on projects, quizzes, and personalized feedback from instructors. 
                </div>

                <div className="flex flex-row gap-7 mt-8">
                    <CTAButton active={true} linkto={'/signup'}>
                        Learn More
                    </CTAButton>

                    <CTAButton active={false} linkto={'/login'}>
                        Book a Demo
                    </CTAButton>
                </div>

                <div className="mx-3 my-12 shadow-blue-200">
                    <video muted loop autoPlay>
                        <source src={Banner} type="video/mp4" />
                    </video>
                </div>

                {/* code setion 1 */}

                <div>
                    <CodeBlocks 
                        position={"lg:flex-row"}
                        heading={
                            <div>
                                Unlock Your 
                                <HightlightText text={"coding potential"}/>
                                with our online courses
                            </div>
                        }
                        subheading={
                            "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you." 
                        }
                        ctabtn1={
                            {
                                btnText: "try it yourself",
                                linkto:'/signup',
                                active:true
                            }
                        }
                        ctabtn2={
                            {
                                btnText: "learn more",
                                linkto:'/login',
                                active:false
                            }
                        }

                        codeblock={`<!DOCTYPE html>\n<html>\nhead><title>Example</title>\n<linkrel="stylesheet"href="styles.css">\n/head>\nbody>\nh1><ahref="/">Header</a>\n/h1>\nnav><ahref="one/">One</a>\n<a href="two/">Two</a><ahref="three/">Three</a>\n/nav>`}
                        codeColor={' text-yellow-25'}
                    />    
                </div>

                {/* code section 2 */}

                <div>
                    <CodeBlocks 
                        position={"lg:flex-row-reverse"}
                        heading={
                            <div>
                                Unlock Your 
                                <HightlightText text={"coding potential"}/>
                                with our online courses
                            </div>
                        }
                        subheading={
                            "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you." 
                        }
                        ctabtn1={
                            {
                                btnText: "try it yourself",
                                linkto:'/signup',
                                active:true
                            }
                        }
                        ctabtn2={
                            {
                                btnText: "learn more",
                                linkto:'/login',
                                active:false
                            }
                        }

                        codeblock={`<!DOCTYPE html>\n<html>\nhead><title>Example</title>\n<linkrel="stylesheet"href="styles.css">\n/head>\nbody>\nh1><ahref="/">Header</a>\n/h1>\nnav><ahref="one/">One</a>\n<a href="two/">Two</a><ahref="three/">Three</a>\n/nav>`}
                        codeColor={' text-yellow-25'}
                    />    
                </div>

                <ExploreMore/>

            </div>

            {/* section 2 */}
            <div className='bg-pure-greys-5 text-richblack-700'>
                <div className="homepage-bg h-[300px]">

                    <div className="w-11/12 max-w-maxContent flex flex-col items-center justify-between  gap-5 max-auto">
                        <div className="h-[150px]"></div>
                        <div className="flex flex-row gap-7 text-white ">
                           
                            <CTAButton active={true} linkto={'/signup'}>
                                <div className="flex items-center gap-3">
                                    Expolore Full Catalog
                                    <FaArrowRight />
                                </div>                              
                            </CTAButton>


                            <CTAButton active={false} linkto={'/signup'}>
                                <div>
                                    Learn More
                                </div>                              
                            </CTAButton>
                        </div>

                    </div>

                </div>

                <div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7">
                    <div className="flex flex-row gap-5 mb-10 mt-[95px]">
                        <div className="text-4xl font-semibold w-[45%]">
                            Get the skills you need for a
                            <HightlightText text={'job that is demand'} />
                        </div>

                        <div className="flex flex-col gap-10 w-[40%] items-start">
                            <div className="text-[16px]">
                                The modern StudyNotion is the dictates its own terms. Today, to be a competitive 
                                specialist requires more than professional skills.
                            </div>

                            <CTAButton active={true} linkto={'/signup'}>
                                Learn More
                            </CTAButton>
                       </div>
                    </div>


                    <TimelineSection/>

                    <LearningLanguageSection/>

                    
                </div>

            </div>

            {/* section 3 */}
            <div className="w-11/12 mx-auto max-w-maxContent flex flex-col items-center justify-between gap-8 first-letter bg-richblack-900 text-white">
                
                <InstructorSection/>

                <h2 className="text-center text-4xl font-semibold mt-10">Review From Other Learners</h2>
                {/* Review Slider here */}
                <ReviewSlider />

            </div>


            {/* footer */}
            <Footer/>
        </div>
    )
}

export default Home
