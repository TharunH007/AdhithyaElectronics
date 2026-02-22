# E2E Test Plan: Bombay Dyeing E-Commerce Flow

This document outlines all possible test scenarios for the order lifecycle, shipping logic, and return/replacement management.

## 1. Order Logic & Shipping SCENARIOS
| Case ID | Scenario | Subtotal | Expected Shipping | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| ORD-01 | Low Value Order | < ₹1,000 | ₹50 | Order places successfully with shipping charge. |
| ORD-02 | Threshold Order | = ₹1,000 | ₹0 | Free shipping applies at exactly threshold. |
| ORD-03 | High Value Order | > ₹1,000 | ₹0 | Free shipping applies. |
| ORD-04 | Stock Subtraction | Any | N/A | Product stock decreases by ordered quantity *only after payment*. |
| ORD-05 | Out of Stock | N/A | N/A | System prevents placing order for quantity > available stock. |

## 2. Order Fulfilment (Admin Actions)
| Case ID | Step | Admin Action | Expected State |
| :--- | :--- | :--- | :--- |
| FUL-01 | Payment | Mark as Paid | `isPaid: true`, `paidAt` timestamp set, Email sent. |
| FUL-02 | Shipping | Mark as Shipped | `status: "Shipped"`, Shipment email sent. |
| FUL-03 | Delivery | Mark as Delivered | `isDelivered: true`, `status: "Delivered"`, `deliveredAt` set. |
| FUL-04 | Unpaid Shipping | Try Shipping unpaid | System should permit (Admin override) or block based on config. |

## 3. Return & Replacement Scenarios
| Case ID | Scenario | Condition | Expected Result |
| :--- | :--- | :--- | :--- |
| RET-01 | Return Request | Within 7 days of Delivery | Request created, Status: `Requested`. |
| RET-02 | Replacement Request| Within 7 days of Delivery | Request created, Status: `Requested`. |
| RET-03 | Return Window Expired| > 7 days after Delivery | **Fail**: Return/Replacement blocked. |
| RET-04 | Pre-Delivery Return | Order not yet Delivered | **Fail**: Return requires delivery first. |
| RET-05 | Admin Approval | Admin clicks Approve | `status: "Approved"`, User notified. |
| RET-06 | Admin Rejection | Admin clicks Reject | `status: "Rejected"`, User notified. |
| RET-07 | Closure | Admin marks Completed | `isProcessed: true`, Case closed. |
| RET-08 | Duplicate Request | Request already exists | **Fail**: One request per order. |

## 4. Edge Cases & Combinations
| Case ID | Scenario | Interaction | Expected Result |
| :--- | :--- | :--- | :--- |
| EDG-01 | Admin Shipped after Approval | Approved Return -> Admin Ships Replacement | Order flow restarts or follows replacement tracking. |
| EDG-02 | Tax Precision | Multi-item order with diff taxes | Total price matches sum of (Price + Tax) correctly. |
| EDG-03 | User Authorization | User A tries to return User B's order | **Fail**: Unauthorized access. |

---
**Note:** These cases are automated in `backend/tests/e2e_flow_complete.test.js`.
