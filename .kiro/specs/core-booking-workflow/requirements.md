# Requirements Document

## Introduction

The core booking workflow system is the heart of ImiRezervimi.al, enabling Albanian beauty salon customers to request appointments through Instagram bio links and receive WhatsApp confirmations. This system bridges the gap between Instagram discovery and structured appointment management, replacing chaotic DM conversations with an organized request-approval workflow that prioritizes customers based on their value and history.

The system must handle the complete customer journey from initial appointment request through final confirmation, while providing salon owners with an intuitive dashboard to manage their bookings efficiently. All interactions must be in Albanian and optimized for mobile devices accessed through Instagram's in-app browser.

## Requirements

### Requirement 1: Customer Appointment Request System

**User Story:** As a beauty salon customer, I want to request appointments through a salon's Instagram bio link, so that I can book services without having to send DMs or make phone calls.

#### Acceptance Criteria

1. WHEN a customer clicks a salon's Instagram bio link THEN the system SHALL display the salon's available services and time slots
2. WHEN a customer selects a service and time slot THEN the system SHALL require them to enter their name and phone number
3. WHEN a new customer submits their first request THEN the system SHALL send an SMS verification code to their phone number
4. WHEN a customer enters a valid verification code THEN the system SHALL create their customer profile and submit the appointment request
5. WHEN an appointment request is submitted THEN the system SHALL display "Kërkesa u dërgua te {salon_name} për {date} në {time}. Do të njoftoheni brenda 2 orësh! 💅" in Albanian
6. IF a customer has more than 2 pending requests THEN the system SHALL prevent them from submitting additional requests until existing ones are resolved
7. WHEN a customer tries to book more than 10 days in advance THEN the system SHALL display an error message in Albanian

### Requirement 2: Salon Request Management Dashboard

**User Story:** As a salon owner, I want to view and manage incoming appointment requests through a dashboard, so that I can efficiently approve or decline bookings based on my availability and customer priority.

#### Acceptance Criteria

1. WHEN a new appointment request is received THEN the system SHALL send a WhatsApp notification to the salon owner immediately
2. WHEN a salon owner logs into their dashboard THEN the system SHALL display all pending requests sorted by priority score
3. WHEN a salon owner views a request THEN the system SHALL show customer details, service requested, preferred time, and priority score
4. WHEN a salon owner approves a request THEN the system SHALL send a WhatsApp confirmation to the customer in Albanian
5. WHEN a salon owner declines a request THEN the system SHALL send a polite decline message to the customer in Albanian
6. WHEN a salon owner approves a request THEN the system SHALL automatically block that time slot from further bookings
7. IF a salon owner doesn't respond to a request within 2 hours THEN the system SHALL send a reminder WhatsApp message

### Requirement 3: Customer Priority Scoring System

**User Story:** As a salon owner, I want customers to be automatically prioritized based on their value and history, so that I can focus on my most important clients first.

#### Acceptance Criteria

1. WHEN calculating customer priority THEN the system SHALL use the formula: (Customer Rating × 40%) + (Revenue Value × 30%) + (Visit History × 20%) + (Booking Behavior × 10%)
2. WHEN a new customer makes their first request THEN the system SHALL assign them a base priority score of 50
3. WHEN a customer completes an appointment THEN the system SHALL allow the salon to rate them from 1-5 stars
4. WHEN a customer has a no-show THEN the system SHALL reduce their priority score by 20 points
5. WHEN a customer cancels with less than 24 hours notice THEN the system SHALL reduce their priority score by 10 points
6. WHEN displaying requests in the dashboard THEN the system SHALL show priority scores and sort by highest priority first
7. IF a customer's priority score drops below 20 THEN the system SHALL flag them as "high-risk" in the dashboard

### Requirement 4: Time Slot Availability Management

**User Story:** As a salon owner, I want to control my available time slots and block periods for holidays or personal time, so that customers can only book when I'm actually available.

#### Acceptance Criteria

1. WHEN a salon owner sets up their profile THEN the system SHALL allow them to configure working hours for each day of the week
2. WHEN a salon owner wants to block time THEN the system SHALL allow them to mark specific dates or time ranges as unavailable
3. WHEN displaying available slots to customers THEN the system SHALL only show times that are within working hours and not blocked
4. WHEN two customers try to book the same time slot simultaneously THEN the system SHALL only allow the first submission to succeed
5. WHEN a time slot is booked THEN the system SHALL immediately remove it from availability for other customers
6. WHEN a salon owner cancels an approved appointment THEN the system SHALL make that time slot available again
7. IF a salon owner tries to approve a request for a time that's already booked THEN the system SHALL display a conflict warning

### Requirement 5: WhatsApp Communication System

**User Story:** As both a customer and salon owner, I want to receive appointment notifications through WhatsApp in Albanian, so that I can stay informed about my bookings through my preferred communication channel.

#### Acceptance Criteria

1. WHEN a customer submits an appointment request THEN the system SHALL send a WhatsApp notification to the salon owner within 1 minute
2. WHEN a salon owner approves a request THEN the system SHALL send "imirezervimii u bë me sukses! {salon_name} ju mirëpret {date} në {time}! ✨" to the customer
3. WHEN a salon owner declines a request THEN the system SHALL send a polite message explaining the decline in Albanian
4. WHEN an appointment is 24 hours away THEN the system SHALL send a reminder message to both customer and salon
5. WHEN sending WhatsApp messages THEN the system SHALL properly encode Albanian characters (ë, ç, etc.)
6. IF a WhatsApp message fails to deliver THEN the system SHALL retry up to 3 times with exponential backoff
7. WHEN a customer or salon owner receives a WhatsApp message THEN it SHALL include the imirezervimi.al branding

### Requirement 6: Mobile-Optimized User Interface

**User Story:** As a customer accessing the booking system through Instagram's browser, I want a fast and intuitive mobile interface, so that I can easily complete my booking without frustration.

#### Acceptance Criteria

1. WHEN a customer accesses the booking page THEN the system SHALL load within 3 seconds on 3G connections
2. WHEN displaying the interface THEN the system SHALL use Albanian language for all text and labels
3. WHEN a customer interacts with form elements THEN the system SHALL provide clear visual feedback and validation
4. WHEN displaying time slots THEN the system SHALL show them in an easy-to-tap grid format optimized for mobile
5. WHEN a customer makes an error THEN the system SHALL display helpful error messages in Albanian
6. WHEN the booking form is submitted THEN the system SHALL show a loading indicator and prevent double-submission
7. IF the customer's internet connection is slow THEN the system SHALL still function with graceful degradation

### Requirement 7: Anti-Spam and Security Measures

**User Story:** As a salon owner, I want protection from spam bookings and fake requests, so that I only receive legitimate appointment requests from real customers.

#### Acceptance Criteria

1. WHEN a new phone number is used THEN the system SHALL require SMS verification before allowing booking requests
2. WHEN a customer submits multiple requests rapidly THEN the system SHALL implement rate limiting (max 1 request per minute)
3. WHEN detecting suspicious patterns THEN the system SHALL flag accounts for manual review
4. WHEN a customer has multiple no-shows THEN the system SHALL require phone re-verification for future bookings
5. WHEN storing customer data THEN the system SHALL encrypt sensitive information like phone numbers
6. WHEN a customer deletes their account THEN the system SHALL remove all personal data within 30 days
7. IF suspicious activity is detected THEN the system SHALL temporarily block the IP address and notify administrators