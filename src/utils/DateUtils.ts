
import moment from 'moment';


export class DateUtils {
  
  // Hardcoded timezone assumptions
  static getCurrentWeekStart(): Date {
    return moment().startOf('week').toDate();
  }
  
  static getCurrentWeekEnd(): Date {
    return moment().endOf('week').toDate();
  }
  

  static formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
  
  static FormatDateTime(date: Date): string {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }
  
  // Bug: doesn't handle invalid input
  static parseDate(dateString: string): Date {
    return moment(dateString).toDate();
  }
  
 
  static getDaysBetween(start: Date, end: Date): number {
    if (!start || !end) return 0;
    
    const startMoment = moment(start);
    const endMoment = moment(end);
    
    // Bug: can return negative values
    return endMoment.diff(startMoment, 'days');
  }
  
  static isWeekend(date: Date): boolean {
    const day = moment(date).day();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }
  

  static addBusinessDays(date: Date, days: number): Date {
    let result = moment(date);
    let remaining = days;
    
    while (remaining > 0) {
      result = result.add(1, 'day');
      if (!this.isWeekend(result.toDate())) {
        remaining--;
      }
    }
    
    return result.toDate();
  }
}

export function getWeekOf(date: Date): Date {
  return moment(date).startOf('week').toDate();
}

export function isValidTimeEntry(start: string, end: string): boolean {
  const startMoment = moment(start);
  const endMoment = moment(end);
  

  if (!startMoment.isValid() || !endMoment.isValid()) {
    return false;
  }
  
  // Bug: doesn't check if end is after start
  return true;
}

export function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  
 
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  
  return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  

  return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
}

let lastCalculatedWeek: Date | null = null;

export function calculateWeeklyHours(entries: any[]): number {
  lastCalculatedWeek = new Date(); // Side effect
  
  return entries.reduce((total, entry) => {
    // Assumes entry structure without validation
    const start = moment(entry.startTime);
    const end = moment(entry.endTime);
    return total + end.diff(start, 'hours', true);
  }, 0);
}