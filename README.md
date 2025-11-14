# Legacy Timesheet System - AI Code Retreat Challenge
Congratulations, you have just joined the engineering team at TimeTrakker. 
Welcome to the Timesheet System codebase!
The team could really do with your help! This TypeScript application is a timesheet entry and management system that has accumulated technical debt over time and contains several known issues that need to be addressed.

## Challenge Overview
Your mission is to improve this legacy codebase by adding new features while fixing existing bugs and improving code quality.

## Current System State

### What's Working ✅
- Employee time entry creation
- Weekly timesheet view
- Basic project assignment
- Time calculation (with bugs!)
- Simple approval workflow
- SQLite database storage

### Known Issues 🐛

The codebase contains several bugs and design problems:

- ❌ **High coupling** between components and services
- ❌ **Inconsistent code styles** and naming conventions  
- ❌ **Known bugs** in time calculation and validation
- ❌ **Poor error handling** throughout the application
- ❌ **Mixed responsibilities** in classes and components
- ❌ **Limited test coverage** (~5-10%) with some failing tests
- ❌ **SQL injection vulnerabilities** 
- ❌ **Poor state management** and data flow



## Known Bugs and Issues

### Critical Issues
1. **Time Calculation Bug** (`src/models/TimeEntry.ts:28`)
    - Doesn't handle overnight shifts properly
2. **Negative Hours** (`src/models/TimeEntry.ts:31`)
    - Can calculate negative hours 
3. **Async Bug** (`src/models/TimeEntry.ts:96`)
    - Async save() called without await
4. **General Code Quality Issues:**
   - Inconsistent coding patterns
   - Lack of proper validation
   - Limited test coverage 

There will be bugs or code issues you will encounter not covered in the list above, so you'll have to keep your wits about you!          

## Setup Instructions

```bash
# Install dependencies
npm install

# Run tests 
npm test

# Run with coverage
npm test:coverage

# Build the project
npm run build

# Start the development server
npm run dev
# Application runs in the browser at http://localhost:3001
```
### Database
The application uses SQLite with automatic initialisation. The database file: `timesheet.db`

Default test data includes:
- 2 employees (EMP001: John Doe, EMP002: Jane Smith)
- 2 projects (Website Redesign, Mobile App Development)

## API Endpoints
- `GET /api/timeentries?employee=EMP001&week=2024-01-01` - Get time entries
- `POST /api/timeentries` - Create new time entry
- `DELETE /api/timeentries/:id` - Delete time entry  
- `POST /api/timesheet/submit` - Submit weekly timesheet
- `GET /api/projects` - Get active projects
- `GET /api/employees` - Get active employees

## ⚠️ Important: Some Tests Are Passing When They Should Not!
This codebase contains tests that are currently passing due to incorrect logic. You'll need to read the tests to understand some of the bugs you need to fix. This gives you a clear starting point while simulating real legacy code scenarios. There are other bugs in this codebase also that are not currently covered by any tests.

## Challenge Tasks

**Task 1: Address the tests that are currently passing that should not be. Fix the logic and update the tests**

**Task 2: Fix the critical bugs listed above while maintaining existing functionality along with any other bugs you find. Write tests as you go!**

**Task 3:  New Feature - Overtime Tracking** 
sAdd a comprehensive overtime tracking feature that:

1. **Automatically calculates overtime** for any hours over 40 per week
2. **Applies different rates** for overtime (1.5x regular rate)
3. **Shows overtime breakdown** in the UI with visual indicators
4. **Sends notifications** when employees approach or exceed overtime
5. **Generates overtime reports** for managers

#### Success Criteria:
- Overtime is calculated correctly for various scenarios
- UI clearly shows regular vs overtime hours
- Data is persisted properly in the database
- Feature is covered by tests
- Code follows better design patterns

**Task 4:  Architecture Improvement** 
Refactor the codebase to improve:
- Separation of concerns
- Dependency injection
- Error handling consistency
- Test coverage
- Performance optimization

## Getting Started

1. **Explore the codebase** - Start by running the existing tests and understanding the current structure
2. **Identify the bugs** - Run the application and try different scenarios to find issues
3. **Plan your approach** - Decide which bugs to fix first and how to approach the feature implementation
4. **Test as you go** - Write tests for your fixes and new features

## Deliverables

At the end of the session, be prepared to:
1. Demonstrate your working solution
2. Explain your approach and decisions
3. Discuss any tradeoffs you made
4. Share what you learned about working with/without AI assistance

Good luck, and happy coding! 🚀

---

*This challenge is designed to simulate real-world legacy code scenarios where you need to understand, fix, and extend existing systems while maintaining backward compatibility.*




