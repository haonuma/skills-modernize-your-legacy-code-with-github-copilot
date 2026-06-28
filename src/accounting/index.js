const readlineSync = require('readline-sync');

const OPERATION_CODES = {
  TOTAL: 'TOTAL ',
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT ',
};

function createDataProgram(initialBalance = 1000.0) {
  let storageBalance = initialBalance;

  return {
    read() {
      return storageBalance;
    },
    write(balance) {
      storageBalance = balance;
    },
  };
}

const DataProgram = createDataProgram();

const Operations = {
  execute(operationType, dependencies = {}) {
    const dataProgram = dependencies.dataProgram || DataProgram;
    const ask = dependencies.ask || ((message) => readlineSync.question(message));
    const log = dependencies.log || console.log;

    if (operationType === OPERATION_CODES.TOTAL) {
      const finalBalance = dataProgram.read();
      log(`Current balance: ${formatBalance(finalBalance)}`);
      return;
    }

    if (operationType === OPERATION_CODES.CREDIT) {
      const amount = promptAmount('Enter credit amount: ', ask);
      const finalBalance = dataProgram.read() + amount;
      dataProgram.write(finalBalance);
      log(`Amount credited. New balance: ${formatBalance(finalBalance)}`);
      return;
    }

    if (operationType === OPERATION_CODES.DEBIT) {
      const amount = promptAmount('Enter debit amount: ', ask);
      const finalBalance = dataProgram.read();

      if (finalBalance >= amount) {
        const updatedBalance = finalBalance - amount;
        dataProgram.write(updatedBalance);
        log(`Amount debited. New balance: ${formatBalance(updatedBalance)}`);
      } else {
        log('Insufficient funds for this debit.');
      }
    }
  },
};

function promptAmount(message, ask = (prompt) => readlineSync.question(prompt)) {
  const input = ask(message).trim();
  const parsed = Number(input);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function formatBalance(value) {
  const [intPart, decimalPart] = value.toFixed(2).split('.');
  return `${intPart.padStart(6, '0')}.${decimalPart}`;
}

function runMainProgram(options = {}) {
  const ask = options.ask || ((prompt) => readlineSync.question(prompt));
  const log = options.log || console.log;
  const dataProgram = options.dataProgram || DataProgram;
  let continueFlag = 'YES';

  while (continueFlag !== 'NO') {
    log('--------------------------------');
    log('Account Management System');
    log('1. View Balance');
    log('2. Credit Account');
    log('3. Debit Account');
    log('4. Exit');
    log('--------------------------------');

    const userChoice = Number(ask('Enter your choice (1-4): ').trim());

    switch (userChoice) {
      case 1:
        Operations.execute(OPERATION_CODES.TOTAL, { ask, log, dataProgram });
        break;
      case 2:
        Operations.execute(OPERATION_CODES.CREDIT, { ask, log, dataProgram });
        break;
      case 3:
        Operations.execute(OPERATION_CODES.DEBIT, { ask, log, dataProgram });
        break;
      case 4:
        continueFlag = 'NO';
        break;
      default:
        log('Invalid choice, please select 1-4.');
        break;
    }
  }

  log('Exiting the program. Goodbye!');
}

if (require.main === module) {
  runMainProgram();
}

module.exports = {
  OPERATION_CODES,
  createDataProgram,
  DataProgram,
  Operations,
  promptAmount,
  formatBalance,
  runMainProgram,
};
