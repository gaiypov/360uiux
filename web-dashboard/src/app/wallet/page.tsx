import { Plus, FileText, BarChart3, ArrowUpRight, ArrowDownLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const transactions = [
  {
    id: 1,
    type: 'deposit' as const,
    description: 'Пополнение через Тинькофф',
    amount: 5000,
    date: '05.11.2025',
    status: 'completed' as const,
  },
  {
    id: 2,
    type: 'withdrawal' as const,
    description: 'Поднятие вакансии в топ',
    amount: -500,
    date: '04.11.2025',
    status: 'completed' as const,
  },
  {
    id: 3,
    type: 'withdrawal' as const,
    description: 'Размещение вакансии "Официант"',
    amount: -1000,
    date: '03.11.2025',
    status: 'completed' as const,
  },
  {
    id: 4,
    type: 'deposit' as const,
    description: 'Пополнение через Альфа-Банк',
    amount: 10000,
    date: '02.11.2025',
    status: 'completed' as const,
  },
  {
    id: 5,
    type: 'withdrawal' as const,
    description: 'Размещение вакансии "Бармен"',
    amount: -1000,
    date: '01.11.2025',
    status: 'completed' as const,
  },
];

export default function WalletPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-lg font-bold text-foreground">Кошелек</h1>
        <p className="mt-2 text-foreground-secondary">Управление балансом и транзакциями</p>
      </div>

      {/* Balance Card */}
      <Card className="overflow-hidden border-none bg-gradient-primary">
        <CardContent className="p-8">
          <div className="mb-2 text-sm font-medium text-background/70">Текущий баланс</div>
          <div className="mb-6 text-number-display font-bold text-background">15 350 ₽</div>
          <Button className="bg-background/20 text-background hover:bg-background/30">
            <Plus className="mr-2 h-5 w-5" />
            Пополнить кошелек
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="mb-2 text-sm font-medium text-foreground-secondary">
              Всего пополнено
            </div>
            <div className="text-number-lg font-bold text-foreground">15 000 ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="mb-2 text-sm font-medium text-foreground-secondary">
              Всего потрачено
            </div>
            <div className="text-number-lg font-bold text-foreground">2 500 ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="mb-2 text-sm font-medium text-foreground-secondary">Транзакций</div>
            <div className="text-number-lg font-bold text-foreground">5</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button variant="gradient" className="gap-2">
          <Plus className="h-5 w-5" />
          Пополнить
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText className="h-5 w-5" />
          Счета
        </Button>
        <Button variant="outline" className="gap-2">
          <BarChart3 className="h-5 w-5" />
          Аналитика
        </Button>
      </div>

      {/* Transactions History */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-6 text-display-sm font-semibold text-foreground">
            История транзакций
          </h2>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      transaction.type === 'deposit'
                        ? 'bg-success/20'
                        : 'bg-destructive/20'
                    }`}
                  >
                    {transaction.type === 'deposit' ? (
                      <ArrowUpRight className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="font-medium text-foreground">{transaction.description}</div>
                    <div className="text-sm text-foreground-muted">{transaction.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Amount */}
                  <div
                    className={`text-lg font-semibold ${
                      transaction.amount > 0 ? 'text-success' : 'text-foreground'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {transaction.amount.toLocaleString('ru-RU')} ₽
                  </div>

                  {/* Status */}
                  {transaction.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
