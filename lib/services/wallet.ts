import { getJson, putJson } from './cos';

export interface Transaction {
  amount: number;
  date: number;
  type: string;
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}

const getWalletPath = (userId: string) => `users/${userId}/wallet.json`;

/**
 * 获取用户钱包余额
 * 如果文件不存在，默认返回余额为 0
 */
export async function getBalance(userId: string): Promise<Wallet> {
  const path = getWalletPath(userId);
  const wallet = await getJson<Wallet>(path);
  
  if (!wallet) {
    return { balance: 0, transactions: [] };
  }
  
  return wallet;
}

/**
 * 扣除用户积分
 * 1. 读取钱包数据
 * 2. 检查余额是否充足
 * 3. 扣除积分并记录交易
 * 4. 写回 COS
 */
export async function deductCredit(userId: string, amount: number): Promise<Wallet> {
  const path = getWalletPath(userId);
  const wallet = await getBalance(userId);

  if (wallet.balance < amount) {
    throw new Error(`余额不足: 当前余额 ${wallet.balance}, 需要 ${amount}`);
  }

  const updatedWallet: Wallet = {
    balance: wallet.balance - amount,
    transactions: [
      {
        amount: -amount,
        date: Date.now(),
        type: 'generation_deduction',
      },
      ...wallet.transactions,
    ].slice(0, 50), // 只保留最近 50 条记录
  };

  await putJson(path, updatedWallet);
  return updatedWallet;
}

/**
 * 充值积分（可选，方便后续扩展或测试）
 */
export async function addCredit(userId: string, amount: number): Promise<Wallet> {
  const path = getWalletPath(userId);
  const wallet = await getBalance(userId);

  const updatedWallet: Wallet = {
    balance: wallet.balance + amount,
    transactions: [
      {
        amount: amount,
        date: Date.now(),
        type: 'recharge',
      },
      ...wallet.transactions,
    ].slice(0, 50),
  };

  await putJson(path, updatedWallet);
  return updatedWallet;
}
