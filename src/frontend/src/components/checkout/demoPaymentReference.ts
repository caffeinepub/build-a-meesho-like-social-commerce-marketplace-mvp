export function generateDemoTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
}

export function storeDemoTransactionId(orderId: string, transactionId: string): void {
  try {
    sessionStorage.setItem(`demo_txn_${orderId}`, transactionId);
  } catch (error) {
    console.error('Failed to store transaction ID:', error);
  }
}

export function getDemoTransactionId(orderId: string): string | null {
  try {
    return sessionStorage.getItem(`demo_txn_${orderId}`);
  } catch (error) {
    console.error('Failed to retrieve transaction ID:', error);
    return null;
  }
}

export function clearDemoTransactionId(orderId: string): void {
  try {
    sessionStorage.removeItem(`demo_txn_${orderId}`);
  } catch (error) {
    console.error('Failed to clear transaction ID:', error);
  }
}
