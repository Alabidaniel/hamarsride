const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrency = (amount) => `N${Number(amount || 0).toLocaleString()}`;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildReceiptHtml = (receipt) => {
  const rows = (receipt.items || [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td style="text-align:center;">${escapeHtml(item.qty)}</td>
          <td style="text-align:right;">${escapeHtml(formatCurrency(item.price))}</td>
          <td style="text-align:right;">${escapeHtml(formatCurrency(item.total))}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Receipt ${escapeHtml(receipt.receiptNumber)}</title>
        <style>
          :root { color-scheme: light; }
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #ffffff;
            color: #1f2937;
          }
          .sheet {
            max-width: 820px;
            margin: 32px auto;
            background: #fff;
            border: 1px solid #fed7aa;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
          }
          .header {
            padding: 28px;
            background: linear-gradient(135deg, #ea580c, #f97316);
            color: #ffffff;
          }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 8px 0 0; opacity: 0.9; }
          .body { padding: 28px; }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }
          .card {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 14px;
            padding: 16px;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
            margin-bottom: 6px;
          }
          .value {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
            line-height: 1.5;
            white-space: pre-wrap;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th, td {
            padding: 12px 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
          }
          th {
            text-align: left;
            background: #fff7ed;
            color: #6b7280;
            font-weight: 600;
          }
          .summary {
            margin-top: 20px;
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 6px 0;
            font-size: 14px;
          }
          .total {
            font-size: 18px;
            font-weight: 700;
            color: #c2410c;
            border-top: 1px solid #e5e7eb;
            margin-top: 10px;
            padding-top: 12px;
          }
          .footer {
            padding: 20px 28px 28px;
            color: #9ca3af;
            font-size: 12px;
            text-align: center;
          }
          @media print {
            body { background: #fff; }
            .sheet {
              margin: 0;
              border: 0;
              border-radius: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <h1>HamarsRide Receipt</h1>
            <p>Receipt #${escapeHtml(receipt.receiptNumber)}</p>
          </div>
          <div class="body">
            <div class="grid">
              <div class="card">
                <div class="label">Order ID</div>
                <div class="value">${escapeHtml(receipt.orderId)}</div>
              </div>
              <div class="card">
                <div class="label">Date</div>
                <div class="value">${escapeHtml(formatDate(receipt.createdAt))}</div>
              </div>
              <div class="card">
                <div class="label">Delivery Address</div>
                <div class="value">${escapeHtml(receipt.address)}</div>
              </div>
              <div class="card">
                <div class="label">Instructions</div>
                <div class="value">${escapeHtml(receipt.instruction || "None")}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>${escapeHtml(formatCurrency(receipt.subtotal))}</span>
              </div>
              <div class="summary-row">
                <span>Delivery Fee</span>
                <span>${escapeHtml(formatCurrency(receipt.deliveryFee))}</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>${escapeHtml(formatCurrency(receipt.total))}</span>
              </div>
            </div>
          </div>
          <div class="footer">Thank you for choosing HamarsRide.</div>
        </div>
      </body>
    </html>
  `;
};

const downloadReceiptHtml = (receipt) => {
  const blob = new Blob([buildReceiptHtml(receipt)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${receipt.receiptNumber || receipt.orderId || "hamarsride"}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const printReceiptHtml = (receipt) => {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=900");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(buildReceiptHtml(receipt));
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};

export { buildReceiptHtml, downloadReceiptHtml, formatCurrency, formatDate, printReceiptHtml };
