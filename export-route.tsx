import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "sales";
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    
    // Generate mock data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let data: any;
    
    if (reportType === "sales") {
      // Generate mock sales data with revenue
      const salesData = months.map(month => {
        const sales = Math.floor(Math.random() * 50) + 10;
        const revenue = sales * (Math.floor(Math.random() * 1000) + 500);
        return {
          month,
          sales,
          revenue
        };
      });
      
      data = {
        title: `Monthly Product Sales Report - ${year}`,
        year,
        data: salesData,
        totalSales: salesData.reduce((sum, item) => sum + item.sales, 0),
        totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0)
      };
    } else {
      // Generate mock revenue data
      const revenueData = months.map(month => ({
        month,
        revenue: (Math.floor(Math.random() * 50) + 10) * (Math.floor(Math.random() * 1000) + 500)
      }));
      
      data = {
        title: `Monthly Revenue Report - ${year}`,
        year,
        data: revenueData,
        totalRevenue: revenueData.reduce((sum, item) => sum + item.revenue, 0)
      };
    }
    
    // Create filename
    const filename = `${reportType}_report_${year}`;
    
    // Generate HTML for PDF
    const htmlContent = generateHTML(data, reportType);
    
    // Return HTML that can be printed as PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

// Generate HTML for PDF export
function generateHTML(data: any, reportType: string): string {
  // Generate table rows
  let tableRows = '';
  let totalValue = '';
  
  if (reportType === 'sales') {
    data.data.forEach((item: any) => {
      tableRows += `
        <tr>
          <td>${item.month}</td>
          <td>${item.sales}</td>
          <td>Rs. ${item.revenue.toLocaleString()}</td>
        </tr>
      `;
    });
    totalValue = `
      <td>${data.totalSales}</td>
      <td>Rs. ${data.totalRevenue.toLocaleString()}</td>
    `;
  } else {
    data.data.forEach((item: any) => {
      tableRows += `
        <tr>
          <td>${item.month}</td>
          <td>Rs. ${item.revenue.toLocaleString()}</td>
        </tr>
      `;
    });
    totalValue = `Rs. ${data.totalRevenue.toLocaleString()}`;
  }
  
  // Define column headers based on report type
  let columnHeaders = '';
  
  if (reportType === 'sales') {
    columnHeaders = `
      <th>Month</th>
      <th>Number of Products Sold</th>
      <th>Revenue (Rs.)</th>
    `;
  } else {
    columnHeaders = `
      <th>Month</th>
      <th>Revenue (Rs.)</th>
    `;
  }
  
  // Create HTML template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #2563eb;
          text-align: center;
          margin-bottom: 20px;
        }
        .report-meta {
          text-align: center;
          margin-bottom: 30px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .total-row {
          font-weight: bold;
          background-color: #e5e7eb;
        }
        .print-button {
          display: block;
          margin: 20px auto;
          padding: 10px 20px;
          background-color: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .print-button:hover {
          background-color: #1d4ed8;
        }
        @media print {
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">Print PDF</button>
      
      <h1>${data.title}</h1>
      <div class="report-meta">
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            ${columnHeaders}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="total-row">
            <td>Total</td>
            ${reportType === 'sales' ? totalValue : `<td>${totalValue}</td>`}
          </tr>
        </tbody>
      </table>
      
      <script>
        // Auto-print when loaded
        window.onload = function() {
          // Give a moment for the page to render
          setTimeout(() => {
            // Uncomment the line below to automatically open the print dialog
            // window.print();
          }, 1000);
        };
      </script>
    </body>
    </html>
  `;
}
