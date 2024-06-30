import React, { useState, useEffect, ChangeEvent } from 'react';
import { SettingsTabs } from '../../../../components/SettingsTabs';
import { Group, Tabs, Text, Title } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

export function SettingsPage() {

    return (
        <>
            <Group gap="xs" justify="center">
                <IconSettings size={32}/>
                <Title order={1} style={{marginTop: "20px", marginBottom: "20px"}}>
                    Settings
                </Title>
            </Group>
            <SettingsTabs/>
        </>
    );
}