import { Link } from "react-router-dom";
import { useDeleteConversationMutation } from "../../features/conversations/conversationsApi";

export default function ChatItem({ avatar, name, lastMessage, lastTime, id }) {

    const [deleteConversation, { isSuccess, isError }] = useDeleteConversationMutation()

    const deleteConversationHandler = () => {
        deleteConversation(id)
    }


    return (
        <div
            className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"

        >

            <div className="w-full pb-2 hidden md:block">
                <div className="flex justify-between">
                    <div className="flex align-center" >
                        <img
                            className="object-cover w-10 h-10 rounded-full"
                            src={avatar}
                            alt={name}
                        />
                        <div className="ml-2 font-semibold text-gray-600 flex items-center">
                            {name}
                        </div>
                    </div>
                    <span className="block ml-2 text-sm text-gray-600">
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "end" }} >
                            <span>{lastTime}</span>

                            <span
                                onClick={deleteConversationHandler}
                                className="hover:text-red-500" >Delete</span>
                        </div>
                    </span>
                </div>
                <span className="block ml-2 text-sm text-gray-600">
                    {lastMessage}
                </span>

            </div>
        </div>
    );
}
