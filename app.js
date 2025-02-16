class ExpenseTracker {
    constructor() {
        const storedTransactions = JSON.parse(localStorage.getItem('transactions'));
        
        // Add dummy data only if no transactions exist
        if (!storedTransactions) {
            const dummyTransactions = [
                {
                    id: Date.now() - 2592000000, // 30 days ago
                    amount: 3000,
                    type: 'income',
                    category: 'salary',
                    date: '2024-02-01',
                    description: 'Monthly Salary'
                },
                {
                    id: Date.now() - 2505600000, // 29 days ago
                    amount: 800,
                    type: 'expense',
                    category: 'rent',
                    date: '2024-02-02',
                    description: 'Monthly Rent'
                },
                {
                    id: Date.now() - 2419200000, // 28 days ago
                    amount: 150,
                    type: 'expense',
                    category: 'utilities',
                    date: '2024-02-03',
                    description: 'Electricity Bill'
                },
                {
                    id: Date.now() - 1728000000, // 20 days ago
                    amount: 200,
                    type: 'expense',
                    category: 'food',
                    date: '2024-02-11',
                    description: 'Grocery Shopping'
                },
                {
                    id: Date.now() - 1209600000, // 14 days ago
                    amount: 500,
                    type: 'income',
                    category: 'freelance',
                    date: '2024-02-17',
                    description: 'Freelance Project'
                },
                {
                    id: Date.now() - 864000000, // 10 days ago
                    amount: 75,
                    type: 'expense',
                    category: 'entertainment',
                    date: '2024-02-21',
                    description: 'Movie Night'
                },
                {
                    id: Date.now() - 432000000, // 5 days ago
                    amount: 120,
                    type: 'expense',
                    category: 'transport',
                    date: '2024-02-26',
                    description: 'Fuel'
                },
                {
                    id: Date.now() - 259200000, // 3 days ago
                    amount: 250,
                    type: 'expense',
                    category: 'food',
                    date: '2024-02-28',
                    description: 'Restaurant Dinner'
                },
                {
                    id: Date.now() - 86400000, // 1 day ago
                    amount: 1000,
                    type: 'income',
                    category: 'bonus',
                    date: '2024-03-01',
                    description: 'Performance Bonus'
                },
                {
                    id: Date.now(),
                    amount: 180,
                    type: 'expense',
                    category: 'utilities',
                    date: '2024-03-02',
                    description: 'Internet Bill'
                }
            ];
            
            localStorage.setItem('transactions', JSON.stringify(dummyTransactions));
            this.transactions = dummyTransactions;
        } else {
            this.transactions = storedTransactions;
        }

        this.form = document.getElementById('transactionForm');
        this.searchInput = document.getElementById('searchTransaction');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.expenseChart = null;
        this.trendChart = null;

        // Initialize theme and currency
        this.initializeTheme();
        this.initializeCurrency();
        
        // Initialize event listeners and UI
        this.initializeEventListeners();
        this.updateDashboard();
        this.renderTransactions();
        this.initializeCharts();
        
        // Initialize sidebar toggle
        this.initializeSidebarToggle();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.searchInput.addEventListener('input', () => this.filterTransactions());
        this.categoryFilter.addEventListener('change', () => this.filterTransactions());
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const transaction = {
            id: Date.now(),
            amount: parseFloat(document.getElementById('amount').value),
            type: document.getElementById('type').value,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value
        };

        this.transactions.push(transaction);
        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderTransactions();
        this.updateCharts();
        
        this.form.reset();
        this.showNotification('Transaction added successfully!');
    }

    updateDashboard() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        document.getElementById('totalBalance').textContent = this.formatCurrency(balance);
        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('totalExpense').textContent = this.formatCurrency(expenses);
    }

    renderTransactions() {
        const tableDiv = document.getElementById('transactionTable');
        const filteredTransactions = this.getFilteredTransactions();

        const transactionHTML = filteredTransactions.map(t => `
            <div class="transaction-item fade-in">
                <div class="transaction-info">
                    <strong>${t.description}</strong>
                    <div>${t.category} - ${t.date}</div>
                </div>
                <div class="transaction-amount">
                    <span style="color: ${t.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)'}">
                        ${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}
                    </span>
                    <div class="actions">
                        <button class="edit-btn" onclick="expenseTracker.editTransaction(${t.id})">Edit</button>
                        <button class="delete-btn" onclick="expenseTracker.deleteTransaction(${t.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

        tableDiv.innerHTML = transactionHTML;
    }

    getFilteredTransactions() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const category = this.categoryFilter.value;

        return this.transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || t.category === category;
            return matchesSearch && matchesCategory;
        });
    }

    initializeCharts() {
        // Expense by Category Chart
        const expenseCtx = document.getElementById('expenseChart').getContext('2d');
        this.expenseChart = new Chart(expenseCtx, {
            type: 'pie',
            data: this.getExpenseChartData(),
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    }
                }
            }
        });

        // Expense Trend Chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        this.trendChart = new Chart(trendCtx, {
            type: 'line',
            data: this.getTrendChartData(),
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Expense Trend'
                    }
                }
            }
        });
    }

    getExpenseChartData() {
        const expensesByCategory = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });

        return {
            labels: Object.keys(expensesByCategory),
            datasets: [{
                data: Object.values(expensesByCategory),
                backgroundColor: [
                    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'
                ]
            }]
        };
    }

    getTrendChartData() {
        const monthlyExpenses = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const month = t.date.substring(0, 7);
                monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
            });

        return {
            labels: Object.keys(monthlyExpenses),
            datasets: [{
                label: 'Monthly Expenses',
                data: Object.values(monthlyExpenses),
                borderColor: '#3b82f6',
                tension: 0.1
            }]
        };
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.updateDashboard();
        this.renderTransactions();
        this.updateCharts();
        this.showNotification('Transaction deleted successfully!');
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;

        document.getElementById('amount').value = transaction.amount;
        document.getElementById('type').value = transaction.type;
        document.getElementById('category').value = transaction.category;
        document.getElementById('date').value = transaction.date;
        document.getElementById('description').value = transaction.description;

        this.deleteTransaction(id);
    }

    updateCharts() {
        this.expenseChart.data = this.getExpenseChartData();
        this.expenseChart.update();
        
        this.trendChart.data = this.getTrendChartData();
        this.trendChart.update();
    }

    saveToLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification animate__animated animate__fadeIn';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('animate__fadeIn');
            notification.classList.add('animate__fadeOut');
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }

    filterTransactions() {
        this.renderTransactions();
    }

    initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme');
        
        // Set initial theme
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            themeToggle.checked = true;
        }
        
        // Theme toggle listener
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.documentElement.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
            // Update charts for theme change
            this.updateCharts();
        });
    }

    initializeCurrency() {
        this.currency = localStorage.getItem('currency') || 'USD';
        this.currencySymbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥'
        };

        const currencySelect = document.getElementById('currencySelect');
        currencySelect.value = this.currency;
        
        currencySelect.addEventListener('change', (e) => {
            this.currency = e.target.value;
            localStorage.setItem('currency', this.currency);
            this.updateDashboard();
            this.renderTransactions();
        });
    }

    formatCurrency(amount) {
        return `${this.currencySymbols[this.currency]}${amount.toFixed(2)}`;
    }

    initializeSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // Toggle sidebar
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-mobile-closed');
            sidebarToggle.classList.toggle('menu-open');
            overlay.classList.toggle('active');
        });
        
        // Close sidebar when clicking overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.add('sidebar-mobile-closed');
            sidebarToggle.classList.remove('menu-open');
            overlay.classList.remove('active');
        });
        
        // Close sidebar when window is resized to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('sidebar-mobile-closed');
                sidebarToggle.classList.remove('menu-open');
                overlay.classList.remove('active');
            } else {
                sidebar.classList.add('sidebar-mobile-closed');
            }
        });
        
        // Initial state for mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.add('sidebar-mobile-closed');
        }
    }
}

// Initialize the expense tracker
const expenseTracker = new ExpenseTracker(); 