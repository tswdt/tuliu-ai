export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.warn(`Retrying... attempts left: ${retries}. Error: ${error}`);
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    // Exponential backoff
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  
  return Promise.race([fn(), timeoutPromise]);
}
