import { useDispatch, useSelector } from "react-redux";
import { conversationsApi, useGetConversationsQuery } from "../../features/conversations/conversationsApi";
import ChatItem from "./ChatItem";
import Error from "../ui/Error";
import moment from "moment/moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import gravatarUrl from "gravatar-url";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";
import { useEffect } from "react";
import { apiSlice } from "../../features/api/apiSlice";

export default function ChatItems() {

    const { user } = useSelector(state => state.auth) || {}
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const dispatch = useDispatch()
    const { email: adminEmail } = user
    const {
        data,
        isLoading,
        isError,
        error
    } = useGetConversationsQuery(adminEmail) || {}

    const { data: conversations, totalCount } = data || {}

    let content = null

    const fetchMore = () => {
        setPage((prevPage) => prevPage + 1)
    }

    useEffect(() => {
        if (page > 1) {

            dispatch(conversationsApi.endpoints.getMoreConversations.initiate({
                email: adminEmail, page
            }))
        }
    }, [page, adminEmail, dispatch])

    useEffect(() => {
        if (totalCount > 0) {
            const more = Math.ceil((totalCount / Number(process.env.REACT_APP_CONVERSATIONS_PER_PAGE))) > page

            setHasMore(more)
        }
    }, [totalCount, page])



    if (isLoading) {
        content = <li className="m-2 text-center">  Loading... </li>
    } else if (!isLoading && isError) {
        content = <li className="m-2 text-center">  <Error message={error?.data} /> </li>
    } else if (!isLoading && !isError && conversations?.length === 0) {
        content = <li className="m-2 text-center" >
            No conversations found!!!
        </li>
    } else if (!isLoading && !isError && conversations?.length > 0) {
        content =
            <InfiniteScroll
                dataLength={conversations?.length} //This is important field to render the next data
                next={fetchMore}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                height={window.innerHeight - 300}
            > {
                    conversations.map(item => {
                        const { message, id, timestamp } = item

                        const { name, email: partnerEmail } = getPartnerInfo(item.users, adminEmail)
                        const avatar = gravatarUrl(partnerEmail, { size: 80 })
                        return (
                            <li key={id}>
                                <Link to={`/inbox/${id}`} >
                                    <ChatItem
                                        id={id}
                                        avatar={avatar}
                                        name={name}
                                        lastMessage={message}
                                        lastTime={moment(timestamp).fromNow()}
                                    />
                                </Link>
                            </li>
                        )
                    })
                }
            </InfiniteScroll>
    }

    return (
        <ul>
            {/* <li>
                <ChatItem
                    avatar="https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg"
                    name="Saad Hasan"
                    lastMessage="bye"
                    lastTime="25 minutes"
                />

            </li> */}
            {content}
        </ul>
    );
}
