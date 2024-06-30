// get the valid hours (24H format) based on current time
export function getValidHours(): string[] {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const validHours: string[] = [];
  
    // Loop through hours to generate valid hours
    for (let hour = currentHour; hour < 25; hour++) {
      // Format the hour to ensure it has a leading zero
      const formattedHour = hour.toString().padStart(2, '0');
  
      // Add the hour to the list of valid hours
      validHours.push(formattedHour);
    }
    return validHours;
} 

// get the valid hours (12H format) based on current time
export function getValid12Hours(): string[] {
    const currentTime = new Date();
    let currentHour = currentTime.getHours();
    
    // Convert to 12-hour format
    switch(currentHour) {
        case 0:
        case 12:
            currentHour = 1;
            break;
        default:
            currentHour = currentHour % 12;
    }
    const valid12Hours: string[] = [];
  
    // Loop through hours to generate valid 12-hour format hours
    for (let hour = currentHour; hour <= 12; hour++) {
        // Format the hour to ensure it has a leading zero
        const formattedHour = hour.toString().padStart(2, '0');
  
        // Add the hour to the list of valid 12-hour format hours
        valid12Hours.push(formattedHour);
    }
    return valid12Hours;
}

// get the general 12 hours (00-12) regardless of current time
export function get12Hours(zero?: boolean, starting?: number): string[] {
    const hoursList: string[] = [];
    var offset = 0;
    var start = 0;

    if (zero === false) {
        offset = 1;
    }

    if (starting !== undefined) {
        start = starting;
    }

    for (let hour = start + offset; hour < 13; hour++) {
        // Format the hour to ensure it has a leading zero
        const formattedHour = hour.toString().padStart(2, '0');
        hoursList.push(formattedHour);
    }
    
    return hoursList;
}
  
// get the valid minutes (00-59) based on current time
export function getValidMinutes(): string[] {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const validMinutes: string[] = [];

    if (currentMinute < 5) {
        // Loop through minutes to generate valid minutes
        for (let minute = (currentHour === currentTime.getHours()) ? currentMinute : 0; minute < 60; minute++) {
            // Format the minute to ensure it has a leading zero
            const formattedMinute = minute.toString().padStart(2, '0');

            // Add the minute to the list of valid minutes
            validMinutes.push(formattedMinute);
        }
    }
    else {
        // Loop through minutes to generate valid minutes with grace period of 5 mins
        for (let minute = (currentHour === currentTime.getHours()) ? currentMinute - 5 : 0; minute < 60; minute++) {
            // Format the minute to ensure it has a leading zero
            const formattedMinute = minute.toString().padStart(2, '0');

            // Add the minute to the list of valid minutes
            validMinutes.push(formattedMinute);
        }
    }
    return validMinutes;
}

// get general minutes list (00-59) or (01-59)
export function getMinutes(zero?: boolean, starting?: number): string[] {
    const minutesList: string[] = [];
    var offset = 0;
    var start = 0;

    if (zero === false) {
        offset = 1;
    }

    if (starting !== undefined) {
        start = starting;
    }

    for (let minute = start + offset; minute < 60; minute++) {
        // Format the minute to ensure it has a leading zero
        const formattedMinute = minute.toString().padStart(2, '0');
        minutesList.push(formattedMinute);
    }
    
    return minutesList;
}

// get the valid time period AM/PM based on current time
export function getValidTimePeriod(): string[] {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const validTimePeriods: string[] = [];
    
    // Determine whether it's AM and/or PM
    if (currentHour < 12) {
        validTimePeriods.push("AM");
        validTimePeriods.push("PM");
    }
    else {
        validTimePeriods.push("PM");
    }
    return validTimePeriods;
}

// get the general time periods AM and PM
export function getTimePeriod(): string[] {
    const timePeriodList: string[] = [];
    timePeriodList.push("AM");
    timePeriodList.push("PM");
    return timePeriodList;
}

// get the current time in the format 'HH:MM A'
export function getValidCurrentTime(): string {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');
    let current12Hour = (currentHour % 12 || 12).toString().padStart(2, '0');
    let currentAmPm = "";
    if (currentHour < 12) {
        currentAmPm = "AM";
    }
    else {
        currentAmPm = "PM";
    }
    return current12Hour + ":" + currentMinute + " " + currentAmPm;
}