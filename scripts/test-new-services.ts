import { getBalance, addCredit, deductCredit } from '../lib/services/wallet';
import { validateText, validateImage } from '../lib/services/safety';

async function testWallet() {
  console.log('--- Testing Wallet Service ---');
  const userId = 'test_user_' + Date.now();
  
  try {
    let wallet = await getBalance(userId);
    console.log('Initial balance:', wallet.balance);

    wallet = await addCredit(userId, 10);
    console.log('Balance after recharge:', wallet.balance);

    wallet = await deductCredit(userId, 1);
    console.log('Balance after deduction:', wallet.balance);
    console.log('Transactions:', wallet.transactions.length);

    try {
      await deductCredit(userId, 100);
    } catch (e: any) {
      console.log('Insufficient funds check passed:', e.message);
    }
  } catch (e) {
    console.error('Wallet test failed:', e);
  }
}

async function testSafety() {
  console.log('\n--- Testing Safety Service ---');
  // Note: This will fail if credentials are not set, which is expected in this environment
  try {
    const textSafe = await validateText('Hello world');
    console.log('Text safety check (normal):', textSafe);

    const imageSafe = await validateImage('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png');
    console.log('Image safety check (normal):', imageSafe);
  } catch (e) {
    console.log('Safety test failed (likely due to missing credentials):', e);
  }
}

async function run() {
  await testWallet();
  // await testSafety(); // Skip safety test as it requires real credentials
}

run();
