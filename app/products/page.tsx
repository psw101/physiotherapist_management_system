import React from 'react'

const products = () => {
  return (
  <body className="bg-gray-100 antialiased font-sans p-8">
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Invoice Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600" htmlFor="invoiceNo">Invoice Number</label>
          <input id="invoiceNo" type="text" placeholder="6B1E73DA–0017" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600" htmlFor="issueDate">Issue Date</label>
          <input id="issueDate" type="date" value="2024-07-28" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100" />
        </div>

        <div className="space-y-1 md:col-span-2 flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-600" htmlFor="patient">Patients Name*</label>
            <input id="patient" type="text" placeholder="John Richards" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100" />
          </div>
          <button type="button" className="shrink-0 h-10 px-4 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">+ Add New Patients</button>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600" htmlFor="email">Email*</label>
          <input id="email" type="email" placeholder="www.johnrichards@gmail.com" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100" />
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-600" htmlFor="dueDate">Due Date</label>
            <input id="dueDate" type="date" value="2024-08-04" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100" />
          </div>
          <div className="w-24 space-y-1">
            <label className="text-sm font-medium text-gray-600" htmlFor="currency">&nbsp;</label>
            <select id="currency" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100">
              <option>USD</option>
              <option>EUR</option>
              <option>LKR</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600" htmlFor="country">Country*</label>
          <input id="country" type="text" placeholder="USA" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600" htmlFor="deliveryDate">Delivery Date</label>
          <input id="deliveryDate" type="date" value="2024-07-28" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100" />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-600" htmlFor="object">Object</label>
          <input id="object" type="text" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2 bg-gray-100" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600" htmlFor="operation">Type of Operation Service</label>
          <input id="operation" type="text" className="w-full rounded-md border-gray-300 focus:ring-0 focus:border-indigo-500 text-sm px-3 py-2" />
        </div>
        
        <div className="space-y-1 flex flex-col">
          <span className="text-sm font-medium text-gray-600">VAT Applicable</span>
          <div className="flex items-center gap-6 mt-2">
            <label className="flex items-center gap-1 text-sm">
              <input type="radio" name="vat" value="yes" className="text-indigo-600 focus:ring-0" />
              Yes
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input type="radio" name="vat" value="no" defaultChecked className="text-indigo-600 focus:ring-0" />
              No
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-800">Item</h3>
          <button type="button" className="h-9 px-4 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">+ Add Item</button>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="px-4 py-3 font-medium w-3/6">Name / Description</th>
                <th className="px-4 py-3 font-medium w-1/12 text-center">Qty</th>
                <th className="px-4 py-3 font-medium w-1/6">Tax</th>
                <th className="px-4 py-3 font-medium w-1/6 text-right">Unit Price</th>
                <th className="px-4 py-3 font-medium w-1/6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2">
                  <input type="text" placeholder="Enter Name" className="w-full border-0 bg-transparent focus:ring-0" />
                </td>
                <td className="px-4 py-2 text-center">1</td>
                <td className="px-4 py-2">
                  <select className="w-full text-sm border-gray-300 rounded focus:ring-0">
                    <option>Select</option>
                    <option>VAT 5%</option>
                    <option>VAT 12%</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-right">0</td>
                <td className="px-4 py-2 text-right">0.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button type="button" className="text-xs px-2 py-1 bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200">+ Add Discount Invoice</button>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>$ 0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>$ 0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Total Tax</span>
              <span>$ 0.00</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Total</span>
              <span>$ 0.00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 justify-end pt-4">
        <button type="button" className="h-10 w-full md:w-auto px-8 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="button" className="h-10 w-full md:w-auto px-8 rounded-md bg-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-300">Save As Draft</button>
        <button type="submit" className="h-10 w-full md:w-auto px-8 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Save</button>
      </div>
    </div>
  </body>
  )
}

export default products