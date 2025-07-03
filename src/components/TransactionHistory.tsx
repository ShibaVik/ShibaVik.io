
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  crypto: string;
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions
}) => {
  const { t } = useLanguage();

  if (transactions.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Aucune transaction</p>
          <p className="text-sm text-gray-500">Vos trades apparaîtront ici</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="bg-slate-900">
        <CardTitle className="flex items-center space-x-2">
          <span className="text-slate-50">{t('transactionHistory')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-slate-900">
        <div className="space-y-4">
          {transactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${transaction.type === 'buy' ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                  {transaction.type === 'buy' ? 
                    <TrendingUp className="h-4 w-4 text-green-400" /> : 
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  }
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={transaction.type === 'buy' ? "default" : "destructive"} 
                      className={transaction.type === 'buy' ? "bg-green-600" : "bg-red-600"}
                    >
                      {transaction.type === 'buy' ? 'ACHAT' : 'VENTE'}
                    </Badge>
                    <span className="font-semibold text-slate-50">{transaction.crypto}</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {transaction.amount.toLocaleString()} tokens @ ${transaction.price.toFixed(8)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-bold ${transaction.type === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
                  {transaction.type === 'buy' ? '-' : '+'}${transaction.total.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Intl.DateTimeFormat('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(transaction.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
