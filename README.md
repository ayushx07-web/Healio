# Healio - Doctor Appointment Platform & AI Triage Room

Healio is a full-stack doctor appointment booking and clinical consultation platform built with **Spring Boot** and **React**, featuring concurrency-safe slot bookings and AI-powered symptom triage and prescription formatting using the **Groq API** (Llama 3.1).

---

## 🏗️ Architecture & System Design

```
+-------------------------------------------------------+
|                   React Frontend                      |
+-------------------------------------------------------+
                           |  (JSON over REST)
                           v
+-------------------------------------------------------+
|                Spring Boot Controller                 |
| - AuthController     - DoctorController               |
| - BookingController  - HealthSummaryController        |
| - AIController                                        |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|                     Service Layer                     |
| - AuthService        - DoctorService                  |
| - BookingService     - HealthSummaryService           |
| - GroqService                                         |
+-------------------------------------------------------+
         |                                     |
         | (Spring Data JPA)                   | (HTTP Client)
         v                                     v
+-------------------------+          +------------------+
|      Database (H2)      |          |     Groq API     |
| - slots    - bookings   |          | (Llama-3.1-8b)   |
| - users    - doctors    |          +------------------+
+-------------------------+
```

### Backend Layer Mapping
* **REST Controllers (`com.ambula.*`)**: Exposes REST interfaces with DTO validations, maps exception types to correct HTTP statuses (e.g., mapping booking conflicts to `409 Conflict`).
* **Service Layer (`com.ambula.*`)**: Coordinates transactions, manages locks, and integrates external clients like HTTP-based Groq calls.
* **JPA/Repository Layer (`com.ambula.*`)**: Declares database queries using Spring Data JPA, managing row locks and transactions.
* **H2 Database**: Operates as a file-based embedded PostgreSQL-compatible relational store.

---

## 🔒 Concurrency & Double-Booking Prevention

### The Problem
In an active medical booking portal, multiple patients will attempt to book the same popular slot at the same instant. A double-booking is a critical failure that directly degrades system reliability and provider trust. 

### Why Pessimistic Locking over Optimistic Locking?
To prevent double bookings, this system implements a database-level **Pessimistic Write Lock** (`SELECT ... FOR UPDATE` via Hibernate `@Lock(LockModeType.PESSIMISTIC_WRITE)`):

* **Optimistic Locking (`@Version`):** Checks version columns at commit time. Under high contention (e.g., 10 users booking a single open slot simultaneously), 9 transactions will perform full validation, query the database, and only fail at commit time. This wastes application and database server CPU cycles on doomed work and leads to a frustrating user experience.
* **Pessimistic Locking (`PESSIMISTIC_WRITE`):** The first transaction to call `findByIdWithLock` immediately acquires a write lock on the target slot row. Any concurrent transaction attempting to query or write that same row blocks and waits at the database level until the holding transaction either commits or rolls back. 

In booking systems, **consistency overrides throughput**. A minor delay (waiting for a lock to clear) is vastly superior to transaction failure or a silent double-booking.

### Defense-In-Depth: Unique Database Constraint
Even if application-level validation slips (e.g., during database migration or isolation level mismatch), the database enforces a `UNIQUE(slot_id)` constraint on the `bookings` table. This serves as a fail-safe. If two transactions somehow reach the insert stage, the H2/Postgres engine will reject the second transaction with a unique constraint violation.

### End-to-End Conflict Flow
```mermaid
sequenceDiagram
    autonumber
    actor Patient1 as Patient 1 (Wins Lock)
    actor Patient2 as Patient 2 (Blocked)
    participant DB as Database (H2)
    participant API as BookingService

    Patient1->>API: bookSlot(slot_1)
    Patient2->>API: bookSlot(slot_1)
    
    Note over API,DB: Transaction 1 starts
    API->>DB: findByIdWithLock(slot_1)
    Note over DB: Lock acquired on slot_1
    
    Note over API,DB: Transaction 2 starts
    API->>DB: findByIdWithLock(slot_1)
    Note over DB: Transaction 2 blocks & waits...

    API->>DB: Insert Booking (slot_1)
    Note over API,DB: Transaction 1 commits & releases lock
    
    Note over DB: Transaction 2 is unblocked
    DB-->>API: returns slot_1 (now booked)
    API->>API: Checks booking status (true)
    API-->>Patient2: Throws SlotAlreadyTakenException
    API-->>Patient2: HTTP 409 Conflict (with next available slot suggestions)
```

1. The second request is rejected with a `409 Conflict` status containing suggestions for the doctor's **next available slot**.
2. The React frontend catches the `409` response and parses the suggested slot ID and time.
3. The UI automatically displays a suggestion card (e.g., *"That slot was just booked! Next available: Friday, June 12 at 10:30 AM"*) and pre-selects the recommended slot for user confirmation.

---

## 🤖 AI Integrations (Powered by Groq Llama 3.1)

### 1. Symptom-to-Specialist Suggester
Patients input unstructured descriptions of their symptoms. The app hits Llama 3.1 with system prompts to identify the matching doctor specialization and write a simple medical triage justification.
* **⚠️ Limit:** LLM categorization is *suggestive* only. It is not a clinical diagnosis. It guides patients to the correct scheduling page but warns them that triage suggestions must be reviewed by a human healthcare provider.

### 2. AI Prescription Formatter
Doctors dictate or type messy consultation notes (e.g., *"give aspirin 75mg once daily after meals for 10 days, patient needs rest, follow up next week"*). The model outputs structured JSON separating the diagnosis, a structured medications table, general lifestyle advice, and follow-up times.
* **⚠️ Limit:** The formatted output is a draft *formatting-only* tool. LLMs are subject to hallucination. Doctors must thoroughly review, modify, and authorize the generated structured prescription details before saving it to the patient's record.

---

## 📂 Key Source Code Structure

### Backend (`backend/src/main/java`)
* **Entities**:
  * [Booking.java](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/backend/src/main/java/com/ambula/booking/Booking.java): Models the scheduling table with a `UNIQUE(slot_id)` database mapping.
  * [Slot.java](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/backend/src/main/java/com/ambula/slot/Slot.java): Manages the start, end, and blocked status of calendar slots.
* **Concurrency Locking**:
  * [SlotRepository.java](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/backend/src/main/java/com/ambula/slot/SlotRepository.java#L14-L16): Contains the pessimistic lock method `findByIdWithLock(id)`.
* **Services**:
  * [BookingService.java](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/backend/src/main/java/com/ambula/booking/BookingService.java): Manages transaction contexts and coordinates slot validation and locking.
  * [GroqService.java](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/backend/src/main/java/com/ambula/ai/GroqService.java): Integrates HTTP-based completions via JSON mode prompts.
* **Controllers**:
  * [BookingController.java](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/backend/src/main/java/com/ambula/booking/BookingController.java): Converts slot conflicts into JSON conflict suggestions.

### Frontend (`frontend/src`)
* [axios.js](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/frontend/src/api/axios.js): Intercepts `401 Unauthorized` API responses to coordinate session renewal.
* [SlotPicker.jsx](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/frontend/src/components/SlotPicker.jsx): Organizes slots into calendar date and time sections.
* [ConsultationForm.jsx](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/frontend/src/pages/doctor/ConsultationForm.jsx): Doctor clinical interface showcasing the AI formatting response.

---

## 🧪 Headline Concurrency Verification Test

To verify the system's lock integrity under load, a multi-threaded integration test was created:

### [BookingServiceConcurrencyTest.java](file:///c:/Users/kandp/OneDrive/Desktop/Ambula/backend/src/test/java/com/ambula/booking/BookingServiceConcurrencyTest.java)
Spawns two concurrent threads using Java `ExecutorService` and aligns their execution using a `CyclicBarrier`. Both threads invoke `bookSlot` at the exact same moment for the same slot ID:
```java
@SpringBootTest
public class BookingServiceConcurrencyTest {
    // ...
    @Test
    public void testConcurrentBookingPreventsDoubleBooking() throws InterruptedException {
        // ... (Sets up unique slot)
        CyclicBarrier barrier = new CyclicBarrier(2);
        List<Callable<BookingResponse>> tasks = List.of(
            () -> { barrier.await(); return bookingService.bookSlot(request, null); },
            () -> { barrier.await(); return bookingService.bookSlot(request, null); }
        );
        // ... (Runs tasks concurrently and asserts)
        assertThat(successCount).isEqualTo(1);
        assertThat(failureCount).isEqualTo(1);
        assertThat(bookingException).isInstanceOfAny(
            SlotAlreadyTakenException.class, 
            DataIntegrityViolationException.class
        );
    }
}
```
* **Result:** Exactly **one** transaction commits successfully, while the concurrent request is blocked and rejected (throwing either the application-level `SlotAlreadyTakenException` or a database-level `DataIntegrityViolationException`).

---

## ⚙️ Development vs. Production-Grade Gaps

| Feature Area | Current Local Development | Production-Grade Design |
| :--- | :--- | :--- |
| **Database** | Embedded file-based H2 Database | Managed PostgreSQL (e.g., AWS RDS) with HikariCP connection pool tuning |
| **Authentication** | Plaintext H2 seeded credentials | Production OAuth2 server / Spring Security Crypto with refresh tokens |
| **Secrets & Keys** | Environment variables / config property fallbacks | HashiCorp Vault / AWS Secrets Manager |
| **AI API Gateway** | Direct unthrottled Groq client HTTP requests | Redis Token Bucket rate-limiting to control API costs and prevent DoS |
| **Audit Trails** | basic JPA lifecycle logs | Dedicated audit tables mapping doctor consultations to booking reference histories |

---

## ⛔ Honest Limitations

* **No Real-time Availability Sync:** There is no WebSocket/SSE connection to sync slot bookings across different browser tabs in real-time. If a slot is booked, other patients only see the change upon reloading the search results or when trying to book it (triggering the 409 flow).
* **No Video Conferencing Infra:** The platform supports clinical records and prescription formatting but does not integrate WebRTC or video servers for remote virtual visits.
* **No Billing/Payment Gateways:** Consultation fees are displayed, but there is no payment gateway integration (e.g., Stripe, Razorpay) to collect fees during booking.
* **Seeded Doctor Profiles:** Doctor listings are seeded dynamically on startup and cannot be added or managed via a public administrative panel.
