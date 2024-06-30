import { useListState, randomId, useMediaQuery } from "@mantine/hooks";
import { Checkbox, Grid, Title, Text, Group, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { GenerateUUID } from "../helpers/Helpers";

interface IDayCheckboxes {
    selectedWeekdays: any[];
    selectedWeekends: any[];
    selectedWeekdayCheckboxes: (selected: any[]) => void; // send selected weekday boxes to parent
    selectedWeekendCheckboxes: (selected: any[]) => void; // send selected weekend boxes to parent
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

export default function DayCheckboxes(props: IDayCheckboxes) {

    // props
    const selectedWeekdaysProp = props.selectedWeekdays;
    const selectedWeekendsProp = props.selectedWeekends;
    const selectedWeekdayCheckboxes = props.selectedWeekdayCheckboxes;
    const selectedWeekendCheckboxes = props.selectedWeekendCheckboxes;

    // states
    const [valueWeekday, setValueWeekday] = useState(selectedWeekdaysProp?.length > 0 ? selectedWeekdaysProp : weekdayValues);
    const [valueWeekend, setValueWeekend] = useState(selectedWeekendsProp?.length > 0 ? selectedWeekendsProp : weekendValues);
    const [weekdayCheckboxes, setWeekdayCheckboxes] = useState<JSX.Element[] | null>(null);
    const [weekendCheckboxes, setWeekendCheckboxes] = useState<JSX.Element[] | null>(null);

    const allWeekdaysChecked = valueWeekday.every((value) => value.checked);
    const allWeekendsChecked = valueWeekend.every((value) => value.checked);
    const indeterminateWeekday = valueWeekday.some((value) => value.checked) && !allWeekdaysChecked;
    const indeterminateWeekend = valueWeekend.some((value) => value.checked) && !allWeekendsChecked;
    const isMobile = useMediaQuery('(max-width: 50em)');

    // setup props
    

    // update states if we have data for the initial values
    useEffect(() => {
        setValueWeekday(selectedWeekdaysProp);
    },[selectedWeekdaysProp]);

    useEffect(() => {
        setValueWeekend(selectedWeekendsProp);
    },[selectedWeekendsProp]);


    // re-render weekday items when data changes
    useEffect(() => {
        getWeekdayItems();
        getWeekendItems();
    },[valueWeekday, valueWeekend]);

    // // re-render weekend items when data changes
    // useEffect(() => {
    //     getWeekendItems();
    // },[valueWeekend])


    // handle when checkbox is changed
    const handleCheckboxChange = (
        index: number,
        isChecked: boolean,
        type: string
    ) => {
        if (type === "weekday") {
            const updatedWeekdayValues = [...valueWeekday];
            updatedWeekdayValues[index].checked = isChecked;
            setValueWeekday(updatedWeekdayValues);
            const checkedValues = updatedWeekdayValues
                .filter((value) => value.checked)
                //.map((value) => value.label);
            selectedWeekdayCheckboxes(updatedWeekdayValues);
        } else {
            const updatedWeekendValues = [...valueWeekend];
            updatedWeekendValues[index].checked = isChecked;
            setValueWeekend(updatedWeekendValues);
            const checkedValues = updatedWeekendValues
                .filter((value) => value.checked)
                //.map((value) => value.label);
            selectedWeekendCheckboxes(updatedWeekendValues);
        }
    };

    // render weekday checkboxes
    function getWeekdayItems() {
        const weekdayItems = valueWeekday.map((value, index) => (
            <Checkbox
                size="xl"
                mt="xs"
                color="lime.4"
                iconColor="dark.8"
                //ml={33}
                label={
                    <Text size="lg" fw={500}>
                        {value.label}
                    </Text>
                }
                key={GenerateUUID()}
                //key={value.key}
                checked={value.checked}
                onChange={(event) => {
                    handleCheckboxChange(index, event.currentTarget.checked, "weekday");
                }}
            />
        ));
        setWeekdayCheckboxes(weekdayItems);
    }

    // render weekend checkboxes
    function getWeekendItems() {
        const weekendItems = valueWeekend.map((value, index) => (
            <Checkbox
                size="xl"
                mt="xs"
                color="lime.4"
                iconColor="dark.8"
                //ml={33}
                label={
                    <Text size="lg" fw={500}>
                        {value.label}
                    </Text>
                }
                key={GenerateUUID()}
                //key={value.key}
                checked={value.checked}
                onChange={(event) => {
                    handleCheckboxChange(index, event.currentTarget.checked, "weekend");
                }}
            />
        ));
        setWeekendCheckboxes(weekendItems);
    }

    return (
        <>
            <Grid>
                <Grid.Col span={{ base: isMobile ? 12 : 3 }} mt="lg">
                    <>
                        <Stack>
                            <Checkbox
                                size="50px"
                                checked={allWeekdaysChecked}
                                indeterminate={indeterminateWeekday}
                                color="lime.4"
                                iconColor="dark.8"
                                label={
                                    <Text size="lg" fw={600}>
                                        Every weekday
                                    </Text>
                                }
                                onChange={(item) => {
                                    const weekdaysChecked = item.target.checked;
                                    const newWeekdayValues = weekdayValues.map((weekday) => {
                                        return {
                                            ...weekday,
                                            checked: weekdaysChecked,
                                        };
                                    });
                                    setValueWeekday(newWeekdayValues);
                                    const checkedValues = newWeekdayValues
                                        .filter((value) => value.checked)
                                        //.map((value) => value.label);
                                    selectedWeekdayCheckboxes(newWeekdayValues);
                                    console.log(checkedValues);
                                }}
                            />
                            <Stack>
                                {weekdayCheckboxes}
                            </Stack>
                            {/* {weekdayItems} */}
                        </Stack>

                    </>
                </Grid.Col>
                <Grid.Col span={{ base: isMobile ? 12 : 3 }} mt="lg">
                    <>
                        <Stack>
                            <Checkbox
                                size="50px"
                                checked={allWeekendsChecked}
                                indeterminate={indeterminateWeekend}
                                color="lime.4"
                                iconColor="dark.8"
                                label={
                                    <Text size="lg" fw={600}>
                                        Every weekend
                                    </Text>
                                }
                                onChange={(item) => {
                                    const weekendsChecked = item.target.checked;
                                    const newWeekendValues = weekendValues.map((weekend) => {
                                        return {
                                            ...weekend,
                                            checked: weekendsChecked,
                                        };
                                    });
                                    setValueWeekend(newWeekendValues);
                                    const checkedValues = newWeekendValues
                                        .filter((value) => value.checked)
                                        //.map((value) => value.label);
                                    selectedWeekendCheckboxes(newWeekendValues);
                                    console.log(checkedValues);
                                }}
                            />
                            <Stack>
                                {weekendCheckboxes}
                            </Stack>
                        </Stack>
                    </>
                </Grid.Col>
            </Grid>
        </>
    );
}
