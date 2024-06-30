import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EmailIcon from "@mui/icons-material/Email";
import Calendar from "@mui/icons-material/CalendarMonth";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ViewListIcon from "@mui/icons-material/ViewList";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import ClassIcon from "@mui/icons-material/Class";
import EscalatorWarningIcon from "@mui/icons-material/EscalatorWarning";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolTwoToneIcon from "@mui/icons-material/SchoolTwoTone";
import MenuBookTwoToneIcon from "@mui/icons-material/MenuBookTwoTone";
import WcTwoToneIcon from "@mui/icons-material/WcTwoTone";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SettingsIcon from "@mui/icons-material/Settings";
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { Divider } from "@mui/material";

interface MainListItemsProps {
	toggleDrawer: () => void;
}

export function MainListItems({ toggleDrawer }: MainListItemsProps) {
	const navigate = useNavigate();

	const handleItemClick = () => {
		toggleDrawer(); // Close the sidebar
	};

	return (
		<React.Fragment>
			<ListItemButton onClick={() => {navigate('/dashboard'); handleItemClick();}}>
				<ListItemIcon>
					<HomeIcon />
				</ListItemIcon>
				<ListItemText primary="Dashboard" />
			</ListItemButton>
			<Divider />
            <ListItemButton onClick={() => {navigate("/register/owner"); handleItemClick();}}>
				<ListItemIcon>
					<PersonAddAlt1Icon />
				</ListItemIcon>
				<ListItemText primary="Register Owner" />
			</ListItemButton>
            <ListItemButton onClick={() => {navigate("/owner/list"); handleItemClick();}}>
				<ListItemIcon>
					<VisibilityIcon />
				</ListItemIcon>
				<ListItemText primary="View Owners" />
			</ListItemButton>
            <ListItemButton onClick={() => {navigate("/register/business"); handleItemClick();}}>
				<ListItemIcon>
					<AddBusinessIcon />
				</ListItemIcon>
				<ListItemText primary="Register Business" />
			</ListItemButton>
            <ListItemButton onClick={() => {navigate("/business/list"); handleItemClick();}}>
				<ListItemIcon>
					<VisibilityIcon />
				</ListItemIcon>
				<ListItemText primary="View Businesses" />
			</ListItemButton>
			<Divider />
            <ListItemButton onClick={() => {navigate("/register/staff"); handleItemClick();}}>
				<ListItemIcon>
					<PersonAddAlt1Icon />
				</ListItemIcon>
				<ListItemText primary="Register Staff" />
			</ListItemButton>
            <ListItemButton onClick={() => {navigate("/staff/list"); handleItemClick();}}>
				<ListItemIcon>
					<VisibilityIcon />
				</ListItemIcon>
				<ListItemText primary="View Staff" />
			</ListItemButton>
			<ListItemButton onClick={() => {navigate('/attendance/staff'); handleItemClick();}}>
				<ListItemIcon>
					<PersonAddAlt1Icon />
				</ListItemIcon>
				<ListItemText primary="View Staff Attendance" />
			</ListItemButton>
			<ListItemButton onClick={() => {navigate('/register/child'); handleItemClick();}}>
				<ListItemIcon>
					<PersonAddAlt1Icon />
				</ListItemIcon>
				<ListItemText primary="Register Child" />
			</ListItemButton>
			<ListItemButton onClick={() => {navigate("/child/list"); handleItemClick();}}>
				<ListItemIcon>
					<VisibilityIcon />
				</ListItemIcon>
				<ListItemText primary="View Children" />
			</ListItemButton>
			<ListItemButton onClick={() => {navigate('/attendance/child'); handleItemClick();}}>
				<ListItemIcon>
					<PersonAddAlt1Icon />
				</ListItemIcon>
				<ListItemText primary="View Child Attendance" />
			</ListItemButton>
			<ListItemButton onClick={() => {navigate("/parent/list"); handleItemClick();}}>
				<ListItemIcon>
					<VisibilityIcon />
				</ListItemIcon>
				<ListItemText primary="View Parents" />
			</ListItemButton>
		</React.Fragment>
	);
}