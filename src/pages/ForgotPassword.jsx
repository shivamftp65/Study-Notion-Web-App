import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getPasswordResetToken } from "../services/opeeations/authAPI";

const ForgotPassword = () => {

    const [emailSent, setEmailSent] = useState(false)
    const [email, setEmail] = useState('')
    const {loading} = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    function handleOnSubmit(e){
        e.preventDefault();
        dispatch(getPasswordResetToken(email,setEmailSent))
    }

    return (
        <div className="text-white flex justify-center items-center">
            {
                loading ? (
                    <div>Loading...</div>
                ) : (
                    <div>
                        <h1>
                            {
                                !emailSent ? "Reset Your Password" : 'Check Email'
                            }
                        </h1>
                        <p>
                            {
                                !emailSent ? "Have no fear. We'll email you instructions to your reset password. if you dont have access to your email we can try account recovery"
                                : `We have sen the reset email to ${email}`
                            }
                        </p>

                        <form onSubmit={handleOnSubmit}>
                            {
                                !emailSent && (
                                    <label>
                                        <p>Email Address <sub>*</sub></p>
                                        <input 
                                            required
                                            type="email"
                                            name="email"
                                            value={email}
                                            placeholder="Enter Your Email Address"
                                            onChange={(e) => setEmail(e.target.value)}
                                            className='w-full p-6 bg-richblack-600 text-richblack-5'
                                        />
                                    </label>
                                ) 
                            }
                            <button>
                                {
                                    !emailSent ? "Reset Password" : "Resend Emai;"
                                }
                            </button>
                        </form>
                        <div>
                            <Link to={'/login'}>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )

            }
        </div>
    )
}

export default ForgotPassword