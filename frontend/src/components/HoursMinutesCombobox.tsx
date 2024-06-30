import { ChangeEvent, useEffect, useState } from 'react';
import { Select, rem, Popover, Combobox, InputBase, Input, Loader, useCombobox, ScrollArea, Grid, Text, Button, Group } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { get12Hours, getMinutes, getTimePeriod, getValid12Hours, getValidCurrentTime, getValidHours, getValidMinutes, getValidTimePeriod } from '../helpers/TimeGenerator';
import { splitTime, splitTimeAmPm } from '../helpers/Helpers';
import classes from "../css/TextInput.module.css";

interface TimeInputSelectProps {
    hoursData: string;
    minutesData: string;
    handleTimeChange: (hours: number, minutes: number) => void;
}

// get the valid times async based on current time
function getAsyncData(type: string, strictMode: boolean) {
    switch(type) {
        case 'hours':
            // get valid hours
            if (strictMode) {
                return new Promise<string[]>((resolve) => {
                    setTimeout(() => resolve(getValid12Hours()), 750);
                });
            }
            else {
                return new Promise<string[]>((resolve) => {
                    setTimeout(() => resolve(get12Hours()), 250);
                });
            }
        case 'minutes':
            // get valid minutes
            if (strictMode) {
                return new Promise<string[]>((resolve) => {
                    setTimeout(() => resolve(getValidMinutes()), 750);
                });
            }
            else {
                return new Promise<string[]>((resolve) => {
                    setTimeout(() => resolve(getMinutes()), 250);
                });
            }
        case 'period':
            // get valid time period (AM/PM)
            if (strictMode) {
                return new Promise<string[]>((resolve) => {
                    setTimeout(() => resolve(getValidTimePeriod()), 750);
                });
            }
            else {
                return new Promise<string[]>((resolve) => {
                    setTimeout(() => resolve(getTimePeriod()), 250);
                });
            }
        default:
            return new Promise<string[]>((resolve) => {
                setTimeout(() => resolve([]), 750);
            });
    }
}

// render placeholders based on type
function renderPlaceholder(type: string) {
    switch(type) {
        case 'hours':
            return "--";
        case 'minutes':
            return "--";
        case 'period':
            return "AM/PM";
        default:
            return "";
    }
}

// render valid times for hours & minutes async in realtime
export function HoursMinutesCombobox(props: TimeInputSelectProps) {
    const [hoursLoading, setHoursLoading] = useState(false);
    const [minutesLoading, setMinutesLoading] = useState(false);
    const [timePeriodLoading, setTimePeriodLoading] = useState(false);
    const [hoursData, setHoursData] = useState<string[]>([]);
    const [minutesData, setMinutesData] = useState<string[]>([]);
    const [timePeriodData, setTimePeriodData] = useState<string[]>([]);
    const [timeInput, setTimeInput] = useState<string>('');
    const [hours, setHours] = useState(props.hoursData);
    const [minutes, setMinutes] = useState(props.minutesData);

    // setup props
    const hoursDataProp = props.hoursData;
    const minutesDataProp = props.minutesData;
    //const strictModeLocationProp = props.strictModeLocation;
    const handleTimeChange = props.handleTimeChange;

    useEffect(() => {
        setHours(hoursDataProp);
    },[hoursDataProp]);

    useEffect(() => {
        setMinutes(minutesDataProp);
    },[minutesDataProp]);

    // run when hours changes
    // useEffect(() => {
    //     setMinutesData(getMinutes(undefined, Number(hours) > 0 ? 0 : 15));
    //     comboboxMinutes.resetSelectedOption();

    //     if (hours === '00') {
    //         setMinutes('15');
    //     }
    // }, [hours]);


    // select dropdown menu for hours
    const comboboxHours = useCombobox({
        onDropdownClose: () => comboboxHours.resetSelectedOption(),
        onDropdownOpen: () => {
            if (hoursData.length === 0 && !hoursLoading) {
                setHoursLoading(true);
                setHoursData(get12Hours());
                setHoursLoading(false);
                comboboxHours.resetSelectedOption();
            }
        },
    });

    // select dropdown menu for minutes
    const comboboxMinutes = useCombobox({
        onDropdownClose: () => comboboxMinutes.resetSelectedOption(),
        onDropdownOpen: () => {
            if (minutesData.length === 0 && !hoursLoading) {
                setMinutesLoading(true);
                //setMinutesData(getMinutes(undefined, Number(hours) > 0 ? 0 : 15));   
                setMinutesData(getMinutes());
                setMinutesLoading(false);
                comboboxMinutes.resetSelectedOption();
            }
        },
    });

    // options for combo box
    let hoursOptions = hoursData.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    let minutesOptions = minutesData.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    // render combobox
    return (
        <Grid align='end' style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
            {/* hours */}
            <Grid.Col span={2}>  
                <Combobox
                    store={comboboxHours}
                    size="md"
                    classNames={classes}
                    withinPortal={false}
                    onOptionSubmit={(val) => {
                        setHours(val);
                        handleTimeChange(Number(val), Number(minutes));
                        comboboxHours.closeDropdown();
                    }}
                >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        label='Hours'
                        size="lg"
                        pointer
                        classNames={classes}
                        rightSection={hoursLoading ? <Loader size={18} /> : ""}
                        onClick={() => comboboxHours.toggleDropdown()}
                        rightSectionPointerEvents="none"
                    >
                        {hours}
                    </InputBase>
                </Combobox.Target>
                    <Combobox.Dropdown>
                        <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
                            <ScrollArea.Autosize type="scroll" mah={200}>
                                {hoursLoading ? <Combobox.Empty>....</Combobox.Empty> : hoursOptions}
                            </ScrollArea.Autosize>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
                
            </Grid.Col>

            {/* time colon ':' */}
            {/* <Grid.Col span={1}>
                <Text size='xl' c="#dcdcdc" fw={600}>:</Text>
            </Grid.Col> */}

            {/* minutes */}
            <Grid.Col span={2}>
                <Combobox
                    store={comboboxMinutes}
                    size="md"
                    classNames={classes}
                    withinPortal={false}
                    onOptionSubmit={(val) => {
                        setMinutes(val);
                        handleTimeChange(Number(hours), Number(val));
                        comboboxMinutes.closeDropdown();
                    }}
                >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        label='Minutes'
                        size="lg"
                        pointer
                        classNames={classes}
                        rightSection={minutesLoading ? <Loader size={18} /> : ""}
                        onClick={() => comboboxMinutes.toggleDropdown()}
                        rightSectionPointerEvents="none"
                    >
                        {minutes}
                    </InputBase>
                </Combobox.Target>
                    <Combobox.Dropdown>
                        <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
                            <ScrollArea.Autosize type="scroll" mah={200}>
                                {minutesLoading ? <Combobox.Empty>....</Combobox.Empty> : minutesOptions}
                            </ScrollArea.Autosize>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
                
            </Grid.Col>
        </Grid>
    );
}