// parse time into a date 'HH:MM:SS' => 'YYYY-MM-DDTHH:MM:SS'
function parseTime(timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0, 0);
    return date;
}

// get the time difference between check_out - check_in => in minutes (1000 * 60)
function parseAndDiffInMinutes(checkIn: string, checkOut: string): number {
    const checkInTime = parseTime(checkIn);
    const checkOutTime = parseTime(checkOut);
    return (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60);
};

// calculate total time duration in hours
// TODO: FIX BUG when you go overnight from PM to AM ex. 8 PM - 1 AM
// total_time = ((check_out - check_in) + (check_out_2 - check_in_2) + (check_out_3 - check_in_3) * 24 * 60) / 60
export function calculateTotalDurationInHours(recordEntry: string[], depth: number): number {
    if (depth > 0) {
        let check_in: string, check_out: string;
        let check_in2: string, check_out2: string;
        let check_in3: string, check_out3: string;
        let duration1: number = 0, duration2: number = 0, duration3: number = 0;
        switch(depth) {
            case 1:
                check_in = recordEntry[0];
                check_out = recordEntry[1];
                duration1 = parseAndDiffInMinutes(check_in, check_out);
                break;
            case 2:
                check_in = recordEntry[0];
                check_out = recordEntry[1];
                check_in2 = recordEntry[2];
                check_out2 = recordEntry[3];
                duration1 = parseAndDiffInMinutes(check_in, check_out);
                duration2 = parseAndDiffInMinutes(check_in2, check_out2);
                break;
            case 3:
                check_in = recordEntry[0];
                check_out = recordEntry[1];
                check_in2 = recordEntry[2];
                check_out2 = recordEntry[3];
                check_in3 = recordEntry[4];
                check_out3 = recordEntry[5];
                duration1 = parseAndDiffInMinutes(check_in, check_out);
                duration2 = parseAndDiffInMinutes(check_in2, check_out2);
                duration3 = parseAndDiffInMinutes(check_in3, check_out3);
                break;
        }

        // Sum up the durations in minutes and convert to hours
        const totalDurationInMinutes = duration1 + duration2 + duration3;
        const totalDurationInHours = totalDurationInMinutes / 60;
        return Math.round(totalDurationInHours * 4) / 4;
    }
    return 0;
}