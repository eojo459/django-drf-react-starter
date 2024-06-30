import { Button, Modal, Stack, TextInput, Textarea, Title } from "@mantine/core";
import { useState } from "react";

interface ChangeReasonModal {
    modalOpened: boolean;
    isMobile: boolean;
    closeModal: () => void;
    submitClicked: (submitFlag: boolean) => void;
    handleReasonChange: (reason: string) => void;
}

export default function ChangeReasonModal(props: ChangeReasonModal) {
    const [reasonValue, setReasonValue] = useState('');

    // setup props
    const modalOpenedProp = props.modalOpened;
    const isMobileProp = props.isMobile;
    const closeModalProp = props.closeModal;
    const submitClickedProp = props.submitClicked;
    const handleReasonChangeProp = props.handleReasonChange;

    // send data back to parent when submit button is clicked
    function handleSubmit() {
        submitClickedProp(true);
        handleReasonChangeProp(reasonValue);
    }

    return (
        <>
            <Modal
                title={<Title order={3}>Please add a reason</Title>}
                opened={modalOpenedProp}
                onClose={closeModalProp}
                fullScreen={isMobileProp}
                size="lg"
                radius="md"
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Stack>
                    {/* <Title order={3}>Enter your reason</Title> */}
                    <Textarea
                        value={reasonValue}
                        onChange={(event) => setReasonValue(event.currentTarget.value)}
                        placeholder="Briefly explain your reason here for making these changes"
                        autosize
                        minRows={5}
                        maxRows={5}
                    />
                    <Button 
                        fullWidth 
                        size="md" 
                        radius="md" 
                        color="green"
                        onClick={handleSubmit}
                    >
                        Save changes
                    </Button>
                </Stack>
            </Modal>
        </>
    );
}