import { ChangeEvent, useEffect, useState } from 'react';
import { Select, rem, Popover, Combobox, InputBase, Input, Loader, useCombobox, ScrollArea, Grid, Text, Button, Group } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import { get12Hours, getMinutes, getTimePeriod, getValid12Hours, getValidCurrentTime, getValidHours, getValidMinutes, getValidTimePeriod } from '../helpers/TimeGenerator';
import { splitTime, splitTimeAmPm } from '../helpers/Helpers';
import classes from '../css/TextInput.module.css';

interface TimeInputSelectProps {
    handleTimeChange: (value: string) => void;
}

// get the valid times async based on current time
function getAsyncData(type: string, strictMode: boolean) {
    switch (type) {
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
    switch (type) {
        case 'hours':
            return "--";
        case 'minutes':
            return "--";
        case 'period':
            return "A";
        default:
            return "";
    }
}

// render valid times for hours & minutes async in realtime
export function TimeInputSelectBase(props: TimeInputSelectProps) {
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
    const handleTimeChange = props.handleTimeChange;

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
                getAsyncData('hours', false).then((response) => {
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
                getAsyncData('minutes', false).then((response) => {
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
                getAsyncData('period', false).then((response) => {
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
        switch (type) {
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
        <Combobox.Option value={item} key={item} classNames={classes}>
            <Text ta="center" size="lg">{item}</Text>
        </Combobox.Option>
    ));

    let minutesOptions = minutesData.map((item) => (
        <Combobox.Option value={item} key={item} classNames={classes}>
            <Text ta="center" size="lg">{item}</Text>
        </Combobox.Option>
    ));

    let timePeriodOptions = timePeriodData.map((item) => (
        <Combobox.Option value={item} key={item} classNames={classes}>
            <Text ta="center" size="lg">{item}</Text>
        </Combobox.Option>
    ));

    // render combobox
    return (
        <Group c="black">
            {/* hours */}
            <Combobox
                store={comboboxHours}
                withinPortal={false}
                onOptionSubmit={(val) => {
                    var minutes = splitTimeAmPm(timeInput, 'minutes');
                    var period = splitTimeAmPm(timeInput, 'period');

                    // build new timeInput string with new hours (H:MM A)
                    var newTime = val + ":" + minutes + " " + period;
                    setTimeInput(newTime);
                    comboboxHours.closeDropdown();
                    handleTimeChange(newTime);
                }}
            >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        size="md"
                        pointer
                        //rightSection={hoursLoading ? <Loader size={18} /> : ""}
                        onClick={() => comboboxHours.toggleDropdown()}
                        rightSectionPointerEvents="none"
                        style={{ width:"60px" }}
                        classNames={classes}
                    >
                        {<Text ta="center" fw={600} size="xl">{renderValue('hours')}</Text> || <Input.Placeholder>{renderPlaceholder('hours')}</Input.Placeholder>}
                    </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown classNames={classes}>
                    <Combobox.Options mah={200} style={{ overflowY: 'auto' }}> 
                        <ScrollArea.Autosize type="scroll" mah={200}>
                            {hoursLoading ? <Combobox.Empty>....</Combobox.Empty> : hoursOptions}
                        </ScrollArea.Autosize>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>

            <Text size='35px' c="#dcdcdc" fw={700} style={{ marginLeft: "-10px", marginRight: "-10px" }}>:</Text>

            {/* minutes */}
            <Combobox
                store={comboboxMinutes}
                withinPortal={false}
                onOptionSubmit={(val) => {
                    var hours = splitTimeAmPm(timeInput, 'hours');
                    var period = splitTimeAmPm(timeInput, 'period');

                    // build new timeInput string with new minutes (H:MM A)
                    var newTime = hours + ":" + val + " " + period;
                    setTimeInput(newTime);
                    comboboxMinutes.closeDropdown();
                    handleTimeChange(newTime);
                }}
            >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        size="md"
                        pointer
                        //rightSection={minutesLoading ? <Loader size={18} /> : ""}
                        onClick={() => comboboxMinutes.toggleDropdown()}
                        rightSectionPointerEvents="none"
                        style={{width:"60px"}}
                        classNames={classes}
                    >
                        {<Text ta="center" fw={600} size="xl">{renderValue('minutes')}</Text> || <Input.Placeholder>{renderPlaceholder('minutes')}</Input.Placeholder>}
                    </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown classNames={classes}>
                    <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
                        <ScrollArea.Autosize type="scroll" mah={200}>
                            {minutesLoading ? <Combobox.Empty>....</Combobox.Empty> : minutesOptions}
                        </ScrollArea.Autosize>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>

            {/* period */}
            <Combobox
                store={comboboxTimePeriod}
                withinPortal={false}
                onOptionSubmit={(val) => {
                    var hours = splitTimeAmPm(timeInput, 'hours');
                    var minutes = splitTimeAmPm(timeInput, 'minutes');

                    // build new timeInput string with new period (H:MM A)
                    var newTime = hours + ":" + minutes + " " + val;
                    setTimeInput(newTime);
                    comboboxTimePeriod.closeDropdown();
                    handleTimeChange(newTime);
                }}
            >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        size="md"
                        pointer
                        //rightSection={timePeriodLoading ? <Loader size={18} /> : ""}
                        onClick={() => comboboxTimePeriod.toggleDropdown()}
                        rightSectionPointerEvents="none"
                        style={{width:"60px"}}
                        classNames={classes}
                    >
                        {<Text ta="center" fw={600} size="lg">{renderValue('period')}</Text> || <Input.Placeholder>{renderPlaceholder('period')}</Input.Placeholder>}
                    </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown classNames={classes}>
                    <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
                        <ScrollArea.Autosize type="scroll" mah={200}>
                            {timePeriodLoading ? <Combobox.Empty>....</Combobox.Empty> : timePeriodOptions}
                        </ScrollArea.Autosize>
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </Group>
    );
}