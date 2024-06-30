import { Avatar, Badge, Button, Grid, Group, Loader, Modal, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { GetUserInfoByUid, getUserById } from '../helpers/Api';
import { useAuth } from '../authentication/SupabaseAuthContext';
import { ProfileHeader } from './ProfileHeader';
import { UserProfileModel } from './UserProfile';
import classes from "../css/UserProfileModal.module.css";
import { TimesheetDataReview, TimesheetReviewInformation } from '../pages/staff-dashboard/timesheet';
import { useMediaQuery } from '@mantine/hooks';
//import { getStatusColor } from '../../../helpers/Helpers';

interface IClockInConfirmModal {
    //modalOpened: boolean;
    //isMobile?: boolean;
    //message: string;
    //timesheetReviewData: TimesheetReviewInformation | undefined;
    //closeModal: () => void;
    clockInClicked: (value: boolean) => void;
}

export default function ClockInConfirmModal({ clockInClicked }: IClockInConfirmModal) {
    return new Promise((resolve, reject) => {
        const isOpen = true;

        function handleClockInClick() {
            clockInClicked(true);
            resolve(true); // Resolve the Promise when clock in is confirmed
        }

        function handleCancelClick() {
            clockInClicked(false);
            resolve(false); // Resolve the Promise when cancellation is confirmed
        }

        return (
            <Modal
                title={<Text c="#dcdcdc" size="30px" style={{ fontFamily: "AK-Medium", letterSpacing: "1px" }}>Confirm your action</Text>}
                opened={isOpen}
                onClose={() => {
                    reject(new Error('Modal closed without action')); // Reject the Promise if the modal is closed without an action
                }}
                size="lg"
                radius="md"
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <Grid c="#dcdcdc">
                    <Grid.Col span={{ base: 12 }}>
                        <Text
                            size="lg"
                            fw={600}
                            style={{ fontFamily: "AK-Regular", letterSpacing: "1px" }}
                        >
                            {/* Your messageProp can be inserted here */}
                        </Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Button 
                            size="lg" 
                            radius="md" 
                            color="#316F22"
                            fullWidth
                            onClick={handleClockInClick} 
                        >
                            Clock in
                        </Button>
                    </Grid.Col>
                    <Grid.Col span={{ base: 6 }} mt="lg">
                        <Group justify="end">
                            <Button
                                size="lg"
                                radius="md"
                                color="#6C221F"
                                fullWidth
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </Button>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Modal>
        );
    });
}