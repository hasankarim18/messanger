import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { userLoggedIn } from '../features/auth/authSlice';

const useAuthCheck = () => {

    const dispatch = useDispatch()
    const [authChecked, setAuthChecked] = useState(false)

    useEffect(() => {
        const localAuth = localStorage.getItem('auth');
        if (localAuth) {
            const auth = JSON.parse(localAuth)
            if (auth?.accessToken && auth?.user) {

                dispatch(userLoggedIn({
                    accessToken: auth.accessToken,
                    user: auth.user
                }))
            }
        }

        setAuthChecked(true)

    }, [dispatch, setAuthChecked])

    // it will always return true 
    // either logged in or logged out 
    // 
    return authChecked
}

export default useAuthCheck