import { Button, Paper, Space, Stack, Text, Grid } from "@mantine/core";
import { useNavigate } from "react-router-dom";

interface IInfoCard {
    color?: string;
    backgroundColor?: string;
    button: boolean;
    title: any;
    description: any;
    subHeading?: any;
    buttonText?: any;
    buttonColor?: string;
    buttonOnClick?: any;
    buttonOnClickNavigate?: any;
}
export default function InfoCard(props: IInfoCard) {

    const navigate = useNavigate();
    
    // props
    const colorProp = props.color;
    const backgroundColorProp = props.backgroundColor;
    const titleProp = props.title;
    const descriptionProp = props.description;
    const subHeadingProp = props.subHeading;
    const buttonTextProp = props.buttonText;
    const buttonProp = props.button;
    const buttonColorProp = props.buttonColor;
    const buttonOnClickProp = props.buttonOnClick;
    const buttonOnClickNavigateProp = props.buttonOnClickNavigate;

    return (
        <>
            <Paper shadow="md" p="lg" radius="lg" mih={250} style={{ background: backgroundColorProp, color: colorProp }}>
                <Grid>
                    {/* title */}
                    <Grid.Col span={{ base: 12 }} mb="md">
                        <Text 
                            size="25px" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {titleProp}
                        </Text>
                    </Grid.Col>

                    {/* description */}
                    <Grid.Col span={{ base: 12 }} mb="md">
                        <Text 
                            size="25px" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                        >
                            {descriptionProp}
                        </Text>
                    </Grid.Col>

                    {/* sub heading */}
                    {subHeadingProp && (
                        <Grid.Col span={{ base: 12 }} mb="md">
                            <Text
                                size="16px"
                                fw={500}
                                style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}
                            >
                                {subHeadingProp}
                            </Text>
                        </Grid.Col>
                    )}
                    
                    {/* button w/ onclick navigate */}
                    {buttonProp && buttonTextProp?.length > 0 && buttonOnClickNavigateProp && (
                        <Grid.Col span={{ base: 12 }}>
                            <Button
                                size="lg"
                                radius="md"
                                color={buttonColorProp}
                                fullWidth
                                onClick={() => navigate(buttonOnClickNavigateProp)}
                            >
                                {buttonTextProp}
                            </Button>
                        </Grid.Col>
                    )}

                    {/* button w/ onclick */}
                    {buttonProp && buttonTextProp?.length > 0 && buttonOnClickProp && (
                        <Grid.Col span={{ base: 12 }}>
                            <Button
                                size="lg"
                                radius="md"
                                color={buttonColorProp}
                                fullWidth
                                onClick={buttonOnClickProp}
                            >
                                {buttonTextProp}
                            </Button>
                        </Grid.Col>
                    )}

                    {/* button no onclick */}
                    {buttonProp && buttonTextProp?.length > 0 && !buttonOnClickNavigateProp && !buttonOnClickProp && (
                        <Grid.Col span={{ base: 12 }}>
                            <Button
                                size="lg"
                                radius="md"
                                color={buttonColorProp}
                                fullWidth
                            >
                                {buttonTextProp}
                            </Button>
                        </Grid.Col>
                    )}
                </Grid>
            </Paper>
        </>
    );
}