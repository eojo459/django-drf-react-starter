import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useAuth } from "./SupabaseAuthContext";

const OwnerRoute = () => {
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
			return <Outlet/>;
		default:
			return <Navigate to="/" />;
	}
	//return user.role === "OWNER" ? <Outlet /> : <Navigate to="/" />;
};

export default OwnerRoute;