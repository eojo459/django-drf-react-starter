import { ActionIcon, Button, Grid, Popover, Text, Tooltip, rem } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { formatTime, getDayOfWeekFromInt, getTimeType, splitTime } from "../helpers/Helpers";
import { SelectAsync } from "./TimeInputSelect";
import { useEffect, useState } from "react";
import classes from '../css/AttendanceTimePicker.module.scss';
import { useMediaQuery } from "@mantine/hooks";

interface ITimePickerPopover { 
    time: string;
    timeType: number;
    day: number;
    strictMode: boolean;
    handlePopoverChange: (timeType: number, timeIndex: number, value: string) => void;
}

export default function TimePickerPopover(props: ITimePickerPopover) {
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [displayTimePicker, setDisplayTimePicker] = useState(true);
    const [popoverOpenD1In, setPopoverOpenD1In] = useState(false);
    const [isHovered, setIsHovered] = useState(true);
    const [attendanceTimes, setAttendanceTimes] = useState({
        check_in_time: '',
        check_out_time: '',
        check_in_time_2: '',
        check_out_time_2: '',
        check_in_time_3: '',
        check_out_time_3: '',
        break_in_time: '',
        break_out_time: '',
        break_in_time_2: '',
        break_out_time_2: '',
        break_in_time_3: '',
        break_out_time_3: '',
    });

    // props
    const timeProp = props.time;
    const strictModeProp = props.strictMode;
    const timeTypeProp = props.timeType;
    const dayProp = props.day;
    const handlePopoverChangeProp = props.handlePopoverChange;
    //const handlePopoverOpenProp = props.handlePopoverOpen
    
    function handlePopoverOpen(opened: boolean) {
        setPopoverOpenD1In(opened);
    }

    useEffect(() => {
        console.log("timeType=" + timeTypeProp);
    }, [timeTypeProp]);

    return (
        <>
            <Popover
                opened={popoverOpenD1In}
                onChange={setPopoverOpenD1In}
                width={300}
                position="bottom"
                withArrow
                shadow="md"
                arrowSize={10}
                radius="sm"
            >

                {/* parent of popover */}
                <Popover.Target>
                    <Grid>
                        <Grid.Col span={12}>
                            <Text size='lg'>{getDayOfWeekFromInt(dayProp)} {getTimeType(timeTypeProp)}</Text>
                            {isHovered && (
                                <Button.Group>
                                    <Button
                                        //className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                        classNames={classes}
                                        size="lg"
                                        disabled
                                        fullWidth
                                        miw={105}
                                        justify="left"
                                        radius="sm"
                                    >
                                        <Text c="black" size={isMobile ? "md" : "20px"} fw={600} style={{ letterSpacing: "1px" }}>{formatTime(timeProp)}</Text>
                                    </Button>
                                    {displayTimePicker && (
                                        <ActionIcon
                                            size="50px"
                                            radius="sm"
                                            color="#4a8a2a"
                                            onClick={() => setPopoverOpenD1In(true)} // show popover
                                        >
                                            <IconEdit style={{ width: rem(18) }} />
                                        </ActionIcon>
                                    )}
                                    {!displayTimePicker && (
                                        <Tooltip
                                            label="Strict mode enabled."
                                            multiline
                                        >
                                            <ActionIcon
                                                size="lg"
                                                radius="sm"
                                                color="#4a8a2a"
                                                disabled
                                            >
                                                <IconEdit style={{ width: rem(18) }} />
                                            </ActionIcon>
                                        </Tooltip>

                                    )}

                                </Button.Group>
                            )}
                            {!isHovered && (
                                <Button
                                    //className={computedColorScheme == 'light' ? "timeInputLight" : "timeInputDark"}
                                    disabled
                                    fullWidth
                                    miw={90}
                                    justify="left"
                                >
                                    <Text c="black" fw={600} style={{ letterSpacing: "1px" }}>{formatTime(timeProp)}</Text>
                                </Button>
                            )}
                        </Grid.Col>
                    </Grid>
                </Popover.Target>

                {/* popover content */}
                <Popover.Dropdown p="md" style={{ backgroundColor: "#182420", border: "transparent", borderRadius: "15px" }}>
                    {/* display time picker if user is at location OR strict mode is disabled */}
                    {displayTimePicker && (
                        <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Grid.Col span={12}>
                                <SelectAsync
                                    data-autofocus
                                    hoursData={splitTime(timeProp, 'hours')}
                                    minutesData={splitTime(timeProp, 'minutes')}
                                    periodData={splitTime(timeProp, 'period')}
                                    timeIndex={dayProp}
                                    timeType={timeTypeProp}
                                    strictMode={strictModeProp}
                                    //strictModeLocation={strictModeLocation}
                                    handlePopoverChange={handlePopoverChangeProp}
                                    handlePopoverOpened={handlePopoverOpen}
                                />
                            </Grid.Col>
                        </Grid>
                    )}
                </Popover.Dropdown>
            </Popover>
        </>
    );
}