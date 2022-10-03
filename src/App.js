import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import useAuthCheck from "./hooks/useAuthCheck";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/Private/PrivateRoute";
import PublicRoute from "./components/Private/PublicRoute";



function App() {
    // console.log(process.env.REACT_APP_API_URL);
    // console.log(process.env.NODE_ENV);

    const authChecked = useAuthCheck()



    return <>
        {
            !authChecked
                ?
                <div> Checking authentication .... </div>
                :
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>

                            } />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>

                            } />
                        <Route
                            path="/inbox"
                            element={
                                <PrivateRoute>
                                    <Conversation />
                                </PrivateRoute>
                            } />
                        <Route
                            path="/inbox/:id"
                            element={
                                <PrivateRoute>
                                    <Inbox />
                                </PrivateRoute>
                            } />
                    </Routes>
                </Router>
        }
    </>

}

export default App;


// 9.9 merge privateRoute, publicRoute and logout and clear from local storage