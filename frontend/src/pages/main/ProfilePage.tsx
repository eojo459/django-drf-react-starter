import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../authentication/AuthContext";
import UserProfile from "../../components/UserProfile";

export default function ProfilePage() {
    //let {authTokens, user}: any = useContext(AuthContext);
    const [userData, setUserData] = useState('');
    const { uid } = useParams();
    const [isMyProfile, setIsMyProfile] = useState(false);

    // run on component load
    useEffect(() => {
        const fetchData = async () => {
            // using the uid, get the user data
            // check if uid matches current authenticated users uid => if true, setIsMyProfile(true) else set false
            //var childProfilesLocal = await getChildInBusinessId(businessUid, authTokens);
            //setChildProfiles(childProfilesLocal);
        };
        fetchData();
    }, []);
    // const userTypeProp = props.userType;

    // render different profile pages depending on the user type
    let userTypeProp = "USER";
    switch (userTypeProp) {
        case "STAFF":
            return (<>Staff profile page</>);
        case "USER":
            return (<UserProfile isMyProfile={true}/>);
    }
}