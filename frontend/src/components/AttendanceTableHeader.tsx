import { ActionIcon, Button, Grid, Group, Paper, Select, Stack, useComputedColorScheme } from "@mantine/core";
import { getStartOfWeek, DatePickerInput } from "@mantine/dates";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { useContext, useEffect, useState } from "react";
import { FetchChildAttendanceRecordsForWeek, getBusinesses, getStaffInBusinessId, getStaffs, saveAttendanceRecords } from "../helpers/Api";
import { businessListFormat, findBusinessIdByName, isChildAttendanceData, isInWeekRange, isNullOrEmpty } from "../helpers/Helpers";
import axios from "axios";
import { API_ROUTES } from "../apiRoutes";
import React from "react";
import { ChildAttendanceData, ChildAttendanceRecord } from "../pages/owner-dashboard/child/Attendance";
import "../css/AttendanceTable.scss";
import { ConfirmUnsavedChangesModal } from "./ConfirmModal";
import { AuthContext } from "../authentication/AuthContext";
import { useGlobalState } from "../context/GlobalStateContext";
import { useAuth } from "../authentication/SupabaseAuthContext";
import classes from "../css/TextInput.module.css";
import { StaffAttendanceData, StaffProfile } from "../pages/owner-dashboard/staff/StaffAttendance";
import { AttendanceData } from "./AttendanceTable";

interface TableHeaderProps {
    personAttendanceData: AttendanceData[];
    newChanges: boolean;
    businessId: string;
    multipleLocations: boolean;
    handleWeekChange: (startDate: Dayjs) => void; // handle week changes
    handleBusinessIdChange: (businessId: string) => void; // handle business id changes
    handleSelectedUserChange: (userType: string) => void; // handle selected user changes
}

export function AtendanceTableHeaderControl(props: TableHeaderProps) {
    //let {authTokens}: any = useContext(AuthContext);
    const { user, business, businessList, session, setBusiness } = useAuth();
    const { unsavedChanges, setUnsavedChanges, userUid } = useGlobalState();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    //const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [prevWeekChange, setPrevWeekChange] = useState(false);
    const [nextWeekChange, setNextWeekChange] = useState(false);
    const [weekChange, setWeekChange] = useState(false);
    const [businessChange, setBusinessChange] = useState(false);
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
    const [businessUidTemp, setBusinessUidTemp] = useState<string>('');
    const [businessNameTemp, setBusinessNameTemp] = useState<string>('');
    const [businessId, setBusinessId] = useState<string>('');
    const [businessesSelectData, setBusinessesSelectData] = useState<any[]>([]);
    const [selectedBusinessModel, setSelectedBusinessModel] = useState({
        business_uid: '',
        business_name: ''
    });
    const [staffs, setStaffs] = useState<StaffProfile[]>([]);
    const [selectedStaffModel, setSelectedStaffModel] = useState({
        staff_id: '',
        first_name: '',
        last_name: ''
    });
    const [staffSelectData, setStaffSelectData] = useState<any[]>([]);
    const [weekValueTemp, setWeekValueTemp] = useState<Date | null>(null);
    const [weekValue, setWeekValue] = useState<Date | null>(null);
    const [selectedWeekStartDate, setSelectedWeekStartDate] = React.useState<Dayjs | null>(null);
    const [hovered, setHovered] = useState<Date | null>(null);
    const [proPlan, setProPlan] = useState(false);
    const [selectedUserType, setSelectedUserType] = useState("STAFF");
    const [userTypeSelectData, setUserTypeSelectData] = useState<any[]>(["STAFF", "USER"]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [businessSelectData, setBusinessSelectData] = useState<any[]>([]);

    // setup props
    const personAttendanceDataProp = props.personAttendanceData;
    const newChangesProp = props.newChanges;
    const businessIdProp = props.businessId;
    const multipleLocationsProp = props.multipleLocations;
    const handleWeekChangeProp = props.handleWeekChange;
    const handleBusinessIdChangeProp = props.handleBusinessIdChange;
    const handleSelectedUserChangeProp = props.handleSelectedUserChange


    // get window size on component load
    useEffect(() => {
        // Update windowWidth when the window is resized
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // set businessId when prop changes
    useEffect(() => {
        if (businessIdProp != null && businessIdProp != undefined) {
            setBusinessId(businessIdProp);
        }
    }, [businessIdProp])

    // fetch data as soon as the component loads
    useEffect(() => {
        const fetchData = async () => {
            const businessesData = await getBusinesses(session?.access_token);
            if (businessesData != undefined && businessesData != null) {
                const businessSelectData = businessesData.map((business: { business_id: number, name: string }) => ({
                    value: business.name,
                    label: business.name,
                }));
                setBusinessesSelectData(businessSelectData);
            }
        };
        fetchData();
    }, []);

    // update saved changes state when new changes prop changes
    useEffect(() => {
        setUnsavedChanges(newChangesProp);
        if (newChangesProp) {
            console.log("New changes");
        }
    }, [newChangesProp]);

    // check for unsaved changes when user tries to leave without saving
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (unsavedChanges) {
                const message = 'You have unsaved changes. Are you sure you want to leave?';
                event.returnValue = message;
                return message;
            }
            return undefined;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [unsavedChanges]);

    // let user confirm changes before clicking on week change buttons
    useEffect(() => {
        if (prevWeekChange) {
            const fetchData = async () => {
                const confirmation = await ConfirmUnsavedChangesModal({ onDeleteConfirm: handleUnsavedChanges });
                if (confirmation) {
                    console.log("Confirmed");
                    handleToggleGlobalSavedChanges();
                    //setUnsavedChanges(false);
                    // Continue with logic
                    if (weekValue) {
                        //const tempValue = dayjs(getStartOfWeek(weekValue)).subtract(1, 'week').toDate();
                        //setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                        //handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                        const tempValue = dayjs(weekValue).startOf('week').day(0).subtract(1, 'week').toDate();
                        setWeekValue(tempValue);
                        handleWeekChange(dayjs(tempValue));
                    }
                }
                else {
                    console.log("Denied");
                }
                setPrevWeekChange(false);
            };
            fetchData();
        }
        else if (nextWeekChange) {
            const fetchData = async () => {
                const confirmation = await ConfirmUnsavedChangesModal({ onDeleteConfirm: handleUnsavedChanges });
                if (confirmation) {
                    console.log("Confirmed");
                    handleToggleGlobalSavedChanges();
                    //setUnsavedChanges(false);
                    // Continue with logic
                    if (weekValue) {
                        // const tempValue = dayjs(getStartOfWeek(weekValue)).add(1, 'week').toDate();
                        // setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                        // handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                        const tempValue = dayjs(weekValue).startOf('week').day(0).add(1, 'week').toDate();
                        setWeekValue(tempValue);
                        handleWeekChange(dayjs(tempValue));
                    }
                }
                else {
                    console.log("Denied");
                }
                setNextWeekChange(false);
            };
            fetchData();
        }
        else if (weekChange) {
            const fetchData = async () => {
                const confirmation = await ConfirmUnsavedChangesModal({ onDeleteConfirm: handleUnsavedChanges });
                if (confirmation) {
                    console.log("Confirmed");
                    handleToggleGlobalSavedChanges();
                    //setUnsavedChanges(false);
                    // Continue with logic
                    if (weekValueTemp) {
                        setWeekValue(weekValueTemp);
                        handleWeekChange(dayjs(getStartOfWeek(weekValueTemp)));
                    }
                }
                else {
                    console.log("Denied");
                }
                setWeekChange(false);
            };
            fetchData();
        }
    }, [prevWeekChange, nextWeekChange, weekChange]);

    // let user confirm changes before clicking on week change buttons
    useEffect(() => {
        if (businessChange) {
            const fetchData = async () => {
                const confirmation = await ConfirmUnsavedChangesModal({ onDeleteConfirm: handleUnsavedChanges });
                if (confirmation) {
                    console.log("Confirmed");
                    handleToggleGlobalSavedChanges();
                    //setUnsavedChanges(false);
                    // Continue with logic
                    if (businessUidTemp) {
                        // change the business id and name in selected business model
                        if (!isNullOrEmpty(businessId)) {
                            setSelectedBusinessModel({
                                business_uid: businessUidTemp.toString(),
                                business_name: businessNameTemp
                            });

                            // update business id state
                            setBusinessId(businessId);
                            handleBusinessIdChangeProp(businessId);
                        }
                    }
                }
                else {
                    console.log("Denied");
                }
                setBusinessChange(false);
            };
            fetchData();
        }
    }, [businessChange]);

    useEffect(() => {
        handleBusinessListFormat();
    }, []);

    // fetch staff data when business id changes
    // useEffect(() => {
    //     const fetchData = async () => {
    //         if (businessId != null) {
    //             const staffData = await getStaffInBusinessId(businessId, authTokens);
    //             if (staffData != undefined && staffData != null) {
    //                 const staffSelectData = staffData.map((staff: { staff_id: number, first_name: string, last_name: string }) => ({
    //                     value: staff.staff_id.toString(),
    //                     label: staff.first_name + " " + staff.last_name,
    //                 }));
    //                 setStaffs(staffData);
    //                 setStaffSelectData(staffSelectData);
    //             }
    //         }
    //     };
    //     fetchData();
    // }, [businessId]);

    // handlers
    const handleToggleGlobalSavedChanges = () => {
        setUnsavedChanges((prevValue) => !prevValue);
    };

    const handleBusinessSelectChange = async (value: string | null) => {
        if (value != null) {
            const businessUid: string = await findBusinessIdByName(value, session?.access_token);
            if (unsavedChanges) {
                setBusinessChange(true);
                setBusinessUidTemp(businessUid);
                setBusinessNameTemp(value);
            }
            else {
                // change the business id and name in selected business model
                if (!isNullOrEmpty(businessUid)) {
                    setSelectedBusinessModel({
                        business_uid: businessUid.toString(),
                        business_name: value
                    });

                    // update business id state
                    setBusinessId(businessUid);
                    handleBusinessIdChangeProp(businessUid);
                }
            }
        }
    };

    function handleUserSelectChange(value: string | null) {
        if (value != null) {
            setSelectedUserType(value);
            handleSelectedUserChangeProp(value);
        }
    }

    // Function to handle changes to the selected week
    const handleWeekChange = async (startDate: Dayjs | null) => {
        if (startDate) {
            setSelectedWeekStartDate(startDate);

            // fetch attendance records for the selected week
            if (businessId != null) {
                setShowUnsavedChangesModal(false);
                handleWeekChangeProp(startDate);
            }
        }
    };

    function handleUnsavedChanges(confirm: boolean) {
        if (confirm) {
            console.log("Changes are gone");
        }
        else {
            console.log("Changes are saved");
        }
    }

    // handle business select change
    function handleSelectChange(value: string | null) {
        if (!user) return;

        user?.business_info.forEach((business: any) => {
            if (business.id === value) {
                setBusiness(business);
                localStorage.setItem("activeBusiness", JSON.stringify(business));
            }
        });
    }

    // format business data for select dropdown
    function handleBusinessListFormat() {
        setBusinessSelectData(businessListFormat(businessList));
    }

    let styleColor = "";
    computedColorScheme == 'light' ? styleColor = "#e8e9ed" : styleColor = "#161b26";

    return (
        <>
            {windowWidth < 800 ? (
                // MOBILE VIEW
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f", borderRadius: "15px" }}>
                    <Stack
                        //grow
                        pt="lg"
                        //style={{ backgroundColor: "#25352F" }}
                        className="sticky"
                    >
                        {/* Business select. Fetch all children and attendance for the selected business */}
                        {businessList?.length > 1 && (
                            <Select
                                id="business"
                                label="Business centre"
                                placeholder={business?.name}
                                size="lg"
                                data={businessSelectData}
                                classNames={classes}
                                onChange={(value) => handleSelectChange(value)}
                            >
                            </Select>
                        )}

                        {/* Staff select disabled if no selected */}
                        {/* {selectedBusinessModel.business_id.length == 0 && (
                        <Select
                            id="staff-name"
                            className="btn-responsive"
                            name="staff_name"
                            label="Staff"
                            placeholder="Please select one"
                            required
                            disabled
                            radius="md"
                            value={selectedStaffModel.staff_id}
                            onChange={(newStaff) => {
                                handleStaffSelectChange(newStaff);
                            }}
                            size="lg"
                            data={staffSelectData}
                        >
                        </Select>
                    )} */}

                        {/* Staff select */}
                        {/* {selectedBusinessModel.business_id.length > 0 && (
                        <Select
                            id="staff-name
                            className="btn-responsive"
                            name="staff_name"
                            label="Staff"
                            placeholder="Please select one"
                            required
                            radius="md"
                            value={selectedStaffModel.staff_id}
                            onChange={(newStaff) => {
                                handleStaffSelectChange(newStaff);
                            }}
                            size="lg"
                            data={staffSelectData}
                        >
                        </Select>
                    )} */}
                        <Group justify="center" align="end">
                            {/* previous week button */}
                            <ActionIcon
                                size="xl"
                                style={{ marginBottom: "3px", width: "60px" }}
                                radius="md"
                                color="#324d3e"
                                onClick={() => {
                                    if (unsavedChanges) {
                                        setPrevWeekChange(true);
                                    }
                                    else {
                                        if (weekValue) {
                                            var tempValue = dayjs(getStartOfWeek(weekValue)).subtract(1, 'week').toDate();
                                            setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                            handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                        }
                                    }
                                }}
                            >
                                <IconChevronLeft />
                            </ActionIcon>
                            {/* Week picker */}
                            <DatePickerInput
                                //ta="center"
                                label="Week of"
                                withCellSpacing={false}
                                maxDate={new Date()}
                                size="lg"
                                id="week-picker"
                                placeholder="Select a week"
                                value={weekValue}
                                classNames={classes}
                                required
                                radius="md"
                                style={{ width: "50%" }}
                                getDayProps={(date) => {
                                    const isHovered = isInWeekRange(date, hovered);
                                    const isSelected = isInWeekRange(date, weekValue);
                                    const isInRange = isHovered || isSelected;
                                    return {
                                        onMouseEnter: () => setHovered(date),
                                        onMouseLeave: () => setHovered(null),
                                        inRange: isInRange,
                                        firstInRange: isInRange && date.getDay() === 1,
                                        lastInRange: isInRange && date.getDay() === 0,
                                        selected: isSelected,
                                        onClick: () => {
                                            if (unsavedChanges) {
                                                setWeekChange(true);
                                            }
                                            else {
                                                setWeekValue(getStartOfWeek(date));
                                                handleWeekChange(dayjs(getStartOfWeek(date)));
                                            }

                                            //console.log(formatDateWeek(date));
                                        },
                                    };
                                }}
                            />
                            {/* next week button */}
                            <ActionIcon
                                size="xl"
                                radius="md"
                                style={{ marginBottom: "3px", width: "60px" }}
                                color="#324d3e"
                                onClick={() => {
                                    if (unsavedChanges) {
                                        setNextWeekChange(true);
                                    }
                                    else {
                                        if (weekValue) {
                                            // Check if tempValue is not in the future
                                            var today = dayjs();
                                            var tempValue = dayjs(getStartOfWeek(weekValue)).add(1, 'week').toDate();
                                            if (dayjs(tempValue).isBefore(dayjs(today))) {
                                                setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                                handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                            }
                                        }
                                    }
                                }}
                            >
                                <IconChevronRight />
                            </ActionIcon>
                        </Group>
                        {/* Save button to save changes */}
                        <Button
                            className="btn-responsive"
                            color='#336E1E'
                            fullWidth
                            style={{ height: "70px" }}
                            size="lg"
                            radius="md"
                            onClick={() => {
                                if (businessId != null && user && personAttendanceDataProp.length > 0) {
                                    saveAttendanceRecords(businessId, user?.uid, personAttendanceDataProp, session?.access_token);
                                    setUnsavedChanges(false);
                                }
                            }}
                        >
                            Save
                        </Button>
                    </Stack>
                </Paper>
            ) : (
                // DESKTOP VIEW
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#24352f", borderRadius: "15px" }}>
                    <Grid align="end">

                        {/* user type select */}
                        {proPlan && (
                            <Grid.Col span={{ base: 2 }}>
                                <Select
                                    name="user_type"
                                    className="btn-responsive"
                                    //required
                                    disabled={true}
                                    mr="md"
                                    classNames={classes}
                                    value={selectedUserType}
                                    onChange={handleUserSelectChange}
                                    label="Person type"
                                    placeholder="Please select one"
                                    size='lg'
                                    radius="md"
                                    data={userTypeSelectData}
                                >
                                </Select>
                            </Grid.Col>
                        )}

                        {businessList?.length > 1 && (
                            <Grid.Col span={{ base: 12, md: 2 }}>
                                <Select
                                    id="business"
                                    placeholder={business?.name}
                                    label="Business centre"
                                    size="lg"
                                    mr="lg"
                                    data={businessSelectData}
                                    classNames={classes}
                                    onChange={(value) => handleSelectChange(value)}
                                >
                                </Select>
                            </Grid.Col>
                        )}

                        <Grid.Col span={{ base: 12, sm: 10 }}>
                            <Group className="btn-responsive" justify="flex-start" align="flex-end">
                                {/* previous week button */}
                                <ActionIcon
                                    size="xl"
                                    style={{ marginBottom: "3px" }}
                                    radius="md"
                                    color="#324d3e"
                                    onClick={() => {
                                        if (unsavedChanges) {
                                            setPrevWeekChange(true);
                                        }
                                        else {
                                            if (weekValue) {
                                                // var tempValue = dayjs(getStartOfWeek(weekValue)).subtract(1, 'week').toDate();
                                                // setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                                // handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                                const tempValue = dayjs(weekValue).startOf('week').day(1).subtract(1, 'week').toDate();
                                                setWeekValue(tempValue);
                                                handleWeekChange(dayjs(tempValue));
                                            }
                                        }
                                    }}
                                >
                                    <IconChevronLeft />
                                </ActionIcon>
                                {/* Week picker */}
                                <DatePickerInput
                                    withCellSpacing={false}
                                    maxDate={new Date()}
                                    size="lg"
                                    id="week-picker"
                                    label="Week of"
                                    placeholder="Please select a week"
                                    value={weekValue}
                                    classNames={classes}
                                    disabled={selectedUserType !== '' ? false : true}
                                    required
                                    radius="md"
                                    style={{ width: "300px", marginTop: "10px" }}
                                    getDayProps={(date) => {
                                        const isHovered = isInWeekRange(date, hovered);
                                        const isSelected = isInWeekRange(date, weekValue);
                                        const isInRange = isHovered || isSelected;
                                        return {
                                            onMouseEnter: () => setHovered(date),
                                            onMouseLeave: () => setHovered(null),
                                            inRange: isInRange,
                                            firstInRange: isInRange && date.getDay() === 1,
                                            lastInRange: isInRange && date.getDay() === 0,
                                            selected: isSelected,
                                            onClick: () => {
                                                if (unsavedChanges) {
                                                    //setWeekValueTemp(getStartOfWeek(date));
                                                    setWeekValueTemp(dayjs(date).startOf('week').day(1).toDate());
                                                    setWeekChange(true);
                                                }
                                                else {
                                                    //setWeekValue(getStartOfWeek(date));
                                                    //handleWeekChange(dayjs(getStartOfWeek(date)));
                                                    var startOfWeekDate = dayjs(date).startOf('week').day(0).toDate();
                                                    setWeekValue(dayjs(date).startOf('week').day(1).toDate());
                                                    handleWeekChange(dayjs(date).startOf('week').day(1));
                                                }
                                                //console.log(formatDateWeek(date));
                                            },
                                        };
                                    }}
                                />
                                <Button.Group>
                                    {/* next week button */}
                                    <ActionIcon
                                        size="xl"
                                        radius="md"
                                        style={{ marginBottom: "3px" }}
                                        color="#324d3e"
                                        onClick={() => {
                                            if (unsavedChanges) {
                                                setNextWeekChange(true);
                                            }
                                            else {
                                                if (weekValue) {
                                                    // Check if tempValue is not in the future
                                                    var today = dayjs();
                                                    //var tempValue = dayjs(getStartOfWeek(weekValue)).add(1, 'week').toDate();
                                                    const tempValue = dayjs(weekValue).startOf('week').day(1).add(1, 'week').toDate();
                                                    if (dayjs(tempValue).isBefore(dayjs(today))) {
                                                        // setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                                        // handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                                        setWeekValue(tempValue);
                                                        handleWeekChange(dayjs(tempValue));
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        <IconChevronRight />
                                    </ActionIcon>
                                </Button.Group>
                            </Group>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 2 }}>
                            {/* Save button to save changes */}
                            <Group justify="end">
                                <Button
                                    //className="btn-responsive"
                                    color='#336E1E'
                                    style={{ height: "70px", marginTop: "10px" }}
                                    size="lg"
                                    radius="md"
                                    fullWidth
                                    onClick={() => {
                                        if (businessId != null && user && personAttendanceDataProp.length > 0) {
                                            saveAttendanceRecords(businessId, user?.uid, personAttendanceDataProp, session?.access_token);
                                            setUnsavedChanges(false);
                                        }
                                    }}
                                >
                                    Save
                                </Button>
                            </Group>
                            
                        </Grid.Col>
                    </Grid>
                </Paper>
            )}

        </>
        //</CopyModeContext.Provider>
    );
}