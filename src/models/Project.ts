export interface ProjectData {
  id?: string;
  name?: string;
  client?: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export class Project {

  private _id: string;
  public name: string;
  client: string; 
  private budget: number;
  startDate: Date;
  endDate: Date;
  public status: string;
  
 
  assignedEmployees: string[] = [];
  totalHoursLogged: number = 0;
  remainingBudget: number = 0;
  
  constructor(data: ProjectData) {
  
    this._id = data.id || Math.random().toString();
    this.name = data.name || 'Unnamed Project';
    this.client = data.client || '';
    this.budget = data.budget || 0;
    this.startDate = data.startDate || new Date();
    this.endDate = data.endDate || new Date();
    this.status = data.status || 'active';
    this.remainingBudget = this.budget;
  }
  

  getId(): string {
    return this._id;
  }
  

  getBudget() {
    return this.budget;
  }
  
  setBudget(amount: number) {
    if (amount < 0) {
      console.log('Budget cannot be negative'); 
      return;
    }
    this.budget = amount;
    this.remainingBudget = amount - this.totalHoursLogged * 100; 
  }
  
 
  isOverBudget(): boolean {
    // Hardcoded hourly rate assumption
    const estimatedCost = this.totalHoursLogged * 100;
    return estimatedCost > this.budget;
  }
  

  addTimeEntry(employeeId: string, hours: number, db: any) {
    this.totalHoursLogged += hours;
    
    if (!this.assignedEmployees.includes(employeeId)) {
      this.assignedEmployees.push(employeeId);
    }
    
    const query = `UPDATE projects SET total_hours = ? WHERE id = ?`;
    db.run(query, [this.totalHoursLogged, this._id]);
    
    //TODO add error handling for database operations
  }
  
  GetProjectProgress(): number {
    const today = new Date();
    const totalDuration = this.endDate.getTime() - this.startDate.getTime();
    const elapsed = today.getTime() - this.startDate.getTime();
    
    // Bug: can return negative or > 100% progress
    return (elapsed / totalDuration) * 100;
  }
  
 
  calculateBillableAmount(employeeHourlyRates: {[key: string]: number}): number {
    let total = 0;
    
  
    for (let employeeId of this.assignedEmployees) {
      const rate = employeeHourlyRates[employeeId] || 50; // Default rate 
      
      // Assumes equal hours distribution 
      const employeeHours = this.totalHoursLogged / this.assignedEmployees.length;
      total += employeeHours * rate * 1.2;
    }
    
    return total;
  }
}