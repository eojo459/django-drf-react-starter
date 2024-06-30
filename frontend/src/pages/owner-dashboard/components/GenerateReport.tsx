import { Tabs, Title, Text, Stack, Grid, Select, Button, Checkbox } from "@mantine/core";
import StaffSubmittedTimesheets from "./StaffSubmittedTimesheets";
import UserSubmittedTimesheets from "./UserSubmittedTimesheets";
import { IndustryData, reportTypeData, reportingFrequencyData } from "../../../helpers/SelectData";
import classes from "../../../css/TextInput.module.css";
import { DatePickerInput } from "@mantine/dates";
import { useState } from "react";
import { ReportInfo } from "../ReportInbox";
import { formatDate } from "../../../helpers/Helpers";

interface GenerateReport {
    handleGenerate: (reportInfo: ReportInfo) => void;
}

export default function GenerateReport(props: GenerateReport) {
    const [selectedRange, setSelectedRange] = useState<[Date | null, Date | null]>([null, null]);
    const [dataOptionsGroup, setDataOptionsGroup] = useState<string[]>([]);
    const [optionsGroup, setOptionsGroup] = useState<string[]>([]);
    const [reportType, setReportType] = useState<string | null>('');

    // props
    const handleGenerateProp = props.handleGenerate;

    // handle when the generate button is clicked
    function handleGenerateClicked() {
        // verify atlest the data option was selected
        if (dataOptionsGroup?.length > 0) {
            // create the data to be sent
            var newReportInfo = {
                'options': optionsGroup,
                'report_type': reportType,
                'data': dataOptionsGroup[0],
                'start_date': formatDate(selectedRange[0]),
                'end_date': formatDate(selectedRange[1]),
            }
            handleGenerateProp(newReportInfo);
        }
    }

    // TODO: display tabs if business also has users, else just display submitted staff timesheets
    return (
        <>
            <Grid align="start">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    {/* <Text size="20px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Staff</Text> */}
                    <Select
                        required
                        id="report"
                        value={reportType}
                        onChange={setReportType}
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        allowDeselect={false}
                        placeholder="Select a report type"
                        label="Report type"
                        name="report"
                        size="lg"
                        maw={500}
                        classNames={classes}
                        data={reportTypeData}
                        //{...form.getInputProps('business_info.industry')}
                    >
                    </Select>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    {/* <Text fw={600}>Users</Text> */}
                    <DatePickerInput
                        type="range"
                        label="Period"
                        placeholder="Period"
                        size="lg"
                        classNames={classes}
                        value={selectedRange}
                        onChange={setSelectedRange}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 6 }}>
                    <Checkbox.Group 
                        label="Data"
                        value={dataOptionsGroup} 
                        onChange={setDataOptionsGroup}
                        size="lg"
                        classNames={classes}
                    >
                        <Checkbox 
                            value="employee" 
                            label="Include all employees" 
                            mt="sm"
                            color="lime.4"
                            iconColor="dark.8"
                        />
                        <Checkbox 
                            mt="sm"
                            value="user" 
                            label="Include all users" 
                            disabled
                            color="lime.4"
                            iconColor="dark.8"
                        />
                        <Checkbox 
                            mt="sm"
                            value="all" 
                            label="Include all employees and users" 
                            disabled
                            color="lime.4"
                            iconColor="dark.8"
                        />
                    </Checkbox.Group>
                </Grid.Col>
                <Grid.Col span={{ base: 6 }}>
                    <Checkbox.Group 
                        label="Options"
                        value={optionsGroup} 
                        onChange={setOptionsGroup}
                        size="lg"
                        classNames={classes}
                    >
                        <Checkbox 
                            value="overtime" 
                            label="Overtime" 
                            mt="sm"
                            color="lime.4"
                            iconColor="dark.8"
                        />
                        <Checkbox 
                            value="sick" 
                            label="Sick leave" 
                            mt="sm"
                            color="lime.4"
                            iconColor="dark.8"
                        />
                        <Checkbox 
                            value="vacation" 
                            label="Vacation" 
                            mt="sm"
                            color="lime.4"
                            iconColor="dark.8"
                        />
                        <Checkbox 
                            value="holiday" 
                            label="Holidays" 
                            mt="sm"
                            color="lime.4"
                            iconColor="dark.8"
                        />
                        <Checkbox 
                            value="unpaid" 
                            label="Unpaid" 
                            mt="sm"
                            color="lime.4"
                            iconColor="dark.8"
                        />
                        <Checkbox 
                            value="other_paid" 
                            label="Other paid" 
                            mt="sm"
                            color="lime.4"
                            iconColor="dark.8"
                        />
                    </Checkbox.Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12 }} mt="lg">
                    <Button 
                        size="lg" 
                        radius="md" 
                        color="#316F22" 
                        fullWidth
                        onClick={handleGenerateClicked}
                    >
                        Generate
                    </Button>
                </Grid.Col>
            </Grid>
        </>
    );
}