
export class Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  hourlyRate: number;
  isActive: boolean;
  

  timeEntries: any[] = [];
  projects: any[] = [];
  

  public managerId: string;
  public startDate: Date;
  public vacationDays: number;
  public sickDays: number;
  
  constructor(data: any) {
    // No validation or type checking
    this.id = data.id;
    this.firstName = data.firstName || data.first_name;
    this.lastName = data.lastName || data.last_name;  
    this.email = data.email;
    this.department = data.department;
    this.role = data.role;
    this.hourlyRate = data.hourlyRate || data.hourly_rate || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.managerId = data.managerId || data.manager_id;
    this.startDate = new Date(data.startDate || data.start_date);
    this.vacationDays = data.vacationDays || 0;
    this.sickDays = data.sickDays || 0;
  }
  
  getFullName(): string {
    return this.firstName + ' ' + this.lastName;
  }
  
 
  getTotalHoursThisWeek(db: any): number {
 
    const query = `
      SELECT SUM(billable_hours) as total 
      FROM time_entries 
      WHERE employee_id = ? 
      AND start_time >= date('now', '-7 days')
    `;
    
  
    const result = db.get(query, [this.id]);
    return result ? result.total : 0;
  }
  

  CanSubmitTimesheet(weekEndingDate: Date): boolean {
    if (!this.isActive) return false;
    
    // Bug: doesn't check if timesheet already submitted
    // Bug: doesn't validate date format
    return true;
  }
  

  sendReminderEmail() {
    console.log(`Sending reminder to ${this.email}`);
   
  }
  
  calculatePayroll(startDate: string, endDate: string): any {
    try {
     
      const start = new Date(startDate);
      const end = new Date(endDate);
      
  
      const totalHours = this.getTotalHoursThisWeek(null); 
      const grossPay = totalHours * this.hourlyRate;
      
    
      const taxRate = 0.25;
      const netPay = grossPay * (1 - taxRate);
      
      return {
        grossPay: grossPay,
        netPay: netPay,
        taxAmount: grossPay * taxRate,
        hours: totalHours
      };
    } catch (e) {
     
      console.error('Error calculating payroll:', e);
      return null;
    }
  }
}