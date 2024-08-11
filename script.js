const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let currentCurrency = 'USD'; // Default currency
let formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: currentCurrency,
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

form.addEventListener("submit", addTransaction);

function updateFormatter() {
  formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currentCurrency,
    signDisplay: 'always',
  });
}

function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  updateFormatter();

  balance.textContent = formatter.format(balanceTotal).substring(1); // Remove currency symbol for consistency
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

function renderList() {
  list.innerHTML = "";

  status.textContent = "";
  if (transactions.length === 0) {
    status.textContent = "No transactions.";
    return;
  }

  transactions.forEach(({ id, name, amount, date, type }) => {
    const sign = type === "income" ? 1 : -1;

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
    
      <div class="action">
        <button class="remove-history-btn" onclick="deleteTransaction(${id})">Delete</button>
      </div>
    `;

    list.appendChild(li);
  });
}


function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
}

function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const type = formData.get("type");

  // Debug logs
  console.log('Selected type:', type);
  console.log('Form Data:', Object.fromEntries(formData.entries()));

  transactions.push({
    id: transactions.length + 1,
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: new Date(formData.get("date")),
    type: type === "income" ? "income" : "expense", // Ensure the type is set correctly
    currency: formData.get("currency"),
  });

  e.target.reset();

  updateTotal();
  saveTransactions();
  renderList();
}

function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log('Saving transactions:', transactions); // Debug log
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

document.addEventListener("DOMContentLoaded", () => {
  updateTotal();
  renderList();
});
