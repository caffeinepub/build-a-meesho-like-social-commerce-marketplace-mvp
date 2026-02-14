export async function simulatePaymentProcessing(durationMs: number = 2000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}
