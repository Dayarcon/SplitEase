// Calculate balances for a group
export function calculateBalances(
  expenses: { id: number; amount: number; paidById: number; splits: { userId: number; amount: number }[] }[]
) {
  const balances: { [userId: number]: number } = {};

  for (const expense of expenses) {
    // Add amount to the person who paid
    if (!balances[expense.paidById]) {
      balances[expense.paidById] = 0;
    }
    balances[expense.paidById] += expense.amount;

    // Subtract from each person who owes
    for (const split of expense.splits) {
      if (!balances[split.userId]) {
        balances[split.userId] = 0;
      }
      balances[split.userId] -= split.amount;
    }
  }

  return balances;
}

// Calculate minimum transactions needed to settle debts
export function minimizeTransactions(balances: { [userId: number]: number }) {
  // Round each balance to 2 decimal places to eliminate floating-point drift
  // (e.g. -0.0001 after settlements should be treated as 0, not as a debt)
  const EPSILON = 0.5; // anything less than ₹0.50 rounds to ₹0 — ignore it

  const debtors = Object.entries(balances)
    .filter(([_, bal]) => bal < -EPSILON)
    .map(([id, bal]) => ({ id: parseInt(id), amount: Math.abs(bal) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.entries(balances)
    .filter(([_, bal]) => bal > EPSILON)
    .map(([id, bal]) => ({ id: parseInt(id), amount: bal }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: { fromUserId: number; toUserId: number; amount: number }[] = [];

  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    // Only record if the transaction is worth showing (≥ ₹1 when rounded)
    if (Math.round(amount) >= 1) {
      transactions.push({
        fromUserId: debtor.id,
        toUserId: creditor.id,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= EPSILON) i++;
    if (creditor.amount <= EPSILON) j++;
  }

  return transactions;
}
