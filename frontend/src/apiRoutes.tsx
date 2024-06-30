const BASE_URL = 'https://verifiedhours.com';
//const BASE_URL = 'http://localhost:8000';
//const BASE_URL = 'http://dev.verifiedhours.com';
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1';
const GEOAPIFY_API_KEY = '09c676a64439453ba2380eab97232940';
const PUBLIC_HOLIDAY_BASE_URL = 'https://date.nager.at/api/v3';

export const API_ROUTES = {
    // auth tokens
    TOKEN: `${BASE_URL}/api/token/`,
    TOKEN_REFRESH: `${BASE_URL}/api/token/refresh`,
    TOKEN_BLACKLIST: `${BASE_URL}/api/token/blacklist`,

    // auth user
    USER: `${BASE_URL}/api/register/`,
    USERS: `${BASE_URL}/api/users/`,
    USERS_ID: (userId: number) => `${BASE_URL}/api/users/id/${userId}`,
    USERS_UID: (userUid: string) => `${BASE_URL}/api/users/id/${userUid}`,
    USERS_UID_EMAIL: (userUid: string) => `${BASE_URL}/api/users/id/email/${userUid}`,
    USERS_CONTACT_NUMBER: (contact_number: string) => `${BASE_URL}/api/users/contact-number/${contact_number}`,
    USERS_USERNAME: (username: string) => `${BASE_URL}/api/persons/username/${username}`,
    USERS_USERNAME_EMAIL: (username: string) => `${BASE_URL}/api/persons/username/email/${username}`,
    USER_INFO_UID: (userUid: string) => `${BASE_URL}/api/persons/id/${userUid}`,
    USER_INFO_UID_EMAIL: (userUid: string) => `${BASE_URL}/api/persons/id/${userUid}/email/`,
    APPROVE_NEW_STAFF_USER: (staffUid: string) => `${BASE_URL}/api/approve/staffs/${staffUid}`,

    // Child routes
    CHILDS: `${BASE_URL}/api/users/`,
    CHILDS_RELATIONSHIP: `${BASE_URL}/api/users/relationships/`,
    CHILDS_RELATIONSHIP_TYPES: `${BASE_URL}/api/users/relationships/types/`,
    CHILDS_ATTENDANCE: `${BASE_URL}/api/users/attendances/`,
    CHILDS_ID: (childId: number) => `${BASE_URL}/api/users/${childId}`,
    CHILDS_UID: (childUid: string) => `${BASE_URL}/api/users/${childUid}`,
    CHILDS_ATTENDANCE_ID: (attendanceId: string) => `${BASE_URL}/api/users/attendances/${attendanceId}`,
    CHILDS_BUSINESS_ID: (businessId: string) => `${BASE_URL}/api/users/businesses/${businessId}`,
    CHILDS_BUSINESS_ID_ATTENDANCE: (businessId: string) => `${BASE_URL}/api/users/attendances/businesses/${businessId}`,
    CHILDS_PARENTS: (childId: number) => `${BASE_URL}/api/users/${childId}/parents`,
    CHILDS_RELATIONSHIPS_BUSINESS_ID: (businessId: string) => `${BASE_URL}/api/users/relationships/businesses/${businessId}`,
    CHILDS_RELATIONSHIPS_USERS_UID: (userUid: string) => `${BASE_URL}/api/users/relationships/users/${userUid}`,

    // Parent routes
    PARENTS: `${BASE_URL}/api/parents/`,
    PARENTS_ID: (parentId: number) => `${BASE_URL}/api/parent/parents/${parentId}`,
    PARENTS_UID: (parentUid: string) => `${BASE_URL}/api/parent/parents/${parentUid}`,

    // Staff routes
    STAFFS: `${BASE_URL}/api/staffs/`,
    STAFFS_RELATIONSHIP: `${BASE_URL}/api/staffs/relationships/`,
    STAFFS_ATTENDANCE: `${BASE_URL}/api/staffs/attendances/`,
    STAFFS_WORKING_HOURS: `${BASE_URL}/api/staffs/working-hours/`,
    STAFFS_UID: (staffUid: string) =>`${BASE_URL}/api/staffs/${staffUid}`,
    STAFFS_ATTENDANCE_ID: (attendanceId: string) => `${BASE_URL}/api/staffs/attendances/${attendanceId}`,
    STAFFS_ATTENDANCE_STAFF_UID: (staffUid: string) => `${BASE_URL}/api/staffs/attendances/staffs/${staffUid}`,
    STAFFS_ATTENDANCE_AUTO_CLOCK_OUT_STAFF_UID: (staffUid: string) => `${BASE_URL}/api/staffs/attendances/auto-clock-out/staffs/${staffUid}`,
    STAFFS_BUSINESS_ID: (businessId: string) => `${BASE_URL}/api/staffs/businesses/${businessId}`,
    STAFFS_RELATIONSHIP_ID: (relationshipId: string) => `${BASE_URL}/api/staffs/relationships/${relationshipId}`,
    STAFFS_RELATIONSHIP_STAFF_UID: (staffUid: string) => `${BASE_URL}/api/staffs/relationships/staffs/${staffUid}`,
    STAFFS_BUSINESS_ID_ATTENDANCE: (businessId: string) => `${BASE_URL}/api/staffs/attendances/businesses/${businessId}`,
    STAFFS_RELATIONSHIPS_BUSINESS_ID: (businessId: string) => `${BASE_URL}/api/staffs/relationships/businesses/${businessId}`,
    STAFFS_RELATIONSHIPS_STAFF_UID: (staffUid: string) => `${BASE_URL}/api/staffs/relationships/staffs/${staffUid}`,
    STAFFS_WORKING_HOURS_STAFF_UID: (staffUid: string) => `${BASE_URL}/api/staffs/working-hours/staffs/${staffUid}`,
    STAFFS_POSITION_STAFF_UID: (staffUid: string) => `${BASE_URL}/api/staffs/position/staffs/${staffUid}`,

    // Business routes
    OWNERS: `${BASE_URL}/api/owners/`,
    BUSINESSES: `${BASE_URL}/api/businesses/`,
    BUSINESS_TYPES: `${BASE_URL}/api/businesses/types/`,
    BUSINESS_PROFILE_PLAN: `${BASE_URL}/api/businesses/plans/`,
    BUSINESS_OWNER_PLAN: `${BASE_URL}/api/businesses/plans/owner/`,
    LOCATIONS: `${BASE_URL}/api/businesses/locations/`,
    EMERGENCY_CONTACTS: `${BASE_URL}/api/businesses/emergency-contacts/`,
    HOLIDAYS: `${BASE_URL}/api/businesses/holidays/`,
    BUSINESS_GROUP: `${BASE_URL}/api/businesses/groups/`,
    GROUP_MEMBER: `${BASE_URL}/api/businesses/groups/members/`,
    BUSINESS_GROUP_RELATIONSHIP: `${BASE_URL}/api/businesses/groups/relationships/`,
    EMPLOYMENT_TYPES: `${BASE_URL}/api/businesses/employment/`,
    PEOPLE: `${BASE_URL}/api/people`,
    WAITLIST: `${BASE_URL}/api/businesses/waitlist/`,
    MESSAGES: `${BASE_URL}/api/businesses/messages/`,
    VALIDATE_INVITE_CODE: `${BASE_URL}/api/businesses/validate-code/`,
    OWNERS_ID: (ownerId: number) => `${BASE_URL}/api/owners/${ownerId}`,
    OWNERS_UID: (ownerUid: string) => `${BASE_URL}/api/owners/${ownerUid}`,
    OWNERS_WORKING_HOURS_OWNER_UID: (ownerUid: string) => `${BASE_URL}/api/businesses/owner/working-hours/owners/${ownerUid}`,
    BUSINESSES_ID: (businessId: string) =>`${BASE_URL}/api/businesses/${businessId}`,
    BUSINESSES_NAME: (businessName: string) =>`${BASE_URL}/api/businesses/find/${businessName}`,
    BUSINESSES_OWNER_ID: (ownerId: number) => `${BASE_URL}/api/businesses/owned-by/${ownerId}`,
    BUSINESSES_OWNER_UID: (ownerUid: string) => `${BASE_URL}/api/businesses/owned-by/${ownerUid}`,
    BUSINESSES_STAFFS_ACTIVITY: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/activity/staffs/`,
    BUSINESSES_USERS_ACTIVITY: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/activity/users/`,
    BUSINESSES_STAFFS_UID_ACTIVITY: (businessId: string, staffUid: string) => `${BASE_URL}/api/businesses/${businessId}/activity/staffs/${staffUid}`,
    BUSINESSES_USERS_UID_ACTIVITY: (businessId: string, userUid: string) => `${BASE_URL}/api/businesses/${businessId}/activity/users/${userUid}`,
    BUSINESSES_STAFFS_ACTIVITY_LOGS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/activity/logs/staffs/`,
    BUSINESSES_STAFFS_UID_ACTIVITY_LOGS: (businessId: string, staffUid: string) => `${BASE_URL}/api/businesses/${businessId}/activity/logs/staffs/${staffUid}`,
    BUSINESSES_MONTHLY_STATS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/monthly-stats/`,
    BUSINESSES_INVITE_QR_CODE: (businessId: string) =>`${BASE_URL}/api/businesses/${businessId}/management/centre/invite-codes/`,
    BUSINESSES_UNASSIGNED_USERS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/management/people/unassigned/`,
    BUSINESSES_EMPLOYMENT_POSITIONS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/management/centre/employment-positions/`,
    BUSINESSES_EMPLOYMENT_POSITIONS_ID: (businessId: string, positionId: string) => `${BASE_URL}/api/businesses/${businessId}/management/centre/employment-positions/${positionId}`,
    BUSINESSES_EMPLOYMENT_POSITIONS_TYPE: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/management/centre/employment-positions/type/`,
    BUSINESSES_PAYROLL_INFORMATION: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/management/centre/payroll/`,
    BUSINESSES_PAYROLL_INFORMATION_ID: (businessId: string, payrollId: string) => `${BASE_URL}/api/businesses/${businessId}/management/centre/payroll/${payrollId}`,
    BUSINESSES_PAYROLL_HOLIDAYS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/management/centre/payroll/holidays/`,
    BUSINESSES_PAYROLL_HOLIDAYS_ID: (businessId: string, holidayId: string) => `${BASE_URL}/api/businesses/${businessId}/management/centre/payroll/holidays/${holidayId}`,
    BUSINESSES_HOURS_OF_OPERATION: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/management/centre/business-hours/`,
    BUSINESSES_TIMESHEETS_STAFFS_UID: (businessId: string, userUid: string) => `${BASE_URL}/api/businesses/${businessId}/timesheets/users/${userUid}`,
    BUSINESSES_SUBMIT_STAFF_TIMESHEETS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/timesheets/submit/`,
    BUSINESSES_SUBMITTED_STAFF_TIMESHEETS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/timesheets/submitted/`,
    BUSINESSES_APPROVE_SUBMITTED_STAFF_TIMESHEETS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/timesheets/submitted/approve/`,
    BUSINESSES_DENY_SUBMITTED_STAFF_TIMESHEETS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/timesheets/submitted/deny/`,
    BUSINESSES_NOT_SUBMITTED_STAFF_TIMESHEETS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/timesheets/not-submitted/`,
    BUSINESSES_ARCHIVED_STAFF_TIMESHEETS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/timesheets/archived/`,
    BUSINESSES_REPORTS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/reports/`,
    NOTIFICATION_MESSAGE_STAFF_UID: (staffUid: string) => `${BASE_URL}/api/businesses/notifications/staffs/${staffUid}`,
    NOTIFICATION_MESSAGE_USER_UID: (userUid: string) => `${BASE_URL}/api/businesses/notifications/users/${userUid}`,
    BUSINESS_TYPES_ID: (typeId: number) => `${BASE_URL}/api/businesses/types/${typeId}`,
    BUSINESS_PROFILE_PLAN_ID: (planId: number) => `${BASE_URL}/api/businesses/plans/${planId}`,
    BUSINESS_PROFILE_PLAN_NAME: (planName: string) => `${BASE_URL}/api/businesses/plans/plan-name/${planName}`,
    BUSINESS_PROFILE_PLAN_BUSINESS_UID: (businessUid: string) => `${BASE_URL}/api/businesses/${businessUid}/plan`,
    BUSINESS_OWNER_PLAN_ID: (planId: number) => `${BASE_URL}/api/businesses/plans/owner/plan/${planId}`,
    BUSINESS_OWNER_PLAN_NAME: (planName: string) => `${BASE_URL}/api/businesses/plans/owner/plan-name/${planName}`,
    BUSINESS_OWNER_PLAN_OWNER_UID: (ownerUid: string) => `${BASE_URL}/api/businesses/plans/owner/id/${ownerUid}`,
    OWNERS_PROFILE_PLAN_ID: (planId: number) => `${BASE_URL}/api/owners/plans/${planId}`,
    BUSINESSES_STAFF_LIMIT_STATUS: (businessId: string) => `${BASE_URL}/api/businesses/${businessId}/limits/staffs/`,
    BUSINESS_OWNERS_SUBSCRIPTIONS: (ownerUid: string) => `${BASE_URL}/api/businesses/subscriptions/owners/owner/${ownerUid}`,
    BUSINESS_OWNERS_PAYMENT: (ownerUid: string) => `${BASE_URL}/api/businesses/payments/owners/owner/${ownerUid}`,
    EMAIL_NEW_BUSINESS_OWNERS: (ownerUid: string) => `${BASE_URL}/api/businesses/email/new-owner/${ownerUid}`,
    EMAIL_VERIFY_TOKEN: `${BASE_URL}/api/businesses/verify/email/token/`,
    EMAIL_VERIFY_CONFIRM: (userUid: string) => `${BASE_URL}/api/businesses/verify/users/user/${userUid}`,

    EMERGENCY_CONTACTS_ID: (contactId: number) => `${BASE_URL}/api/businesses/emergency-contacts/${contactId}`,
    LOCATIONS_BUSINESS_ID: (businessId: string) => `${BASE_URL}/api/businesses/locations/${businessId}`,
    BUSINESS_GROUP_ID: (groupId: string) => `${BASE_URL}/api/businesses/groups/${groupId}`,
    BUSINESS_GROUP_BUSINESS_ID: (businessId: number) => `${BASE_URL}/api/businesses/groups/business/${businessId}`,
    BUSINESS_GROUP_BUSINESS_UID: (businessUid: string) => `${BASE_URL}/api/businesses/groups/business/${businessUid}`,
    GROUP_MEMBER_ID: (memberId: number) => `${BASE_URL}/api/businesses/groups/members/${memberId}`,
    BUSINESSES_RELATIONSHIP_USER_UID: (userUid: string) => `${BASE_URL}/api/businesses/relationships/${userUid}`,
    EMPLOYMENT_TYPE_ID: (employmentTypeId: string) => `${BASE_URL}/api/businesses/employment/${employmentTypeId}`,

    // cookies
    COOKIES: `${BASE_URL}/api/businesses/cookies/`,
    COOKIES_UID: (userUid: string) => `${BASE_URL}/api/businesses/cookies/${userUid}`,

    // 3RD PARTY API ROUTES
    // GeoApify routes - https://apidocs.geoapify.com/
    // https://api.geoapify.com/v1/geocode/autocomplete?text={searchText}&apiKey={key}&limit=5
    GEOAPIFY_ADDRESS_LOOKUP: (searchText: string) => `${GEOAPIFY_BASE_URL}/geocode/autocomplete?text=${searchText}&apiKey=${GEOAPIFY_API_KEY}&limit=5`,

    // holiday api
    // https://date.nager.at/Api
    // https://date.nager.at/api/v3/publicholidays/{year}/{country_code}
    PUBLIC_HOLIDAY_API: (countryCode: string, year: number) => `${PUBLIC_HOLIDAY_BASE_URL}/publicholidays/${year}/${countryCode}`,

    // chargebee api
    CHARGEBEE_NEW_CHECKOUT_URL: `${BASE_URL}/api/businesses/subscriptions/checkout/create/`,
    CHARGEBEE_GET_CHECKOUT_URL: (hostedPageUrl: string) => `${BASE_URL}/api/businesses/subscriptions/checkout/get/${hostedPageUrl}`,
    CHARGEBEE_CANCEL_SUBSCRIPTION: (ownerUid: string) => `${BASE_URL}/api/businesses/subscriptions/cancel/owners/owner/${ownerUid}`,
    CHARGEBEE_UPDATE_SUBSCRIPTION: (ownerUid: string) => `${BASE_URL}/api/businesses/subscriptions/checkout/update/owners/owner/${ownerUid}`,
    CHARGEBEE_UPDATE_PAYMENT_METHOD: (ownerUid: string) => `${BASE_URL}/api/businesses/subscriptions/payments/checkout/update/owners/owner/${ownerUid}`,
    CHARGEBEE_INVOICE_DATA: (ownerUid: string) => `${BASE_URL}/api/businesses/subscriptions/invoices/owners/owner/${ownerUid}`,
    CHARGEBEE_INVOICE_PDF: (ownerUid: string) => `${BASE_URL}/api/businesses/subscriptions/invoices/pdf/owners/owner/${ownerUid}`,
    CHARGEBEE_GET_SUBSCRIPTION: (ownerUid: string) => `${BASE_URL}/api/businesses/subscriptions/owners/owner/${ownerUid}`,
    CHARGEBEE_VERIFY_SUBSCRIPTION: (subscriptionId: string) => `${BASE_URL}/api/businesses/verify/subscriptions/subscription/${subscriptionId}`,
};