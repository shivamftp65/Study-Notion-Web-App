import React, { useState } from "react";
import {Chart, registerables} from "chart.js";
import { Pie } from "react-chartjs-2";


Chart.register(...registerables);

const InstructorChart = ({courses}) => {

    const [currChart, setCurrChar] = useState("students");

    // function to generate random color
    const getRandomColors = (numColors) => {
        const colors= [];
        for(let i=0;i<numColors;i++){
            const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
            colors.push(color)
        }

        return colors
    }

    // create data for chart displaying students info
    const chartDataForStudents = {
        labels: courses.map((course) => course.courseName),
        datasets: [
            {
                data: courses.map((course) => course.totalStudentsEnrolled),
                backgroundColor: getRandomColors(courses.length),
            }
        ]
    }

    // create data for chart displaying income info
    const ChartDataForIncome = {
        labels: courses.map((course) => course.courseName),
        datasets: [
            {
                data: courses.map((course) => course.totalAmountGenerated),
                backgroundColor: getRandomColors(courses.length),
            }
        ]
    }

    // create otpions
    const options = {

    };

    return (
        <div>
            <p>Visualise</p>

            <div>
                <button 
                    onClick={() => setCurrChar("students")}
                >
                    Student
                </button>
                <button
                    onClick={() => setCurrChar("income")}
                >
                    Income
                </button>
            </div>

            <Pie 
                data={currChart === 'students' ? chartDataForStudents : ChartDataForIncome}
                options={options}
            />
        </div>
    )
}

export default InstructorChart