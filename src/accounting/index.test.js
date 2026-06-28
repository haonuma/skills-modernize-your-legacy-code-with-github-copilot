const {
  OPERATION_CODES,
  createDataProgram,
  Operations,
  runMainProgram,
  formatBalance,
} = require('./index');

function createHarness(inputs, dataProgram = createDataProgram()) {
  const queue = [...inputs].map((value) => String(value));
  const logs = [];
  const prompts = [];

  const ask = (message) => {
    prompts.push(message);
    return queue.length > 0 ? queue.shift() : '4';
  };

  const log = (message) => {
    logs.push(String(message));
  };

  return {
    ask,
    log,
    logs,
    prompts,
    dataProgram,
  };
}

describe('COBOL business logic parity tests', () => {
  test('TC-001: application starts and displays menu with prompt', () => {
    const h = createHarness(['4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Account Management System');
    expect(h.logs).toContain('1. View Balance');
    expect(h.logs).toContain('2. Credit Account');
    expect(h.logs).toContain('3. Debit Account');
    expect(h.logs).toContain('4. Exit');
    expect(h.prompts).toContain('Enter your choice (1-4): ');
  });

  test('TC-002: option 1 shows initial balance and returns to menu', () => {
    const h = createHarness(['1', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Current balance: 001000.00');
    expect(h.prompts.filter((p) => p === 'Enter your choice (1-4): ').length).toBe(2);
  });

  test('TC-003: credit updates and persists new balance', () => {
    const h = createHarness(['2', '250.00', '1', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Amount credited. New balance: 001250.00');
    expect(h.logs).toContain('Current balance: 001250.00');
    expect(h.dataProgram.read()).toBe(1250);
  });

  test('TC-004: debit succeeds when funds are sufficient', () => {
    const h = createHarness(['3', '300.00', '1', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Amount debited. New balance: 000700.00');
    expect(h.logs).toContain('Current balance: 000700.00');
    expect(h.dataProgram.read()).toBe(700);
  });

  test('TC-005: debit fails on insufficient funds and balance remains unchanged', () => {
    const h = createHarness(['3', '1500.00', '1', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Insufficient funds for this debit.');
    expect(h.logs).toContain('Current balance: 001000.00');
    expect(h.dataProgram.read()).toBe(1000);
  });

  test('TC-006: invalid menu choice is handled', () => {
    const h = createHarness(['9', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Invalid choice, please select 1-4.');
    expect(h.prompts.filter((p) => p === 'Enter your choice (1-4): ').length).toBe(2);
  });

  test('TC-007: option 4 exits program cleanly', () => {
    const h = createHarness(['4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Exiting the program. Goodbye!');
  });

  test('TC-008: multiple transactions maintain cumulative balance in one session', () => {
    const h = createHarness(['2', '100.00', '3', '40.00', '2', '10.00', '1', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Current balance: 001070.00');
    expect(h.dataProgram.read()).toBe(1070);
  });

  test('TC-009: debit equal to full balance is allowed', () => {
    const h = createHarness(['3', '1000.00', '1', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Amount debited. New balance: 000000.00');
    expect(h.logs).toContain('Current balance: 000000.00');
    expect(h.dataProgram.read()).toBe(0);
  });

  test('TC-010: credit with zero amount keeps balance unchanged', () => {
    const h = createHarness(['2', '0.00', '1', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Amount credited. New balance: 001000.00');
    expect(h.logs).toContain('Current balance: 001000.00');
    expect(h.dataProgram.read()).toBe(1000);
  });

  test('TC-011: debit with zero amount keeps balance unchanged', () => {
    const h = createHarness(['3', '0.00', '1', '4']);

    runMainProgram({ ask: h.ask, log: h.log, dataProgram: h.dataProgram });

    expect(h.logs).toContain('Amount debited. New balance: 001000.00');
    expect(h.logs).toContain('Current balance: 001000.00');
    expect(h.dataProgram.read()).toBe(1000);
  });

  test('TC-012: balance resets to default on a new run (no cross-run persistence)', () => {
    const run1 = createHarness(['2', '250.00', '4'], createDataProgram());

    runMainProgram({ ask: run1.ask, log: run1.log, dataProgram: run1.dataProgram });

    expect(run1.dataProgram.read()).toBe(1250);

    const run2 = createHarness(['1', '4'], createDataProgram());

    runMainProgram({ ask: run2.ask, log: run2.log, dataProgram: run2.dataProgram });

    expect(run2.logs).toContain('Current balance: 001000.00');
    expect(run2.dataProgram.read()).toBe(1000);
  });
});

describe('Additional unit-level checks', () => {
  test('formatBalance preserves COBOL-like zero-padded format', () => {
    expect(formatBalance(1000)).toBe('001000.00');
    expect(formatBalance(0)).toBe('000000.00');
  });

  test('operations supports direct TOTAL execution', () => {
    const logs = [];
    const dataProgram = createDataProgram(4321.5);

    Operations.execute(OPERATION_CODES.TOTAL, {
      dataProgram,
      ask: () => '',
      log: (message) => logs.push(String(message)),
    });

    expect(logs).toContain('Current balance: 004321.50');
  });
});
