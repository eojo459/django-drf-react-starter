import { Tabs, Title, Text } from "@mantine/core";
import StaffSubmittedTimesheets from "./StaffSubmittedTimesheets";
import UserSubmittedTimesheets from "./UserSubmittedTimesheets";
import classes from  "../../../css/HomePanel.module.css";
import { StaffSubmittedTimesheetsData } from "../TimesheetInbox";

export interface SubmittedTimesheets {
    staffSubmittedTimesheets: StaffSubmittedTimesheetsData[];
    userSubmittedTimesheets?: StaffSubmittedTimesheetsData[]; // TODO: add user submitted timesheets
    handleApproveButtonClicked: (timesheetId: string) => void;
    handleDenyButtonClicked: (timesheetId: string) => void;
}

export default function SubmittedTimesheets(props: SubmittedTimesheets) {

    // props
    const staffSubmittedTimesheetsProp = props.staffSubmittedTimesheets;
    const userSubmittedTimesheetsProp = props.userSubmittedTimesheets;
    const handleApproveButtonClickedProp = props.handleApproveButtonClicked;
    const handleDenyButtonClickedProp = props.handleDenyButtonClicked;

    // TODO: display tabs if business also has users, else just display submitted staff timesheets
    return (
        <>
            <Tabs defaultValue="staff" mt="lg" variant="pills" radius="md" color="rgba(24,28,38,0.5)">
                <Tabs.List>
                    {userSubmittedTimesheetsProp && (
                        <>
                            <Tabs.Tab value="staff" classNames={classes}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Staff</Text>
                            </Tabs.Tab>

                            <Tabs.Tab value="user" classNames={classes}>
                                <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Users</Text>
                            </Tabs.Tab>
                        </>
                    )}
                </Tabs.List>

                <Tabs.Panel value="staff">
                    <StaffSubmittedTimesheets 
                        staffSubmittedTimesheets={staffSubmittedTimesheetsProp}
                        handleApproveButtonClicked={handleApproveButtonClickedProp}
                        handleDenyButtonClicked={handleDenyButtonClickedProp}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="user">
                    <UserSubmittedTimesheets/>
                </Tabs.Panel>
            </Tabs>
        </>
    );
}