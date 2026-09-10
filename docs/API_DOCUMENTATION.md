# 🔌 REST API Documentation

The backend runs on Express.js (default port: 5000). When running Next.js, API requests are proxied via /api/* rewrites.

---

## 1. Authentication (/api/auth)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | /api/auth/register | Register new customer account | No |
| POST | /api/auth/login | Login user & return JWT token | No |
| GET | /api/auth/me | Fetch authenticated user profile | Yes (Bearer Token) |

---

## 2. Products (/api/products)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | /api/products | Get all available dairy & farm products | No |
| POST | /api/products | Add new product (Staff/Admin only) | Yes |
| PUT | /api/products/:id | Update product details or stock | Yes |
| DELETE | /api/products/:id | Delete product from inventory | Yes |

---

## 3. Orders & Sales (/api/orders)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | /api/orders | Place a new order | Yes / Guest |
| GET | /api/orders | Get orders for current authenticated user | Yes |

---

## 4. Payment Configuration (/api/payment)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | /api/payment/config | Returns active merchant UPI ID & payee name | No |

---

## 5. Admin Operations (/api/admin)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | /api/admin/stats | Dashboard metrics (total revenue, orders, stock) | Yes (Admin) |
| GET | /api/admin/orders | Full orders queue with customer & payment refs | Yes (Admin) |
| PUT | /api/admin/orders/:id/status | Update order status (Pending, Confirmed, Delivered) | Yes (Admin) |
| POST | /api/admin/users | Create staff or admin accounts | Yes (Admin) |
