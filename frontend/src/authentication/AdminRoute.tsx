import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const AdminRoute = () => {
	let { user }: any = useContext(AuthContext);
	if (user === null) {
		return <Navigate to="/" />;
	}
	return user.role === "ADMIN" ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;