import { ChangeEvent, useEffect, useState } from 'react';
import { Select, rem, Popover, Combobox, InputBase, Input, Loader, useCombobox, ScrollArea, Grid, Text, Button } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { get12Hours, getMinutes, getTimePeriod, getValid12Hours, getValidCurrentTime, getValidHours, getValidMinutes, getValidTimePeriod } from '../helpers/TimeGenerator';
import { splitTime, splitTimeAmPm } from '../helpers/Helpers';
import classes from "../css/TextInput.module.css";

interface TimeInputSelectProps {
    hoursData: string;
    minutesData: string;
    periodData: string;
    timeIndex: number; // 1 | 2 | 3
    timeType: number; // 1 = out, 2 = in, 3 = break start, 4 = break end, 5 = n/a
    strictMode: boolean;
    //strictModeLocation: boolean;
    handlePopoverChange: (timeType: number, timeIndex: number, value: string) => void;
    handlePopoverOpened?: (opened: boolean, timeType: number, timeIndex: number) => void;
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
export function SelectAsync(props: TimeInputSelectProps) {
    const [hoursLoading, setHoursLoading] = useState(false);
    const [minutesLoading, setMinutesLoading] = useState(false);
    const [timePeriodLoading, setTimePeriodLoading] = useState(false);
    const [hoursData, setHoursData] = useState<string[]>([]);
    const [minutesData, setMinutesData] = useState<string[]>([]);
    const [timePeriodData, setTimePeriodData] = useState<string[]>([]);
    const [timeInput, setTimeInput] = useState<string>('');
    const [minutes, setMinutes] = useState<string>('');
    const [period, setPeriod] = useState<string>('');
    const [currentTimeInput, setCurrentTimeInput] = useState('');

    // setup props
    const hoursDataProp = props.hoursData;
    const minutesDataProp = props.minutesData;
    const periodDataProp = props.periodData;
    const timeIndexProp = props.timeIndex;
    const timeTypeProp = props.timeType;
    const strictModeProp = props.strictMode;
    //const strictModeLocationProp = props.strictModeLocation;
    const handlePopoverChange = props.handlePopoverChange;
    const handlePopoverOpen = props.handlePopoverOpened;

    // sync state with data from parent
    useEffect(() => {
        setTimeInput(hoursDataProp + ":" + minutesDataProp + " " + periodDataProp);
    }, [hoursDataProp, minutesDataProp, periodDataProp]);

    // set time to current time
    useEffect(() => {
        if (currentTimeInput != '') {
            setTimeInput(currentTimeInput);
        }
    }, [currentTimeInput]);

    // select dropdown menu for hours
    const comboboxHours = useCombobox({
        onDropdownClose: () => comboboxHours.resetSelectedOption(),
        onDropdownOpen: () => {
            if (hoursData.length === 0 && !hoursLoading) {
                setHoursLoading(true);
                getAsyncData('hours', strictModeProp).then((response) => {
                    setHoursData(response);
                    setHoursLoading(false);
                    comboboxHours.resetSelectedOption();
                });
            }
        },
    });

    // select dropdown menu for minutes
    const comboboxMinutes = useCombobox({
        onDropdownClose: () => comboboxMinutes.resetSelectedOption(),
        onDropdownOpen: () => {
            if (minutesData.length === 0 && !hoursLoading) {
                setMinutesLoading(true);
                getAsyncData('minutes', strictModeProp).then((response) => {
                    setMinutesData(response);   
                    setMinutesLoading(false);
                    comboboxMinutes.resetSelectedOption();
                });
            }
        },
    });

    // select dropdown menu for time period
    const comboboxTimePeriod = useCombobox({
        onDropdownClose: () => comboboxTimePeriod.resetSelectedOption(),
        onDropdownOpen: () => {
            if (timePeriodData.length === 0 && !hoursLoading) {
                setTimePeriodLoading(true);
                getAsyncData('period', strictModeProp).then((response) => {
                    setTimePeriodData(response);   
                    setTimePeriodLoading(false);
                    comboboxTimePeriod.resetSelectedOption();
                });
            }
        },
    });

    // render the value based on what type is given
    function renderValue(type: string) {
        var hours = splitTimeAmPm(timeInput, 'hours');
        var minutes = splitTimeAmPm(timeInput, 'minutes');
        var period = splitTimeAmPm(timeInput, 'period');
        switch(type) {
            case 'hours':
                if (hours == "" || hours === undefined) {
                    hours = "--";
                }
                return hours;
            case 'minutes':
                if (minutes == "" || minutes === undefined) {
                    minutes = "--";
                }
                return minutes;
            case 'period':
                return period;
            default:
                return "";
        }
    }

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

    let timePeriodOptions = timePeriodData.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    // render combobox
    return (
        <Grid style={{ display:"flex", justifyContent:"center", alignItems:"center"}}>
            {/* hours */}
            <Grid.Col span={3}>  
                <Combobox
                    store={comboboxHours}
                    classNames={classes}
                    withinPortal={false}
                    onOptionSubmit={(val) => {
                        var minutes = splitTimeAmPm(timeInput, 'minutes');
                        var period = splitTimeAmPm(timeInput, 'period');

                        // build new timeInput string with new hours (H:MM A)
                        var newTime = val + ":" + minutes + " " + period;
                        setTimeInput(newTime);
                        comboboxHours.closeDropdown();
                    }}
                >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        pointer
                        classNames={classes}
                        rightSection={hoursLoading ? <Loader size={18} /> : ""}
                        onClick={() => comboboxHours.toggleDropdown()}
                        rightSectionPointerEvents="none"
                    >
                        {renderValue('hours') || <Input.Placeholder>{renderPlaceholder('hours')}</Input.Placeholder>}
                    </InputBase>
                </Combobox.Target>
                    <Combobox.Dropdown>
                        <Combobox.Options mah={100} style={{ overflowY: 'auto' }}>
                            <ScrollArea.Autosize type="scroll" mah={100}>
                                {hoursLoading ? <Combobox.Empty>....</Combobox.Empty> : hoursOptions}
                            </ScrollArea.Autosize>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
            </Grid.Col>

            {/* time colon ':' */}
            <Grid.Col span={1} style={{ marginLeft: "-10px", marginRight: "-15px"}}>
                <Text size='xl' c="#dcdcdc" fw={600}>:</Text>
            </Grid.Col>

            {/* minutes */}
            <Grid.Col span={3}>
                <Combobox
                    store={comboboxMinutes}
                    classNames={classes}
                    withinPortal={false}
                    onOptionSubmit={(val) => {
                        var hours = splitTimeAmPm(timeInput, 'hours');
                        var period = splitTimeAmPm(timeInput, 'period');

                        // build new timeInput string with new minutes (H:MM A)
                        var newTime = hours + ":" + val + " " + period;
                        setTimeInput(newTime);
                        comboboxMinutes.closeDropdown();
                    }}
                >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        pointer
                        classNames={classes}
                        rightSection={minutesLoading ? <Loader size={18} /> : ""}
                        onClick={() => comboboxMinutes.toggleDropdown()}
                        rightSectionPointerEvents="none"
                    >
                        {renderValue('minutes') || <Input.Placeholder>{renderPlaceholder('minutes')}</Input.Placeholder>}
                    </InputBase>
                </Combobox.Target>
                    <Combobox.Dropdown>
                        <Combobox.Options mah={100} style={{ overflowY: 'auto' }}>
                            <ScrollArea.Autosize type="scroll" mah={100}>
                                {minutesLoading ? <Combobox.Empty>....</Combobox.Empty> : minutesOptions}
                            </ScrollArea.Autosize>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
            </Grid.Col>

            {/* period */}
            <Grid.Col span={6}>
                <Combobox
                    store={comboboxTimePeriod}
                    classNames={classes}
                    withinPortal={false}
                    onOptionSubmit={(val) => {
                        var hours = splitTimeAmPm(timeInput, 'hours');
                        var minutes = splitTimeAmPm(timeInput, 'minutes');

                        // build new timeInput string with new period (H:MM A)
                        var newTime = hours + ":" + minutes + " " + val;
                        setTimeInput(newTime);
                        comboboxTimePeriod.closeDropdown();
                    }}
                >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        pointer
                        classNames={classes}
                        rightSection={timePeriodLoading ? <Loader size={18} /> : ""}
                        onClick={() => comboboxTimePeriod.toggleDropdown()}
                        rightSectionPointerEvents="none"
                    >
                        {renderValue('period') || <Input.Placeholder>{renderPlaceholder('period')}</Input.Placeholder>}
                    </InputBase>
                </Combobox.Target>
                    <Combobox.Dropdown>
                        <Combobox.Options mah={100} style={{ overflowY: 'auto' }}>
                            <ScrollArea.Autosize type="scroll" mah={100}>
                                {timePeriodLoading ? <Combobox.Empty>....</Combobox.Empty> : timePeriodOptions}
                            </ScrollArea.Autosize>
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
            </Grid.Col>

            {/* current time button */}
            <Grid.Col span={12}>
                <Button
                    fullWidth
                    //variant="light"
                    color="#324D3E"
                    onClick={() => {
                        setCurrentTimeInput(getValidCurrentTime());
                        console.log("Current time=" + getValidCurrentTime());
                    }}
                >
                    Current time
                </Button>
            </Grid.Col>
            
            {/* cancel button, close popover */}
            <Grid.Col span={6}>
                <Button
                    fullWidth
                    color="rgba(117, 115, 113, 0.2)"
                    onClick={() => {
                        if (props.handlePopoverOpened != undefined) {
                            props.handlePopoverOpened(false, timeTypeProp, timeIndexProp)
                        }
                    }}
                >
                    Cancel
                </Button>
            </Grid.Col>

            {/* ok button, confirm changes */}
            <Grid.Col span={6}>
                <Button
                    fullWidth
                    color="#4a8a2a"
                    onClick={() => {
                        handlePopoverChange(timeTypeProp, timeIndexProp, timeInput);
                        if (props.handlePopoverOpened != undefined) {
                            props.handlePopoverOpened(false, timeTypeProp, timeIndexProp);
                        }
                    }}
                >
                    OK
                </Button>
            </Grid.Col>
            {/* add this but a toggle to the center management page */}
            {/* <Grid.Col span={12}>
                <Button
                    onClick={() => {
                        setStrictMode(!strictMode);
                        setHoursData([]);
                        setMinutesData([]);
                        setTimePeriodData([]);
                    }}
                >   
                    {strictMode ? "Disable strict mode" : "Enable strict mode"}
                </Button>
            </Grid.Col> */}
        </Grid>
    );
}