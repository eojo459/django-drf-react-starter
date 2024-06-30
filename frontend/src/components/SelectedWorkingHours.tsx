import { Grid, Paper, Select, Space, Table, TextInput, Text, Group } from "@mantine/core";
import DayCheckboxes from "./DayCheckboxes";
import { IndustryData, employeeCountData, timezoneData } from "../helpers/SelectData";
import classes from '../css/TextInput.module.css';
import { useEffect, useMemo, useState } from "react";
import { TimeInputSelectBase } from "./TimeInputSelectBase";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { useAuth } from "../authentication/SupabaseAuthContext";
import { SelectAsync } from "./TimeInputSelect";
import TimePickerPopover from "./TimePickerPopover";
import { GenerateUUID, convertMinutesToHoursAndMinutes, formatPopoverTime, formatTime, getDayOfWeekFromInt, getDayOfWeekInt } from "../helpers/Helpers";
import { HoursMinutesCombobox } from "./HoursMinutesCombobox";
import { format } from "path";

export interface SelectedDays {
    label: string;
    checked: boolean;
    key: string;
}

interface ISelectedWorkingHours {
    selectedWeekdays: SelectedDays[];
    selectedWeekends: SelectedDays[];
    hoursOfOperation: any[];
    handleFormChanges: (form: any) => void; // send back form data to parent
}

export default function SelectedWorkingHours(props: ISelectedWorkingHours) {
    const { user, business, session } = useAuth();

    const hoursOfOperationDefault = [
        { uid: randomId(), day: "Monday", day_id: 0, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Tuesday", day_id: 1, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Wednesday", day_id: 2, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Thursday", day_id: 3, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Friday", day_id: 4, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Saturday", day_id: 5, start: "", end: "", business_id: business?.id },
        { uid: randomId(), day: "Sunday", day_id: 6, start: "", end: "", business_id: business?.id },
    ]

    // setup props
    const { selectedWeekdays, selectedWeekends, hoursOfOperation, handleFormChanges } = props;

    // const selectedWeekdaysProp = props.selectedWeekdays;
    // const selectedWeekendsProp = props.selectedWeekends;
    // const hoursOfOperationProp = props.hoursOfOperation;
    //const handleFormChangesProp = props.handleFormChanges;

    // continue with states
    const [localSelectedWeekdays, setLocalSelectedWeekdays] = useState<any[]>([]);
    const [localSelectedWeekends, setLocalSelectedWeekends] = useState<any[]>([]);
    const [hoursOfOperationList, setHoursOfOperationList] = useState<any[]>(hoursOfOperation?.length > 0 ? hoursOfOperation : hoursOfOperationDefault);
    const [weekdayRows, setWeekdayRows] = useState<JSX.Element[] | null>(null);
    const [weekendRows, setWeekendRows] = useState<JSX.Element[] | null>(null);

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            selected_weekdays: selectedWeekdays ?? [] as SelectedDays[], // foreach create a new record in business schedule
            selected_weekends: selectedWeekends ?? [] as SelectedDays[], 
            hours_of_operation: hoursOfOperationList,
            //overtime_max_duration: props.overtimeMaxDuration,
            section: 'working_hours',
        },
        validate: (value) => {
            return {
                hours_of_operation: value.hours_of_operation.length <= 0 ? 'Selected working hours is required' : null,
            }
        },
        onValuesChange: (values) => {
            setupWorkingHoursForm(values);
            //console.log(values);
        },
    });

    useEffect(() => {
        setupWorkingHoursForm(hoursOfOperation, true);
    },[]);

    // update local states when props change
    useEffect(() => {
        if (hoursOfOperation?.length > 0) {
            setHoursOfOperationList(hoursOfOperation);
            setupWorkingHoursForm(hoursOfOperation, true);
        }
        handleSelectedWeekdaysChanges(selectedWeekdays);
        handleSelectedWeekendsChanges(selectedWeekends);
    }, [selectedWeekdays, selectedWeekends, hoursOfOperation]);

    useEffect(() => {
        //handleFormChanges(form);
        getWeekdayRows();
        getWeekendRows();
    },[selectedWeekdays, selectedWeekends, hoursOfOperationList, localSelectedWeekdays, localSelectedWeekends]);

    useEffect(() => {
        //console.log(hoursOfOperationList);
        //console.log(form);
        form.setFieldValue('hours_of_operation', hoursOfOperationList);
    }, [hoursOfOperationList]);

    // useEffect(() => {
    //     getWeekdayRows();
    // },[]);

    function handleSelectedWeekdaysChanges(selected: SelectedDays[]) {
        setLocalSelectedWeekdays(selected); 
        hoursOfOperationList.forEach((weekday) => { 
            var isWeekday = false;
            if (weekday.day !== "Saturday" && weekday.day !== "Sunday") {
                isWeekday = true;
            }

            // if weekday was not selected, clear start/end values
            const exists = selected.some(item => item.label === weekday.day && item.checked === true);
            if (!exists && isWeekday) {
                weekday.start = "";
                weekday.end = "";
            }
        });
        form.setFieldValue('selected_weekdays', selected);
        //handleFormChanges(form);
        //getWeekdayRows();
        //console.log(selected);   
    }

    function handleSelectedWeekendsChanges(selected: SelectedDays[]) {
        setLocalSelectedWeekends(selected);  
        hoursOfOperationList.forEach((weekend) => { 
            var isWeekend = false;
            if (weekend.day === "Saturday" || weekend.day === "Sunday") {
                isWeekend = true;
            }

            // if weekend was not selected, clear start/end values
            const exists = selected.some(item => item.label === weekend.day && item.checked === true);
            if (!exists && isWeekend) {
                weekend.start = "";
                weekend.end = "";
            }
        });
        //handleSelectedWeekends(selected);
        form.setFieldValue('selected_weekends', selected);
        //handleFormChanges(form);
        //console.log(selected);  
    }

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
            form.setFieldValue('hours_of_operation', updatedHoursOfOperationList);
            setHoursOfOperationList(updatedHoursOfOperationList);
            //handleFormChanges(form);
            //console.log(timeType + " " + day + " Time=" + value);
        }
    }

    // find the index in the hours of the operation for the current day
    function getIndexForDay(day_str: string) {
        return hoursOfOperationList.findIndex(day => day.day === day_str)
    }

    // weekday (mon-fri) start and end working times
    function getWeekdayRows() {
        const weekdayRows = localSelectedWeekdays.map((element, index) => (
            <>
                {element.checked && (
                    <>
                        <Grid.Col span={{ base: 6 }} key={GenerateUUID()}>
                            <TimePickerPopover
                                time={hoursOfOperationList[getIndexForDay(element.label)]?.start}
                                timeType={0}
                                day={getDayOfWeekInt(element.label)}
                                strictMode={false}
                                handlePopoverChange={handlePopoverChange}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <TimePickerPopover
                                time={hoursOfOperationList[getIndexForDay(element.label)]?.end}
                                timeType={1}
                                day={getDayOfWeekInt(element.label)}
                                strictMode={false}
                                handlePopoverChange={handlePopoverChange}
                            />
                        </Grid.Col>
                    </>
                )}
            </>
        ));
        //form.values.selected_weekdays = localSelectedWeekdays;
        setWeekdayRows(weekdayRows);
    }

    // weekend (sat & sun) start and end working 
    function getWeekendRows() {
        const weekendRows = localSelectedWeekends.map((element, index) => (
            <>
                {element.checked && (
                    <>
                        <Grid.Col span={{ base: 6 }} key={GenerateUUID()}>
                            <TimePickerPopover
                                time={hoursOfOperationList[getIndexForDay(element.label)]?.start}
                                timeType={0}
                                day={getDayOfWeekInt(element.label)}
                                strictMode={false}
                                handlePopoverChange={handlePopoverChange}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <TimePickerPopover
                                time={hoursOfOperationList[getIndexForDay(element.label)]?.end}
                                timeType={1}
                                day={getDayOfWeekInt(element.label)}
                                strictMode={false}
                                handlePopoverChange={handlePopoverChange}
                            />
                        </Grid.Col>
                    </>
                )}
            </>
        ));
        //form.values.selected_weekends = localSelectedWeekends;
        setWeekendRows(weekendRows);
    }

    // setup the working hours form
    function setupWorkingHoursForm(values: any, format: boolean = false) {
        if (values.length <= 0) return;

        var workingHours;

        if (format) {
            workingHours = {
                'id': business?.working_hours.id,
                'business_id': values[0].business_id,
                'monday_start': values[0].start,
                'monday_end': values[0].end,
                'tuesday_start': values[1].start,
                'tuesday_end': values[1].end,
                'wednesday_start': values[2].start,
                'wednesday_end': values[2].end,
                'thursday_start': values[3].start,
                'thursday_end': values[3].end,
                'friday_start': values[4].start,
                'friday_end': values[4].end,
                'saturday_start': values[5].start,
                'saturday_end': values[5].end,
                'sunday_start': values[6].start,
                'sunday_end': values[6].end,
                'section': 'working_hours',
            }
        }
        else {
            workingHours = {
                'id': business?.working_hours.id,
                'business_id': values.hours_of_operation[0].business_id,
                'monday_start': values.hours_of_operation[0].start,
                'monday_end': values.hours_of_operation[0].end,
                'tuesday_start': values.hours_of_operation[1].start,
                'tuesday_end': values.hours_of_operation[1].end,
                'wednesday_start': values.hours_of_operation[2].start,
                'wednesday_end': values.hours_of_operation[2].end,
                'thursday_start': values.hours_of_operation[3].start,
                'thursday_end': values.hours_of_operation[3].end,
                'friday_start': values.hours_of_operation[4].start,
                'friday_end': values.hours_of_operation[4].end,
                'saturday_start': values.hours_of_operation[5].start,
                'saturday_end': values.hours_of_operation[5].end,
                'sunday_start': values.hours_of_operation[6].start,
                'sunday_end': values.hours_of_operation[6].end,
                'section': 'working_hours',
            }
        }
        
        // send changes back to parent
        handleFormChanges(workingHours);
    }

    return (
        <>
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background:"#25352F", color:"#dcdcdc"}}>  */}
            <Grid>
                <Grid.Col span={{ base:12 }}>
                    <Space h="lg"/>
                    <Group>
                        <Text size="xl" fw={700}>Selected work days</Text>
                        <Text size="xl" fw={700} ml="-10px" c="#db3c34">*</Text>
                    </Group>
                    <Text>Please provide accurate information about your work schedule.</Text>
                    <Space h="sm"/>
                    <DayCheckboxes 
                        selectedWeekdays={localSelectedWeekdays}
                        selectedWeekends={localSelectedWeekends}
                        selectedWeekdayCheckboxes={handleSelectedWeekdaysChanges}
                        selectedWeekendCheckboxes={handleSelectedWeekendsChanges}
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12 }}>
                    <Space h="lg"/>
                    <Group>
                        <Text size="xl" fw={700}>Standard work hours</Text>
                        <Text size="xl" fw={700} ml="-10px" c="#db3c34">*</Text>
                    </Group>
                    <Text>Please provide your regular work shift start and end times for each day.</Text>

                    {/* start and end working times */}
                    <Grid mt="lg">
                        <Grid.Col span={{ base: 6 }}>
                            <Text size="xl" fw={700}>Start time</Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 6 }}>
                            <Text size="xl" fw={700}>End time</Text>
                        </Grid.Col>
                        {weekdayRows}
                        {weekendRows}
                        <Space/>
                    </Grid>

                </Grid.Col>
            </Grid>
        {/* </Paper> */}
        </>
    );
}