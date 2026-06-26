import dotenv from 'dotenv';
import path from 'path';

// Load environment variables if needed
dotenv.config({ path: path.resolve(process.cwd(), 'env/.env.dev') });

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4100';

async function login() {
  const username = 'Rohit';
  const password = 'LEFT';

  console.log(`Authenticating against ${BASE_URL}/api/mobile/auth/login with user "${username}"...`);
  
  const response = await fetch(`${BASE_URL}/api/mobile/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Login failed with status ${response.status}: ${errText}`);
  }

  const json = await response.json() as any;
  if (!json.success || !json.data?.access_token) {
    throw new Error(`Login response did not return token: ${JSON.stringify(json)}`);
  }

  return json.data.access_token;
}

async function fetchLatestLoanId(token: string): Promise<string | null> {
  console.log(`Fetching latest loan ID dynamically from API...`);
  const response = await fetch(`${BASE_URL}/api/mobile/loan-requests`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to list loans with status ${response.status}: ${errText}`);
  }

  const json = await response.json() as any;
  const items = json.data?.data || json.data?.items || json.data;
  if (Array.isArray(items) && items.length > 0) {
    const latestLoan = items[0];
    const loanId = latestLoan.pk_loan_id;
    return loanId ? String(loanId) : null;
  }

  return null;
}

async function fetchLoanDetails(loanId: string, token: string) {
  console.log(`Fetching loan details for ID "${loanId}" via API...`);
  const response = await fetch(`${BASE_URL}/api/mobile/loan-requests/${loanId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch loan details with status ${response.status}: ${errText}`);
  }

  const json = await response.json() as any;
  return json.data;
}

async function run() {
  try {
    const token = await login();
    console.log('Authentication successful.');

    const argId = process.argv[2];
    let loanId = argId;

    if (!loanId) {
      loanId = await fetchLatestLoanId(token) || '';
      if (!loanId) {
        console.log('No loan requests found via API.');
        process.exit(0);
      }
      console.log(`Found latest loan ID dynamically: "${loanId}"`);
    }

    console.log(`\n--- Fetching Loan Details for ID "${loanId}" ---`);
    const details = await fetchLoanDetails(loanId, token);

    // Compute loan totals dynamically from the schedule
    const totalPrincipal = parseFloat(details.loan_amount) || 0;
    let totalInterest = 0;
    let totalReturnAmount = 0;
    let totalPendingAmount = 0;
    let totalPaidAmount = 0;
    let pendingCount = 0;
    let paidCount = 0;

    if (Array.isArray(details.schedule)) {
      for (const inst of details.schedule) {
        const interest = parseFloat(inst.interest_amount) || 0;
        const payable = parseFloat(inst.total_payable) || 0;
        
        totalInterest += interest;
        totalReturnAmount += payable;

        if (inst.status === 'Pending' || !inst.status) {
          totalPendingAmount += payable;
          pendingCount++;
        } else {
          totalPaidAmount += payable;
          paidCount++;
        }
      }
    }

    console.log(`\n==================================================`);
    console.log(`             LOAN ACCOUNT SUMMARY                `);
    console.log(`==================================================`);
    console.log(`Employee Name:       ${details.employee_name || 'N/A'}`);
    console.log(`Employee ID (FK):    ${details.fk_emp_id}`);
    console.log(`Loan Reference No:   ${details.loan_no}`);
    console.log(`Loan Type:           ${details.loan_type}`);
    console.log(`Calculation Method:  ${details.calc_method}`);
    console.log(`Payment Status:      ${details.last_status || 'Applied'}`);
    console.log(`Deduction Starts:    ${details.deduct_from_month}`);
    console.log(`Tenure:              ${details.installments} Months`);
    console.log(`Interest Rate:       ${details.interest_rate}%`);
    console.log(`--------------------------------------------------`);
    console.log(`Principal Applied:   ₹${totalPrincipal.toFixed(2)}`);
    console.log(`Total Interest Acc:  ₹${totalInterest.toFixed(2)}`);
    console.log(`Total Return Amount: ₹${totalReturnAmount.toFixed(2)}`);
    console.log(`--------------------------------------------------`);
    console.log(`Total Returned/Paid: ₹${totalPaidAmount.toFixed(2)} (${paidCount} Paid Installments)`);
    console.log(`Total Outstanding:   ₹${totalPendingAmount.toFixed(2)} (${pendingCount} Pending Installments)`);
    console.log(`==================================================\n`);

    console.log('Raw Loan Details:', JSON.stringify({ ...details, schedule: '[Schedule list hidden for summary]' }, null, 2));

  } catch (err: any) {
    console.error('Error during execution:', err.message || err);
    process.exit(1);
  }

  process.exit(0);
}

run().catch(console.error);
