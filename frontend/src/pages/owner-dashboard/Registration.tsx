import { ComboboxData, Grid, Paper, Select, Stack, Text,  } from "@mantine/core";
import AccordionRegistrationForm from "../../components/AccordionRegistrationForm";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import classes from "../../css/UserProfile.module.css";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { GetChildRelationshipByBusinessId, GetStaffRelationshipByBusinessId, getBusinessByOwnerId, getBusinessOwnerPlanById, getBusinessOwnerPlanByName, getBusinessOwnerPlanByOwnerUid, getBusinessProfilePlanById, getBusinessProfilePlanByName } from "../../helpers/Api";
import { ProgressCard } from "../../components/ProgressCard";

interface UserRoleData {
    value: number;
    label: string;
    disabled: boolean;
}

export function Registration() {
    const { user, business, session } = useAuth();
    const [selectedEntityType, setSelectedEntityType] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [registrationEntityData, setRegistrationEntityData] = useState<ComboboxData>();
    const [businessCount, setBusinessCount] = useState(0);
    const [staffCount, setStaffCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [maxLocations, setMaxLocations] = useState(0);
    const [maxStaffs, setMaxStaffs] = useState(0);
    const [maxUsers, setMaxUsers] = useState(0);

    // run on component load
    useEffect(() => {
        validatePlanIntegrity();
    },[]);

    // before registration check and see if user has permission to complete the action
    // this determines the data to be displayed in the dropdowns
    async function validatePlanIntegrity() {
        if (!user) {
            return;
        }

        var MAX_LOCATIONS;
        var MAX_USERS;
        var MAX_STAFFS; 
        var businessPlanInfo;
        var ownerPlanInfo;
        var createBusiness = false;
        //var createUser = false;
        //var createStaff = false;

        // get users plan id, if none => FREE PLAN
        var businessPlanId = business?.plan;
        var ownerPlanId = user?.plan;
        if (businessPlanId === undefined || ownerPlanId === undefined) {
            // query database for info about plan
            businessPlanInfo = await getBusinessProfilePlanByName("Free", session?.access_token);
            ownerPlanInfo = await getBusinessOwnerPlanByName("Free", session?.access_token);
        }
        else {
            businessPlanInfo = await getBusinessProfilePlanById(businessPlanId, session?.access_token);
            ownerPlanInfo = await getBusinessOwnerPlanByOwnerUid(user?.uid, session?.access_token);
        }

        // guidelines to meet 
        MAX_LOCATIONS = ownerPlanInfo?.max_locations;
        MAX_USERS = businessPlanInfo?.max_users;
        MAX_STAFFS = businessPlanInfo?.max_staff;
        setMaxLocations(MAX_LOCATIONS);
        setMaxStaffs(MAX_STAFFS);
        setMaxUsers(MAX_USERS);

        // check if allowed to create new business
        var businessLocations = await getBusinessByOwnerId(user?.uid, session?.access_token);
        setBusinessCount(businessLocations?.length);
        if (businessLocations?.length < MAX_LOCATIONS) {
            createBusiness = true;
        }
      
        if (business) {
            // check if allowed to create new staff
            var staffRelationships = await GetStaffRelationshipByBusinessId(business?.id, session?.access_token);
            setStaffCount(staffRelationships?.length);
            // if (staffRelationships?.length < MAX_STAFFS) {
            //     createStaff = true;
            // }

            // check if allowed to create new user
            var userRelationships = await GetChildRelationshipByBusinessId(business?.id, session?.access_token);
            setUserCount(userRelationships?.length);
            // if (userRelationships?.length < MAX_USERS) {
            //     createUser = true;
            // }
        }
        
        // TODO: check if allowed to create new parent/guardian

        // create options
        var registrationOptions: any[] = [];
        registrationOptions.push({
            'value': "0", 
            'label': "Business centre",
            //'disabled': false,
            'disabled': createBusiness ? false : true,
        });

        registrationOptions.push({
            'value': "1", 
            'label': "Staff employee",
            'disabled': true,
            //'disabled': createStaff ? false : true,
        });

        registrationOptions.push({
            'value': "2", 
            'label': "User",
            'disabled': true,
            //'disabled': createUser ? false : true,
        });

        setRegistrationEntityData(registrationOptions);
    }

    return (
        <>
            <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", color: "#dcdcdc" }}>
                <Text 
                    size={isMobile ? "30px" : "35px"} 
                    fw={600} 
                    style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                    mb="lg"
                >
                    Registration
                </Text>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <ProgressCard title="Business locations" current={businessCount?.toString()} max={maxLocations?.toString() ?? 0} value={(businessCount/maxLocations)*100}/>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <ProgressCard title="Staff members" current={staffCount?.toString()} max={maxStaffs?.toString() ?? 0} value={(staffCount/maxStaffs)*100}/>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <ProgressCard title="Users" current={userCount?.toString()} max={maxUsers?.toString() ?? 0} value={(userCount/maxUsers)*100}/>
                    </Grid.Col>
                </Grid>
                
            </Paper>
            <Stack justify="center">
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#25352F", width: isMobile ? "100%" : "300px" }}>
                    <Select
                        required
                        id="user-select"
                        allowDeselect={false}
                        placeholder="Business / Staff / User"
                        label="Select an entity to create"
                        size="lg"
                        classNames={classes}
                        variant="filled"
                        data={registrationEntityData}
                        value={selectedEntityType}
                        style={{ width: "100%" }}
                        onChange={setSelectedEntityType}
                    >
                    </Select>
                </Paper>
                {selectedEntityType != null && selectedEntityType.toString() === "0" && (
                    <AccordionRegistrationForm formType="BUSINESS" />
                )}
                {selectedEntityType != null && selectedEntityType.toString() === "1" && (
                    <AccordionRegistrationForm formType="STAFF" />
                )}
                {selectedEntityType != null && selectedEntityType.toString() === "2" && (
                    <AccordionRegistrationForm formType="USER" />
                )}
                {selectedEntityType != null && selectedEntityType.toString() === "3" && (
                    <AccordionRegistrationForm formType="PARENT" />
                )}
            </Stack>
        </>
    );
}