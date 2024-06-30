import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const ParentRoute = () => {
	let { user }: any = useContext(AuthContext);
	if (user === null) {
		return <Navigate to="/" />;
	}
	switch(user.role) {
		case "ADMIN":
		case "PARENT":
			return <Outlet/>;
		default:
			return <Navigate to="/" />;
	}
	//return user.role === "PARENT" ? <Outlet /> : <Navigate to="/" />;
};

export default ParentRoute;