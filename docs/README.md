# COBOL Student Account System Documentation

## Overview
This project implements a simple menu-driven account management flow for student accounts.
The logic is split into three COBOL programs:
- `MainProgram` for user interaction and menu control
- `Operations` for business operations (view, credit, debit)
- `DataProgram` for balance storage read/write

## File Purposes

### src/cobol/main.cob
Purpose:
- Entry point of the application.
- Displays the account management menu in a loop.
- Routes the selected option to the operations module.

Key logic:
- Uses `PERFORM UNTIL CONTINUE-FLAG = 'NO'` to keep the app running.
- Accepts menu choice `1-4`.
- Calls `Operations` with operation codes:
  - `TOTAL ` for viewing balance
  - `CREDIT` for adding funds
  - `DEBIT ` for subtracting funds
- Stops when the user selects `4`.

### src/cobol/operations.cob
Purpose:
- Implements account transaction behavior.
- Handles user amount input for credit/debit operations.
- Coordinates with `DataProgram` for persistent balance access.

Key logic:
- `TOTAL `:
  - Calls `DataProgram` with `READ`.
  - Displays current balance.
- `CREDIT`:
  - Accepts credit amount.
  - Reads current balance.
  - Adds amount to balance.
  - Writes updated balance.
- `DEBIT `:
  - Accepts debit amount.
  - Reads current balance.
  - Debits only if funds are sufficient.
  - Writes updated balance only on successful debit.

### src/cobol/data.cob
Purpose:
- Central storage handler for the account balance.
- Exposes simple operation-based interface for data access.

Key logic:
- Maintains `STORAGE-BALANCE` in working storage.
- `READ` operation copies stored balance to the caller.
- `WRITE` operation updates stored balance from the caller.

## Business Rules for Student Accounts
The following rules are implemented by the current COBOL logic:

1. Single account balance model
- The system maintains one active balance value (`STORAGE-BALANCE`) for the running program context.

2. Starting balance
- The initial student account balance is `1000.00`.

3. Valid menu actions
- `1`: view balance
- `2`: credit account
- `3`: debit account
- `4`: exit
- Any other choice is rejected with an invalid selection message.

4. Credit rule
- Credited amount is added directly to the current balance.

5. Debit rule (insufficient funds protection)
- A debit is allowed only when `balance >= debit amount`.
- If funds are insufficient, the balance is unchanged and an error message is shown.

6. Balance update flow
- All transactional updates follow read-then-write through `DataProgram`.

## Notes and Constraints
- The balance field uses `PIC 9(6)V99`, allowing up to six integer digits and two decimal digits.
- The current implementation has no student identifier input; it behaves as a single-account system rather than multi-student account management.
- Balance persistence is in-memory for program execution context and not backed by an external file or database.
