import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { useAuth } from "./SupabaseAuthContext";

const AuthRoute = () => {
	//let { user }: any = useContext(AuthContext);
	let { user, session } = useAuth();
	let role;
	if ((user == null && session == null) || (user == undefined && session == undefined)) {
        // Authentication is still loading
		console.log("NOTHING -- NULL");
        return <Navigate to="/" />;
    }
	else {
		role = session?.user.user_metadata.role;
	}

	switch(role) {
		case "ADMIN":
		case "OWNER":
		case "STAFF":
		case "PARENT":
			return <Outlet/>;
		default:
			return <Navigate to="/login" />;
			//return <Outlet/>;
	}
	//return user.role === "OWNER" ? <Outlet /> : <Navigate to="/" />;
};

export default AuthRoute;