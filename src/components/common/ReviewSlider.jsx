import React, { useEffect, useState } from "react";

import {Swiper, SwiperSlide} from 'swiper/react'
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import {Autoplay, FreeMode, Pagination} from "swiper/modules"

import ReactStars from 'react-rating-stars-component';

import { apiConnector } from "../../services/apiconnector";
import { ratingsEndpoints } from "../../services/apis";

import { FaStar } from "react-icons/fa";
// import { delay } from "@reduxjs/toolkit/dist/utils";

const ReviewSlider = () => {

    const [reviews, setReviews] = useState([]);
    const truncateWords = 15;

    useEffect(() => {
        const fetchAllReviews = async () => {
            const response = await apiConnector("GET",ratingsEndpoints.REVIEWS_DETAILS_API);
            console.log("Loging respnse in rating", response);
            const {data} = response;

            if(data?.success){
                setReviews(data?.data);
            }

            console.log("Printing Reviews",reviews)
        }
        fetchAllReviews();
    }, []);

    return (
        <div>
            <div className="h-[190px] max-w-maxContent">
                <Swiper
                    slidesPerView={4}
                    spaceBetween={24}
                    loop={true}
                    freeMode={true}
                    autoplay={{
                        delay: 2500,
                    }}
                    modules={[FreeMode, Pagination, Autoplay]}
                    className="w-full"
                >
                    {
                        reviews.map((review, index) => {
                            <SwiperSlide key={index}>
                                <img 
                                    src={review?.user?.Image ? review?.user?.image :`https:/`}
                                    alt="Profile pic"
                                />
                                <p>{review?.user?.firstName} {review?.user?.lastName}</p>
                                <p>{review?.course?.courseName}</p>
                                <p>{review?.review}</p>
                                <p>{review?.rating.toFixd(1)}</p>

                                <ReactStars
                                    count={5}
                                    value={review?.rating}
                                    size={20}
                                    edit={false}
                                    activeColor={"#ffd700"}
                                    emptyIcon={<FaStar />}
                                    fullIcon = {<FaStar/>}
                                />
                            </SwiperSlide>
                        })
                    }
                </Swiper>
            </div>
        </div>
    )
}

export default ReviewSlider