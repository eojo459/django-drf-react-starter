import { ActionIcon } from "@mantine/core";
import { DatePickerInput, getStartOfWeek } from "@mantine/dates";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { isInWeekRange } from "../helpers/Helpers";
import { useState } from "react";
import React from "react";

export default function WeekPickerWithArrows() {
    const [weekValue, setWeekValue] = useState<Date | null>(null);
    const [selectedWeekStartDate, setSelectedWeekStartDate] = React.useState<Dayjs | null>(null);
    const [hovered, setHovered] = useState<Date | null>(null);

    function handleWeekChange(startDate: Dayjs) {
        console.log("Parent received updated start date:", startDate);
        //setNewChanges(false);
        setSelectedWeekStartDate(startDate);
    }

    return (
        <>
            <ActionIcon
                                size="xl"
                                style={{ marginBottom: "3px" }}
                                radius="md"
                                // onClick={() => {
                                //     if (unsavedChanges) {
                                //         setPrevWeekChange(true);
                                //     }
                                //     else {
                                //         if (weekValue) {
                                //             var tempValue = dayjs(getStartOfWeek(weekValue)).subtract(1, 'week').toDate();
                                //             setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                //             handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                //         }
                                //     }
                                // }}
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
                                radius="md"
                                style={{maxWidth: "300px", marginTop:"10px"}}
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
                                            setWeekValue(getStartOfWeek(date));
                                            handleWeekChange(dayjs(getStartOfWeek(date)));
                                            // if (unsavedChanges) {
                                            //     setWeekValueTemp(getStartOfWeek(date));
                                            //     setWeekChange(true);
                                            // }
                                            // else {
                                            //     setWeekValue(getStartOfWeek(date));
                                            //     handleWeekChange(dayjs(getStartOfWeek(date)));
                                            // }
                                            //console.log(formatDateWeek(date));
                                        },
                                    };
                                }}
                            />
                        

                        {/* next week button */}
                    
                            <ActionIcon
                                size="xl"
                                radius="md"
                                style={{ marginBottom: "3px" }}
                                // onClick={() => {
                                //     if (unsavedChanges) {
                                //         setNextWeekChange(true);
                                //     }
                                //     else {
                                //         if (weekValue) {
                                //             // Check if tempValue is not in the future
                                //             var today = dayjs();
                                //             var tempValue = dayjs(getStartOfWeek(weekValue)).add(1, 'week').toDate();
                                //             if (dayjs(tempValue).isBefore(dayjs(today))) {
                                //                 setWeekValue(dayjs(getStartOfWeek(tempValue)).toDate());
                                //                 handleWeekChange(dayjs(getStartOfWeek(tempValue)));
                                //             }
                                //         }
                                //     }
                                // }}
                            >
                                <IconChevronRight />
                            </ActionIcon>
        </>
    );
}