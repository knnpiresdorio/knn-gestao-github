# SaaS Transformation Action Plan: KNN Dashboard (BI-as-a-Service)

This plan focuses on transforming the KNN BI Dashboard into a SaaS platform where franchise owners/managers pay for advanced presentation and analysis of their existing Google Sheets data.

## Goal Description
Transition the current BI tool to a multi-tenant SaaS model where customers pay to visualize their financial data from Google Sheets via a premium dashboard interface.

## User Review Required

> [!IMPORTANT]
> **Data Model**: This system does **not** store student data locally. It consumes external data from **Google Sheets**. The SaaS value is in the "BI Layer" (presentation, charts, and metrics).
> [!IMPORTANT]
> **Isolation Scope**: Multi-tenancy focuses on isolating the **Google Spreadsheet IDs** and dashboard configurations for each franchise.
> [!NOTE]
> **Billing**: Automated monthly **Boletos/PIX** via **Asaas API**.

---

## Proposed Changes

### Phase 1: Access Control & Data Isolation
Protecting the "Secret Sauce" (Sheet Configurations).

#### 1.1 Secure Configuration (Supabase)
*   **Logical Isolation**: Harden the `tenants` table using RLS. Each owner only sees their own Spreadsheet IDs.
*   **Privacy Mode**: Ensure that even with valid credentials, data is only fetched if the `tenants.status` is `active` (verified against Asaas payment status).

#### 1.2 Frontend logic
*   **Config Multi-tenancy**: Update the `SettingsPage` to dynamically load the spreadsheet IDs indexed by the user's `tenant_id`.
*   **Lock Layer**: Implement a global React Guard that blocks the Dashboard view if the user is overdue on their monthly payment.

---

### Phase 2: Asaas Automation (Monthly Boletos)
Automating the "Pay-to-View" model.

#### 2.1 Asaas Backend Implementation
*   **Subscription Logic**: Create an Edge Function that registers a new franchise in Asaas and starts a monthly subscription generating a Boleto/PIX.
*   **Webhook Handler**: Monitor `PAYMENT_RECEIVED` and `PAYMENT_OVERDUE` events.
    - If `OVERDUE` > 5 days: Set tenant status to `suspended`.
    - If `RECEIVED`: Re-activate access immediately.

#### 2.2 Billing Dashboard
*   **Client Self-Service**: A "Minha Assinatura" tab where the owner can download the current month's Boleto or copy the PIX key without contacting support.

---

### Phase 3: White-labeling for Franchises
Improving the premium feel for owners.

*   **Dynamic Theme Variables**: Extend the currently limited `theme_color` to include custom logos and branding for each specific KNN unit.

---

### Phase 4: Security & Compliance (LGPD)
Focus on login security and audit.

*   **Audit Access**: Log when a user views the dashboard (capturing timestamp and IP) to comply with LGPD requirements for data processing transparency.
*   **MFA**: Enable Multi-Factor Authentication for franchise owners to protect their financial dashboard.

---

### Phase 5: PDF Reporting & Print-Ready Export
Enabling "Paper Trail" and professional reporting.

#### 5.1 Technical Implementation (Client-side)
*   **Print Simulation**: Implement "Print-only" CSS Media Queries to hide navigation bars and background elements during export.
*   **PDF Generation**: Use libraries like `jsPDF` + `html2canvas` or `react-to-print` to capture the current dashboard state (respecting all active filters).
*   **Report Template**: Design a header/footer template containing:
    - Franchise Name (Unit).
    - Date Range of the data.
    - Export Timestamp.
    - Page Numbers.

#### 5.2 Dynamic Information
*   The PDF will automatically capture the status of the dashboard at the moment of clicking "Export", including all active filters and visible KPIs.

---

## Verification Plan

### Automated Tests
1.  **RLS Theft Test**: Ensure a user from "Unit A" cannot overwrite or read the Spreadsheet ID of "Unit B".
2.  **Access Lock Test**: Simulate an `overdue` status in the database and verify the `/dashboard` route redirects to the `/billing` page.

### Manual Verification
1.  **Asaas Integration**: Generate a real test Boleto in the Asaas Sandbox and confirm the "active" status toggle in our Supabase DB upon "payment".
2.  **Configuration Persistence**: Verify that changing a Spreadsheet ID in settings only affects that specific franchise.
