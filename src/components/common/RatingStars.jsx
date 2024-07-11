import React, {useEffect , useState} from "react";

import {
    TiStarFullOutline,
    TiStarHalfOutline,
    TiStarOutline
} from 'react-icons/ti'

function RatingStars({review_Count, Star_Size}){
    const [starCount, setStarCount] = useState({full: 0, half: 0, empty: 0})

    useEffect(() => {
        const wholeStars = Math.floor(review_Count) || 0
        setStarCount({
            full: wholeStars,
            half: Number.isInteger(review_Count)? 0 : 1,
            empty: Number.isInteger(review_Count) ? 5 - wholeStars: 4- wholeStars,
        })
    }, [review_Count])

    return (
        <div className="flex gap-1 text-yellow-100">
            {[...new Array(starCount.full)].map((_, i) => {
                return <TiStarFullOutline key={i} size={Star_Size || 20} /> 
            })}
            {[...new Array(starCount.half)].map((_, i) => {
                return <TiStarHalfOutline key={i} size={Star_Size || 20} />
            })}
            {[...new Array(starCount.empty)].map((_, i) => {
                return <TiStarOutline key={i} size={Star_Size || 20} />
            })}
        </div>
    )
}

export default RatingStars