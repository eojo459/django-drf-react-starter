import { useState } from 'react';
import { Tabs, Text } from '@mantine/core';
import { SettingsPersonal } from '../pages/owner-dashboard/business/settings/components/settings-personal';
import classes from '../css/Settings.module.scss';
import { SettingsManagement } from '../pages/owner-dashboard/business/settings/components/settings-management';

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<string | null>('first');

  return (
    <>
        <Tabs 
            value={activeTab} 
            onChange={setActiveTab} 
            style={{marginLeft:"25px", marginRight: "25px"}}
            variant="outline"
            radius="md"
            classNames={classes}
        >
            <Tabs.List justify="center">
                <Tabs.Tab value="first">Personal</Tabs.Tab>
                <Tabs.Tab value="second">Business manager</Tabs.Tab> {/* TODO: only show if user is owner */} 
                <Tabs.Tab value="third">Subscription</Tabs.Tab> {/* TODO: only show if user is owner */} 
            </Tabs.List>

            <Tabs.Panel value="first">
                <SettingsPersonal/>
            </Tabs.Panel>
            <Tabs.Panel value="second">
                <SettingsManagement/>
            </Tabs.Panel>
            <Tabs.Panel value="third">Subscription panel</Tabs.Panel>
        </Tabs>
    </>
  );
}