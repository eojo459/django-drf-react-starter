import axios from "axios";
import { API_ROUTES } from "../apiRoutes";
import { Dayjs } from "dayjs";
import { ChildAttendanceData, ChildAttendanceRecord } from "../pages/owner-dashboard/child/Attendance";
import { calculateTotalDurationInHours } from "./TotalTimeCalculation";
import { orderChildAttendance, orderAttendance, validateTime, startOfWeek, getCurrentTimestamp } from "./Helpers";
import { AuthContext } from "../authentication/AuthContext";
import { useContext } from "react";
import { OwnerProfile } from "../pages/owner-dashboard/business/owner/owner-profile";
import { ParamFields } from "../components/PeopleDirectoryTable";
import { StaffAttendanceRecord } from "../pages/owner-dashboard/staff/StaffAttendance";
import { AttendanceData, AttendanceRecord } from "../components/AttendanceTable";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../css/Notifications.module.css";
import { rem } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

// Data Types
export type EmergencyContactProfile = {
    first_name: '',
    last_name: '',
    contact_number: '',
    notes: '',
};

// Fetch the business data
export async function getBusinesses(authTokens: any) {
    //let {authTokens}: any = useContext(AuthContext);
    try {
        //const response = await axios.get(API_ROUTES.BUSINESSES);
        //console.log("tokens:" + authTokens.access);
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES,
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the business data using owner id
export async function getBusinessByOwnerId(ownerUid: string, authTokens: any) {
    //let {authTokens}: any = useContext(AuthContext);
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_OWNER_UID(ownerUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the staff data 
export async function getStaffs(authTokens: any) {
    //let {authTokens}: any = useContext(AuthContext);
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.STAFFS,
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the staff who belong to the business id
export async function getStaffInBusinessId(businessId: string, authTokens: any) {
    //let {authTokens}: any = useContext(AuthContext);
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.STAFFS_BUSINESS_ID(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the number of staff who belong to the business id
export async function getStaffCountInBusinessId(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.STAFFS_BUSINESS_ID(businessId),
            params: {
                filter: "count", // send count query param
            },
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the child data
export async function getChilds(authTokens: any) {
    //let {authTokens}: any = useContext(AuthContext);
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHILDS,
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the children who belong to the business id
export async function getChildInBusinessId(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHILDS_BUSINESS_ID(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the number of children who belong to the business id
export async function getChildCountInBusinessId(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHILDS_BUSINESS_ID(businessId),
            params: {
                filter: "count", // send count query param
            },
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// fetch holidays
export async function getHolidays(authTokens: any) {
    //let {authTokens}: any = useContext(AuthContext);
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.HOLIDAYS,
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function PostUser(data: any, authTokens: any) {
    // POST new user
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.USER,
            data: data,
			headers: {
				'X-JWT': authTokens,
			},
		})
        if (response.status == 201) {
            console.log(response.data);
        }
        return response;
    } catch (error) {
        console.error('Error submitting form:', error);
        // TODO: open error snackbar
    }
}

export async function PostOwner(data: any, authTokens: any) {
    // POST new owner
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.OWNERS,
            data: data,
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status == 201) {
            console.log(response.data);
        }
        return response;
    } catch (error) {
        console.error('Error submitting form:', error);
        // TODO: open error snackbar
    }
}

// Fetch the owners
export async function getOwners(authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.OWNERS,
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the owner by id
export async function getOwnerById(ownerId: number, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.OWNERS_ID(ownerId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the logged in user by id
export async function getUserById(userUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.USERS_UID(userUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// save attendance records for user/child
export async function saveAttendanceRecords(businessUid: string, staffUid: string, attendanceData: AttendanceData[], authTokens: any) {
    // show notification
    const id = notifications.show({
        loading: true,
        title: 'Connecting to the server',
        message: 'Please wait.',
        autoClose: false,
        withCloseButton: false,
        classNames: notiicationClasses,
    });

    var userType = attendanceData[0]?.type;
    try {
        if (businessUid != null) {

            attendanceData.forEach(personData => {
                personData.attendance = personData.attendance.filter(record => {
                    if ((record.check_in_time && record.check_in_time?.length > 0) && (record.check_out_time && record.check_out_time?.length > 0)) {
                        //console.log(record);
                        //record.signed_by = parseInt(selectedStaffModel.staff_id, 10); //temp sign with staff from dropdown, FUTURE: auto use staff when logged in
                        record.signed_by = staffUid;
                        var localRecord = record;
                        let recordEntry: string[] = [];
                        var depth = 0;

                        // check check_in_time
                        if (record.check_in_time == "") {
                            record.check_in_time = null;
                            record.check_out_time = null;
                        }

                        // check break_in_time
                        if (record.break_in_time == "") {
                            record.break_in_time = null;
                            record.break_out_time = null;
                        }

                        // check check_in_time_2
                        if (record.check_in_time_2 == "") {
                            record.check_in_time_2 = null;
                            record.check_out_time_2 = null;
                        }
                        
                        // check break_in_time_2
                        if (record.break_in_time_2 == "") {
                            record.break_in_time_2 = null;
                            record.break_out_time_2 = null;
                        }

                        // check check_in_time_3
                        if (record.check_in_time_3 == "") {
                            record.check_in_time_3 = null;
                            record.check_out_time_3 = null;
                        }
                    
                        // check break_in_time_3
                        if (record.break_in_time_3 == "") {
                            record.break_in_time_3 = null;
                            record.break_out_time_3 = null;
                        }

                        if (!validateTime(record)) {
                            // display error alert to check time entries to fix errors
                            setTimeout(() => {
                                notifications.update({
                                    id,
                                    color: 'red',
                                    title: 'Error',
                                    message: 'Please fix the errors first and then try again.',
                                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                                    loading: false,
                                    autoClose: 3000,
                                    classNames: notiicationClasses,
                                });
                            }, 500);
                        }
                        // valid record, keep it
                        return true;
                    }
                    else {
                        // remove empty records
                        return false;
                    }
                });
            });

            // PUT => update attendance record list
            const response = await axios({
                method: "PUT",
                url: userType === "STAFF" ? API_ROUTES.STAFFS_ATTENDANCE : API_ROUTES.CHILDS_ATTENDANCE,
                data: attendanceData,
                headers: {
                    'X-JWT': authTokens
                },
            })
            if (response.status === 200) {
                // display success alert
                console.log("Attendance records were modified");
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Attendance was saved.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 500);
            }
            else {
                // display error alert
                throw new Error('Update attendance records failed');
            }
        }

    } catch (error) {
        // error
        console.error('Error saving attendance records:', error);
        setTimeout(() => {
            notifications.update({
                id,
                color: 'red',
                title: 'Error',
                message: 'There was an error saving. Please try again.',
                icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 1500,
                classNames: notiicationClasses,
            });
        }, 500);
        return;
    }

    // success
    // setTimeout(() => {
    //     notifications.update({
    //         id,
    //         color: 'teal',
    //         title: 'Success',
    //         message: 'Attendance was saved.',
    //         icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
    //         loading: false,
    //         autoClose: 1000,
    //         classNames: notiicationClasses,
    //     });
    // }, 500);
}

// fetch child attendance records based on the selected week
export async function FetchChildAttendanceRecordsForWeek(startDate: Dayjs, businessUid: string, authTokens: any) {
    //let {authTokens}: any = useContext(AuthContext);
    var noRecordsFound: AttendanceRecord[] = [];
    try {
        // fetch attendance records for the selected week
        if (businessUid != null) {
            const response = await axios({
                method: "GET",
                url: API_ROUTES.CHILDS_BUSINESS_ID_ATTENDANCE(businessUid),
                params: {
                    week: startDate.format('YYYY-MM-DD'), // Pass the selected week as a query parameter
                },
                headers: {
                    'X-JWT': authTokens
                },
            })

            // update attendance record state with new data 
            if (response.status === 200) {
                const orderedAttendanceRecords: AttendanceRecord[] = orderAttendance(response.data);
                return orderedAttendanceRecords;
            }
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error('Error fetching attendance records:', error);
        return noRecordsFound;
    }
    return noRecordsFound;
};

// fetch staff attendance records based on the selected week
export async function FetchStaffAttendanceRecordsForWeek(startDate: Dayjs, businessUid: string, authTokens: any) {
    //let {authTokens}: any = useContext(AuthContext);
    var noRecordsFound: AttendanceRecord[] = [];
    try {
        // fetch attendance records for the selected week
        if (businessUid != null) {
            const response = await axios({
                method: "GET",
                url: API_ROUTES.STAFFS_BUSINESS_ID_ATTENDANCE(businessUid),
                params: {
                    week: startDate.format('YYYY-MM-DD'), // Pass the selected week as a query parameter
                },
                headers: {
                    'X-JWT': authTokens
                },
            })

            // update attendance record state with new data 
            if (response.status === 200) {
                const orderedAttendanceRecords: AttendanceRecord[] = orderAttendance(response.data);
                return orderedAttendanceRecords;
            }
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error('Error fetching attendance records:', error);
        return noRecordsFound;
    }
    return noRecordsFound;
};

// get the daily attendance status for the users and staff
// display their most recent activity status if there is any
export async function getDailyAttendanceStatus(businessUid: string, authTokens: any) {
    try {
        if (businessUid != null) {
            const response = await axios({
                method: "GET",
                url: API_ROUTES.CHILDS_BUSINESS_ID_ATTENDANCE(businessUid),
                params: {
                    status: "day", // pass in query param
                },
                headers: {
                    'X-JWT': authTokens
                },
            })

            // return data
            if (response.status === 200) {
                return response.data;
            }
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error('Error fetching attendance status:', error);
        return null;
    }
    return null;
};

// get the attendance count for the week or month
export async function getAttendanceCount(businessUid: string, countRange: string, authTokens: any) {
    try {
        if (businessUid != null) {
            const response = await axios({
                method: "GET",
                url: API_ROUTES.CHILDS_BUSINESS_ID_ATTENDANCE(businessUid),
                params: {
                    count: countRange, // pass in query param
                    type: "attendance",
                },
                headers: {
                    'X-JWT': authTokens
                },
            })

            // return data
            if (response.status === 200) {
                return response.data;
            }
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error('Error fetching attendance count:', error);
        return null;
    }
    return null;
};

// get the absent count for the week or month
export async function getAbsentCount(businessUid: string, countRange: string, authTokens: any) {
    try {
        if (businessUid != null) {
            const response = await axios({
                method: "GET",
                url: API_ROUTES.CHILDS_BUSINESS_ID_ATTENDANCE(businessUid),
                params: {
                    count: countRange, // pass in query param
                    type: "absent",
                },
                headers: {
                    'X-JWT': authTokens
                },
            })

            // return data
            if (response.status === 200) {
                return response.data;
            }
        }
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error('Error fetching attendance count:', error);
        return null;
    }
    return null;
};

// Find owner of business using name
export async function findOwnerIdByName(name: string, authTokens: any) {
    const nameSplit = name.split(' ');
    const owners = await getOwners(authTokens);
    const owner = owners.find((owner: { first_name: string; }) => owner.first_name === nameSplit[0]);
    return owner ? owner.owner_id : null; // Return the ID if found, otherwise return null
};

// Find owner id by user_id
export async function getOwnerIdByUserId(userId: number, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.USERS_ID(userId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data.owner_id;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    return null;
};

// get the business types
export async function getBusinessTypes(authTokens: any) {
    try {
        const response = await axios({
            method: "GET",
            url: API_ROUTES.BUSINESS_TYPES,
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status == 200) {
            //console.log(response.data);
            const typesData = response.data.map((type: { type_id: number; name: string; }) => ({
                value: type.type_id.toString(),
                label: type.name,
            }));
            return response.data;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the emergency contact
export async function PostEmergencyContact(emergencyContactForm: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.EMERGENCY_CONTACTS,
            data: emergencyContactForm,
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status == 201) {
            return response;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the user id by contact number
export async function getIdByContactNumber(contactNumber: string, isChild: boolean, authTokens: any) {
    try {
        const response = await axios({
            method: "GET",
            url: API_ROUTES.USERS_CONTACT_NUMBER(contactNumber),
            params: {
                isChild: isChild, // Pass child flag as a query parameter
            },
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status === 200) {
            return response.data;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the user id by username
export async function getIdByUsername(username: string, authTokens: any) {
    try {
        const response = await axios({
            method: "GET",
            url: API_ROUTES.USERS_USERNAME(username),
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status === 200) {
            return response.data;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new staff
export async function PostStaff(staffData: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.STAFFS,
            data: staffData,
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status === 201) {
            return response;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new child
export async function PostChild(childData: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.CHILDS,
            data: childData,
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status === 201) {
            return response;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Get relationship type list
export async function getRelationshipTypes(authTokens: any) {
    try {
        const response = await axios({
            method: "GET",
            url: API_ROUTES.CHILDS_RELATIONSHIP_TYPES,
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status == 200) {
            //console.log(response.data);
            return response.data;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new parent
export async function PostParent(parentData: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.PARENTS,
            data: parentData,
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status === 201) {
            return response;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new child relationship
export async function PostChildRelationship(relationshipData: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.CHILDS_RELATIONSHIP,
            data: relationshipData,
            headers: {
                'X-JWT': authTokens
            },
        })
        return response.status;
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new staff relationship
export async function PostStaffRelationship(relationshipData: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.STAFFS_RELATIONSHIP,
            data: relationshipData,
            headers: {
                'X-JWT': authTokens
            },
        })
        return response.status;
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET businessId from staff relationship
export async function getStaffBusinessId(staff_uid: string, authTokens: any) {
    try {
        const response = await axios({
            method: "GET",
            url: API_ROUTES.STAFFS_RELATIONSHIP_STAFF_UID(staff_uid),
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status == 200) {
            return response.data.business_id;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the business profile plan
export async function getBusinessProfilePlanById(planId: number, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_PROFILE_PLAN_ID(planId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the business profile plan
export async function getBusinessProfilePlanByBusinessId(businessUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_PROFILE_PLAN_BUSINESS_UID(businessUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the business profile plan by name
export async function getBusinessProfilePlanByName(planName: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_PROFILE_PLAN_NAME(planName),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the business owner plan by name
export async function getBusinessOwnerPlanByName(planName: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_OWNER_PLAN_NAME(planName),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the business owner plan by id
export async function getBusinessOwnerPlanById(planId: number, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_OWNER_PLAN_ID(planId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the business owner plan by business owner id
export async function getBusinessOwnerPlanByOwnerUid(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_OWNER_PLAN_OWNER_UID(ownerUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the business data using business id
export async function GetBusinessById(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_ID(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the business group data using business id
export async function getBusinessGroupsWithinBusiness(businessUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_GROUP_BUSINESS_UID(businessUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new business
export async function PostBusiness(businessData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.BUSINESSES,
            data: businessData,
			headers: {
				'X-JWT': authTokens
			},
		})
        return response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// PUT business group data
export async function PutBusinessGroup(groupData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PUT",
			url: API_ROUTES.BUSINESS_GROUP,
            data: groupData,
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new business group relationship data
export async function PostBusinessGroupRelationship(relationshipData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.BUSINESS_GROUP_RELATIONSHIP,
            data: relationshipData,
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// DELETE business group data
export async function DeleteBusinessGroup(groupUid: any, authTokens: any) {
    try {
        const response = await axios({
			method: "DELETE",
			url: API_ROUTES.BUSINESS_GROUP_ID(groupUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Fetch the business group data by id
export async function getBusinessGroupById(groupdUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_GROUP_ID(groupdUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET business data for user
export async function GetBusinessInfoForUserByUid(user_uid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_RELATIONSHIP_USER_UID(user_uid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET employment type data
export async function GetEmploymentTypes(authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.EMPLOYMENT_TYPES,
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET employment type data by id
export async function GetEmploymentTypeById(employment_id: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.EMPLOYMENT_TYPE_ID(employment_id),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET people from business for people directory
export async function GetPeopleDirectoryList(params: ParamFields, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: `${API_ROUTES.PEOPLE}?business_id=${params.businessId}&position=${params.position}&name=${params.name}&role=${params.role}&email=${params.email}`,
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Get the user's info by uid
export async function GetUserInfoByUid(userUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.USER_INFO_UID(userUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// PATCH/UPDATE the user by id
export async function PatchUserById(userUid: string, userData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
			url: API_ROUTES.USERS_UID(userUid),
            data: userData,
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new waitlist
export async function PostWaitlist(waitlistData: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.WAITLIST,
            data: waitlistData,
			// headers: {
			// 	'X-JWT': authTokens
			// },
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new contact us message
export async function PostContactMessage(messageData: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.MESSAGES,
            data: messageData,
			// headers: {
			// 	'X-JWT': authTokens
			// },
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET staff activity
export async function GetStaffActivity(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                'timestamp': getCurrentTimestamp()
            },
			url: API_ROUTES.BUSINESSES_STAFFS_ACTIVITY(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET staff activity by staff uid
export async function GetStaffActivityByUid(businessId: string, staffUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                'timestamp': getCurrentTimestamp()
            },
			url: API_ROUTES.BUSINESSES_STAFFS_UID_ACTIVITY(businessId, staffUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// PATCH staff activity by staff uid
export async function PatchStaffActivityByUid(businessId: string, staffUid: string, activityData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
            data: activityData,
			url: API_ROUTES.BUSINESSES_STAFFS_UID_ACTIVITY(businessId, staffUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET staff activity logs
export async function GetStaffActivityLogs(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                'timestamp': getCurrentTimestamp()
            },
			url: API_ROUTES.BUSINESSES_STAFFS_ACTIVITY_LOGS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET staff activity logs
export async function GetStaffActivityLogsByUid(businessId: string, staffUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                'timestamp': getCurrentTimestamp()
            },
			url: API_ROUTES.BUSINESSES_STAFFS_UID_ACTIVITY_LOGS(businessId, staffUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET user activity
export async function GetUserActivity(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                'timestamp': getCurrentTimestamp()
            },
			url: API_ROUTES.BUSINESSES_USERS_ACTIVITY(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET monthly hours
export async function GetTotalMonthlyStats(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_MONTHLY_STATS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET Geoapify data
// https://apidocs.geoapify.com/
// https://api.geoapify.com/v1/geocode/autocomplete?text=20%20bedfield%20close&apiKey=b8568cb9afc64fad861a69edbddb2658&limit=5
export async function GetGeoApifyData(search_text: string) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.GEOAPIFY_ADDRESS_LOOKUP(search_text),
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET business qr code invite link
export async function GetQrcodeInviteLink(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_INVITE_QR_CODE(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST request to generate a new qr code invite
export async function PostQrcodeInviteLink(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.BUSINESSES_INVITE_QR_CODE(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error posting data:', error);
    }
}

// PATCH business profile by business id
export async function PatchBusinessById(businessId: string, updatedData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
            data: updatedData,
			url: API_ROUTES.BUSINESSES_ID(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

// POST user to unassigned users table
export async function PostUnassignedUsers(businessId: string, updatedData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
            data: updatedData,
			url: API_ROUTES.BUSINESSES_UNASSIGNED_USERS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error posting data:', error);
    }
}

// DELETE user by user uid
export async function DeleteUserByUid(userUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "DELETE",
			url: API_ROUTES.USERS_UID(userUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error deleting data:', error);
    }
}

// DELETE the business by business id
export async function DeleteBusinessById(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "DELETE",
			url: API_ROUTES.BUSINESSES_ID(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET employment positions by business id
export async function GetEmploymentPositionsByBusinessId(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_EMPLOYMENT_POSITIONS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status == 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// PATCH business employment positions
export async function PatchEmploymentPositions(businessId: string, updatedData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
            data: updatedData,
			url: API_ROUTES.BUSINESSES_EMPLOYMENT_POSITIONS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

// DELETE business employment position by id
export async function DeleteEmploymentPositions(businessId: string, positionId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "DELETE",
			url: API_ROUTES.BUSINESSES_EMPLOYMENT_POSITIONS_ID(businessId, positionId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error deleting data:', error);
    }
}

// GET holiday data
// https://date.nager.at/Api
// https://date.nager.at/api/v3/publicholidays/{year}/{country_code}
export async function GetHolidayApiData(countryCode: string) {
    try {
        // get current year
        const currentYear: number = new Date().getFullYear();
        const response = await axios({
			method: "GET",
			url: API_ROUTES.PUBLIC_HOLIDAY_API(countryCode, currentYear),
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET payroll information
export async function GetPayrollInformation(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_PAYROLL_INFORMATION(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status == 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET payroll information by id
export async function GetPayrollInformationById(businessId: string, payrollId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_PAYROLL_INFORMATION_ID(businessId, payrollId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status == 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST payroll information
export async function PostPayrollInformation(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.BUSINESSES_PAYROLL_INFORMATION(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error posting data:', error);
    }
}

// PUT update payroll information by id
export async function PutPayrollInformationById(businessId: string, payrollId: string, payrollData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PUT",
            data: payrollData,
			url: API_ROUTES.BUSINESSES_PAYROLL_INFORMATION_ID(businessId, payrollId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

// PUT update holiday by id
export async function PutHolidayById(businessId: string, holidayId: string, holidayData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PUT",
            data: holidayData,
			url: API_ROUTES.BUSINESSES_PAYROLL_HOLIDAYS_ID(businessId, holidayId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

// DELETE holiday by id
export async function DeleteHolidayById(businessId: string, holidayId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "DELETE",
			url: API_ROUTES.BUSINESSES_PAYROLL_HOLIDAYS_ID(businessId, holidayId),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error deleting data:', error);
    }
}

// GET all holidays for a business
export async function GetHolidays(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_PAYROLL_HOLIDAYS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status == 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error feteching data:', error);
    }
}

// GET staff relationships for a business
export async function GetStaffRelationshipByBusinessId(businessId: string, authTokens?: any) {
    try {
        var headers = {
            'X-JWT': authTokens
        };

        const response = await axios({
			method: "GET",
			url: API_ROUTES.STAFFS_RELATIONSHIPS_BUSINESS_ID(businessId),
			headers: authTokens ? headers : {},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET child relationships for a business
export async function GetChildRelationshipByBusinessId(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHILDS_RELATIONSHIPS_BUSINESS_ID(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status == 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET unassigned staff and users for a business
export async function GetUnassignedUsersByBusinessId(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_UNASSIGNED_USERS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status == 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// PATCH new relationship after adding unassigned user to buisness
export async function PatchUnassignedUserRelationship(userUid:string, unassignedData: any, authTokens: any) {
    try {
        const response = await axios({
            method: "PATCH",
            url: API_ROUTES.CHILDS_RELATIONSHIPS_USERS_UID(userUid),
            data: unassignedData,
            headers: {
                'X-JWT': authTokens
            },
        })
        return response.status;
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// PATCH new relationship after adding unassigned staff to buisness
export async function PatchUnassignedStaffRelationship(staffUid:string, unassignedData: any, authTokens: any) {
    try {
        const response = await axios({
            method: "PATCH",
            url: API_ROUTES.STAFFS_RELATIONSHIPS_STAFF_UID(staffUid),
            data: unassignedData,
            headers: {
                'X-JWT': authTokens
            },
        })
        return response.status;
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function GetStaffAttendanceByStaffUid(staffUid: string, authTokens: any) {
    try {
        const response = await axios({
            method: "GET",
            url: API_ROUTES.STAFFS_ATTENDANCE_STAFF_UID(staffUid),
            params: {
                week: startOfWeek(new Date()).toISOString().split('T')[0], // Pass the selected week as a query parameter
            },
            headers: {
                'X-JWT': authTokens
            },
        })
        if (response.status === 200) {
            return response.data;
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new submitted timesheet
export async function PostSubmitStaffTimesheet(businessId:string, attendanceRecordData: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.BUSINESSES_SUBMIT_STAFF_TIMESHEETS(businessId),
            data: attendanceRecordData,
            headers: {
                'X-JWT': authTokens
            },
        })
        return response.status;
    }
    catch (error) {
        console.error('Error posting data:', error);
    }
}

// GET timesheet data for a staff
export async function GetTimesheetDataByStaffUid(businessId: string, staffUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_TIMESHEETS_STAFFS_UID(businessId, staffUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET submitted timesheet data for staffs
export async function GetSubmittedStaffTimesheetData(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_SUBMITTED_STAFF_TIMESHEETS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new request to approve a submitted timesheet
export async function PostApproveTimesheet(businessId:string, timesheetIdList: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.BUSINESSES_APPROVE_SUBMITTED_STAFF_TIMESHEETS(businessId),
            data: timesheetIdList,
            headers: {
                'X-JWT': authTokens
            },
        })
        return response.status;
    }
    catch (error) {
        console.error('Error updating data:', error);
    }
}

// POST new request to deny a submitted timesheet
export async function PostDenyTimesheet(businessId:string, timesheetId: any, authTokens: any) {
    try {
        const response = await axios({
            method: "POST",
            url: API_ROUTES.BUSINESSES_DENY_SUBMITTED_STAFF_TIMESHEETS(businessId),
            data: timesheetId,
            headers: {
                'X-JWT': authTokens
            },
        })
        return response.status;
    }
    catch (error) {
        console.error('Error updating data:', error);
    }
}

// GET not submitted timesheet data for staffs
export async function GetNotSubmittedStaffTimesheetData(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_NOT_SUBMITTED_STAFF_TIMESHEETS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET archived timesheet data for staffs
export async function GetArchivedStaffTimesheetData(businessId: string, authTokens: any, staffUid?: string) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_ARCHIVED_STAFF_TIMESHEETS(businessId),
            params: {
                staff_uid: staffUid,
            },
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST new report for a business
export async function PostReport(businessId: string, query_params: {}, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.BUSINESSES_REPORTS(businessId),
            params: query_params,
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error posting data:', error);
    }
}

// GET reports for a business
export async function GetReports(businessId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESSES_REPORTS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST the valid state of the invite code and return the business id if valid
export async function ValidateCode(code: any) {
    try {
        const response = await axios({
			method: "POST",
            data: code,
			url: API_ROUTES.VALIDATE_INVITE_CODE,
		})
        if (response.status === 200) {
            return response;
        }
    } catch (error) {
        console.error('Error validating data:', error);
    }
}

// GET working hours for a staff
export async function GetStaffWorkingHours(staffUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.STAFFS_WORKING_HOURS_STAFF_UID(staffUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status == 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST and create the staff working hours
export async function PostStaffWorkingHours(updatedData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
            data: updatedData,
			url: API_ROUTES.STAFFS_WORKING_HOURS,
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error creating data:', error);
    }
}


// PATCH and update the staff working hours by staff uid
export async function PatchStaffWorkingHours(staffUid: string, updatedData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
            data: updatedData,
			url: API_ROUTES.STAFFS_WORKING_HOURS_STAFF_UID(staffUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

// GET staff notification messages
export async function GetStaffNotificationMessages(staffUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.NOTIFICATION_MESSAGE_STAFF_UID(staffUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET user notification messages
export async function GetUserNotificationMessages(userUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.NOTIFICATION_MESSAGE_USER_UID(userUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET employment positions by employment type id
export async function GetEmploymentPositionsByEmploymentTypeId(businessId: string, employmentTypeId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                type: employmentTypeId,
            },
			url: API_ROUTES.BUSINESSES_EMPLOYMENT_POSITIONS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET employment positions by employment type id
export async function GetEmploymentPositionsByEmploymentName(businessId: string, employmentName: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                name: employmentName,
            },
			url: API_ROUTES.BUSINESSES_EMPLOYMENT_POSITIONS(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET employment positions type by position id
export async function GetEmploymentPositionType(businessId: string, employmentType: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                name: employmentType,
            },
			url: API_ROUTES.BUSINESSES_EMPLOYMENT_POSITIONS_TYPE(businessId),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// PATCH and update the staff by staff uid
export async function PatchStaff(staffUid: string, updatedData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
            data: updatedData,
			url: API_ROUTES.STAFFS_UID(staffUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

// GET staff by staff uid
export async function GetStaffByUid(staffUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.STAFFS_UID(staffUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST and approve new staff user
export async function PostApproveStaffUser(staffUid: string, data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.APPROVE_NEW_STAFF_USER(staffUid),
            data: data,
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// GET working hours for an owner
export async function GetOwnerWorkingHours(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.OWNERS_WORKING_HOURS_OWNER_UID(ownerUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// get the staff limit status for the business
export async function getStaffLimitStatus(businessId: string, data: any) {
    try {
        const response = await axios({
			method: "POST",
            data: data,
			url: API_ROUTES.BUSINESSES_STAFF_LIMIT_STATUS(businessId),
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// PATCH and update the business hours by business id
export async function PatchBusinessHours(businessId: string, updatedData: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
            data: updatedData,
			url: API_ROUTES.BUSINESSES_HOURS_OF_OPERATION(businessId),
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

// POST and check user info
export async function CheckUsers(queryParam: any, data: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.USERS,
            data: data,
            params: queryParam,
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// POST and create new chargebee checkout url
export async function PostChargebeeNewCheckoutUrl(data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.CHARGEBEE_NEW_CHECKOUT_URL,
            data: data,
            headers: {
				'X-JWT': authTokens
			},
		})
        return response;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// GET a chargebee checkout url and view the status
export async function GetChargebeeCheckoutUrl(hostedPageUrl: any, data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.CHARGEBEE_GET_CHECKOUT_URL(hostedPageUrl),
            data: data,
            headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response;
        }
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// GET a subscription for an owner 
export async function GetOwnerSubscription(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_OWNERS_SUBSCRIPTIONS(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET a payment for an owner 
export async function GetOwnerPayment(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.BUSINESS_OWNERS_PAYMENT(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// POST a cancel subscription request for an owner 
export async function CancelChargebeeSubscription(ownerUid: string, data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.CHARGEBEE_CANCEL_SUBSCRIPTION(ownerUid),
            data: data,
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Get a hosted page url to update a subscription for an owner 
export async function GetChargebeeUpdateSubscriptionCheckoutUrl(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHARGEBEE_UPDATE_SUBSCRIPTION(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Get a hosted page url to update a payment method for an owner 
export async function GetChargebeeUpdatePaymentMethodCheckoutUrl(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHARGEBEE_UPDATE_PAYMENT_METHOD(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        return response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Get invoice data for subscription
export async function GetChargebeeInvoiceData(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHARGEBEE_INVOICE_DATA(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Get invoice pdf for subscription
export async function GetChargebeeInvoicePDF(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHARGEBEE_INVOICE_PDF(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Get chargebee subscription data
export async function GetChargebeeSubscription(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHARGEBEE_GET_SUBSCRIPTION(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Send email to new registered owners
export async function EmailNewBusinessOwners(ownerUid: string, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
			url: API_ROUTES.EMAIL_NEW_BUSINESS_OWNERS(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Get status of chargebee subscription verification
export async function GetChargebeeSubscriptionVerification(subscriptionId: string, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
			url: API_ROUTES.CHARGEBEE_VERIFY_SUBSCRIPTION(subscriptionId),
            headers: {
				'X-JWT': authTokens
			},
		})
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Send verify/confirm email 
export async function VerifyConfirmEmail(ownerUid: string, data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
            data: data,
			url: API_ROUTES.EMAIL_VERIFY_CONFIRM(ownerUid),
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Create email verification token
export async function EmailVerifyToken(data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "POST",
            data: data,
			url: API_ROUTES.EMAIL_VERIFY_TOKEN,
            headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// PATCH staff attendance autoclock out by staff uid and current day
export async function PatchStaffAttendanceAutoClockOut(staffUid: string, data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
            data: data,
			url: API_ROUTES.STAFFS_ATTENDANCE_AUTO_CLOCK_OUT_STAFF_UID(staffUid),
			headers: {
				'X-JWT': authTokens
			},
		})
        return response.status;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// PATCH cookies
export async function PatchCookies(userUid: string, data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "PATCH",
            data: data,
			url: API_ROUTES.COOKIES_UID(userUid),
			headers: {
				'X-JWT': authTokens
			},
            withCredentials: true, // allow cookies
		})
        return response.status;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// GET cookies
export async function GetCookies(userUid: string, httponly: boolean, authTokens: any) {
    try {
        const response = await axios({
			method: "GET",
            params: {
                httponly: httponly,
            },
			url: API_ROUTES.COOKIES_UID(userUid),
			headers: {
				'X-JWT': authTokens
			},
            withCredentials: true, // allow cookies
		})
        if (response.status === 200) {
            return response;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// DELETE cookies
export async function DeleteCookies(userUid: string, data: any, authTokens: any) {
    try {
        const response = await axios({
			method: "DELETE",
            data: data,
			url: API_ROUTES.COOKIES_UID(userUid),
			headers: {
				'X-JWT': authTokens
			},
            //withCredentials: true, // allow cookies
		})
        return response.status;
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// GET auth user email by username
export async function GetAuthUserEmailByUsername(username: string, data: any) {
    try {
        const response = await axios({
			method: "POST",
            data: data,
			url: API_ROUTES.USERS_USERNAME_EMAIL(username),
		})
        if (response.status === 200) {
            return response;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// GET auth user email by uid
export async function GetAuthUserEmailByUid(staffUid: string, data: any) {
    try {
        const response = await axios({
			method: "POST",
            data: data,
			url: API_ROUTES.USERS_UID_EMAIL(staffUid),
		})
        if (response.status === 200) {
            return response;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}