import { Grid, Paper, Select, Space, Table, TextInput, Text, Switch, useMantineTheme, rem, Group, Stack, Divider, Title, ScrollArea, Button, ActionIcon, NumberInput, Accordion, Badge } from "@mantine/core";
import DayCheckboxes from "../DayCheckboxes";
import { IndustryData, countryData, employeeCountData, canadaProvinceData, staffBaseTypeData, timezoneData } from "../../helpers/SelectData";
import classes from '../../css/TextInput.module.css';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { TimeInputSelectBase } from "../TimeInputSelectBase";
import { IconCheck, IconDots, IconX } from "@tabler/icons-react";
import { randomId, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import { UseFormReturnType, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import notiicationClasses from "../../css/Notifications.module.css";
import { GenerateUUID } from "../../helpers/Helpers";
import DeleteLabelConfirmModal from "../DeleteLabelConfirmModal";
import { useAuth } from "../../authentication/SupabaseAuthContext";
import { DeleteEmploymentPositions } from "../../helpers/Api";
import { PositionRoles } from "../../pages/owner-dashboard/business/Business-Management";

interface BusinessStaffCustomizationForm {
    employmentPositionData: PositionRoles[];
    handleFormChanges: (form: any) => void; // send back form data to parent
}

interface RoleLabel {
    uid: string;
    label: string;
    employment_type: string;
    business_id: number;
}

const initialState: any = [
    {
        coowner_labels: [],
        manager_labels: [],
        fulltime_labels: [],
        parttime_labels: [],
        term_labels: [],
        contractor_labels: [],
        freelancer_labels: [],
        student_labels: [],
        max_labels: 0,
    },
    // Add more objects here if needed
];


export default function BusinessStaffCustomizationForm(props: BusinessStaffCustomizationForm) {
    const { user, business, session } = useAuth();
    const [selectedWeekdays, setSelectedWeekdays] = useState<string>('');
    const theme = useMantineTheme();
    const [openedItem, setOpenedItem] = useState<string | null>('');
    const [holidayDateValue, setHolidayDateValue] = useState<Date | null>(null);
    const [labelName, setLabelName] = useState('');
    const [selectedRoleType, setSelectedRoleType] = useState<string | null>('');
    //const [holidayDateValue, setHolidayDateValue] = useState('');
    const [coownerRoleLabels, setCoownerRoleLabels] = useState<any[]>([]);
    const [managerRoleLabels, setManagerRoleLabels] = useState<any[]>([]);
    const [fulltimeRoleLabels, setFulltimeRoleLabels] = useState<any[]>([]);
    const [parttimeRoleLabels, setParttimeRoleLabels] = useState<any[]>([]);
    const [termRoleLabels, setTermRoleLabels] = useState<any[]>([]);
    const [contractorRoleLabels, setContractorRoleLabels] = useState<any[]>([]);
    const [freelancerRoleLabels, setFreelancerRoleLabels] = useState<any[]>([]);
    const [studentRoleLabels, setStudentRoleLabels] = useState<any[]>([]);
    const [coownerLabelRows, setCoownerLabelRows] = useState<JSX.Element[]>([]);
    const [managerLabelRows, setManagerLabelRows] = useState<JSX.Element[]>([]);
    const [fulltimeLabelRows, setFulltimeLabelRows] = useState<JSX.Element[]>([]);
    const [partTimeLabelRows, setParttimeLabelRows] = useState<JSX.Element[]>([]);
    const [termLabelRows, setTermLabelRows] = useState<JSX.Element[]>([]);
    const [contractorLabelRows, setContractorLabelRows] = useState<JSX.Element[]>([]);
    const [freelancerLabelRows, setFreelancerLabelRows] = useState<JSX.Element[]>([]);
    const [studentLabelRows, setStudentLabelRows] = useState<JSX.Element[]>([]);
    const [positionRoles, setPositionRoles] = useState<PositionRoles | null>(initialState);
    const [maxLabels, setMaxLabels] = useState(0);
    const isMobile = useMediaQuery('(max-width: 50em)');
    const [deleteLabelModalOpened, { open: openDeleteLabelModal, close: closeDeleteLabelModal }] = useDisclosure(false);
    const [selectedRoleIdToDelete, setSelectedRoleIdToDelete] = useState(''); // id of the role we want to delete if we click delete in the modal
    const [selectedRoleToDelete, setSelectedRoleToDelete] = useState({});
    

    //setup props
    const handleFormChangesProp = props.handleFormChanges;
    const employmentPositionDataProp = props.employmentPositionData;

    // form fields for mantine components
    const form = useForm({
        initialValues: {
            coowner_labels: employmentPositionDataProp[0]?.coowner_labels ?? [],
            manager_labels: employmentPositionDataProp[0]?.manager_labels ?? [],
            fulltime_labels: employmentPositionDataProp[0]?.fulltime_labels ?? [],
            parttime_labels: employmentPositionDataProp[0]?.parttime_labels ?? [],
            term_labels: employmentPositionDataProp[0]?.term_labels ?? [],
            contractor_labels: employmentPositionDataProp[0]?.contractor_labels ?? [],
            freelancer_labels: employmentPositionDataProp[0]?.freelancer_labels ?? [],
            student_labels: employmentPositionDataProp[0]?.student_labels ?? [],
            max_labels: employmentPositionDataProp[0]?.max_labels ?? [],
            section: 'business_employment_positions',
        },
        onValuesChange: (values) => {
            var formattedData = {
                'coowner_labels': values.coowner_labels,
                'manager_labels': values.manager_labels,
                'fulltime_labels': values.fulltime_labels,
                'parttime_labels': values.parttime_labels,
                'term_labels': values.term_labels,
                'contractor_labels': values.contractor_labels,
                'freelancer_labels': values.freelancer_labels,
                'student_labels': values.student_labels,
                'max_labels': values.max_labels,
                'section': 'business_employment_positions',
            }
            handleFormChangesProp(formattedData);
        },
    });

    // handle label changes
    // update co owner labels on change
    useEffect(() => {
        console.log(coownerRoleLabels);
        setCoownerLabelRows(updateCoownerTableRows());
        if (coownerRoleLabels[0]?.length > 0) {
            var coownerRoleLabelsList: any[] = [];
            coownerRoleLabels[0].forEach((role: { id: string; business_id:string; label: string; employment_type: string; }) => {
                var data = {
                    'id': role?.id,
                    'business_id': role?.business_id,
                    'label': role?.label,
                    'employment_type': role?.employment_type,
                }
                coownerRoleLabelsList.push(data);
            });
            form.setFieldValue('coowner_labels', coownerRoleLabelsList);
            handleFormChangesProp(form);
        }
    }, [coownerRoleLabels]);

    // update manager labels on change
    useEffect(() => {
        setManagerLabelRows(updateManagerTableRows());
        if (managerRoleLabels[0]?.length > 0) {
            var managerRoleLabelsList: any[] = [];
            managerRoleLabels[0].forEach((role: { id: string; business_id:string; label: string; employment_type: string; }) => {
                var data = {
                    'id': role?.id,
                    'business_id': role?.business_id,
                    'label': role?.label,
                    'employment_type': role?.employment_type,
                }
                managerRoleLabelsList.push(data);
            });
            form.setFieldValue('manager_labels', managerRoleLabelsList);
            handleFormChangesProp(form);
        }
    }, [managerRoleLabels]);

    // update full-time labels on change
    useEffect(() => {
        setFulltimeLabelRows(updateFulltimeTableRows());
        if (fulltimeRoleLabels[0]?.length > 0) {
            var fulltimeRoleLabelsList: any[] = [];
            fulltimeRoleLabels[0].forEach((role: { id: string; business_id:string; label: string; employment_type: string; }) => {
                var data = {
                    'id': role?.id,
                    'business_id': role?.business_id,
                    'label': role?.label,
                    'employment_type': role?.employment_type,
                }
                fulltimeRoleLabelsList.push(data);
            });
            form.setFieldValue('fulltime_labels', fulltimeRoleLabelsList);
            handleFormChangesProp(form);
        }
    }, [fulltimeRoleLabels]);

    // update part-time labels on change
    useEffect(() => {
        setParttimeLabelRows(updateParttimeTableRows());
        if (parttimeRoleLabels[0]?.length > 0) {
            var parttimeRoleLabelsList: any[] = [];
            parttimeRoleLabels[0].forEach((role: { id: string; business_id:string; label: string; employment_type: string; }) => {
                var data = {
                    'id': role?.id,
                    'business_id': role?.business_id,
                    'label': role?.label,
                    'employment_type': role?.employment_type,
                }
                parttimeRoleLabelsList.push(data);
            });
            form.setFieldValue('parttime_labels', parttimeRoleLabelsList);
            handleFormChangesProp(form);
        }
    }, [parttimeRoleLabels]);

    // update term labels on change
    useEffect(() => {
        setTermLabelRows(updateTermTableRows());
        if (termRoleLabels[0]?.length > 0) {
            var termRoleLabelsList: any[] = [];
            termRoleLabels[0].forEach((role: { id: string; business_id:string; label: string; employment_type: string; }) => {
                var data = {
                    'id': role?.id,
                    'business_id': role?.business_id,
                    'label': role?.label,
                    'employment_type': role?.employment_type,
                }
                termRoleLabelsList.push(data);
            });
            form.setFieldValue('term_labels', termRoleLabelsList);
            handleFormChangesProp(form);
        }
    }, [termRoleLabels]);

    // update contractor labels on change
    useEffect(() => {
        setContractorLabelRows(updateContractorTableRows());
        if (contractorRoleLabels[0]?.length > 0) {
            var contractorRoleLabelsList: any[] = [];
            contractorRoleLabels[0].forEach((role: { id: string; business_id:string; label: string; employment_type: string; }) => {
                var data = {
                    'id': role?.id,
                    'business_id': role?.business_id,
                    'label': role?.label,
                    'employment_type': role?.employment_type,
                }
                contractorRoleLabelsList.push(data);
            });
            form.setFieldValue('contractor_labels', contractorRoleLabelsList);
            handleFormChangesProp(form);
        }
    }, [contractorRoleLabels]);

    // update freelancer labels on change
    useEffect(() => {
        setFreelancerLabelRows(updateFreelancerTableRows());
        if (freelancerRoleLabels[0]?.length > 0) {
            var freelancerRoleLabelsList: any[] = [];
            freelancerRoleLabels[0].forEach((role: { id: string; business_id:string; label: string; employment_type: string; }) => {
                var data = {
                    'id': role?.id,
                    'business_id': role?.business_id,
                    'label': role?.label,
                    'employment_type': role?.employment_type,
                }
                freelancerRoleLabelsList.push(data);
            });
            form.setFieldValue('freelancer_labels', freelancerRoleLabelsList);
            handleFormChangesProp(form);
        }
    }, [freelancerRoleLabels]);

    // update student labels on change
    useEffect(() => {
        setStudentLabelRows(updateStudentTableRows());
        if (studentRoleLabels[0]?.length > 0) {
            var studentRoleLabelsList: any[] = [];
            studentRoleLabels[0].forEach((role: { id: string; business_id:string; label: string; employment_type: string; }) => {
                var data = {
                    'id': role?.id,
                    'business_id': role?.business_id,
                    'label': role?.label,
                    'employment_type': role?.employment_type,
                }
                studentRoleLabelsList.push(data);
            });
            form.setFieldValue('student_labels', studentRoleLabelsList);
            handleFormChangesProp(form);
        }
    }, [studentRoleLabels]);

    // useEffect(() => {
    //     console.log(labelName);
    // }, [labelName]);

    // useEffect(() => {
    //     console.log(holidayDateValue);
    // }, [holidayDateValue]);

    useEffect(() => {
        //console.log(selectedRoleType);
        if (selectedRoleType != null && selectedRoleType != '') {
            setOpenedItem(selectedRoleType);
        }
    }, [selectedRoleType]);

    // set the position label values when the data changes
    useEffect(() => {
        if (employmentPositionDataProp.length > 0) {
            //console.log("employmentPositionDataProp:", employmentPositionDataProp);
            //setPositionRoles(employmentPositionDataProp[0]);
            setMaxLabels(employmentPositionDataProp[0]?.max_labels);
            setCoownerRoleLabels([...coownerRoleLabels, employmentPositionDataProp[0]?.coowner_labels]);
            setManagerRoleLabels([...managerRoleLabels, employmentPositionDataProp[0]?.manager_labels]);
            setFulltimeRoleLabels([...fulltimeRoleLabels, employmentPositionDataProp[0]?.fulltime_labels]);
            setParttimeRoleLabels([...parttimeRoleLabels, employmentPositionDataProp[0]?.parttime_labels]);
            setTermRoleLabels([...termRoleLabels, employmentPositionDataProp[0]?.term_labels]);
            setContractorRoleLabels([...contractorRoleLabels, employmentPositionDataProp[0]?.contractor_labels]);
            setFreelancerRoleLabels([...freelancerRoleLabels, employmentPositionDataProp[0]?.freelancer_labels]);
            setStudentRoleLabels([...studentRoleLabels, employmentPositionDataProp[0]?.student_labels]);
        }
    },[employmentPositionDataProp])

    function handleFormChanges(form: string) {
        setSelectedWeekdays(form);
        //handleFormChangesProp(form);
        //console.log(selected);   
    }

    function setupForm() {
        var formattedData = {
            'values': {
                'employment_positions': {
                    'coowner_labels': form.setFieldValue('coowner_labels', coownerRoleLabels),
                    'manager_labels': form.setFieldValue('manager_labels', managerRoleLabels),
                    'fulltime_labels': form.setFieldValue('fulltime_labels', fulltimeRoleLabels),
                    'parttime_labels': form.setFieldValue('parttime_labels', parttimeRoleLabels),
                    'term_labels': form.setFieldValue('term_labels', termRoleLabels),
                    'contractor_labels': form.setFieldValue('contractor_labels', contractorRoleLabels),
                    'freelancer_labels': form.setFieldValue('freelancer_labels', freelancerRoleLabels),
                    'student_labels': form.setFieldValue('student_labels', studentRoleLabels),
                    'max_labels': form.setFieldValue('max_labels', maxLabels),
                },
                'section': 'business_employment_positions',
            }
        }
        return formattedData;
    }

    function handleAccordionChange(value: string | null) {
        if (value != null) {
            setOpenedItem(value);
            setSelectedRoleType(value);
        }
    }

    // add custom labels to the list
    const handleAddRole = (type: string) => {
        // Check if both name and date are provided
        const id = notifications.show({
            loading: true,
            title: 'Attemping to add new role',
            message: 'Please wait.',
            autoClose: false,
            withCloseButton: false,
            classNames: notiicationClasses,
        });
        if (labelName.trim() === '' || selectedRoleType == null) {
            // Handle error, e.g., show a message to the user
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: 'There was an error adding the role. Please fill in all fields.',
                    icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 2000,
                    classNames: notiicationClasses,
                });
            }, 500);
            return;
        }

        // Create a new custom role object
        const newCustomLabel = {
            id: '-1',
            label: labelName,
            employment_type: selectedRoleType,
        };

        // Update the labels list for each role
        var maxLabelsReached = false;
        switch (type.toLocaleLowerCase()) {
            case 'co-owner':
                console.log(coownerRoleLabels[0]?.length);
                if (coownerRoleLabels.length === 0 || coownerRoleLabels[0]?.length < maxLabels) {
                    setCoownerRoleLabels(prevLabels => { 
                        if (!Array.isArray(prevLabels[0])) {
                            return [[newCustomLabel]]; // If it's not an array, initialize it with the new label
                        } else {
                            return [[...prevLabels[0], newCustomLabel]]; // Otherwise, append the new label
                        }
                    });
                }
                else {
                    maxLabelsReached = true;
                }
                break;
            case 'manager':
                if (managerRoleLabels.length === 0 || managerRoleLabels[0]?.length < maxLabels) {
                    setManagerRoleLabels(prevLabels => { 
                        if (!Array.isArray(prevLabels[0])) {
                            return [[newCustomLabel]]; 
                        } else {
                            return [[...prevLabels[0], newCustomLabel]];
                        }
                    });
                }
                else {
                    maxLabelsReached = true;
                }
                break;
            case 'full-time':
                if (fulltimeRoleLabels.length === 0 || fulltimeRoleLabels[0]?.length < maxLabels) {
                    setFulltimeRoleLabels(prevLabels => { 
                        if (!Array.isArray(prevLabels[0])) {
                            return [[newCustomLabel]]; 
                        } else {
                            return [[...prevLabels[0], newCustomLabel]];
                        }
                    });
                }
                else {
                    maxLabelsReached = true;
                }
                break;
            case 'part-time':
                if (parttimeRoleLabels.length === 0 || parttimeRoleLabels[0]?.length < maxLabels) {
                    setParttimeRoleLabels(prevLabels => { 
                        if (!Array.isArray(prevLabels[0])) {
                            return [[newCustomLabel]]; 
                        } else {
                            return [[...prevLabels[0], newCustomLabel]];
                        }
                    });
                }
                else {
                    maxLabelsReached = true;
                }
                break;
            case 'term':
                if (termRoleLabels.length === 0 || termRoleLabels[0]?.length < maxLabels) {
                    setTermRoleLabels(prevLabels => { 
                        if (!Array.isArray(prevLabels[0])) {
                            return [[newCustomLabel]]; 
                        } else {
                            return [[...prevLabels[0], newCustomLabel]];
                        }
                    });
                }
                else {
                    maxLabelsReached = true;
                }
                break;
            case 'contractor':
                if (contractorRoleLabels.length === 0 || contractorRoleLabels[0]?.length < maxLabels) {
                    setContractorRoleLabels(prevLabels => { 
                        if (!Array.isArray(prevLabels[0])) {
                            return [[newCustomLabel]]; 
                        } else {
                            return [[...prevLabels[0], newCustomLabel]];
                        }
                    });
                }
                else {
                    maxLabelsReached = true;
                }
                break;
            case 'freelancer':
                if (freelancerRoleLabels.length === 0 || freelancerRoleLabels[0]?.length < maxLabels) {
                    setFreelancerRoleLabels(prevLabels => { 
                        if (!Array.isArray(prevLabels[0])) {
                            return [[newCustomLabel]]; 
                        } else {
                            return [[...prevLabels[0], newCustomLabel]];
                        }
                    });
                }
                else {
                    maxLabelsReached = true;
                }
                break;
            case 'student':
                if (studentRoleLabels.length === 0 || studentRoleLabels[0]?.length < maxLabels) {
                    setStudentRoleLabels(prevLabels => { 
                        if (!Array.isArray(prevLabels[0])) {
                            return [[newCustomLabel]]; 
                        } else {
                            return [[...prevLabels[0], newCustomLabel]];
                        }
                    });
                }
                else {
                    maxLabelsReached = true;
                }
                break;
        }


        // check max labels
        if (maxLabelsReached) {
            setTimeout(() => {
                notifications.update({
                    id,
                    color: 'red',
                    title: 'Error',
                    message: <p style={{ marginTop: "-3px"}}>Too many labels. Current plan max is {maxLabels}. <br/>Remove labels or upgrade your plan.</p>,
                    icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                    loading: false,
                    autoClose: 2000,
                    classNames: notiicationClasses,
                });
            }, 500);
            return;
        }

        // clear input values
        setLabelName('');
        setHolidayDateValue(null);
        setTimeout(() => {
            notifications.update({
                id,
                color: 'teal',
                title: 'Success',
                message: 'Postion label was added.',
                icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                loading: false,
                autoClose: 1000,
                classNames: notiicationClasses,
            });
        }, 500);
    };

    // remove labels from list
    const handleRemoveLabel = (labelToRemove: any) => {
        // Filter out the label to remove
        let updatedLabels;
        var type = labelToRemove?.employment_type;
        switch (type.toLocaleLowerCase()) {
            case 'co-owner':
                if (labelToRemove?.id != "-1") {
                    updatedLabels = coownerRoleLabels[0].filter((label: { id: string; }) => label.id !== labelToRemove.id);
                }
                else {
                    updatedLabels = coownerRoleLabels[0].filter((label: { label: string; }) => label.label !== labelToRemove.label);
                }
                setCoownerRoleLabels([updatedLabels]);
                break;
            case 'manager':
                if (labelToRemove?.id != "-1") {
                    updatedLabels = managerRoleLabels[0].filter((label: { id: string; }) => label.id !== labelToRemove.id);
                }
                else {
                    updatedLabels = managerRoleLabels[0].filter((label: { label: string; }) => label.label !== labelToRemove.label);
                }
                setManagerRoleLabels([updatedLabels]);
                break;
            case 'full-time':
                if (labelToRemove?.id != "-1") {
                    updatedLabels = fulltimeRoleLabels[0].filter((label: { id: string; }) => label.id !== labelToRemove.id);
                }
                else {
                    updatedLabels = fulltimeRoleLabels[0].filter((label: { label: string; }) => label.label !== labelToRemove.label);
                }
                setFulltimeRoleLabels([updatedLabels]);
                break;
            case 'part-time':
                if (labelToRemove?.id != "-1") {
                    updatedLabels = parttimeRoleLabels[0].filter((label: { id: string; }) => label.id !== labelToRemove.id);
                }
                else {
                    updatedLabels = parttimeRoleLabels[0].filter((label: { label: string; }) => label.label !== labelToRemove.label);
                }
                setParttimeRoleLabels([updatedLabels]);
                break;
            case 'term':
                if (labelToRemove?.id != "-1") {
                    updatedLabels = termRoleLabels[0].filter((label: { id: string; }) => label.id !== labelToRemove.id);
                }
                else {
                    updatedLabels = termRoleLabels[0].filter((label: { label: string; }) => label.label !== labelToRemove.label);
                }
                setTermRoleLabels([updatedLabels]);
                break;
            case 'contractor':
                if (labelToRemove?.id != "-1") {
                    updatedLabels = contractorRoleLabels[0].filter((label: { id: string; }) => label.id !== labelToRemove.id);
                }
                else {
                    updatedLabels = contractorRoleLabels[0].filter((label: { label: string; }) => label.label !== labelToRemove.label);
                }
                setContractorRoleLabels([updatedLabels]);
                break;
            case 'freelancer':
                if (labelToRemove?.id != "-1") {
                    updatedLabels = freelancerRoleLabels[0].filter((label: { id: string; }) => label.id !== labelToRemove.id);
                }
                else {
                    updatedLabels = freelancerRoleLabels[0].filter((label: { label: string; }) => label.label !== labelToRemove.label);
                }
                setFreelancerRoleLabels([updatedLabels]);
                break;
            case 'student':
                if (labelToRemove?.id != "-1") {
                    updatedLabels = studentRoleLabels[0].filter((label: { id: string; }) => label.id !== labelToRemove.id);
                }
                else {
                    updatedLabels = studentRoleLabels[0].filter((label: { label: string; }) => label.label !== labelToRemove.label);
                }
                setStudentRoleLabels([updatedLabels]);
                break;
        }
    };

    // api call to DELETE the position by id
    async function handleDeleteLabel(positionId: string) {
        if (user && business) {
            // show notification
            const id = notifications.show({
                loading: true,
                title: 'Connecting to the server',
                message: 'Please wait.',
                autoClose: false,
                withCloseButton: false,
                classNames: notiicationClasses,
            });
            var response = await DeleteEmploymentPositions(business?.id, positionId, session?.access_token);
            if (response == 200) {
                // show success
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'teal',
                        title: 'Success',
                        message: 'Position label was deleted.',
                        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1000,
                        classNames: notiicationClasses,
                    });
                }, 250);

                // reset states
                setSelectedRoleIdToDelete(''); 
                setSelectedRoleToDelete({});
            }
            else {
                // show error
                setTimeout(() => {
                    notifications.update({
                        id,
                        color: 'red',
                        title: 'Error',
                        message: 'There was an error deleting the position label. Please try again.',
                        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
                        loading: false,
                        autoClose: 1500,
                        classNames: notiicationClasses,
                    });
                }, 250);
            }
        }
    }

    function handleActionIconXClick(role: any) {
        // save the id of the position we want to delete
        if (role?.id != "-1") {
            setSelectedRoleIdToDelete(role?.id);
            setSelectedRoleToDelete(role);
            openDeleteLabelModal();
        }
        else {
            handleRemoveLabel(role);
        }
    }

    function handleModalDeleteLabelClick() {
        // if we selected an actual label to delete and not a default one
        if (selectedRoleIdToDelete != "-1") {
            handleDeleteLabel(selectedRoleIdToDelete);
            handleRemoveLabel(selectedRoleToDelete);
        }
    }

    // update rows when labels change
    const updateCoownerTableRows = () => {
        return coownerRoleLabels[0]?.map((role: { id: string; label: string; employment_type: string; }) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td>
                    <Badge 
                        size="15px" 
                        radius="md" 
                        color="rgba(61,91,79,0.3)" 
                        p="lg" 
                        pb="lg"
                    >
                        <Text 
                            size="sm" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}
                        >
                            {role?.label}
                        </Text>
                    </Badge>
                </Table.Td>
                <Table.Td><Text size="lg">{role?.employment_type}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(role)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };

    const updateManagerTableRows = () => {
        return managerRoleLabels[0]?.map((role: { id: string; label: string; employment_type: string }) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td>
                    <Badge 
                        size="15px" 
                        radius="md" 
                        color="rgba(61,91,79,0.3)" 
                        p="lg" 
                        pb="lg"
                    >
                        <Text 
                            size="sm" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}
                        >
                            {role?.label}
                        </Text>
                    </Badge>
                </Table.Td>
                <Table.Td><Text size="lg">{role?.employment_type}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(role)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };

    const updateFulltimeTableRows = () => {
        return fulltimeRoleLabels[0]?.map((role: { id: string; label: string; employment_type: string }) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td>
                    <Badge 
                        size="15px" 
                        radius="md" 
                        color="rgba(61,91,79,0.3)" 
                        p="lg" 
                        pb="lg"
                    >
                        <Text 
                            size="sm" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}
                        >
                            {role?.label}
                        </Text>
                    </Badge>
                </Table.Td>
                <Table.Td><Text size="lg">{role?.employment_type}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(role)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };

    const updateParttimeTableRows = () => {
        return parttimeRoleLabels[0]?.map((role: { id: string; label: string; employment_type: string }) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td>
                    <Badge 
                        size="15px" 
                        radius="md" 
                        color="rgba(61,91,79,0.3)" 
                        p="lg" 
                        pb="lg"
                    >
                        <Text 
                            size="sm" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}
                        >
                            {role?.label}
                        </Text>
                    </Badge>
                </Table.Td>
                <Table.Td><Text size="lg">{role?.employment_type}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(role)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };


    const updateTermTableRows = () => {
        return termRoleLabels[0]?.map((role: { id: string; label: string; employment_type: string }) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td>
                    <Badge 
                        size="15px" 
                        radius="md" 
                        color="rgba(61,91,79,0.3)" 
                        p="lg" 
                        pb="lg"
                    >
                        <Text 
                            size="sm" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}
                        >
                            {role?.label}
                        </Text>
                    </Badge>
                </Table.Td>
                <Table.Td><Text size="lg">{role?.employment_type}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(role)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };

    const updateContractorTableRows = () => {
        return contractorRoleLabels[0]?.map((role: { id: string; label: string; employment_type: string }) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td>
                    <Badge 
                        size="15px" 
                        radius="md" 
                        color="rgba(61,91,79,0.3)" 
                        p="lg" 
                        pb="lg"
                    >
                        <Text 
                            size="sm" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}
                        >
                            {role?.label}
                        </Text>
                    </Badge>
                </Table.Td>
                <Table.Td><Text size="lg">{role?.employment_type}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(role)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };

    const updateFreelancerTableRows = () => {
        return freelancerRoleLabels[0]?.map((role: { id: string; label: string; employment_type: string }) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td>
                    <Badge 
                        size="15px" 
                        radius="md" 
                        color="rgba(61,91,79,0.3)" 
                        p="lg" 
                        pb="lg"
                    >
                        <Text 
                            size="sm" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}
                        >
                            {role?.label}
                        </Text>
                    </Badge>
                </Table.Td>
                <Table.Td><Text size="lg">{role?.employment_type}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(role)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };

    const updateStudentTableRows = () => {
        return studentRoleLabels[0]?.map((role: { id: string; label: string; employment_type: string }) => (
            <Table.Tr key={GenerateUUID()}>
                <Table.Td>
                    <Badge 
                        size="15px" 
                        radius="md" 
                        color="rgba(61,91,79,0.3)" 
                        p="lg" 
                        pb="lg"
                    >
                        <Text 
                            size="sm" 
                            fw={600} 
                            style={{ fontFamily: "AK-Medium", letterSpacing: "1px", color: "#dcdcdc" }}
                        >
                            {role?.label}
                        </Text>
                    </Badge>
                </Table.Td>
                <Table.Td><Text size="lg">{role?.employment_type}</Text></Table.Td>
                <Table.Td>
                    <ActionIcon variant="subtle" color="gray">
                        <IconX onClick={() => handleActionIconXClick(role)} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        ));
    };

    const AccordionLabels = (
        <>
            {/* co-owner labels */}
            <Accordion.Item key={randomId()} value="Co-owner" style={{ background:"transparent", border: "transparent" }} classNames={classes}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#1a2521", color: "#dcdcdc" }}>
                    <Accordion.Control c="#dcdcdc" style={{ background: "#1a2521" }}>
                        <Text size="xl" fw={700}>Co-Owner labels</Text>
                    </Accordion.Control>
                </Paper>
                <Accordion.Panel c="#dcdcdc" style={{ background: "#1a2521", borderRadius: "15px" }} mt="sm">
                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th><Text size="lg" fw={700}>Label name</Text></Table.Th>
                                    <Table.Th><Text size="lg" fw={700}>Employment type</Text></Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {coownerLabelRows}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Accordion.Panel>
            </Accordion.Item>

            {/* manager labels */}
            <Accordion.Item key={randomId()} value="Manager" style={{ background:"transparent", border: "transparent" }}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#1a2521", color: "white" }}>
                    <Accordion.Control c="#dcdcdc" style={{ background: "#1a2521" }}>
                        <Text size="xl" fw={700}>Manager labels</Text>
                    </Accordion.Control>
                </Paper>
                <Accordion.Panel c="#dcdcdc" style={{ background: "#1a2521", borderRadius: "15px" }} mt="sm">
                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th><Text size="lg" fw={700}>Label name</Text></Table.Th>
                                    <Table.Th><Text size="lg" fw={700}>Employment type</Text></Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {managerLabelRows}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Accordion.Panel>
            </Accordion.Item>

            {/* full-time labels */}
            <Accordion.Item key={randomId()} value="Full-time" style={{ background:"transparent", border: "transparent" }}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#1a2521", color: "white" }}>
                    <Accordion.Control c="#dcdcdc" style={{ background: "#1a2521" }}>
                        <Text size="xl" fw={700}>Full-time employee labels</Text>
                    </Accordion.Control>
                </Paper>
                <Accordion.Panel c="#dcdcdc" style={{ background: "#1a2521", borderRadius: "15px" }} mt="sm">
                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th><Text size="lg" fw={700}>Label name</Text></Table.Th>
                                    <Table.Th><Text size="lg" fw={700}>Employment type</Text></Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {fulltimeLabelRows}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Accordion.Panel>
            </Accordion.Item>

            {/* part-time labels */}
            <Accordion.Item key={randomId()} value="Part-time" style={{ background:"transparent", border: "transparent" }}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#1a2521", color: "white" }}>
                    <Accordion.Control c="#dcdcdc" style={{ background: "#1a2521" }}>
                        <Text size="xl" fw={700}>Part-time employee labels</Text>
                    </Accordion.Control>
                </Paper>
                <Accordion.Panel c="#dcdcdc" style={{ background: "#1a2521", borderRadius: "15px" }} mt="sm">
                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th><Text size="lg" fw={700}>Label name</Text></Table.Th>
                                    <Table.Th><Text size="lg" fw={700}>Employment type</Text></Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {partTimeLabelRows}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Accordion.Panel>
            </Accordion.Item>

            {/* term labels */}
            <Accordion.Item key={randomId()} value="Term" style={{ background:"transparent", border: "transparent" }}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#1a2521", color: "white" }}>
                    <Accordion.Control c="#dcdcdc" style={{ background: "#1a2521" }}>
                        <Text size="xl" fw={700}>Term employee labels</Text>
                    </Accordion.Control>
                </Paper>
                <Accordion.Panel c="#dcdcdc" style={{ background: "#1a2521", borderRadius: "15px" }} mt="sm">
                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th><Text size="lg" fw={700}>Label name</Text></Table.Th>
                                    <Table.Th><Text size="lg" fw={700}>Employment type</Text></Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {termLabelRows}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Accordion.Panel>
            </Accordion.Item>

            {/* contractor labels */}
            <Accordion.Item key={randomId()} value="Contractor" style={{ background:"transparent", border: "transparent" }}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#1a2521", color: "white" }}>
                    <Accordion.Control c="#dcdcdc" style={{ background: "#1a2521" }}>
                        <Text size="xl" fw={700}>Contractor labels</Text>
                    </Accordion.Control>
                </Paper>
                <Accordion.Panel c="#dcdcdc" style={{ background: "#1a2521", borderRadius: "15px" }} mt="sm">
                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th><Text size="lg" fw={700}>Label name</Text></Table.Th>
                                    <Table.Th><Text size="lg" fw={700}>Employment type</Text></Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {contractorLabelRows}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Accordion.Panel>
            </Accordion.Item>

            {/* freelancer labels */}
            <Accordion.Item key={randomId()} value="Freelancer" style={{ background:"transparent", border: "transparent" }}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#1a2521", color: "white" }}>
                    <Accordion.Control c="#dcdcdc" style={{ background: "#1a2521" }}>
                        <Text size="xl" fw={700}>Freelancer labels</Text>
                    </Accordion.Control>
                </Paper>
                <Accordion.Panel c="#dcdcdc" style={{ background: "#1a2521", borderRadius: "15px" }} mt="sm">
                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th><Text size="lg" fw={700}>Label name</Text></Table.Th>
                                    <Table.Th><Text size="lg" fw={700}>Employment type</Text></Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {freelancerLabelRows}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Accordion.Panel>
            </Accordion.Item>

            {/* student labels */}
            <Accordion.Item key={randomId()} value="Student" style={{ background:"transparent", border: "transparent" }}>
                <Paper shadow="md" p="lg" radius="lg" style={{ background: "#1a2521", color: "white" }}>
                    <Accordion.Control c="#dcdcdc" style={{ background: "#1a2521" }}>
                        <Text size="xl" fw={700}>Student labels</Text>
                    </Accordion.Control>
                </Paper>
                <Accordion.Panel c="#dcdcdc" style={{ background: "#1a2521", borderRadius: "15px" }} mt="sm">
                    <Table.ScrollContainer minWidth={500}>
                        <Table verticalSpacing="md" horizontalSpacing="md">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th><Text size="lg" fw={700}>Label name</Text></Table.Th>
                                    <Table.Th><Text size="lg" fw={700}>Employment type</Text></Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {studentLabelRows}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                </Accordion.Panel>
            </Accordion.Item>
        </>

    );
    //const rows = updateTableRows(); // Initial rendering

    return (
        <>
            {deleteLabelModalOpened && (
                <DeleteLabelConfirmModal 
                    modalOpened={deleteLabelModalOpened}
                    isMobile={isMobile !== undefined? isMobile : false}
                    closeModal={closeDeleteLabelModal}
                    handleDeleteClick={handleModalDeleteLabelClick}
                />
            )}
            {/* <Paper p="xl" mt="lg" ml="lg" mr="lg" radius="lg" style={{ padding: "20px", background: "#25352F", color: "#dcdcdc" }}> */}
                <Grid>
                    <Grid.Col span={{ base: 12 }} mt="lg" mb="lg">
                        <Text size="xl" fw={600} mb="lg">To tailor our services specifically to your business needs, please specify the staff employment positions and labels relevant to your organization.</Text>
                        <Space h="lg"/>
                        <Text size="xl" fw={600} mb="lg">This customization ensures that our services will align precisely with your current internal structure and terminology.</Text>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12 }}>
                        <Stack>
                            <Group align="flex-end">
                                <Stack>
                                    <Text size="xl" fw={700}>Add a new staff position label</Text>
                                    <Grid>
                                        <Grid.Col span={{ base: 12, md: 6 }} >
                                            <Select
                                                id="role-type"
                                                value={selectedRoleType}
                                                onChange={setSelectedRoleType}
                                                allowDeselect={false}
                                                placeholder="Select employment type"
                                                label="Employment/position type"
                                                size="lg"
                                                w="100%"
                                                classNames={classes}
                                                data={staffBaseTypeData}
                                            //{...form.getInputProps('country')}
                                            >
                                            </Select>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, md: 6 }} >
                                            <TextInput
                                                id="new-role"
                                                //className={computedColorScheme == 'light' ? "input-light" : "input-dark"}
                                                value={labelName}
                                                onChange={(event) => setLabelName(event.target.value)}
                                                label="Name"
                                                name="new_role"
                                                w="100%"
                                                placeholder="Enter a custom label"
                                                size="lg"
                                                classNames={classes}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                </Stack>
                                <Button
                                    //fullWidth 
                                    size="lg"
                                    radius="md"
                                    onClick={() => {
                                        handleAddRole(selectedRoleType != null ? selectedRoleType : "");
                                    }}
                                    color="#4a8a2a"
                                    w={ isMobile ? "100%" : "fit" }
                                    //variant="light"
                                >
                                    <Title order={4}>Add</Title>
                                </Button>
                            </Group>
                            <Space h="lg" />
                            <Text size="xl" fw={700}>Current employment position labels</Text>
                            <Accordion
                                value={openedItem}
                                onChange={handleAccordionChange}
                                variant="separated"
                            >
                                {AccordionLabels}
                            </Accordion>
                        </Stack>
                    </Grid.Col>
                </Grid>

            {/* </Paper> */}
        </>
    );
}