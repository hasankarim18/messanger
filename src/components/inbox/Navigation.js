import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logoImage from "../../assets/images/lws-logo-dark.svg";
import { userLogeedOut } from "../../features/auth/authSlice";
import getAvater from 'gravatar-url'

export default function Navigation() {

    const dispatch = useDispatch()

    const { user } = useSelector(state => state.auth) || {}
    const { email, name } = user || {}



    const logoutHandler = () => {
        dispatch(userLogeedOut())
        localStorage.removeItem('auth')
        // localStoreage.clear()
    }

    return (
        <nav className="border-general sticky top-0 z-40 border-b bg-violet-700 transition-colors">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between h-16 items-center">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Link to="/">
                            <img
                                className="h-10"
                                src={getAvater(email, 80)}
                                alt="Learn with Sumit"
                            />
                        </Link>
                        <div style={{ textTransform: "capitalize", marginLeft: "10px", fontSize: "24px", color: "#fff" }} >
                            {name}
                        </div>
                    </div>
                    <ul>
                        <li className="text-white">
                            <span
                                style={{ cursor: "pointer" }}
                                onClick={logoutHandler}
                            >Logout</span>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
