import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import * as React from "react";
import { API_ROUTES } from "../apiRoutes";
import { GetBusinessById, getBusinessByOwnerId, getBusinessProfilePlanByBusinessId, getBusinessProfilePlanById, getStaffBusinessId, getUserById } from "../helpers/Api";
import { useGlobalState } from "../context/GlobalStateContext";

interface AuthTokens {
    access: string;
    refresh: string;
}

interface User {
    role: string;
    uid: string;
    //user_id: number;
    // Add other user properties as needed
}

interface AuthContextProps {
    loginUser: (e: React.FormEvent<HTMLFormElement>) => void;
    user: User | null;
    logoutUser: () => void;
    loginUserWithArguments: (username: string, password: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("Success!");
    const [snackbarSeverity, setSnackbarSeverity] = React.useState("success");
    const { setUserUid, setBusinessUid: setBusinessUid, setBusinessPlanUid} = useGlobalState();

    let [authTokens, setAuthTokens] = useState<AuthTokens | null>(() =>
        localStorage.getItem("authTokens") ? JSON.parse(localStorage.getItem("authTokens")!) : null
    );
    let [user, setUser] = useState<User | null>(() =>
        localStorage.getItem("authTokens") ? jwtDecode<User>(localStorage.getItem("authTokens")!) : null
    );
    let [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // set userId in global state
    useEffect(() => {
        const fetchData = async () => {
            if (user != null && user != undefined) {
                if (authTokens == null || authTokens == undefined) {
                    authTokens = JSON.parse(localStorage.getItem("authTokens")!);
                }

                // get and globally set:
                // - the user uid
                // - business uid
                // - business plan uid
                var userId = await getUserById(user.uid, authTokens);
                switch(userId?.base_role) {
                    case "OWNER":
                        var businesses = await getBusinessByOwnerId(userId.uid, authTokens);
                        if (businesses.length > 0) {
                            var businessUid = businesses[0]?.uid;
                            var businessPlan = await getBusinessProfilePlanByBusinessId(businessUid, authTokens);
                            setUserUid(userId?.uid);
                            setBusinessUid(businesses[0]?.uid);
                            setBusinessPlanUid(businessPlan?.type_id);
                        }
                        break;
                    case "STAFF":
                        var businessId = await getStaffBusinessId(userId.uid, authTokens);
                        if (businessId != undefined && businessId != null) {
                            setUserUid(userId.uid);
                            //setBusinessUid(userId.uid);
                            //var businesss = await getBusinessById(userId.business_id, authTokens);
                            //setBusinessPlanId(businesss.business_plan_id);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        fetchData();
    },[user])

    const loginUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios({
            method: "post",
            url: API_ROUTES.TOKEN,
            data: { username: e.currentTarget.username.value, password: e.currentTarget.password.value },
        })
            .then(async function (response) {
                if (response.status === 200) {
                    setAuthTokens(response.data);
                    setUser(jwtDecode<User>(response.data.access));
                    localStorage.setItem("authTokens", JSON.stringify(response.data)); // TODO: SWITCH TO COOKIE
                    var userRole = jwtDecode<User>(response.data.access).role;
                    switch (userRole) {
                        case "ADMIN":
                        case "OWNER":
                        case "PARENT":
                        case "STAFF":
                            navigate("/dashboard");
                            break;
                        default:
                            navigate("/");
                            break;
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
                // Handle error and show snackbar
            });
    };

    const loginUserWithArguments = (username: string, password: string) => {
        axios({
            method: "post",
            url: API_ROUTES.TOKEN,
            data: { username, password },
        })
            .then(function (response) {
                if (response.status === 200) {
                    setAuthTokens(response.data);
                    setUser(jwtDecode<User>(response.data.access));
                    localStorage.setItem("authTokens", JSON.stringify(response.data)); // TODO: SWITCH TO COOKIE
                    var userRole = jwtDecode<User>(response.data.access).role;
                    switch (userRole) {
                        case "ADMIN":
                        case "OWNER":
                        case "PARENT":
                        case "STAFF":
                            navigate("/dashboard");
                            break;
                        default:
                            navigate("/");
                            break;
                    }
                }
            })
            .catch(function (error) {
                console.log(error);
                // Handle error and show snackbar
            });
    };

    const logoutUser = () => {
        axios.post(API_ROUTES.TOKEN_BLACKLIST, { refresh: authTokens!.refresh });
        setUser(null);
        setAuthTokens(null);
        localStorage.removeItem("authTokens");
        navigate("/");
    };

    const updateToken = () => {
        if (!authTokens) {
            setLoading(false);
            return;
        }

        axios({
            method: "post",
            url: API_ROUTES.TOKEN_REFRESH,
            data: { refresh: authTokens?.refresh },
        })
            .then(function (response) {
                if (response.status === 200) {
                    setAuthTokens(response.data);
                    setUser(jwtDecode<User>(response.data.access));
                    localStorage.setItem("authTokens", JSON.stringify(response.data)); // TODO: SWITCH TO COOKIE
                }
            })
            .catch(function (error) {
                logoutUser();
            });
        if (loading) {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading) {
            updateToken();
        }

        let interval = setInterval(() => {
            if (authTokens) {
                updateToken();
            }
        }, 1000 * 60 * 14); // refresh every 14 min
        return () => clearInterval(interval);
    });

    const contextData: AuthContextProps = {
        loginUser,
        user,
        logoutUser,
        loginUserWithArguments,
    };

    return (
        <>
            {/* <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar> */}
            <AuthContext.Provider value={contextData}>{loading ? null : children}</AuthContext.Provider>
        </>
    );
};

export { AuthContext, AuthProvider };
