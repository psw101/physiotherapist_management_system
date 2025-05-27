import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/prisma/client";

// Export report data (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin privileges
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "sales";
    // Only supporting PDF format
    const year = searchParams.get("year") || new Date().getFullYear().toString();

    // Generate mock data for the report
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let data;
    let filename;

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

      filename = `sales_report_${year}`;
    } else {
      // Generate mock revenue data
      const revenueData = months.map(month => {
        const sales = Math.floor(Math.random() * 50) + 10;
        return {
          month,
          revenue: sales * (Math.floor(Math.random() * 1000) + 500)
        };
      });

      data = {
        title: `Monthly Revenue Report - ${year}`,
        year,
        data: revenueData,
        totalRevenue: revenueData.reduce((sum, item) => sum + item.revenue, 0)
      };

      filename = `revenue_report_${year}`;
    }

    // Generate HTML for PDF
    const htmlContent = generateHTML(data, reportType);

    // Return HTML that can be printed as PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}

// Generate HTML for printing as PDF
function generateHTML(data: any, reportType: string): string {
  const title = data.title;
  const currentDate = new Date().toLocaleDateString();

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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          line-height: 1.6;
        }
        h1 {
          text-align: center;
          color: #333;
        }
        .date {
          text-align: center;
          margin-bottom: 30px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
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
          background-color: #f2f2f2;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body {
            margin: 0;
            padding: 20px;
          }
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-button" style="text-align: right; margin-bottom: 20px;">
        <button onclick="window.print()">Print PDF</button>
      </div>

      <h1>${title}</h1>
      <div class="date">Generated on: ${currentDate}</div>

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

      <div class="footer">
        This is an automatically generated report from the Physiotherapist Management System.
      </div>
    </body>
    </html>
  `;
}


