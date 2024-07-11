import React from 'react'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import {resetPassword} from '../services/opeeations/authAPI'
import { Link,useLocation } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"

const UpdatePassword = () => {
    const [formData, setFormData] = useState({
        password:"",
        confirmPassword:"",
    })
    const dispatch = useDispatch()
    const {loading} = useSelector((state) => state.auth)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfimrPassword, setShowConfirmPassword] = useState(false)
     const location = useLocation()

    const {password, confirmPassword} = formData

    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name] : e.target.value,
        }))
    } 

    const handleOnSubmit = (e) => {
        e.preventDefault();
        const token = location.pathname.split('/').at(-1)
        dispatch(resetPassword(password,confirmPassword, token));
    }

    return (
        <div className='text-white'>
        {
            loading ? (
                <div className='text-white'>Loading...</div>
            ) : (
                <div>
                    <h1>Choose new Password</h1>
                    <p>Almost done, Enter Your Password and Youre all set</p>
                    <form action="" onSubmit={handleOnSubmit}>
                        <label htmlFor="">
                            <p>New Password <sub>*</sub></p>
                            <input
                                required
                                type={showPassword? 'text' : 'password'}
                                name='password'
                                value={password}
                                onChange={handleOnChange}
                                placeholder='Password'
                                className='w-full p-6 bg-richblack-600 text-richblack-5'
                            />
                            <span onClick={() => setShowPassword((prev) => !prev)}>
                                {
                                    showPassword? <AiFillEyeInvisible fontSize={24} /> : <AiFillEye fontSize={24}  />
                                }
                            </span>
                        </label>
                        <label htmlFor="">
                            <p>Confirm Password <sub>*</sub></p>
                            <input
                                required
                                type={showConfimrPassword? 'text' : 'password'}
                                name='confirmPassword'
                                value={confirmPassword}
                                onChange={handleOnChange}
                                placeholder='confirm Password'
                                className='w-full p-6 bg-richblack-600 text-richblack-5'
                            />
                            <span onClick={() => setShowConfirmPassword((prev) => !prev)}>
                                {
                                    showConfimrPassword? <AiFillEyeInvisible fontSize={24} /> : <AiFillEye fontSize={24}  />
                                }
                            </span>
                        </label>
                        <button type='submit'>
                            Reset Password
                        </button>
                        <div>
                            <Link to={'/login'}>
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            )
        }
        </div>
    )
}

export default UpdatePassword