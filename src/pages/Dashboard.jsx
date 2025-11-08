// Dashboard.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Receipt,
  PieChart
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useBudgets } from "@/contexts/BudgetContext";
import { useState } from "react";
import heroImage from "@/assets/dashboard-hero.jpg";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import UploadReceiptModal from "@/components/modals/UploadReceiptModal";
import { formatINR } from "@/lib/utils";
import Chatbot from "@/components/Chatbot"; // ✅ NEW IMPORT

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--success))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--destructive))",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, getFinancialMetrics, getSpendingByCategory } = useTransactions();
  const { getBudgetMetrics } = useBudgets();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  const metrics = getFinancialMetrics();
  const { totalIncome, totalExpenses, netSavings, savingsRate } = metrics;
  const budgetMetrics = getBudgetMetrics();
  const { budgetCategories, budgetUsedPercentage, totalBudget, totalSpent } = budgetMetrics;
  
  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5).map(t => ({
    id: t.id,
    description: t.description,
    amount: t.type === 'income' ? t.amount : -t.amount,
    category: t.category,
    date: new Date(t.date).toLocaleDateString(),
    type: t.type
  }));

  // Generate monthly data from actual transactions (last 6 months)
  const generateMonthlyData = () => {
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth();
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === monthNum && 
               transactionDate.getFullYear() === year;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      monthlyData.push({
        month,
        income: Math.round(income),
        expenses: Math.round(expenses)
      });
    }
    
    return monthlyData;
  };

  const monthlyData = generateMonthlyData();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Financial Dashboard" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative p-8 space-y-4">
          <h1 className="text-4xl font-bold">Welcome back, {user?.email?.split('@')[0] || 'User'}!</h1>
          <p className="text-lg opacity-90">Here's your financial overview for this month</p>    
          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="gap-2" onClick={() => setShowTransactionModal(true)}>
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
            <Button variant="secondary" className="gap-2" onClick={() => setShowReceiptModal(true)}>
              <Receipt className="h-4 w-4" />
              Upload Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {/* ... existing code remains unchanged ... */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        {/* ... existing chart code ... */}
        
        {/* Budget Overview */}
        {/* ... existing code ... */}
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your most recent spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet.</p>
                <p className="text-sm">Add your first transaction to see it here!</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.amount > 0 ? "bg-success/20" : "bg-destructive/20"
                    }`}>
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    transaction.amount > 0 ? "text-success" : "text-destructive"
                  }`}>
                    {transaction.amount > 0 ? "+" : ""}{formatINR(Math.abs(transaction.amount))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ Chatbot Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>MoneyMind AI Assistant</CardTitle>
          <CardDescription>Ask questions about your expenses or get advice</CardDescription>
        </CardHeader>
        <CardContent>
          <Chatbot userId={user?.id || 1} /> {/* ✅ chatbot component */}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddTransactionModal 
        open={showTransactionModal} 
        onOpenChange={setShowTransactionModal} 
      />
      <UploadReceiptModal 
        open={showReceiptModal} 
        onOpenChange={setShowReceiptModal} 
      />
    </div>
  );
}
