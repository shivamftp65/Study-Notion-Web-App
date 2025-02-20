import React, { useEffect, useState } from 'react'
import Footer from '../components/common/Footer'
import { useParams } from 'react-router-dom'
import { apiConnector } from '../services/apiconnector';
import { categories } from '../services/apis';
import { getCatalogPageData } from '../services/opeeations/pageAndComponentData';
import CourseSlider from '../components/core/Catalog/CourseSlider';
import Course_Card from '../components/core/Catalog/Course_Card';
import { useSelector } from 'react-redux';
import Error from "./Error.jsx"

const Catalog = () => {
    const { loading } = useSelector((state) => state.profile)
    const { catalogName } = useParams();
    const [active, setActive] = useState(1)
    const [catalogPageData, setCatalogPageData] = useState(null);
    const [categoryId, setCategoryId] = useState("");

    // fetch all categories
    useEffect(() => {
        // select the category jo ki hamne hit kiya tha, uski id nikalenge taki uska details findout kar sake
        const getCategories = async () => {
            const res = await apiConnector("GET", categories.CATEGORIES_API);
            console.log("result inside Catalog Page: ", res);
            const category_id = res?.data?.date?.filter((ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName)[0]._id;
            console.log("Category id inside Catalog page: ", category_id);
            setCategoryId(category_id);
        }
        getCategories();
    }, [catalogName]);

    useEffect(() => {
        // category details nikal lenge using categoryid 
        const getCategoryDetails = async () => {
            try {
                const res = await getCatalogPageData(categoryId);
                console.log("Printing the res in category Page: ", res);
                setCatalogPageData(res);
            } catch (error) {
                console.log(error);
            }
        }

        if (categoryId) {
            getCategoryDetails();
        }
    }, [categoryId]);

    if (loading || !catalogPageData) {
        return (
          <div>
            <div  className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <div className='spinner'></div>
            </div>
          </div>
        )
    }

    if (!loading && !catalogPageData.success) {
        return <Error />
    }

    return (
        <>
            {/* Hero Section */}
            <div className="box-content bg-richblack-800 px-4">

                <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent ">
                    <p className="text-sm text-richblack-300">
                        {`Home / Catalog /`}
                        <span className="text-yellow-25">
                            {catalogPageData?.data?.selectedCategory?.name}
                        </span>
                    </p>
                    <p className="text-3xl text-richblack-5">
                        {
                            catalogPageData?.data?.selectedCategory?.name
                        }
                    </p>
                    <p className="max-w-[870px] text-richblack-200">
                        {
                            catalogPageData?.data?.selectedCategory?.description
                        }
                    </p>
                </div>
            </div>

            {/* section1 */}


            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">Courses to get You started</div>
                <div className="my-4 flex border-b border-b-richblack-600 text-sm">
                    <p
                        className={`px-4 py-2 ${active === 1 ? "border-b border-b-yellow-25 text-yellow-25"
                                : "text-richblack-50"
                            } cursor-pointer`}
                        onClick={() => setActive(1)}
                    >
                        Most Popular
                    </p>

                    <p
                        className={`px-4 py-2 ${active === 2
                                ? "border-b border-b-yellow-25 text-yellow-25"
                                : "text-richblack-50"
                            } cursor-pointer`}
                    >
                        New
                    </p>
                </div>
                <div>
                    <CourseSlider
                        Courses={catalogPageData?.data?.selectedCategory?.courses}
                    />
                </div>
            </div>

            {/* section2 */}

            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">
                    Top Courses in {catalogPageData?.data?.selectedCategory?.data}
                </div>
                <p>Top Courses</p>
                <div className='py-8'>
                    <CourseSlider
                        Courses={catalogPageData?.data?.differentCategory?.courses}
                    />
                </div>
            </div>

            {/* section3 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <p className="section_heading">Frequently Bought</p>
                <div className='py-8'>
                    <div className='grid grid-cols-1 lg:grid-cols-2'>
                        {
                            catalogPageData?.data?.mostSellingCourses?.slice(0, 4)
                                .map((course, index) => (
                                    <Course_Card course={course} key={index} Height={"h-[400px]"} />
                                ))
                        }
                    </div>
                </div>
            </div>
            
            <Footer />
        </>
    )
}


export default Catalog