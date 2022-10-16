import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    conversationsApi,
    useAddConversationMutation,
    useEditConversationMutation
} from "../../features/conversations/conversationsApi";
import { useGetUserQuery } from "../../features/users/usersApi";
import IsEmailValid from "../../utils/IsEmailValid";
import Error from '../ui/Error'

export default function Modal({ open, control }) {

    const [to, setTo] = useState('')
    const [message, setMessage] = useState('')
    const [userCheck, setUserCheck] = useState(false)
    const [getConversaion, setGetConversation] = useState(false)
    const dispatch = useDispatch()
    const [responseError, setResponseError] = useState('')
    const [lastConversation, setLastConversation] = useState(undefined)

    const [isMyEamil, setIsMyEamil] = useState(false)
    const [isParticipantValid, setIsParticipantValid] = useState(true)
    const [emailNotValid, setEmailNotValid] = useState(false)

    const [borderColor, setBorderColor] = useState('')

    const auth = useSelector(state => state.auth)

    const { user } = auth || {}
    const { email: myEmail } = user


    const { data: participant, isSuccess, isError, error } = useGetUserQuery(to, {
        skip: !userCheck,
    })

    const [addConversation, { isSuccess: isAddConversationSuccess }] = useAddConversationMutation()

    const [editConversation, { isSuccess: isEditConversationSuccess }] = useEditConversationMutation()



    const resetForm = () => {
        setIsMyEamil(false)
        setIsParticipantValid(true)
        setEmailNotValid(false)
        setBorderColor('')
        setLastConversation(undefined)
        setMessage('')
        setTo('')
    }


    const debounceHandler = (fn, delay) => {
        let timeoutId;
        return (...arg) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                fn(...arg)
            }, delay);
        }
    }

    const doSearch = (value) => {

        if (value.trim().length > 0) {

            if (IsEmailValid(value)) {

                setTo(value)
                setUserCheck(true)

                setEmailNotValid(false)
            } else if (!IsEmailValid(value)) {
                // email is not valid 
                setIsParticipantValid(true)
                setBorderColor('red')
                setIsMyEamil(false)
                setEmailNotValid(true)
                setUserCheck(false)
                setTo(value)
                setLastConversation(undefined)

            }
        } else if (value.trim().length === 0) {
            // empty input field after delete
            setBorderColor('')
            setIsMyEamil(false)
            setEmailNotValid(false)
            setIsParticipantValid(true)
            setTo(value)
            setLastConversation(undefined)

        }
    }

    useEffect(() => {
        if (participant) {
            if (isSuccess && participant[0]?.email !== myEmail && participant[0]?.email) {

                setIsParticipantValid(true)
                setIsMyEamil(false)
                setBorderColor('green')
                // every thing is valid and now to check previous conversation          


                dispatch(
                    conversationsApi.endpoints.getConversation.initiate
                        ({
                            userEmail: myEmail,
                            participantEmail: to
                        })
                ).unwrap().then((data) => {
                    setLastConversation(data)
                }).catch(err => {
                    setResponseError('There was a problem')
                })
                //  setGetConversation(true)
            } else if (isSuccess && participant[0]?.email === myEmail) {
                setIsParticipantValid(true)
                setIsMyEamil(true)
                setBorderColor('red')
                //setLastConversation(undefined)

            } else if (isSuccess && !participant[0]?.email) {
                setIsMyEamil(false)
                setIsParticipantValid(false)
                setBorderColor('red')
                setLastConversation(undefined)
            }

        }
    }, [participant])


    // const handleSearch = useMemo(() => debounceHandler(doSearch, 1000))
    const handleSearch = debounceHandler(doSearch, 1000)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (lastConversation?.length > 0) {
            // edit conversation 

            editConversation({
                sender: myEmail,
                id: lastConversation[0].id,
                data: {
                    participants: `${myEmail}-${participant[0].email}`,
                    users: [user, participant[0]],
                    message: message,
                    timestamp: new Date().getTime()
                }
            })

        } else if (lastConversation?.length === 0) {
            // add conversatio n

            addConversation({
                sender: myEmail,
                data: {
                    participants: `${myEmail}-${participant[0].email}`,
                    users: [user, participant[0]],
                    message: message,
                    timestamp: new Date().getTime()
                }
            })
        }
    }

    // listen conversation add/edit success 

    useEffect(() => {
        if (isAddConversationSuccess || isEditConversationSuccess) {
            control()
        }
    }, [isAddConversationSuccess, isEditConversationSuccess])

    return (
        open && (
            <>
                <div
                    onClick={() => {
                        control()
                        resetForm()
                    }}
                    className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
                ></div>
                <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Send message
                    </h2>
                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-6" action="#" method="POST">

                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="to" className="sr-only">
                                    To
                                </label>
                                <input
                                    style={{ borderColor: `${borderColor}` }}
                                    id="to"
                                    name="to"
                                    type="email"
                                    required
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none 
                                     focus:ring-violet-500
                                      focus:border-violet-500
                                       focus:z-10 sm:text-sm`}
                                    placeholder="Send to"
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">
                                    Message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    id="message"
                                    name="message"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Message"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                id="new_message"
                                disabled={lastConversation === undefined || isMyEamil}
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Send Message
                            </button>
                        </div>

                        {/* {participant?.length === 0 && <Error message="This user does not exists!" />} */}
                        {/**participant k true hote hobe */}
                        {!isParticipantValid && <Error message="Cannot find Email!" />}
                        {isMyEamil && <Error message="You cannot sent message to yourself!" />}
                        {emailNotValid && <Error message="Email not valid!" />}
                        {responseError && <Error message="There was an response error!" />}
                    </form>
                </div>
            </>
        )
    );
}
