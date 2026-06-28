# COBOL Student Account System Test Plan

This test plan covers the current COBOL implementation and business logic in `main.cob`, `operations.cob`, and `data.cob`.
Use this as the baseline for stakeholder validation, then for Node.js unit/integration test design.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Application starts and displays the account menu | 1. `accountsystem` binary is compiled.<br>2. No running instance is required. | 1. Run `./accountsystem`. | 1. Menu is displayed with options 1-4.<br>2. Prompt shows `Enter your choice (1-4):`. | TBD | TBD | Baseline startup check. |
| TC-002 | Option 1 shows initial balance | 1. Fresh app start (no prior credit/debit in current run). | 1. Start app.<br>2. Enter `1`. | 1. Balance is shown as `001000.00` (or equivalent formatted 1000.00).<br>2. App returns to menu loop. | TBD | TBD | Verifies default starting balance behavior. |
| TC-003 | Option 2 credits account and persists new balance | 1. Fresh app start (balance = 1000.00). | 1. Start app.<br>2. Enter `2`.<br>3. Enter credit amount `250.00`.<br>4. Enter `1` to view balance. | 1. Credit success message is shown.<br>2. New balance becomes `1250.00` (formatted by COBOL display).<br>3. View Balance reflects the updated amount. | TBD | TBD | Confirms READ -> ADD -> WRITE flow. |
| TC-004 | Option 3 debits account when funds are sufficient | 1. Fresh app start (balance = 1000.00). | 1. Start app.<br>2. Enter `3`.<br>3. Enter debit amount `300.00`.<br>4. Enter `1` to view balance. | 1. Debit success message is shown.<br>2. New balance becomes `700.00`.<br>3. View Balance reflects the updated amount. | TBD | TBD | Confirms READ -> SUBTRACT -> WRITE flow for valid debit. |
| TC-005 | Option 3 rejects debit when funds are insufficient | 1. Fresh app start (balance = 1000.00). | 1. Start app.<br>2. Enter `3`.<br>3. Enter debit amount `1500.00`.<br>4. Enter `1` to view balance. | 1. Message `Insufficient funds for this debit.` is shown.<br>2. Balance remains unchanged at `1000.00`. | TBD | TBD | Core business rule: no negative balance. |
| TC-006 | Invalid menu choice is handled | 1. App is running at menu prompt. | 1. Enter `9` (or any value outside 1-4). | 1. Message `Invalid choice, please select 1-4.` is shown.<br>2. App remains in menu loop. | TBD | TBD | Validates `WHEN OTHER` path. |
| TC-007 | Option 4 exits application | 1. App is running at menu prompt. | 1. Enter `4`. | 1. `Exiting the program. Goodbye!` is displayed.<br>2. Process terminates cleanly. | TBD | TBD | Validates loop termination via `CONTINUE-FLAG = 'NO'`. |
| TC-008 | Multiple transactions in one session keep cumulative balance | 1. Fresh app start (balance = 1000.00). | 1. Enter `2`, then `100.00`.<br>2. Enter `3`, then `40.00`.<br>3. Enter `2`, then `10.00`.<br>4. Enter `1`. | 1. Final balance is `1070.00`.<br>2. Each transaction updates balance used by the next transaction. | TBD | TBD | Verifies in-memory persistence within the same run. |
| TC-009 | Debit equal to full balance is allowed | 1. Fresh app start (balance = 1000.00). | 1. Enter `3`.<br>2. Enter `1000.00`.<br>3. Enter `1`. | 1. Debit succeeds (because condition is `>=`).<br>2. Balance becomes `0.00`. | TBD | TBD | Boundary test for debit condition. |
| TC-010 | Credit with zero amount keeps balance unchanged | 1. Fresh app start (balance = 1000.00). | 1. Enter `2`.<br>2. Enter `0.00`.<br>3. Enter `1`. | 1. Credit flow completes without error.<br>2. Balance remains `1000.00`. | TBD | TBD | Implementation allows zero-value transactions. |
| TC-011 | Debit with zero amount keeps balance unchanged | 1. Fresh app start (balance = 1000.00). | 1. Enter `3`.<br>2. Enter `0.00`.<br>3. Enter `1`. | 1. Debit flow completes as sufficient funds condition passes.<br>2. Balance remains `1000.00`. | TBD | TBD | Captures current behavior for zero debit. |
| TC-012 | Balance resets to default on new process run | 1. Previous run changed balance to non-default (for example 1250.00). | 1. Exit app (`4`).<br>2. Start app again.<br>3. Enter `1`. | 1. Balance is reset to initial `1000.00` on new run.<br>2. No cross-run persistence exists. | TBD | TBD | Important implementation constraint for modernization. |

## Notes for Node.js Migration

- Convert each test case into:
  - Unit tests for operation rules (credit, debit, insufficient funds, validation branches).
  - Integration tests for menu command -> operation dispatch -> data persistence behavior.
- Preserve observed COBOL behavior first (including formatting and zero-amount behavior), then align with future business decisions where needed.
