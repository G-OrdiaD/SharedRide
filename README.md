# SharedRide

**SharedRide** is a full-stack ride-sharing platform designed as a practical demonstration of modern software engineering principles.  
Developed with **Node.js**, **React**, and **MongoDB**, the project applies **object-oriented programming (OOP)**, **MVC architecture**, and a range of **design patterns** to model the complexities of real-world ride-hailing systems.  

The application is not merely a prototype but a structured case study in applying software architecture to transportation services. By leveraging **Mongoose discriminators**, the system cleanly extends a base `User` schema into distinct roles (`Driver` and `Passenger`), and adapts a base `Ride` schema to manage dynamic ride lifecycles.  
Core services—including **fare management**, **payment processing**, **notifications**, and **ride management**—are implemented using established design patterns such as **Singleton**, **Factory**, **Observer**, and **Strategy**, ensuring scalability, maintainability, and extensibility.  

Unlike simplified ride-booking demos, SharedRide introduces realistic business logic such as:  
- **Driver earnings tracking** (cumulative and per-ride breakdowns)  
- **Passenger payment flexibility** (Card, Cash, Wallet)  
- **Role-based user flows** aligned with real ride-hailing platforms  

SharedRide thus serves both as a **functional ride-sharing solution** and as a **didactic reference** for the application of advanced software engineering methods in building distributed, user-centric applications.  
 
---

## Features

- **Authentication & Authorization**: JWT-based secure login and role-specific access  
- **Role-based users**: Drivers and Passengers with separate capabilities  
- **Driver Features**:  
  - Accept/reject ride requests  
  - Track active rides  
  - **Earnings dashboard** with total and per-ride breakdown  
- **Passenger Features**:  
  - Request rides with pickup/drop-off locations  
  - Choose **Card, Cash, or Wallet** as payment method  
  - Access ride history and receipts  
- **Ride Lifecycle Management**: Request → Accept → In-progress → Completed  
- **Fare Calculation**: Flexible pricing via Strategy Pattern (fixed, distance-based, surge, wallet-deduction)  
- **Payment Processing**: Managed by Factory + Strategy patterns  
- **Notification System**: Observer pattern updates passengers and drivers on ride status  

---

## Tech Stack

**Frontend:**  
- React.js with hooks  
- React Router  

**Backend:**  
- Node.js + Express.js  
- MongoDB + Mongoose (discriminators for schema inheritance)  
- JWT for authentication  

**Design & Patterns:**  
- **Singleton** → Ride management system 
- **Factory** → Payment type creation (Card, Cash, Wallet)  
- **Observer** → Ride status notifications  
- **Strategy** → Fare calculation and payment handling  

---

## System Architecture

The architecture is based on the **MVC model**:

- **Models**  
  - `User` (Base) → `Driver`, `Passenger` (via discriminators)  
  - `Ride` (Base) with linked participants  
  - `Payment` (Card, Cash, Wallet)  

- **Controllers**  
  - User management, ride lifecycle, payments, notifications  

- **Routes**  
  - REST API endpoints connected to controllers  

- **Views**  
  - React components handling presentation & interactions  

---

## Data Model Diagram

```mermaid
classDiagram
    class User {
        +id
        +name
        +email
    }
    User <|-- Driver
    User <|-- Passenger

    class Driver {
        +earnings
        +history
    }
    class Passenger {
        +wallet
        +rideRequests
    }

    class Ride {
        +pickup
        +dropoff
        +status
    }

    class Payment {
        <<factory+strategy>>
        +type
        +amount
    }

    Payment <|-- Card
    Payment <|-- Cash
    Payment <|-- Wallet

    Ride --> Passenger
    Ride --> Driver
    Payment --> Ride
    Payment --> Driver : updates earnings
````

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant P as Passenger
    participant D as Driver
    participant R as Ride System
    participant Pay as Payment

    P->>R: Request Ride
    R->>D: Notify Driver (Observer)
    D->>R: Accept Ride
    R->>P: Confirm Driver Assigned
    P->>Pay: Select Payment Method (Card/Cash/Wallet)
    Pay->>R: Process Payment
    R->>D: Update Earnings
    R->>P: Ride Completed Notification
    R->>D: Ride Completed Notification
```

---

## Installation

1. Clone repository

```bash
git clone https://github.com/G-OrdiaD/SharedRide.git
cd SharedRide
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

4. Setup `.env` in backend

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

5. Run servers

```bash
cd backend && npm run dev
cd ../frontend && npm start
```

6. Access app at

```
http://localhost:3000
```

---

## Design Patterns in Action

* **Singleton**: One shared MongoDB connection
* **Factory**: Creation of Payment objects (Card, Cash, Wallet)
* **Strategy**: Multiple pricing models for fares
* **Observer**: Real-time notifications for ride lifecycle

---

## License

Licensed under MIT.

**Project:** SharedRide

**Author:** Ordia David Gbakena

**GitHub:** [https://github.com/G-OrdiaD]
