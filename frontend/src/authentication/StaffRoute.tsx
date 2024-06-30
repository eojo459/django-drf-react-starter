import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const StaffRoute = () => {
	let { user }: any = useContext(AuthContext);
	if (user === null) {
		return <Navigate to="/" />;
	}
	switch(user.role) {
		case "ADMIN":
		case "STAFF":
			return <Outlet/>;
		default:
			return <Navigate to="/" />;
	}
	//return user.role === "STAFF" ? <Outlet /> : <Navigate to="/" />;
};

export default StaffRoute;