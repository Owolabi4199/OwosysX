/**
 * VantrexTech AI Invoice Assistant
 * Full Vanilla JS logic — invoice creation, AI parsing, PDF, Supabase, Stripe
 */

(function () {
  "use strict";

  // ──────────────────────────────────────────────
  // CONFIG
  // ──────────────────────────────────────────────
  const FREE_INVOICE_LIMIT = 3;
  // REPLACE with your real Stripe payment link
  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_XXXXXXXX";
  const CURRENCY_SYMBOLS = {
    USD: "$",
    EUR: "\u20AC",
    GBP: "\u00A3",
    NGN: "\u20A6",
    CAD: "C$",
    AUD: "A$",
  };

  // ──────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────
  let state = {
    isPro: false,
    invoiceCount: parseInt(localStorage.getItem("vtx_invoice_count") || "0", 10),
    sessionId: localStorage.getItem("vtx_session_id") || generateSessionId(),
    invoiceSeq: parseInt(localStorage.getItem("vtx_invoice_seq") || "1000", 10),
    logoDataUrl: null,
    items: [],
  };

  localStorage.setItem("vtx_session_id", state.sessionId);

  function generateSessionId() {
    return "sess_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ──────────────────────────────────────────────
  // DOM REFS
  // ──────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  // Wait for DOM to be fully ready
  function initApp() {
    const els = {
      aiPrompt: $("ai-prompt"),
      btnAiParse: $("btn-ai-parse"),
      aiStatus: $("ai-status"),
      senderName: $("sender-name"),
      senderEmail: $("sender-email"),
      senderAddress: $("sender-address"),
      clientName: $("client-name"),
      clientEmail: $("client-email"),
      clientAddress: $("client-address"),
      issueDate: $("issue-date"),
      dueDate: $("due-date"),
      invoiceNumber: $("invoice-number"),
      currencySelect: $("currency-select"),
      taxRate: $("tax-rate"),
      invoiceNotes: $("invoice-notes"),
      lineItemsContainer: $("line-items-container"),
      btnAddItem: $("btn-add-item"),
      btnSaveInvoice: $("btn-save-invoice"),
      btnDownloadPdf: $("btn-download-pdf"),
      btnNewInvoice: $("btn-new-invoice"),
      summaryInvoiceNumber: $("summary-invoice-number"),
      summaryClient: $("summary-client"),
      summaryItemCount: $("summary-item-count"),
      summarySubtotal: $("summary-subtotal"),
      summaryTaxRate: $("summary-tax-rate"),
      summaryTax: $("summary-tax"),
      summaryTotal: $("summary-total"),
      usageCounter: $("usage-counter"),
      usageBar: $("usage-bar"),
      planBadge: $("plan-badge"),
      btnUpgradeNav: $("btn-upgrade-nav"),
      upgradeModal: $("upgrade-modal"),
      btnCloseUpgrade: $("btn-close-upgrade"),
      btnStripeCheckout: $("btn-stripe-checkout"),
      waitlistModal: $("waitlist-modal"),
      btnCloseWaitlist: $("btn-close-waitlist"),
      btnWaitlistFooter: $("btn-waitlist-footer"),
      waitlistForm: $("waitlist-form"),
      waitlistSuccess: $("waitlist-success"),
      logoUploadArea: $("logo-upload-area"),
      logoInput: $("logo-input"),
      logoPlaceholder: $("logo-placeholder"),
      logoPreview: $("logo-preview"),
      invoiceHistory: $("invoice-history"),
      toast: $("toast"),
      toastTitle: $("toast-title"),
      toastMessage: $("toast-message"),
      toastIcon: $("toast-icon"),
    };

    // ──────────────────────────────────────────────
    // INIT
    // ──────────────────────────────────────────────
    function init() {
      setTodayDate();
      generateInvoiceNumber();
      addLineItem("", 1, 0);
      updateSummary();
      updateUsageUI();
      bindEvents();
    }

    function setTodayDate() {
      const today = new Date().toISOString().split("T")[0];
      els.issueDate.value = today;
    }

    function generateInvoiceNumber() {
      state.invoiceSeq++;
      localStorage.setItem("vtx_invoice_seq", state.invoiceSeq.toString());
      const num = "VTX-" + String(state.invoiceSeq).padStart(5, "0");
      els.invoiceNumber.value = num;
      els.summaryInvoiceNumber.textContent = num;
    }

    // ──────────────────────────────────────────────
    // LINE ITEMS
    // ──────────────────────────────────────────────
    function addLineItem(desc, qty, price) {
      const id = "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
      const amount = (qty || 0) * (price || 0);

      const itemEl = document.createElement("div");
      itemEl.setAttribute("data-item-id", id);
      // Mobile: card layout. Desktop: grid row.
      itemEl.className = "rounded-lg border border-[#1E293B] bg-[#0A0F1C] p-3 sm:border-0 sm:bg-transparent sm:p-0 sm:grid sm:grid-cols-[1fr_60px_90px_90px_36px] sm:gap-2 sm:items-center lg:grid-cols-[1fr_80px_110px_110px_40px] lg:gap-3";

      itemEl.innerHTML =
        '<div class="space-y-2 sm:contents">' +
        '  <div class="min-w-0">' +
        '    <label class="mb-1 block text-[10px] font-medium text-[#64748B] sm:hidden">Description</label>' +
        '    <input type="text" data-field="desc" value="' + escapeAttr(desc) + '" placeholder="Item description"' +
        '      class="w-full rounded-lg border border-[#1E293B] bg-[#111827] px-2 py-2 text-sm text-white placeholder-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 sm:bg-transparent sm:border-[#1E293B] sm:px-3" />' +
        '  </div>' +
        '  <div class="grid grid-cols-3 gap-2 sm:contents">' +
        '    <div class="min-w-0">' +
        '      <label class="mb-1 block text-[10px] font-medium text-[#64748B] sm:hidden">Qty</label>' +
        '      <input type="number" data-field="qty" min="0" step="1" value="' + (qty || 1) + '"' +
        '        class="w-full rounded-lg border border-[#1E293B] bg-[#111827] px-2 py-2 text-sm text-white text-right focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 sm:bg-transparent sm:border-[#1E293B] sm:px-3" />' +
        '    </div>' +
        '    <div class="min-w-0">' +
        '      <label class="mb-1 block text-[10px] font-medium text-[#64748B] sm:hidden">Price</label>' +
        '      <input type="number" data-field="price" min="0" step="0.01" value="' + (price || 0).toFixed(2) + '"' +
        '        class="w-full rounded-lg border border-[#1E293B] bg-[#111827] px-2 py-2 text-sm text-white text-right focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 sm:bg-transparent sm:border-[#1E293B] sm:px-3" />' +
        '    </div>' +
        '    <div class="min-w-0">' +
        '      <label class="mb-1 block text-[10px] font-medium text-[#64748B] sm:hidden">Amount</label>' +
        '      <div data-field="amount" class="flex items-center justify-end rounded-lg border border-[#1E293B] bg-[#111827]/50 px-2 py-2 text-sm font-mono text-[#94A3B8] sm:bg-transparent sm:border-[#1E293B] sm:px-3 truncate">' +
        '        ' + formatCurrency(amount) +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '  <div class="flex justify-end sm:justify-center">' +
        '    <button type="button" data-action="remove" class="rounded-lg p-1.5 text-[#64748B] transition hover:bg-red-500/10 hover:text-red-400 focus:outline-none" aria-label="Remove item">' +
        '      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>' +
        '    </button>' +
        '  </div>' +
        '</div>';

      els.lineItemsContainer.appendChild(itemEl);

      // Bind input events
      const inputs = itemEl.querySelectorAll("input");
      inputs.forEach(function (inp) {
        inp.addEventListener("input", function () {
          recalcRow(itemEl);
          updateSummary();
        });
      });

      // Bind remove
      itemEl.querySelector('[data-action="remove"]').addEventListener("click", function () {
        itemEl.remove();
        updateSummary();
      });

      updateSummary();
    }

    function recalcRow(rowEl) {
      const qty = parseFloat(rowEl.querySelector('[data-field="qty"]').value) || 0;
      const price = parseFloat(rowEl.querySelector('[data-field="price"]').value) || 0;
      const amount = qty * price;
      rowEl.querySelector('[data-field="amount"]').textContent = formatCurrency(amount);
    }

    // ──────────────────────────────────────────────
    // SUMMARY
    // ──────────────────────────────────────────────
    function updateSummary() {
      const rows = els.lineItemsContainer.querySelectorAll("[data-item-id]");
      let subtotal = 0;
      let count = 0;

      rows.forEach(function (row) {
        const qty = parseFloat(row.querySelector('[data-field="qty"]').value) || 0;
        const price = parseFloat(row.querySelector('[data-field="price"]').value) || 0;
        subtotal += qty * price;
        count++;
      });

      const taxRate = parseFloat(els.taxRate.value) || 0;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      els.summaryClient.textContent = els.clientName.value || "--";
      els.summaryItemCount.textContent = count;
      els.summarySubtotal.textContent = formatCurrency(subtotal);
      els.summaryTaxRate.textContent = taxRate;
      els.summaryTax.textContent = formatCurrency(taxAmount);
      els.summaryTotal.textContent = formatCurrency(total);
    }

    // ──────────────────────────────────────────────
    // CURRENCY
    // ──────────────────────────────────────────────
    function getCurrencySymbol() {
      return CURRENCY_SYMBOLS[els.currencySelect.value] || "$";
    }

    function formatCurrency(val) {
      return getCurrencySymbol() + (val || 0).toFixed(2);
    }

    // ──────────────────────────────────────────────
    // USAGE / PRO
    // ──────────────────────────────────────────────
    function updateUsageUI() {
      const used = state.invoiceCount;
      els.usageCounter.textContent = used + " / " + FREE_INVOICE_LIMIT;
      const pct = Math.min((used / FREE_INVOICE_LIMIT) * 100, 100);
      els.usageBar.style.width = pct + "%";

      if (pct >= 100) {
        els.usageBar.classList.remove("bg-[#3B82F6]");
        els.usageBar.classList.add("bg-red-500");
      }

      if (state.isPro) {
        els.planBadge.textContent = "Pro Plan";
        els.planBadge.classList.remove("bg-[#1E293B]", "text-[#94A3B8]");
        els.planBadge.classList.add("bg-[#3B82F6]/20", "text-[#3B82F6]");
        els.btnUpgradeNav.classList.add("hidden");
      }
    }

    function checkFreeLimit() {
      if (state.isPro) return true;
      if (state.invoiceCount >= FREE_INVOICE_LIMIT) {
        showUpgradeModal();
        return false;
      }
      return true;
    }

    function incrementUsage() {
      state.invoiceCount++;
      localStorage.setItem("vtx_invoice_count", state.invoiceCount.toString());
      updateUsageUI();
    }

    // ──────────────────────────────────────────────
    // LOGO UPLOAD
    // ──────────────────────────────────────────────
    function handleLogoUpload(file) {
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        state.logoDataUrl = e.target.result;
        els.logoPreview.src = state.logoDataUrl;
        els.logoPreview.classList.remove("hidden");
        els.logoPlaceholder.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }

    // ──────────────────────────────────────────────
    // AI PARSE
    // ──────────────────────────────────────────────
    async function handleAiParse() {
      const prompt = els.aiPrompt.value.trim();
      if (!prompt) {
        showToast("Input Required", "Please describe your invoice in natural language.", "warn");
        return;
      }

      els.btnAiParse.disabled = true;
      els.btnAiParse.innerHTML =
        '<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Parsing...';

      els.aiStatus.classList.remove("hidden");
      els.aiStatus.textContent = "AI is analyzing your input...";

      try {
        const res = await fetch("/api/ai-parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "AI parsing failed");
        }

        const json = await res.json();
        const d = json.data;

        // Fill form
        if (d.clientName) els.clientName.value = d.clientName;
        if (d.clientEmail) els.clientEmail.value = d.clientEmail;
        if (d.clientAddress) els.clientAddress.value = d.clientAddress;
        if (d.taxRate !== undefined && d.taxRate !== null) els.taxRate.value = d.taxRate;
        if (d.dueDate) els.dueDate.value = d.dueDate;
        if (d.notes) els.invoiceNotes.value = d.notes;
        if (d.currency) {
          const opt = els.currencySelect.querySelector('option[value="' + d.currency + '"]');
          if (opt) els.currencySelect.value = d.currency;
        }

        // Clear existing items and add parsed ones
        els.lineItemsContainer.innerHTML = "";
        if (d.items && d.items.length > 0) {
          d.items.forEach(function (item) {
            addLineItem(item.description || "", item.quantity || 1, item.unitPrice || 0);
          });
        }

        updateSummary();
        els.aiStatus.textContent = "Invoice populated from AI. Review and save.";
        els.aiStatus.classList.remove("text-[#64748B]");
        els.aiStatus.classList.add("text-[#22C55E]");
        showToast("AI Parsed", "Invoice fields populated successfully.", "success");
      } catch (err) {
        els.aiStatus.textContent = "Error: " + err.message;
        els.aiStatus.classList.remove("text-[#64748B]");
        els.aiStatus.classList.add("text-red-400");
        showToast("AI Error", err.message, "error");
      } finally {
        els.btnAiParse.disabled = false;
        els.btnAiParse.innerHTML =
          '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Generate Invoice';
      }
    }

    // ──────────────────────────────────────────────
    // SAVE INVOICE
    // ──────────────────────────────────────────────
    async function handleSaveInvoice() {
      if (!checkFreeLimit()) return;

      const clientName = els.clientName.value.trim();
      if (!clientName) {
        showToast("Missing Field", "Client name is required.", "warn");
        els.clientName.focus();
        return;
      }

      const rows = els.lineItemsContainer.querySelectorAll("[data-item-id]");
      if (rows.length === 0) {
        showToast("No Items", "Add at least one line item.", "warn");
        return;
      }

      const taxRate = parseFloat(els.taxRate.value) || 0;
      let subtotal = 0;
      const items = [];

      rows.forEach(function (row, i) {
        const desc = row.querySelector('[data-field="desc"]').value.trim();
        const qty = parseFloat(row.querySelector('[data-field="qty"]').value) || 0;
        const price = parseFloat(row.querySelector('[data-field="price"]').value) || 0;
        const amount = qty * price;
        subtotal += amount;
        items.push({
          description: desc || "Item " + (i + 1),
          quantity: qty,
          unit_price: price,
          amount: amount,
          sort_order: i,
        });
      });

      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      const invoice = {
        invoice_number: els.invoiceNumber.value,
        client_name: clientName,
        client_email: els.clientEmail.value.trim() || null,
        client_address: els.clientAddress.value.trim() || null,
        sender_name: els.senderName.value.trim() || "VantrexTech",
        sender_email: els.senderEmail.value.trim() || null,
        sender_address: els.senderAddress.value.trim() || null,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total: total,
        currency: els.currencySelect.value,
        status: "draft",
        issue_date: els.issueDate.value || new Date().toISOString().split("T")[0],
        due_date: els.dueDate.value || null,
        notes: els.invoiceNotes.value.trim() || null,
        is_pro: state.isPro,
        session_id: state.sessionId,
      };

      els.btnSaveInvoice.disabled = true;
      els.btnSaveInvoice.innerHTML =
        '<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Saving...';

      try {
        const res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice: invoice, items: items }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save invoice");
        }

        incrementUsage();
        showToast("Invoice Saved", "Invoice " + invoice.invoice_number + " saved successfully.", "success");
      } catch (err) {
        showToast("Save Error", err.message, "error");
      } finally {
        els.btnSaveInvoice.disabled = false;
        els.btnSaveInvoice.innerHTML =
          '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Save Invoice';
      }
    }

    // ──────────────────────────────────────────────
    // PDF GENERATION
    // ──────────────────────────────────────────────
    function handleDownloadPdf() {
      if (!checkFreeLimit()) return;

      if (typeof window.jspdf === "undefined") {
        showToast("PDF Error", "PDF library not loaded. Please refresh.", "error");
        return;
      }

      var jsPDF = window.jspdf.jsPDF;
      var doc = new jsPDF({ unit: "mm", format: "a4" });
      var pageW = 210;
      var marginL = 20;
      var marginR = 20;
      var contentW = pageW - marginL - marginR;
      var y = 20;
      var sym = getCurrencySymbol();

      // Colors
      var brandBlue = [59, 130, 246];
      var darkBg = [10, 15, 28];
      var textWhite = [255, 255, 255];
      var textGray = [148, 163, 184];
      var lineColor = [30, 41, 59];

      // Background
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
      doc.rect(0, 0, pageW, 297, "F");

      // Header bar
      doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.rect(0, 0, pageW, 40, "F");

      // Logo or brand name
      if (state.logoDataUrl && state.isPro) {
        try {
          doc.addImage(state.logoDataUrl, "PNG", marginL, 8, 24, 24);
        } catch (e) {
          doc.setFontSize(18);
          doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
          doc.text(els.senderName.value || "VantrexTech", marginL, 25);
        }
      } else {
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
        doc.text(els.senderName.value || "VantrexTech", marginL, 25);
      }

      // Invoice label on header
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text("INVOICE", pageW - marginR, 18, { align: "right" });
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(els.invoiceNumber.value, pageW - marginR, 28, { align: "right" });

      y = 52;

      // From / To section
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("FROM", marginL, y);
      doc.text("BILL TO", marginL + contentW / 2 + 5, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text(els.senderName.value || "VantrexTech", marginL, y);
      doc.text(els.clientName.value || "--", marginL + contentW / 2 + 5, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);

      if (els.senderEmail.value) {
        doc.text(els.senderEmail.value, marginL, y);
        y += 4;
      }
      if (els.senderAddress.value) {
        doc.text(els.senderAddress.value, marginL, y);
      }

      var yRight = y - (els.senderEmail.value ? 4 : 0);
      if (els.clientEmail.value) {
        doc.text(els.clientEmail.value, marginL + contentW / 2 + 5, yRight);
        yRight += 4;
      }
      if (els.clientAddress.value) {
        doc.text(els.clientAddress.value, marginL + contentW / 2 + 5, yRight);
      }

      y = Math.max(y, yRight) + 10;

      // Dates
      doc.setFillColor(17, 24, 39);
      doc.roundedRect(marginL, y, contentW, 14, 2, 2, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("Issue Date", marginL + 5, y + 5);
      doc.text("Due Date", marginL + contentW / 3, y + 5);
      doc.text("Currency", marginL + (contentW * 2) / 3, y + 5);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text(els.issueDate.value || "--", marginL + 5, y + 11);
      doc.text(els.dueDate.value || "--", marginL + contentW / 3, y + 11);
      doc.text(els.currencySelect.value, marginL + (contentW * 2) / 3, y + 11);

      y += 22;

      // Line items table header
      doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.roundedRect(marginL, y, contentW, 10, 2, 2, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text("DESCRIPTION", marginL + 5, y + 7);
      doc.text("QTY", marginL + contentW * 0.55, y + 7);
      doc.text("PRICE", marginL + contentW * 0.68, y + 7);
      doc.text("AMOUNT", marginL + contentW - 5, y + 7, { align: "right" });

      y += 14;

      // Line items rows
      var rows = els.lineItemsContainer.querySelectorAll("[data-item-id]");
      var subtotal = 0;

      rows.forEach(function (row, idx) {
        var desc = row.querySelector('[data-field="desc"]').value || "Item " + (idx + 1);
        var qty = parseFloat(row.querySelector('[data-field="qty"]').value) || 0;
        var price = parseFloat(row.querySelector('[data-field="price"]').value) || 0;
        var amount = qty * price;
        subtotal += amount;

        if (idx % 2 === 0) {
          doc.setFillColor(17, 24, 39);
          doc.rect(marginL, y - 4, contentW, 10, "F");
        }

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
        doc.text(desc.substring(0, 40), marginL + 5, y + 2);

        doc.setTextColor(textGray[0], textGray[1], textGray[2]);
        doc.text(qty.toString(), marginL + contentW * 0.55, y + 2);
        doc.text(sym + price.toFixed(2), marginL + contentW * 0.68, y + 2);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
        doc.text(sym + amount.toFixed(2), marginL + contentW - 5, y + 2, { align: "right" });

        y += 10;
      });

      y += 4;

      // Divider
      doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
      doc.line(marginL + contentW * 0.5, y, marginL + contentW, y);
      y += 6;

      // Totals
      var taxRate = parseFloat(els.taxRate.value) || 0;
      var taxAmount = subtotal * (taxRate / 100);
      var total = subtotal + taxAmount;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("Subtotal", marginL + contentW * 0.55, y);
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text(sym + subtotal.toFixed(2), marginL + contentW - 5, y, { align: "right" });
      y += 6;

      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("Tax (" + taxRate + "%)", marginL + contentW * 0.55, y);
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text(sym + taxAmount.toFixed(2), marginL + contentW - 5, y, { align: "right" });
      y += 8;

      // Total highlight
      doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.roundedRect(marginL + contentW * 0.5, y - 5, contentW * 0.5, 14, 2, 2, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textWhite[0], textWhite[1], textWhite[2]);
      doc.text("TOTAL", marginL + contentW * 0.55, y + 4);
      doc.setFontSize(12);
      doc.text(sym + total.toFixed(2), marginL + contentW - 5, y + 4, { align: "right" });

      y += 20;

      // Notes
      var notes = els.invoiceNotes.value.trim();
      if (notes) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textGray[0], textGray[1], textGray[2]);
        doc.text("NOTES / TERMS", marginL, y);
        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        var splitNotes = doc.splitTextToSize(notes, contentW);
        doc.text(splitNotes, marginL, y);
        y += splitNotes.length * 5;
      }

      // Footer
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text("Generated by VantrexTech AI Invoice Assistant", pageW / 2, 285, { align: "center" });

      // Save
      doc.save(els.invoiceNumber.value + ".pdf");
      showToast("PDF Downloaded", "Your invoice PDF has been generated.", "success");
    }

    // ──────────────────────────────────────────────
    // NEW INVOICE
    // ──────────────────────────────────────────────
    function handleNewInvoice() {
      els.clientName.value = "";
      els.clientEmail.value = "";
      els.clientAddress.value = "";
      els.taxRate.value = "0";
      els.invoiceNotes.value = "";
      els.dueDate.value = "";
      els.aiPrompt.value = "";
      els.aiStatus.classList.add("hidden");
      els.aiStatus.classList.remove("text-[#22C55E]", "text-red-400");
      els.aiStatus.classList.add("text-[#64748B]");

      els.lineItemsContainer.innerHTML = "";
      addLineItem("", 1, 0);

      setTodayDate();
      generateInvoiceNumber();
      updateSummary();
    }

    // ──────────────────────────────────────────────
    // MODALS
    // ──────────────────────────────────────────────
    function showUpgradeModal() {
      els.upgradeModal.classList.remove("hidden");
      els.upgradeModal.classList.add("flex");
    }

    function hideUpgradeModal() {
      els.upgradeModal.classList.add("hidden");
      els.upgradeModal.classList.remove("flex");
    }

    function showWaitlistModal() {
      els.waitlistForm.classList.remove("hidden");
      els.waitlistSuccess.classList.add("hidden");
      els.waitlistModal.classList.remove("hidden");
      els.waitlistModal.classList.add("flex");
    }

    function hideWaitlistModal() {
      els.waitlistModal.classList.add("hidden");
      els.waitlistModal.classList.remove("flex");
    }

    // ──────────────────────────────────────────────
    // WAITLIST
    // ──────────────────────────────────────────────
    async function handleWaitlistSubmit(e) {
      e.preventDefault();

      var email = $("waitlist-email").value.trim();
      var name = $("waitlist-name").value.trim();
      var company = $("waitlist-company").value.trim();

      if (!email) return;

      try {
        var res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, name: name, company: company }),
        });

        if (!res.ok) throw new Error("Failed to join waitlist");

        els.waitlistForm.classList.add("hidden");
        els.waitlistSuccess.classList.remove("hidden");
        showToast("Waitlist", "You have been added to the waitlist!", "success");
      } catch (err) {
        showToast("Error", err.message, "error");
      }
    }

    // ──────────────────────────────────────────────
    // STRIPE
    // ──────────────────────────────────────────────
    function handleStripeCheckout() {
      window.open(STRIPE_PAYMENT_LINK, "_blank");
    }

    // ──────────────────────────────────────────────
    // TOAST
    // ──────────────────────────────────────────────
    function showToast(title, message, type) {
      els.toastTitle.textContent = title;
      els.toastMessage.textContent = message;

      var iconColors = {
        success: { bg: "bg-[#22C55E]/20", text: "text-[#22C55E]" },
        error: { bg: "bg-red-500/20", text: "text-red-400" },
        warn: { bg: "bg-amber-500/20", text: "text-amber-400" },
      };

      var c = iconColors[type] || iconColors.success;
      els.toastIcon.className = "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full " + c.bg;
      var iconSvg = els.toastIcon.querySelector("svg");
      if (iconSvg) {
        iconSvg.className.baseVal = "h-3.5 w-3.5 " + c.text;
      }

      els.toast.classList.remove("hidden");
      els.toast.classList.add("flex");

      clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(function () {
        els.toast.classList.add("hidden");
        els.toast.classList.remove("flex");
      }, 4000);
    }

    // ──────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────
    function escapeAttr(str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    // ──────────────────────────────────────────────
    // EVENTS
    // ──────────────────────────────────────────────
    function bindEvents() {
      // AI Parse
      els.btnAiParse.addEventListener("click", handleAiParse);
      els.aiPrompt.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleAiParse();
        }
      });

      // Add line item
      els.btnAddItem.addEventListener("click", function () {
        addLineItem("", 1, 0);
      });

      // Save / PDF / New
      els.btnSaveInvoice.addEventListener("click", handleSaveInvoice);
      els.btnDownloadPdf.addEventListener("click", handleDownloadPdf);
      els.btnNewInvoice.addEventListener("click", handleNewInvoice);

      // Client name live update
      els.clientName.addEventListener("input", updateSummary);

      // Tax rate change
      els.taxRate.addEventListener("input", updateSummary);

      // Currency change
      els.currencySelect.addEventListener("change", function () {
        updateSummary();
        // Refresh all row amounts
        var rows = els.lineItemsContainer.querySelectorAll("[data-item-id]");
        rows.forEach(function (row) {
          recalcRow(row);
        });
      });

      // Logo
      els.logoUploadArea.addEventListener("click", function () {
        els.logoInput.click();
      });
      els.logoInput.addEventListener("change", function () {
        if (this.files && this.files[0]) {
          handleLogoUpload(this.files[0]);
        }
      });

      // Upgrade modal
      els.btnUpgradeNav.addEventListener("click", showUpgradeModal);
      els.btnCloseUpgrade.addEventListener("click", hideUpgradeModal);
      els.upgradeModal.addEventListener("click", function (e) {
        if (e.target === els.upgradeModal) hideUpgradeModal();
      });

      // Stripe checkout
      els.btnStripeCheckout.addEventListener("click", handleStripeCheckout);

      // Waitlist modal
      els.btnWaitlistFooter.addEventListener("click", showWaitlistModal);
      els.btnCloseWaitlist.addEventListener("click", hideWaitlistModal);
      els.waitlistModal.addEventListener("click", function (e) {
        if (e.target === els.waitlistModal) hideWaitlistModal();
      });
      els.waitlistForm.addEventListener("submit", handleWaitlistSubmit);
    }

    // ──────────────────────────────────────────────
    // BOOT
    // ──────────────────────────────────────────────
    init();
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
