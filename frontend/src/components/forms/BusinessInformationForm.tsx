import { Grid, Paper, Select, Space, Table, TextInput, Text, Group } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, employeeCountData, timezoneData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { clampUseMovePosition, randomId } from "@mantine/hooks";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import TimePickerPopover from "../TimePickerPopover";
import { GenerateUUID, formatPopoverTime, formatTime, getDayOfWeekFromInt, getDayOfWeekInt } from "../../helpers/Helpers";
import SelectedWorkingHours from "../SelectedWorkingHours";

interface BusinessInformationForm {
    handleFormChanges: (form: any) => void; // send back form data to parent
}

export default function BusinessInformationForm(props: BusinessInformationForm) {
    const { user, business, session } = useAuth();
    const [selectedWeekdays, setSelectedWeekdays] = useState<any[]>([]);
    const [selectedWeekends, setSelectedWeekends] = useState<any[]>([]);
    const [hoursOfOperationList, setHoursOfOperationList] = useState([
        { uid: randomId(), day: "Monday", day_id: 1, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Tuesday", day_id: 2, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Wednesday", day_id: 3, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Thursday", day_id: 4, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Friday", day_id: 5, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Saturday", day_id: 6, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Sunday", day_id: 7, start: "", end: "", business_id: business?.id },
    ]);
    const [hoursOfOperation, setHoursOfOperation] = useState<any[]>([]);

    // setup props
    const handleFormChangesProp = props.handleFormChanges;

    // form fields for mantine components
    const businessForm = useForm({
        initialValues: {
            business_name: "",
            business_owner: user?.uid,
            industry: "",
            employee_count: "",
            //timezone: "",
            selected_weekdays: [] as string[], // foreach create a new record in business schedule
            selected_weekends: [] as string[], 
            hours_of_operation: hoursOfOperationList,
            section: 'business_info',
        },
        validate: (value) => {
            return {
                business_name: value.business_name.trim().length <= 0 ? 'Business name is required' : null,
                business_owner: value.business_owner ? 'Business owner is required' : null,
                industry: value.industry.trim().length <= 0 ? 'Industry is required' : null,
                employee_count: value.employee_count.trim().length <= 0 ? 'Employee count is required' : null,
                selected_weekdays: value.selected_weekdays.length < 0 ? 'Selected weekdays is required' : null,
                selected_weekends: value.selected_weekends.length < 0 ? 'Selected weekends is required' : null,
                hours_of_operation: value.hours_of_operation.length < 0 ? 'Hours of operation is required' : null,
            }
        },
        onValuesChange: (values) => {
            handleFormChangesProp(values);
        },
    });

    // detect form updates and send back form data to parent
    // useEffect(() => {
    //     handleFormChangesProp(businessForm);
    // },[businessForm]);

    useEffect(() => {
        setupHoursOfOperation();
    },[]);

    // useEffect(() => {
    //     handleFormChangesProp(businessForm);
    // },[businessForm]);

    function handleSelectedWeekdaysChanges(selected: string[]) {
        setSelectedWeekdays(selected); 
        hoursOfOperationList.forEach((weekday) => { 
            // if weekday was not selected, clear start/end values
            if (!selected.includes(weekday.day)) {
                weekday.start = "";
                weekday.end = "";
            }
        });
        businessForm.setFieldValue('selected_weekdays', selected);
        handleFormChangesProp(businessForm);
        //console.log(selected);   
    }

    function handleSelectedWeekendsChanges(selected: string[]) {
        setSelectedWeekends(selected);  
        hoursOfOperationList.forEach((weekend) => { 
            // if weekday was not selected, clear start/end values
            if (!selected.includes(weekend.day)) {
                weekend.start = "";
                weekend.end = "";
            }
        });
        //handleSelectedWeekends(selected);
        businessForm.setFieldValue('selected_weekends', selected);
        handleFormChangesProp(businessForm);
        //console.log(selected);  
    }

    const handleTimeInputChange = (value: string, day: string, timeType: string) => {
        // Handle time change logic here
        console.log("Day=" + day + " Time=" + value);
        //handleTimeInput(value, day);
        switch(timeType) {
            case "start":
                hoursOfOperationList.forEach(element => {
                    if(element.day == day) {
                        element.start = value;
                    }
                });
                break;
            case "end":
                hoursOfOperationList.forEach(element => {
                    if(element.day == day) {
                        element.end = value;
                    }
                });
                break;
        }
        businessForm.setFieldValue('hours_of_operation', hoursOfOperationList);
        handleFormChangesProp(businessForm);
    };

    function handlePopoverChange(timeType: number, day: number, value: string) {
        // find which day index we need to update
        const dayIndex = hoursOfOperationList.findIndex(item => item.day === getDayOfWeekFromInt(day));

        // if day is found, update its start or end time based on timeType
        if (dayIndex !== -1) {
            const updatedHoursOfOperationList = [...hoursOfOperationList];
            if (timeType === 0) {
                // update start time
                updatedHoursOfOperationList[dayIndex] = {
                    ...updatedHoursOfOperationList[dayIndex], // copy the existing object properties
                    start: formatPopoverTime(value),
                };
            }
            else {
                // update end time
                updatedHoursOfOperationList[dayIndex] = {
                    ...updatedHoursOfOperationList[dayIndex], // copy the existing object properties
                    end: formatPopoverTime(value),
                };
            }
            
            // update the state with the modified array
            businessForm.setFieldValue('hours_of_operation', updatedHoursOfOperationList);
            setHoursOfOperationList(updatedHoursOfOperationList);
            //console.log(timeType + " " + day + " Time=" + value);
        }
    }

    function updateHoursOfOperation(day: string, newStart: string, newEnd: string) {
        setHoursOfOperationList(prevList =>
            prevList.map(item =>
                item.day.toLowerCase() === day
                    ? { ...item, start: newStart, end: newEnd }
                    : item
            )
        );
    };

    function handleFormChanges(form: any) {
        updateHoursOfOperation('monday', form.monday_start, form.monday_end);
        updateHoursOfOperation('tuesday', form.tuesday_start, form.tuesday_end);
        updateHoursOfOperation('wednesday', form.wednesday_start, form.wednesday_end);
        updateHoursOfOperation('thursday', form.thursday_start, form.thursday_end);
        updateHoursOfOperation('friday', form.friday_start, form.friday_end);
        updateHoursOfOperation('saturday', form.saturday_start, form.saturday_end);
        updateHoursOfOperation('sunday', form.sunday_start, form.sunday_end);
        businessForm.setFieldValue("hours_of_operation", form);
        //console.log(form);
    }

    function handleOvertimeMaxFormChanges(form: any) {
        businessForm.setFieldValue('overtime_max_duration', form.values.overtime_max_duration);
    }
    
    function setupHoursOfOperation() {
        if (!user) {
            return;
        }

        const weekdayValues = [
            { label: "Monday", checked: false, key: randomId() },
            { label: "Tuesday", checked: false, key: randomId() },
            { label: "Wednesday", checked: false, key: randomId() },
            { label: "Thursday", checked: false, key: randomId() },
            { label: "Friday", checked: false, key: randomId() },
        ];
        
        const weekendValues = [
            { label: "Saturday", checked: false, key: randomId() },
            { label: "Sunday", checked: false, key: randomId() },
        ];

        setSelectedWeekdays(weekdayValues);
        setSelectedWeekends(weekendValues);

        setHoursOfOperation([
            {
                'uid': randomId(),
                'day': 'Monday',
                'day_id': 0,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Tuesday',
                'day_id': 1,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Wednesday',
                'day_id': 2,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Thursday',
                'day_id': 3,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Friday',
                'day_id': 4,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Saturday',
                'day_id': 5,
                'start': '',
                'end': '',
                'business_id': '',
            },
            {
                'uid': randomId(),
                'day': 'Sunday',
                'day_id': 6,
                'start': '',
                'end': '',
                'business_id': '',
            }
        ])       
    }

    // weekday (mon-fri) start and end working times
    const weekdayRows = selectedWeekdays.map((element, index) => (
        <>
            <Grid.Col span={{ base: 6 }} key={GenerateUUID()}>
                <TimePickerPopover
                    time={hoursOfOperationList[index]?.start}
                    timeType={0}
                    day={getDayOfWeekInt(element)}
                    strictMode={false}
                    handlePopoverChange={handlePopoverChange}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 6 }}>
                <TimePickerPopover
                    time={hoursOfOperationList[index]?.end}
                    timeType={1}
                    day={getDayOfWeekInt(element)}
                    strictMode={false}
                    handlePopoverChange={handlePopoverChange}
                />
            </Grid.Col>
        </>

    ));

    // weekend (sat & sun) start and end working times
    const weekendRows = selectedWeekends.map((element, index) => (
        <>
            <Grid.Col span={{ base: 6 }} key={GenerateUUID()}>
                <TimePickerPopover
                    time={hoursOfOperationList[index]?.start}
                    timeType={0}
                    day={getDayOfWeekInt(element)}
                    strictMode={false}
                    handlePopoverChange={handlePopoverChange}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 6 }}>
                <TimePickerPopover
                    time={hoursOfOperationList[index]?.end}
                    timeType={1}
                    day={getDayOfWeekInt(element)}
                    strictMode={false}
                    handlePopoverChange={handlePopoverChange}
                />
            </Grid.Col>
        </>
    ));

    return (
        <>
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background:"#25352F", color:"#dcdcdc"}}>  */}
            <Grid>
                <Grid.Col span={{ base: 12, md: 10 }}>
                    <Text size="xl" fw={600}>Please provide accurate information about your business.</Text>
                    <Space h="lg"/>
                    <Text size="xl" fw={600}>These details will assist us in better understanding and serving your business needs.</Text>
                    <Space h="lg" mb="lg"/>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        required
                        id="business-name"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="Business name"
                        name="name"
                        placeholder="Business name"
                        size="lg"
                        classNames={classes}
                        {...businessForm.getInputProps('business_name')}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                        required
                        disabled
                        id="owner"
                        value={user?.username}
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        label="Business owner"
                        name="owner"
                        placeholder="Business owner"
                        size="lg"
                        classNames={classes}
                        //{...form.getInputProps('business_info.business_owner_name')}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                        required
                        id="industry"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        allowDeselect={false}
                        placeholder="Select a business industry"
                        label="Industry"
                        name="industry"
                        size="lg"
                        classNames={classes}
                        data={IndustryData}
                        {...businessForm.getInputProps('industry')}
                    >
                    </Select>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                        required
                        id="employee-count"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        allowDeselect={false}
                        placeholder="Number of employees"
                        label="Number of employees"
                        name="employee-count"
                        size="lg"
                        classNames={classes}
                        data={employeeCountData}
                        {...businessForm.getInputProps('employee_count')}
                    >
                    </Select>
                </Grid.Col>
                {/* <Grid.Col span={{ base:12, md: 4}}>
                    <Select
                        required
                        id="timezone"
                        //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                        allowDeselect={false}
                        placeholder="Select a timezone"
                        label="Select a timezone"
                        name="timezone"
                        size="lg"
                        classNames={classes}
                        data={timezoneData}
                        {...form.getInputProps('business_info.timezone')}
                    >
                    </Select>
                </Grid.Col> */}
                <Grid.Col span={{ base:12 }}>
                    <Space h="lg"/>
                    <Group>
                        <Text size="xl" fw={700}>Work schedule</Text>
                        <Text size="xl" fw={700} ml="-10px" c="#db3c34">*</Text>
                    </Group>
                    <Space h="sm"/>
                    <SelectedWorkingHours
                        selectedWeekdays={selectedWeekdays}
                        selectedWeekends={selectedWeekends}
                        hoursOfOperation={hoursOfOperation}
                        handleFormChanges={handleFormChanges}
                    />
                </Grid.Col>
            </Grid>
        {/* </Paper> */}
        </>
    );
}