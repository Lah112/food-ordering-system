import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Transactions.css'; // Import the CSS
import html2pdf from 'html2pdf.js';  // Import html2pdf.js

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const url = import.meta.env.VITE_APP_URL || 'http://localhost:5000';

  useEffect(() => {
    axios.get(`${url}/api/transactions/transactions`)
      .then(response => {
        setTransactions(response.data);
      })
      .catch(error => {
        console.error("Error fetching transactions:", error);
      });
  }, []);

  // Function to download the table as PDF
  const downloadReport = () => {
    const element = document.getElementById('transactions-table'); // Get the table by ID
    const options = {
      margin:       0.5,
      filename:     'transactions_report.pdf',  // PDF file name
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(options).save();  // Convert to PDF and trigger download
  };

  return (
    <div className="transactions-page">
      <div className="transactions-card">
        <h2>Transactions</h2>
        {/* Add the download button here */}
        <button className="download-btn" onClick={downloadReport}>Download Report</button>
        
        <table className="transactions-table" id="transactions-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction._id}</td>
                <td>{transaction.userId}</td>
                <td>${transaction.amount}</td>
                <td>{transaction.paymentInfo?.status}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
