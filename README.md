# Healio - Full-Stack Doctor Appointment Platform

Healio is a modern, responsive doctor appointment scheduling platform built with Spring Boot, React, and integrated with the Groq API for advanced AI features.

---

## 🚀 Getting Started

### Prerequisites
- Java 21 SDK
- Node.js (v18+)
- Maven (v3.9+)

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Start the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
   *The server runs on [http://localhost:8080](http://localhost:8080) and uses an H2 in-memory database seeded automatically on startup.*

### Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The client application will launch on [http://localhost:5173/](http://localhost:5173/).*

---

## 🤖 AI Features (Powered by Groq + Llama 3.1)

Healio utilizes Groq's low-latency inference API running `llama-3.1-8b-instant` to deliver two core AI capabilities:

### 1. Symptom-to-Specialist Suggester (Patient Side)
Patients describe what symptoms they are experiencing in plain text on the home page. The AI analyzes the symptoms, suggests the matching doctor specialization, and explains its reasoning in simple terms.
* **Triage Flow:** Homepage Symptom Box → Suggestion Card → Automatic result filtering of matching doctors.

### 2. AI Prescription Formatter (Doctor Side)
Doctors can type or dictate raw, unstructured notes (e.g. *"patient has cold, give codeine syrup 5ml thrice daily for 3 days, rest, follow up if fever increases"*). The AI automatically formats this into a clean, structured prescription with:
* Diagnostic clinical notes
* Structured medications table (Medicine | Dosage | Frequency | Duration)
* Lifestyle/general advice
* Follow-up instructions
* A simplified, patient-friendly summary for the patient's convenience.

---

## 🔒 Concurrency & Double-Booking Prevention

To guarantee that no two patients can successfully book the same doctor's slot at the same time:
1. **Pessimistic Locking:** The database slot row is locked during transaction evaluation using `SELECT ... FOR UPDATE` (via `@Lock(LockModeType.PESSIMISTIC_WRITE)` in Spring Data JPA). Any concurrent booking requests block and wait until the active transaction commits.
2. **Unique Database Constraints:** The `bookings` table has a `UNIQUE (slot_id)` constraint, serving as a failsafe database-level protection against race conditions.
3. **Graceful Failover:** If a conflict occurs, the second booking request is rejected with a `409 Conflict` status, and the frontend automatically offers and highlights the **next available slot** for that doctor.

---

## 🔑 Mock Credentials for Testing

The application seeds the following default accounts on startup:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Doctor (Cardiology)** | `priya@ambula.com` | `password123` | Dr. Priya Sharma (Connaught Place) |
| **Doctor (Dermatology)** | `rahul@ambula.com` | `password123` | Dr. Rahul Mehta (Lajpat Nagar) |
| **Doctor (Physician)** | `ananya@ambula.com` | `password123` | Dr. Ananya Iyer (Vasant Kunj) |
| **Patient** | `ravi@test.com` | `password123` | Ravi Kumar |
