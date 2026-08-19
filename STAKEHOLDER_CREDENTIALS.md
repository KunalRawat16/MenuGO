# 🔑 MenuGO Platform — Stakeholder Credentials & System Guide

This document contains all official access credentials, demo accounts, database IDs, and system URLs for stakeholders, administrators, and QA reviewers.

---

## 👑 Global Super Admin Access

Used by platform administrators to manage subscriptions, audit all registered businesses, reset credentials, and monitor platform metrics.

| Field | Value |
| :--- | :--- |
| **Control Panel Route** | `/admin` |
| **Login Route** | `/auth/login` |
| **Super Admin Username / Email** | `superadmin@gmail.com` |
| **Default Password** | `admin123` |
| **Access Level** | Global Super Admin (Full Platform Control) |

---

## 🏪 Business Owner & Demo Restaurant Accounts

Each business owner account below is pre-loaded with rich categories, high-resolution imagery, itemized menus, table QR codes, and sales analytics.

| Restaurant Name | Public Digital Menu Link | Owner Login Email | Default Password | Database User ID (`_id`) |
| :--- | :--- | :--- | :--- | :--- |
| 🍕 **La Bella Italia** | `/[slug]` → `/la-bella-italia` | `owner.italian@menugo.com` | `password123` | `6a85678b2606026344fc133f` |
| 🍣 **Dragon Fly Bistro** | `/[slug]` → `/dragon-fly-bistro` | `owner.asian@menugo.com` | `password123` | `6a85678d2606026344fc1351` |
| 🍲 **The Copper Handi** | `/[slug]` → `/copper-handi` | `owner.indian@menugo.com` | `password123` | `6a8567bffb3adf7b0fedb2af` |
| ☕ **Brew & Bean Roastery** | `/[slug]` → `/brew-and-bean` | `owner.cafe@menugo.com` | `password123` | `6a8567c1fb3adf7b0fedb2bc` |
| 🍽️ **demo01** | `/[slug]` → `/demo01` | `demo01@gmail.com` | `admin123` | `6a85563bb9a42ee6a554554c` |

---

## 📱 Quick Test Table URLs (Customer QR Experience)

Simulate a customer scanning a table QR code at any restaurant:

- **La Bella Italia (Table T1)**: `https://[your-domain]/la-bella-italia?table=T1`
- **Dragon Fly Bistro (Table T3)**: `https://[your-domain]/dragon-fly-bistro?table=T3`
- **The Copper Handi (Table T2)**: `https://[your-domain]/copper-handi?table=T2`
- **Brew & Bean Roastery (Table T4)**: `https://[your-domain]/brew-and-bean?table=T4`

---

## 🚀 Key Portal Routes

- **Super Admin Portal**: `/admin`
- **Business Management**: `/admin/businesses`
- **Subscription Management**: `/admin/subscriptions`
- **Business Owner Dashboard**: `/dashboard`
- **Menu Management**: `/dashboard/menu`
- **Table & QR Code Generator**: `/dashboard/tables`
- **Analytics & Sales Reports**: `/dashboard/analytics`
- **User Authentication**: `/auth/login` & `/auth/register`

---

## 💡 Important Testing Notes for Stakeholders

1. **Incognito Testing**: Browsers share cookies across tabs within the *same* Incognito window. To test two different owner accounts side-by-side, use **1 Normal Window + 1 Incognito Window** or **2 different Browser Profiles**.
2. **Real-Time Kitchen Sync**: The business owner dashboard (`/dashboard`) features an active **2-second Auto Sync** engine and Web Audio chime notifications for incoming orders.
3. **Excel / CSV Sales Reports**: Inside `/dashboard/analytics`, click the **`Export to Excel / CSV`** button to download full itemized sales reports for accounting.
