# AI-Powered RFP Management System

This project is an AI-driven Request for Proposal (RFP) management system that streamlines the procurement process. It helps users generate RFPs using AI, send them to vendors, parse vendor responses (proposals) from emails, and compare proposals to recommend the best vendor.

## Project Setup

### Prerequisites

- **Node.js**: v18 or higher recommended.
- **Database**: MongoDB (Local or Atlas).
- **API Keys**: Google Gemini API Key for AI features.
- **Email Account**: An email account with IMAP and SMTP access (e.g., Gmail with App Password) to send RFPs and receive proposals.

### Installation

1.  **Clone the repository**.
2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    ```
3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    ```

### Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/airfp
GEMINI_API_KEY=your_google_gemini_api_key

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
IMAP_HOST=imap.gmail.com
```

### Running Locally

1.  **Start Backend**:

    ```bash
    cd backend
    npm run dev
    ```

    The server will run on `http://localhost:5000`.

2.  **Start Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Seed Data

No specific seed scripts are provided, but the system allows you to create Vendors and RFPs directly from the UI.

---

## Tech Stack

### Frontend

- **Framework**: React (Vite)
- **Styling**: TailwindCSS, Shadcn UI
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **AI Provider**: Google Gemini (`@google/genai`)
- **Email Services**: Nodemailer (sending), imap-simple (receiving/polling), mailparser (parsing)
- **Utilities**: dotenv, cors

---

## API Documentation

### RFPs

- **GET /api/rfps**: Get all RFPs.
- **POST /api/rfps**: Create a new RFP.
  - Body: `{ title, original_prompt, ... }`
- **GET /api/rfps/:id**: Get details of a specific RFP.
- **POST /api/rfps/:id/send**: Send the RFP to selected vendors via email.
- **POST /api/rfps/check-emails**: Manually trigger the email checker to look for new proposals.

### Proposals

- **GET /api/proposals/rfp/:id**: Get all proposals for a specific RFP.
- **GET /api/proposals/:id**: Get details of a single proposal.

### Vendors

- **GET /api/vendors**: Get all vendors.
- **POST /api/vendors**: Create a new vendor.
  - Body: `{ name, email, category, ... }`
- **PUT /api/vendors/:id**: Update a vendor.
- **DELETE /api/vendors/:id**: Delete a vendor.

---

## Decisions & Assumptions

### Design Decisions

- **AI Integration**: Google Gemini is used to structure raw user prompts into formal RFPs and to parse unstructured email responses from vendors into structured JSON data.
- **Email Flow**: The system actively polls an email inbox for responses. It matches incoming emails to RFPs (likely via subject line or context) and parses attachments/body text.
- **Comparison Logic**: Proposals are compared based on parsed cost, warranty, and compliance scores. An AI justification is generated to recommend the best vendor.
- **Vendor Management**: Vendors are managed as a separate entity to allow reuse across multiple RFPs.

### Assumptions

- **Email Format**: It is assumed vendors reply to the RFP email or include specific keywords (like the RFP ID) to be correctly associated.
- **Data Quality**: The system relies on the LLM's ability to extract structured data from potentially messy vendor emails.
- **Single Currency**: For simplicity, all costs are assumed to be in a single currency (e.g., USD).

---

## AI Tools Usage

### Tools Used

- **Antigravity (Google DeepMind Agent)**: Used for codebase cleanup, refactoring, bug fixing, and documentation generation.
- **Google Gemini**: Integrated within the application logic for generative tasks.

### Contributions

- **Code Cleanup**: Removed extensive comments and boilerplate code to make the codebase cleaner and more maintainable.
- **Feature Implementation**: Helped implement the logic for AI-driven proposal comparison and justification using the backend `aiService`.
- **Documentation**: Generated this README to provide a clear comprehensive guide to the project.

### Learnings

- **AI-Driven Workflows**: Integrating LLMs into the core business logic (like parsing emails) significantly reduces the need for rigid regex-based parsers but requires robust error handling for non-deterministic outputs.
