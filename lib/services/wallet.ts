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
export async function getBalance(userId: string): Promise<{ wallet: Wallet; etag?: string }> {
  const path = getWalletPath(userId);
  const { data: wallet, etag } = await getJson<Wallet>(path);
  
  if (!wallet) {
    return { wallet: { balance: 0, transactions: [] } };
  }
  
  return { wallet, etag };
}

/**
 * 扣除用户积分
 */
export async function deductCredit(userId: string, amount: number): Promise<Wallet> {
  const path = getWalletPath(userId);
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const { wallet, etag } = await getBalance(userId);

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
        ].slice(0, 50),
      };

      await putJson(path, updatedWallet, etag);
      return updatedWallet;
    } catch (error: any) {
      if (error.message.includes('Precondition Failed') && attempts < maxAttempts - 1) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100 * attempts));
        continue;
      }
      throw error;
    }
  }
  throw new Error('扣费失败: 钱包更新并发冲突');
}

/**
 * 充值积分
 */
export async function addCredit(userId: string, amount: number): Promise<Wallet> {
  const path = getWalletPath(userId);
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const { wallet, etag } = await getBalance(userId);

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

      await putJson(path, updatedWallet, etag);
      return updatedWallet;
    } catch (error: any) {
      if (error.message.includes('Precondition Failed') && attempts < maxAttempts - 1) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100 * attempts));
        continue;
      }
      throw error;
    }
  }
  throw new Error('充值失败: 钱包更新并发冲突');
}
