import Script from "next/script";

export default function InvoicePage() {
  return (
    <>
      <div
        id="app-root"
        className="min-h-screen bg-[#0A0F1C] text-[#E2E8F0] font-sans antialiased overflow-x-hidden"
      >
        {/* Top Nav */}
        <header className="sticky top-0 z-50 border-b border-[#1E293B] bg-[#0A0F1C]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6] sm:h-9 sm:w-9">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white leading-tight sm:text-base truncate">
                  VantrexTech
                </h1>
                <p className="text-[10px] text-[#64748B] sm:text-xs">AI Invoice Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span
                id="plan-badge"
                className="hidden rounded-full bg-[#1E293B] px-2 py-1 text-[10px] font-medium text-[#94A3B8] sm:inline-flex sm:px-3 sm:text-xs"
              >
                Free Plan
              </span>
              <button
                id="btn-upgrade-nav"
                type="button"
                className="rounded-lg bg-[#3B82F6] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 sm:px-4 sm:py-2 sm:text-xs"
              >
                Upgrade
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
          {/* AI Assistant Bar */}
          <section className="mb-6">
            <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3B82F6]/20">
                  <svg
                    className="h-3.5 w-3.5 text-[#3B82F6]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-white">
                  AI Invoice Builder
                </h2>
                <span className="rounded bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-medium text-[#3B82F6]">
                  BETA
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  id="ai-prompt"
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-4 py-3 text-sm text-[#E2E8F0] placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                  placeholder='e.g. "Create invoice for John Smith, laptop repair $150, parts $40, 10% tax, due tomorrow"'
                ></textarea>
                <button
                  id="btn-ai-parse"
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50 sm:self-end"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Generate Invoice
                </button>
              </div>
              <div
                id="ai-status"
                className="mt-2 hidden text-xs text-[#64748B]"
              ></div>
            </div>
          </section>

          {/* Two Column Layout on Desktop */}
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
            {/* Left: Invoice Form */}
            <div className="space-y-6 min-w-0">
              {/* Sender / Client */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* From */}
                <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 sm:p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#64748B] sm:mb-4">
                    From (Your Business)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="sender-name"
                        className="mb-1 block text-xs font-medium text-[#94A3B8]"
                      >
                        Business Name
                      </label>
                      <input
                        id="sender-name"
                        type="text"
                        defaultValue="VantrexTech"
                        className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sender-email"
                        className="mb-1 block text-xs font-medium text-[#94A3B8]"
                      >
                        Email
                      </label>
                      <input
                        id="sender-email"
                        type="email"
                        placeholder="you@business.com"
                        className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sender-address"
                        className="mb-1 block text-xs font-medium text-[#94A3B8]"
                      >
                        Address
                      </label>
                      <input
                        id="sender-address"
                        type="text"
                        placeholder="123 Main St, City, State"
                        className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                      />
                    </div>
                    {/* Logo upload */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#94A3B8]">
                        Logo
                      </label>
                      <div
                        id="logo-upload-area"
                        className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#1E293B] bg-[#0A0F1C] p-4 transition hover:border-[#3B82F6]/50"
                      >
                        <div
                          id="logo-placeholder"
                          className="text-center"
                        >
                          <svg
                            className="mx-auto h-8 w-8 text-[#475569]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                            />
                          </svg>
                          <p className="mt-1 text-xs text-[#475569]">
                            Upload logo
                          </p>
                        </div>
                        <img
                          id="logo-preview"
                          src=""
                          alt="Business logo preview"
                          className="hidden h-16 w-auto max-w-[120px] object-contain"
                        />
                      </div>
                      <input
                        id="logo-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* To */}
                <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 sm:p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#64748B] sm:mb-4">
                    Bill To (Client)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="client-name"
                        className="mb-1 block text-xs font-medium text-[#94A3B8]"
                      >
                        Client Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="client-name"
                        type="text"
                        placeholder="John Smith"
                        className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="client-email"
                        className="mb-1 block text-xs font-medium text-[#94A3B8]"
                      >
                        Client Email
                      </label>
                      <input
                        id="client-email"
                        type="email"
                        placeholder="client@email.com"
                        className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="client-address"
                        className="mb-1 block text-xs font-medium text-[#94A3B8]"
                      >
                        Client Address
                      </label>
                      <input
                        id="client-address"
                        type="text"
                        placeholder="456 Oak Ave, City, State"
                        className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                      />
                    </div>
                    {/* Invoice Meta */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="issue-date"
                          className="mb-1 block text-xs font-medium text-[#94A3B8]"
                        >
                          Issue Date
                        </label>
                        <input
                          id="issue-date"
                          type="date"
                          className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="due-date"
                          className="mb-1 block text-xs font-medium text-[#94A3B8]"
                        >
                          Due Date
                        </label>
                        <input
                          id="due-date"
                          type="date"
                          className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="invoice-number"
                          className="mb-1 block text-xs font-medium text-[#94A3B8]"
                        >
                          Invoice #
                        </label>
                        <input
                          id="invoice-number"
                          type="text"
                          readOnly
                          className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C]/50 px-3 py-2.5 text-sm text-[#94A3B8] transition focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="currency-select"
                          className="mb-1 block text-xs font-medium text-[#94A3B8]"
                        >
                          Currency
                        </label>
                        <select
                          id="currency-select"
                          className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 [color-scheme:dark]"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (&euro;)</option>
                          <option value="GBP">GBP (&pound;)</option>
                          <option value="NGN">NGN (&#8358;)</option>
                          <option value="CAD">CAD ($)</option>
                          <option value="AUD">AUD ($)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 sm:p-5">
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Line Items
                  </h3>
                  <button
                    id="btn-add-item"
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E293B] px-3 py-1.5 text-xs font-medium text-[#94A3B8] transition hover:bg-[#334155] hover:text-white focus:outline-none"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Item
                  </button>
                </div>

                {/* Desktop table header - hidden on mobile */}
                <div className="mb-2 hidden rounded-lg bg-[#0A0F1C] px-3 py-2.5 sm:grid sm:grid-cols-[1fr_60px_90px_90px_36px] sm:gap-2 lg:grid-cols-[1fr_80px_110px_110px_40px] lg:gap-3 lg:px-4">
                  <span className="text-xs font-medium text-[#64748B]">
                    Description
                  </span>
                  <span className="text-xs font-medium text-[#64748B]">
                    Qty
                  </span>
                  <span className="text-xs font-medium text-[#64748B]">
                    Unit Price
                  </span>
                  <span className="text-xs font-medium text-[#64748B]">
                    Amount
                  </span>
                  <span></span>
                </div>

                <div id="line-items-container" className="space-y-3"></div>

                {/* Tax Row */}
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 sm:px-4 sm:py-3">
                  <label
                    htmlFor="tax-rate"
                    className="text-xs font-medium text-[#94A3B8] whitespace-nowrap"
                  >
                    Tax Rate (%)
                  </label>
                  <input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    defaultValue="0"
                    className="w-24 rounded-lg border border-[#1E293B] bg-[#111827] px-3 py-2 text-sm text-white text-right transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                  />
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label
                    htmlFor="invoice-notes"
                    className="mb-1 block text-xs font-medium text-[#94A3B8]"
                  >
                    Notes / Payment Terms
                  </label>
                  <textarea
                    id="invoice-notes"
                    rows={2}
                    placeholder="Payment due within 30 days. Bank details..."
                    className="w-full resize-none rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Right: Live Preview & Actions */}
            <aside className="space-y-6 min-w-0">
              {/* Summary Card */}
              <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 sm:p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#64748B] sm:mb-4">
                  Invoice Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Invoice #</span>
                    <span id="summary-invoice-number" className="font-mono text-white">
                      --
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Client</span>
                    <span id="summary-client" className="text-white">
                      --
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Items</span>
                    <span id="summary-item-count" className="text-white">
                      0
                    </span>
                  </div>
                  <hr className="border-[#1E293B]" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">Subtotal</span>
                    <span id="summary-subtotal" className="font-mono text-white">
                      $0.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8]">
                      Tax (<span id="summary-tax-rate">0</span>%)
                    </span>
                    <span id="summary-tax" className="font-mono text-white">
                      $0.00
                    </span>
                  </div>
                  <hr className="border-[#1E293B]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      Total
                    </span>
                    <span
                      id="summary-total"
                      className="text-xl font-bold text-[#3B82F6]"
                    >
                      $0.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  id="btn-save-invoice"
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Invoice
                </button>
                <button
                  id="btn-download-pdf"
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#111827] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  Download PDF
                </button>
                <button
                  id="btn-new-invoice"
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#111827] px-5 py-3.5 text-sm font-semibold text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-white focus:outline-none"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Invoice
                </button>
              </div>

              {/* Invoice History (Pro) */}
              <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Recent Invoices
                  </h3>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    PRO
                  </span>
                </div>
                <div
                  id="invoice-history"
                  className="space-y-2 text-sm text-[#64748B]"
                >
                  <p className="text-xs">Upgrade to Pro to view past invoices.</p>
                </div>
              </div>

              {/* Free usage counter */}
              <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#94A3B8]">
                    Free Invoices Used
                  </span>
                  <span
                    id="usage-counter"
                    className="text-xs font-mono text-white"
                  >
                    0 / 3
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                  <div
                    id="usage-bar"
                    className="h-full rounded-full bg-[#3B82F6] transition-all"
                    style={{ width: "0%" }}
                  ></div>
                </div>
                <p className="mt-2 text-[10px] text-[#64748B]">
                  Free plan allows 3 invoices. Upgrade for unlimited.
                </p>
              </div>
            </aside>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#1E293B] bg-[#0A0F1C]">
          <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-[#475569]">
                &copy; 2026 VantrexTech. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <button
                  id="btn-waitlist-footer"
                  type="button"
                  className="text-xs text-[#3B82F6] hover:underline"
                >
                  Join Waitlist
                </button>
                <span className="text-[#1E293B]">|</span>
                <span className="text-xs text-[#475569]">
                  Powered by AI
                </span>
              </div>
            </div>
          </div>
        </footer>

        {/* ===== UPGRADE MODAL ===== */}
        <div
          id="upgrade-modal"
          className="fixed inset-0 z-[100] hidden items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-[#1E293B] bg-[#111827] p-4 shadow-2xl sm:p-6">
            <button
              id="btn-close-upgrade"
              type="button"
              className="absolute right-4 top-4 text-[#64748B] hover:text-white transition"
              aria-label="Close upgrade modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Upgrade to Pro
                </h2>
                <p className="text-xs text-[#64748B]">
                  Unlock the full power of VantrexTech
                </p>
              </div>
            </div>
            <ul className="mb-6 space-y-2.5">
              <li className="flex items-start gap-2 text-sm text-[#E2E8F0]">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Unlimited invoices
              </li>
              <li className="flex items-start gap-2 text-sm text-[#E2E8F0]">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Custom logo on PDF
              </li>
              <li className="flex items-start gap-2 text-sm text-[#E2E8F0]">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Invoice history &amp; tracking
              </li>
              <li className="flex items-start gap-2 text-sm text-[#E2E8F0]">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Priority AI parsing
              </li>
              <li className="flex items-start gap-2 text-sm text-[#E2E8F0]">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22C55E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Multi-currency support
              </li>
            </ul>
            <div className="mb-4 rounded-xl bg-[#0A0F1C] p-4 text-center">
              <span className="text-3xl font-bold text-white">$9</span>
              <span className="text-sm text-[#64748B]">/month</span>
            </div>
            <button
              id="btn-flutterwave-checkout"
              type="button"
              className="w-full rounded-xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white transition hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
            >
              Subscribe Now
            </button>
            <p className="mt-3 text-center text-[10px] text-[#475569]">
              Powered by Flutterwave. Cancel anytime.
            </p>
          </div>
        </div>

        {/* ===== WAITLIST MODAL ===== */}
        <div
          id="waitlist-modal"
          className="fixed inset-0 z-[100] hidden items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-[#1E293B] bg-[#111827] p-4 shadow-2xl sm:p-6">
            <button
              id="btn-close-waitlist"
              type="button"
              className="absolute right-4 top-4 text-[#64748B] hover:text-white transition"
              aria-label="Close waitlist modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white">
                Join the VantrexTech Waitlist
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Be the first to access our full AI business platform.
              </p>
            </div>
            <form id="waitlist-form" className="space-y-3">
              <div>
                <label
                  htmlFor="waitlist-name"
                  className="mb-1 block text-xs font-medium text-[#94A3B8]"
                >
                  Full Name
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                />
              </div>
              <div>
                <label
                  htmlFor="waitlist-email"
                  className="mb-1 block text-xs font-medium text-[#94A3B8]"
                >
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                />
              </div>
              <div>
                <label
                  htmlFor="waitlist-company"
                  className="mb-1 block text-xs font-medium text-[#94A3B8]"
                >
                  Company
                </label>
                <input
                  id="waitlist-company"
                  type="text"
                  placeholder="Acme Inc."
                  className="w-full rounded-lg border border-[#1E293B] bg-[#0A0F1C] px-3 py-2.5 text-sm text-white placeholder-[#475569] transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white transition hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
              >
                Join Waitlist
              </button>
            </form>
            <div
              id="waitlist-success"
              className="hidden text-center py-8"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/20">
                <svg
                  className="h-6 w-6 text-[#22C55E]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">
                {"You're on the list!"}
              </h3>
              <p className="mt-1 text-sm text-[#64748B]">
                {"We'll notify you when new features launch."}
              </p>
            </div>
          </div>
        </div>

        {/* ===== TOAST ===== */}
        <div
          id="toast"
          className="fixed bottom-4 left-3 right-3 z-[200] hidden rounded-xl border border-[#1E293B] bg-[#111827] px-4 py-3 shadow-2xl sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm sm:px-5 sm:py-4"
        >
          <div className="flex items-start gap-3">
            <div
              id="toast-icon"
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20"
            >
              <svg
                className="h-3.5 w-3.5 text-[#22C55E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p id="toast-title" className="text-sm font-semibold text-white">
                Success
              </p>
              <p id="toast-message" className="mt-0.5 text-xs text-[#64748B]">
                Invoice saved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* jsPDF CDN */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js"
        strategy="beforeInteractive"
      />

      {/* Main script */}
      <Script src="/script.js" strategy="afterInteractive" />
    </>
  );
}
