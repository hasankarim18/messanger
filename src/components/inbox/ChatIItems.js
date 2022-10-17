import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/conversations/conversationsApi";
import ChatItem from "./ChatItem";
import Error from "../ui/Error";
import moment from "moment/moment";
import getPartnerInfo from "../../utils/getPartnerInfo";
import gravatarUrl from "gravatar-url";
import { Link } from "react-router-dom";

export default function ChatItems() {

    const { user } = useSelector(state => state.auth) || {}
    const { email: adminEmail } = user
    const { data: conversations, isLoading, isError, error } = useGetConversationsQuery(adminEmail)

    let content = null

    if (isLoading) {
        content = <li className="m-2 text-center">  Loading... </li>
    } else if (!isLoading && isError) {
        content = <li className="m-2 text-center">  <Error message={error?.data} /> </li>
    } else if (!isLoading && !isError && conversations?.length === 0) {
        content = <li className="m-2 text-center" >
            No conversations found!!!
        </li>
    } else if (!isLoading && !isError && conversations?.length > 0) {
        content = conversations.map(item => {
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
