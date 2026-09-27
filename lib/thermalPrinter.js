/**
 * Thermal Receipt Printer Utility for 80mm and 58mm POS roll printers.
 * Uses an isolated hidden iframe and dynamically calculates exact receipt height in mm
 * so the browser print engine and PDF export generate an exact receipt-sized document (no A4/Letter waste).
 */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateThermalReceiptHtml(order, settings = {}, paperSize = "80mm") {
  const is58 = paperSize === "58mm";
  const rollWidth = is58 ? "58mm" : "80mm";
  const printableWidth = is58 ? "54mm" : "78mm";
  const baseFontSize = is58 ? "11px" : "12px";
  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";

  const dateStr = order.timestamp
    ? new Date(order.timestamp).toLocaleDateString()
    : new Date().toLocaleDateString();
  const timeStr = order.timestamp
    ? new Date(order.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const items = order.items || [];
  const itemsRows = items
    .map((item) => {
      const qty = item.quantity || 1;
      const price = Number(item.price || 0);
      const lineTotal = (price * qty).toFixed(2);
      const notesHtml = item.notes
        ? `<tr><td colspan="4" style="font-size: 10px; font-style: italic; padding: 0 0 2px 6px; color: #111;">* ${escapeHtml(item.notes)}</td></tr>`
        : "";

      return `
        <tr>
          <td style="padding: 2px 0; font-weight: bold; vertical-align: top; max-width: 140px; word-break: break-word;">${escapeHtml(item.name || "")}</td>
          <td style="padding: 2px 0; text-align: center; vertical-align: top;">${qty}</td>
          <td style="padding: 2px 0; text-align: right; vertical-align: top;">${price.toFixed(0)}</td>
          <td style="padding: 2px 0; text-align: right; vertical-align: top; font-weight: bold;">${lineTotal}</td>
        </tr>
        ${notesHtml}
      `;
    })
    .join("");

  const total = Number(order.total || 0);
  const tenderAmount = Number(order.tenderAmount || total);
  const changeDue = Math.max(0, tenderAmount - total);
  const subtotal = Number(order.subtotal || 0);
  const taxAmount = Number(order.taxAmount || 0);
  const taxRate = order.taxRate || settings.taxRate || 0;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt_${escapeHtml(order.orderNumber || "").replace(/[^a-zA-Z0-9_-]/g, "")}</title>
  <style id="page-style">
    @page {
      size: ${rollWidth} 180mm;
      margin: 0mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: ${rollWidth};
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: 'Courier New', Courier, monospace;
      font-size: ${baseFontSize};
      line-height: 1.3;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .receipt-container {
      width: ${printableWidth};
      max-width: 100%;
      margin: 0 auto;
      padding: 3mm 2mm 8mm 2mm;
    }
    .divider {
      border-bottom: 1px dashed #000000;
      margin: 4px 0;
    }
    .divider-double {
      border-bottom: 2px dashed #000000;
      margin: 5px 0;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .table-full {
      width: 100%;
      border-collapse: collapse;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Shop Header -->
    <div class="text-center" style="margin-bottom: 4px;">
      <div style="font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
        ${escapeHtml(settings.shopName || "Crispy Bites")}
      </div>
      ${settings.tagline ? `<div style="font-size: 10px; margin-top: 1px;">${escapeHtml(settings.tagline)}</div>` : ""}
      ${settings.address ? `<div style="font-size: 10px;">${escapeHtml(settings.address)}</div>` : ""}
      ${settings.phone ? `<div style="font-size: 10px; font-weight: bold;">Tel: ${escapeHtml(settings.phone)}</div>` : ""}
    </div>

    <div class="divider"></div>

    <!-- Order Metadata Table -->
    <table class="table-full" style="font-size: 11px; line-height: 1.35;">
      <tr>
        <td class="bold">INVOICE: ${escapeHtml(order.orderNumber || "")}</td>
        <td class="text-right bold">${order.orderType === "dine_in" && order.tableNumber ? `TABLE: ${escapeHtml(order.tableNumber)}` : `TYPE: ${escapeHtml((order.orderType || "").replace("_", " ").toUpperCase())}`}</td>
      </tr>
      <tr>
        <td>DATE: ${dateStr}</td>
        <td class="text-right">TIME: ${timeStr}</td>
      </tr>
      <tr>
        <td>TYPE: ${escapeHtml((order.orderType || "").replace("_", " ").toUpperCase())}</td>
        <td class="text-right">CASHIER: ${escapeHtml(order.cashier || settings.cashierName || "Cashier")}</td>
      </tr>
      ${order.customerName ? `
      <tr>
        <td colspan="2" style="font-weight: bold; padding-top: 2px;">
          CUSTOMER: ${escapeHtml(order.customerName)} ${order.customerPhone ? `(${escapeHtml(order.customerPhone)})` : ""}
        </td>
      </tr>
      ` : ""}
    </table>

    <div class="divider"></div>

    <!-- Items Table -->
    <table class="table-full" style="font-size: 11px;">
      <thead>
        <tr style="border-bottom: 1px dashed #000; text-transform: uppercase; font-size: 10px; font-weight: 900;">
          <th style="text-align: left; padding-bottom: 3px;">Item</th>
          <th style="text-align: center; width: 30px; padding-bottom: 3px;">Qty</th>
          <th style="text-align: right; width: 45px; padding-bottom: 3px;">Price</th>
          <th style="text-align: right; width: 55px; padding-bottom: 3px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="divider"></div>

    <!-- Financial Totals Table -->
    <table class="table-full" style="font-size: 11px; line-height: 1.4;">
      <tr>
        <td>Subtotal:</td>
        <td class="text-right">${currency} ${subtotal.toFixed(2)}</td>
      </tr>
      ${taxAmount > 0 ? `
      <tr>
        <td>Tax (${taxRate}%):</td>
        <td class="text-right">${currency} ${taxAmount.toFixed(2)}</td>
      </tr>
      ` : ""}
      <tr style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; font-size: 14px; font-weight: 900;">
        <td style="padding: 4px 0;">TOTAL:</td>
        <td class="text-right" style="padding: 4px 0;">${currency} ${total.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding-top: 3px;">Payment Method:</td>
        <td class="text-right bold" style="padding-top: 3px;">${escapeHtml(order.paymentMethod || "Cash")}</td>
      </tr>
      ${order.paymentMethod === "Cash" ? `
      <tr>
        <td>Cash Tendered:</td>
        <td class="text-right">${currency} ${tenderAmount.toFixed(2)}</td>
      </tr>
      <tr class="bold">
        <td>Change Due:</td>
        <td class="text-right">${currency} ${changeDue.toFixed(2)}</td>
      </tr>
      ` : ""}
    </table>

    <div class="divider"></div>

    <!-- Receipt Footer -->
    <div class="text-center" style="font-size: 10px; margin-top: 6px; line-height: 1.35;">
      <div>${escapeHtml(settings.invoiceFooter || "Thank you for dining with us! Please visit again.")}</div>
      <div style="font-size: 9px; margin-top: 2px; color: #333;">Powered by BitePOS System</div>
      <div style="margin-top: 4px; font-weight: bold; letter-spacing: 1px;">*** THANK YOU ***</div>
    </div>
  </div>
</body>
</html>`;
}

export function printThermalReceipt(order, settings = {}, paperSize = "80mm") {
  if (typeof window === "undefined") return;

  const actualPaperSize = settings?.receiptPaperSize || paperSize || "80mm";
  const rollWidth = actualPaperSize === "58mm" ? "58mm" : "80mm";
  const html = generateThermalReceiptHtml(order, settings, actualPaperSize);

  let iframe = document.getElementById("thermal-receipt-iframe");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "thermal-receipt-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.style.zIndex = "-9999";
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      // Measure actual rendered content height and calculate exact mm required
      const container = doc.querySelector(".receipt-container") || doc.body;
      const heightPx = container.scrollHeight || container.offsetHeight || 500;
      // Convert px to mm: (px * 25.4) / 96 + margin
      const heightMm = Math.max(60, Math.ceil((heightPx * 25.4) / 96) + 4);

      // Inject exact custom page dimensions into @page rule
      let styleTag = doc.getElementById("page-style");
      if (styleTag) {
        styleTag.innerHTML = `
          @page {
            size: ${rollWidth} ${heightMm}mm !important;
            margin: 0mm !important;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: ${rollWidth} !important;
            height: ${heightMm}mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: ${actualPaperSize === "58mm" ? "11px" : "12px"} !important;
            line-height: 1.3 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .receipt-container {
            width: ${actualPaperSize === "58mm" ? "54mm" : "78mm"} !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 3mm 2mm 6mm 2mm !important;
          }
          .divider {
            border-bottom: 1px dashed #000000 !important;
            margin: 4px 0 !important;
          }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
          .bold { font-weight: bold !important; }
          .table-full {
            width: 100% !important;
            border-collapse: collapse !important;
          }
        `;
      }

      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error("Thermal iframe print failed, falling back to window.print():", err);
      window.print();
    }
  }, 200);
}
