import { randomId } from "@mantine/hooks";

// country data
export const countryData = [
    'Afghanistan',
    'Algeria',
    'Angola',
    'Argentina',
    'Australia',
    'Bangladesh',
    'Belgium',
    'Bhutan',
    'Botswana',
    'Brazil',
    'Cambodia',
    'Canada',
    'China',
    'Denmark',
    'Egypt',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Germany',
    'Ghana',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Israel',
    'Italy',
    'Japan',
    'Jordan',
    'Kenya',
    'Kuwait',
    'Lebanon',
    'Lesotho',
    'Libya',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Mexico',
    'Mongolia',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nigeria',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Papua New Guinea',
    'Philippines',
    'Portugal',
    'Qatar',
    'Russia',
    'Rwanda',
    'Saudi Arabia',
    'Singapore',
    'Solomon Islands',
    'South Africa',
    'South Korea',
    'Spain',
    'Sri Lanka',
    'Sweden',
    'Switzerland',
    'Syria',
    'Tanzania',
    'Thailand',
    'Tunisia',
    'Turkey',
    'Tuvalu',
    'Uganda',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Vanuatu',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe'
    // Add more countries as needed
];

// canada province data
export const canadaProvinceData = [
    { value: 'AB', label: "Alberta" }, // alberta
    { value: 'BC', label: "British Columbia" }, // british columbia
    { value: 'MB', label: "Manitoba" }, // manitoba
    { value: 'NB', label: "New Brunswick" }, // new brunswick
    { value: 'NL', label: "Newfoundland and Labrador" }, // newfoundland
    { value: 'NT', label: "Northwest Territories" }, // northwest territories
    { value: 'NS', label: "Nova Scotia" }, // nova scotia
    { value: 'NU', label: "Nunavut" }, // nunavut
    { value: 'ON', label: "Ontario" }, // ontario
    { value: 'PE', label: "Prince Edward Island" }, // prince edward island
    { value: 'QC', label: "Quebec" }, // quebec
    { value: 'SK', label: "Saskatchewan" }, // saskatchewan
    { value: 'YT', label: "Yukon" }  // yukon
];

// USA state data
export const usaStateData = [
    { value: 'Alabama', label: 'Alabama' },
    { value: 'Alaska', label: 'Alaska' },
    { value: 'Arizona', label: 'Arizona' },
    { value: 'Arkansas', label: 'Arkansas' },
    { value: 'California', label: 'California' },
    { value: 'Colorado', label: 'Colorado' },
    { value: 'Connecticut', label: 'Connecticut' },
    { value: 'Delaware', label: 'Delaware' },
    { value: 'Florida', label: 'Florida' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Hawaii', label: 'Hawaii' },
    { value: 'Idaho', label: 'Idaho' },
    { value: 'Illinois', label: 'Illinois' },
    { value: 'Indiana', label: 'Indiana' },
    { value: 'Iowa', label: 'Iowa' },
    { value: 'Kansas', label: 'Kansas' },
    { value: 'Kentucky', label: 'Kentucky' },
    { value: 'Louisiana', label: 'Louisiana' },
    { value: 'Maine', label: 'Maine' },
    { value: 'Maryland', label: 'Maryland' },
    { value: 'Massachusetts', label: 'Massachusetts' },
    { value: 'Michigan', label: 'Michigan' },
    { value: 'Minnesota', label: 'Minnesota' },
    { value: 'Mississippi', label: 'Mississippi' },
    { value: 'Missouri', label: 'Missouri' },
    { value: 'Montana', label: 'Montana' },
    { value: 'Nebraska', label: 'Nebraska' },
    { value: 'Nevada', label: 'Nevada' },
    { value: 'New Hampshire', label: 'New Hampshire' },
    { value: 'New Jersey', label: 'New Jersey' },
    { value: 'New Mexico', label: 'New Mexico' },
    { value: 'New York', label: 'New York' },
    { value: 'North Carolina', label: 'North Carolina' },
    { value: 'North Dakota', label: 'North Dakota' },
    { value: 'Ohio', label: 'Ohio' },
    { value: 'Oklahoma', label: 'Oklahoma' },
    { value: 'Oregon', label: 'Oregon' },
    { value: 'Pennsylvania', label: 'Pennsylvania' },
    { value: 'Rhode Island', label: 'Rhode Island' },
    { value: 'South Carolina', label: 'South Carolina' },
    { value: 'South Dakota', label: 'South Dakota' },
    { value: 'Tennessee', label: 'Tennessee' },
    { value: 'Texas', label: 'Texas' },
    { value: 'Utah', label: 'Utah' },
    { value: 'Vermont', label: 'Vermont' },
    { value: 'Virginia', label: 'Virginia' },
    { value: 'Washington', label: 'Washington' },
    { value: 'West Virginia', label: 'West Virginia' },
    { value: 'Wisconsin', label: 'Wisconsin' },
    { value: 'Wyoming', label: 'Wyoming' }
];
  
// parent relationship types
export const parentRelationshipTypeData = [
    'Mother',
    'Father',
    'Guardian'
];

// industry types
export const IndustryData = [
    'Agriculture and Farming',
    'Architecture and Design',
    'Automotive',
    'Beauty and Wellness',
    'Construction',
    'Consulting',
    'Childcare Services',
    'Education and Training',
    'Energy and Utilities',
    'Entertainment and Media',
    'Financial Services',
    'Food and Beverage',
    'Healthcare and Medical',
    'Hospitality and Tourism',
    'Information Technology (IT)',
    'Legal Services',
    'Manufacturing',
    'Nonprofit and Social Services',
    'Real Estate',
    'Retail',
    'Telecommunications',
    'Transportation and Logistics',
    'Wholesale and Distribution',
];

// timezones
export const timezoneData = [
    'UTC-12:00 (International Date Line West)',
    'UTC-11:00 (Midway Island, Samoa)',
    'UTC-10:00 (Hawaii)',
    'UTC-09:00 (Alaska)',
    'UTC-08:00 (Pacific Time)',
    'UTC-07:00 (Mountain Time)',
    'UTC-06:00 (Central Time)',
    'UTC-05:00 (Eastern Time)',
    'UTC-04:00 (Atlantic Time)',
    'UTC-03:00 (Greenland, Brasilia)',
    'UTC-02:00 (Mid-Atlantic)',
    'UTC-01:00 (Azores, Cape Verde)',
    'UTC±00:00 (Greenwich Mean Time, Western European Time)',
    'UTC+01:00 (Central European Time)',
    'UTC+02:00 (Eastern European Time, Kaliningrad Time)',
    'UTC+03:00 (Moscow Time, Arabia Standard Time)',
    'UTC+03:30 (Iran Standard Time)',
    'UTC+04:00 (Azerbaijan Time, Samara Time)',
    'UTC+04:30 (Afghanistan Time)',
    'UTC+05:00 (Pakistan Standard Time, Yekaterinburg Time)',
    'UTC+05:30 (Indian Standard Time, Sri Lanka Time)',
    'UTC+05:45 (Nepal Time)',
    'UTC+06:00 (Bangladesh Time, Omsk Time)',
    'UTC+06:30 (Cocos Islands Time)',
    'UTC+07:00 (Indochina Time, Novosibirsk Time)',
    'UTC+08:00 (China Standard Time, Australian Western Standard Time)',
    'UTC+08:45 (Australian Central Western Standard Time)',
    'UTC+09:00 (Japan Standard Time, Korea Standard Time)',
    'UTC+09:30 (Australian Central Standard Time)',
    'UTC+10:00 (Australian Eastern Standard Time, Vladivostok Time)',
    'UTC+10:30 (Lord Howe Standard Time)',
    'UTC+11:00 (Solomon Islands Time, Magadan Time)',
    'UTC+11:30 (Norfolk Island Time)',
    'UTC+12:00 (New Zealand Standard Time, Fiji Time)',
    'UTC+12:45 (Chatham Islands Time)',
    'UTC+13:00 (Tonga Time, Phoenix Islands Time)',
    'UTC+14:00 (Line Islands Time)',
];

// employee count
// 1-10, 11- 25, 26-50, 51- 100, 101-250, 251-500, 501-1000, 1001-5000, 5001-10,000, 10001+
export const employeeCountData = [
    '1 - 10',
    '11 - 25',
    '26 - 50',
    '51 - 100',
    '101 - 250',
    '251 - 500',
    '501 - 1,000',
    '1,001 - 5,000',
    '5,001 - 10,000',
    '10,001+',
];

// staff employee types
export const staffBaseTypeData = [
    { value: 'Owner', label: 'Owner/CEO/Director', disabled: true },
    { value: 'Co-owner', label: 'Co-owner', disabled: false },
    { value: 'Manager', label: 'Manager (Full-time)', disabled: false },
    { value: 'Full-time', label: 'Full-time employee', disabled: false },
    { value: 'Part-time', label: 'Part-time employee', disabled: false },
    { value: 'Term', label: 'Term/Seasonal employee', disabled: false },
    { value: 'Contractor', label: 'Contractor', disabled: false },
    { value: 'Freelancer', label: 'Freelancer', disabled: false },
    // { value: 'Volunteer', label: 'Volunteer', disabled: false },
    // { value: 'Internship', label: 'Internship', disabled: false },
    { value: 'Student', label: 'Student', disabled: false },
];

// gender options
export const genderSelectData = [
    'Male', 
    'Female', 
    'Non-binary', 
    'Undisclosed',
];

// parent relationship options
export const parentRelationshipData = [
    { value: "Mother", label: "Mother" },
    { value: "Father", label: "Father" },
    { value: "Guardian", label: "Guardian" },
];

// default co-owner labels
export const coownerLabels = [
    { value: "COO", label: "COO" },
    { value: "CTO", label: "CTO" },
    { value: "Co-Director", label: "Co-Director" },
];

// default manager labels 
export const managerLabels = [
    { value: "General Manager", label: "General Manager" },
    { value: "Supervisor", label: "Supervisor"  },
    { value: "Shift Lead", label: "Shift Lead" },
];

// default full-time labels
export const fullTimeLabels = [
    { value: "Customer Service Associate", label: "Customer Service Associate" },
    { value: "Sales Associate", label: "Sales Associate" },
    { value: "Cashier", label: "Cashier" },
    { value: "Server", label: "Server" },
    { value: "Merchandiser", label: "Merchandiser" },
    { value: "Office Administrator", label: "Office Administrator" },
    { value: "Receptionist", label: "Receptionist" },
    { value: "Security", label: "Security" },
    { value: "Maintenance", label: "Maintenance" },
];

// default part-time labels
export const partTimeLabels = [
    { value: "Customer Service Associate", label: "Customer Service Associate" },
    { value: "Sales Associate", label: "Sales Associate" },
    { value: "Cashier", label: "Cashier" },
    { value: "Server", label: "Server" },
    { value: "Merchandiser", label: "Merchandiser" },
    { value: "Office Administrator", label: "Office Administrator" },
    { value: "Receptionist", label: "Receptionist" },
    { value: "Security", label: "Security" },
    { value: "Maintenance", label: "Maintenance" },
];

// default term labels
export const termLabels = [
    { value: "Customer Service Associate", label: "Customer Service Associate" },
    { value: "Sales Associate", label: "Sales Associate" },
    { value: "Cashier", label: "Cashier" },
    { value: "Server", label: "Server" },
    { value: "Merchandiser", label: "Merchandiser" },
    { value: "Office Administrator", label: "Office Administrator" },
    { value: "Receptionist", label: "Receptionist" },
    { value: "Security", label: "Security" },
    { value: "Maintenance", label: "Maintenance" },
];

// default contractor labels
export const contractorLabels = [
    { value: "Project Manager", label: "Project Manager" },
    { value: "Consultant", label: "Consultant" },
    { value: "Research Analyst", label: "Research Analyst" },
];

// default freelancer labels
export const freelancerLabels = [
    { value: "Content Writer", label: "Content Writer" },
    { value: "Graphics Designer", label: "Graphics Designer" },
    { value: "Developer", label: "Developer" },
];

// default student labels
export const studentLabels = [
    { value: "Customer Service Associate", label: "Customer Service Associate" },
    { value: "Sales Associate", label: "Sales Associate" },
    { value: "Cashier", label: "Cashier" },
    { value: "Server", label: "Server" },
    { value: "Merchandiser", label: "Merchandiser" },
];

// default user labels
export const userLabels = [
    { value: "User", label: "User", disabled: true },
    { value: "Person", label: "Person", disabled: true },
    { value: "Client", label: "Client", disabled: true },
];

// entity options
export const userRoleData = [
    { value: "0", label: "Business centre" },
    { value: "1", label: "Staff employee" },
    { value: "2", label: "User", disabled: false },
    { value: "3", label: "Parent/Guardian", disabled: true },
];

// reporting frequency options
export const reportingFrequencyData = [
    { value: "0", label: "Daily" },
    { value: "1", label: "Weekly" },
    { value: "2", label: "Bi-weekly" },
    { value: "4", label: "Monthly" },
    { value: "5", label: "Quarterly" },
    { value: "6", label: "Semi-anually" },
    { value: "7", label: "Anually" },
];

// report type options
export const reportTypeData = [
    'Timesheet'
];

// time type
export const timeTypeData = [
    { value: '2', label: 'Clock in' },
    { value: '3', label: 'Break start' },
    { value: '4', label: 'Break end' },
    { value: '1', label: 'Clock out' },
]