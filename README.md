# Inspire Hub

# PROJECT INITIALIZATION & ARCHITECTURE FOUNDATION

## AIM Framework

### Actor

You are a Senior Full-Stack Software Architect, UI/UX Designer, Product Architect, and DevOps Engineer. Your responsibility is to create a scalable, production-ready foundation for a long-term startup project. Think beyond an MVP and build an architecture that can grow into a large platform without major rewrites.

### Input

We are building a platform called **Inspire to Aspire** (working name may temporarily appear differently in previous documents). It is a creative marketplace and media ecosystem that connects creators, clients, organizations, and audiences. This prompt focuses ONLY on creating the project's technical and design foundation—not implementing business features yet.

### Mission

Create a clean, modular, scalable, and maintainable application foundation that will support future development. Prioritize developer experience, accessibility, responsiveness, performance, and extensibility.

---

# MAP Framework

## Memory

This project will eventually include:

- Multiple user roles

- Creator portfolios

- Organizations

- Secure booking system

- Escrow payments

- Collaboration hub

- Community features

- Media platform

- AI-powered features

- Premium subscriptions

- Admin dashboard

- Analytics

- Mobile applications

Do NOT implement these features yet.

Only prepare the architecture to support them.

---

## Assets

Initialize a modern production-ready project using:

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- React Router

- React Query (TanStack Query)

- Supabase (prepare integration)

- Lucide Icons

- Responsive design

- Dark mode support

- Component-driven architecture

If a better equivalent exists within Lovable's supported stack, use it while preserving scalability.

---

## Actions

Create:

### Folder Structure

Organize the project into logical folders such as:

- components

- pages

- layouts

- hooks

- services

- utils

- types

- lib

- assets

- constants

- contexts

- providers

- styles

Design the structure for long-term maintainability.

---

### Routing

Create placeholder routes only:

- Home

- About

- Discover

- Creators

- Organizations

- Projects

- Community

- Contact

- Login

- Register

- Dashboard (placeholder)

- 404

No business functionality yet.

---

### Global Layout

Build a reusable layout including:

- Navigation bar

- Footer

- Theme provider

- Responsive container

- Page transitions (if appropriate)

- Global spacing system

---

### Design System

Establish:

Typography

Spacing

Border radius

Buttons

Cards

Inputs

Modals

Badges

Tags

Tables

Loading states

Empty states

Error states

Use a modern, elegant aesthetic suitable for a premium creative platform.

---

### Branding

Use temporary branding:

Platform Name:

Inspire to Aspire

Tagline:

Connecting Talent. Creating Opportunities. Inspiring Communities.

Create a clean hero section using placeholder content.

Do NOT create the final landing page yet.

---

### Theme

Implement:

Light Mode

Dark Mode

Consistent color system

Reusable design tokens

Accessibility-friendly contrast

---

### State Management

Prepare the architecture for:

Authentication

Notifications

Theme

Future global state

Avoid unnecessary complexity.

---

### Supabase Preparation

Prepare the project structure for Supabase integration.

Do not create database tables yet.

Simply ensure the project is ready for authentication, storage, and database connectivity later.

---

### Performance

Optimize for:

Code splitting

Lazy loading

Reusable components

Clean imports

Minimal repetition

Future scalability

---

### Accessibility

Follow WCAG best practices.

Keyboard navigation.

Semantic HTML.

Proper heading hierarchy.

ARIA labels where appropriate.

---

### Responsiveness

Support:

Desktop

Laptop

Tablet

Mobile

Use mobile-first principles.

---

# Development Principles

Throughout the project, follow:

SOLID Principles

DRY

KISS

Separation of Concerns

Component Reusability

Clean Architecture

Scalable File Organization

Avoid unnecessary abstractions while keeping the project extensible.

---

# ETHOS

Ensure the architecture supports:

Equity

Transparency

Human dignity

User safety

Administrative oversight

Privacy by design

Future compliance with international data protection practices.

---

# TRACK Framework

Before considering this task complete, verify:

✓ The architecture is modular.

✓ The routing is scalable.

✓ Components are reusable.

✓ Styling is consistent.

✓ No unnecessary code duplication exists.

✓ Performance considerations have been applied.

✓ Accessibility has been considered.

✓ The project is easy for future developers to understand.

---

# Deliverables

Build only the project foundation.

Do NOT implement:

Authentication

Database schema

Booking logic

Payments

Creator profiles

Organizations

Marketplace functionality

Messaging

Reviews

Media platform

Subscriptions

AI

Admin dashboard

These will be implemented incrementally in later prompts.

---

# Acceptance Criteria

The project should compile successfully.

Navigation should function between placeholder pages.

The layout should be fully responsive.

Dark mode should work.

The architecture should be clean enough that future features can be added without restructuring.

No placeholder code should create technical debt.

---

# Self-Verification

Before finishing, internally verify:

- Is this architecture scalable for several years of growth?

- Is the folder structure clean?

- Could another senior developer immediately understand this project?

- Is there any unnecessary complexity?

- Is every reusable component truly reusable?

Refine if necessary before finalizing.

---

# Documentation (IMPORTANT)

After completing the work, provide:

## 1. Executive Summary

Explain everything you built.

## 2. Project Architecture

Explain the folder structure.

Explain the routing strategy.

Explain the design system.

Explain the state management strategy.

Explain why each major decision was made.

## 3. File Report

List every file created.

List every file modified.

Briefly explain the purpose of each.

## 4. Future Readiness

Explain how this architecture supports future implementation of:

- Authentication

- Marketplace

- Payments

- Creator Profiles

- Organizations

- Collaboration

- AI

- Media

- Admin Dashboard

## 5. Technical Debt

Identify anything intentionally postponed.

## 6. Recommendations

Provide recommendations for the next development phase.

Do not implement those recommendations yet.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://inspire-canvas-50.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a264d284-8c76-4224-b8d4-fec92f2b1236).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
