import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScheduleEntry {
  payment_number: number;
  payment_date: string;
  principal_payment: number;
  interest_payment: number;
  total_payment: number;
  closing_balance: number;
}

const LoanRepaymentChart = ({ scheduleData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      let processedData = scheduleData;
      if (scheduleData.length > 24) {
        processedData = scheduleData.filter((_, index) => index % 2 === 0);
      }

      const formattedData = processedData.map(entry => ({
        name: `Payment ${entry.payment_number}`,
        Principal: entry.principal_payment,
        Interest: entry.interest_payment,
        Balance: entry.closing_balance
      }));

      setChartData(formattedData);
    }
  }, [scheduleData]);

  if (!scheduleData || scheduleData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-300">No data available</div>;
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12, fill: '#4a5568' }}
          />
          <YAxis tick={{ fill: '#4a5568' }} />
          <Tooltip 
            formatter={(value) => `$${Number(value).toFixed(2)}`}
            contentStyle={{ backgroundColor: '#fff', color: '#4a5568', border: '1px solid #e5e7eb' }}
            itemStyle={{ color: '#4a5568' }}
          />
          <Legend wrapperStyle={{ color: '#4a5568' }} />
          <Bar dataKey="Principal" stackId="a" fill="#8884d8" />
          <Bar dataKey="Interest" stackId="a" fill="#82ca9d" />
          <Bar dataKey="Balance" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoanRepaymentChart;