# Aureon Analytics — Client Analytics Dashboard with AI Analyst

An enterprise-style analytics dashboard built as a learning and exploration project, showcasing how modern consultancies can combine **data infrastructure, dashboards, and AI-driven analysis** into a single cohesive product.

This project uses **synthetic business data** and is not intended for real-world commercial use.

---

## Overview

This repository contains a **client-facing analytics dashboard** designed in the style of professional consultancy tools.

The dashboard provides:
- Executive-level KPIs (Revenue, MRR, ARR, CAC, Churn, etc.)
- Deep-dive analytics across revenue, acquisition, and customer health
- An embedded **AI Analyst** that can answer natural-language questions about the data
- A polished, enterprise-grade UI with both **Light and Dark modes**

The primary goal of the project is **learning and skill-building** across:
- Product design
- Data modeling
- Analytics architecture
- AI-assisted insight generation
- Modern full-stack workflows

---

## Key Features

- 📊 **Analytics Dashboard**
  - Overview, Revenue, Acquisition, and Customers sections
  - Global date range and filter controls
  - Charts, KPI cards, and data tables

- 🧠 **AI Data Analyst**
  - Natural-language questions over business data
  - Plain-English explanations of trends and metrics
  - Grounded in database views (no fabricated data)

- 🗄 **Structured Data Layer**
  - Relational schema designed for analytics
  - Derived SQL views for KPIs and trends
  - Realistic, seeded fake business data

- 🎨 **Professional UI**
  - Design guided by Google Stitch (directional, not pixel-perfect)
  - Enterprise visual language
  - Light & Dark mode support

---

## Tech Stack

- **Frontend / App Builder:** Lovable
- **Design Reference:** Google Stitch
- **Database:** Supabase (PostgreSQL)
- **AI Layer:** Lovable AI Gateway
- **Styling:** Custom design system (Light & Dark modes)

---

## Data Notes

- All data in this project is **synthetic**
- No real customers, payments, or personal data are used
- Pricing and plans exist **only as analytical data**, not as product features
- There is no billing, checkout, or subscription management functionality

---

## AI Analyst Behaviour

The AI Analyst is designed to:
- Answer questions using database-backed analytics views
- Respect global filters and date ranges
- Cite real metrics in responses
- Ask for clarification when questions are ambiguous
- Avoid hallucinating or guessing missing data

Example questions:
- “Why did revenue change last month?”
- “Which channel has the highest CAC?”
- “Which customers are most at risk?”
- “Summarise performance for this period.”

---

## Project Status

This project is **exploratory and iterative**.

The focus is on:
- Improving system design intuition
- Learning how dashboards and AI layers work together
- Experimenting with data modeling and analytics UX

It is not intended to be production-ready software.

---

## Future Ideas (Optional)

- More advanced cohort and retention analysis
- Enhanced AI insight summaries
- Data export features
- Additional visual polish and micro-interactions
- Optional swap to direct OpenAI API usage for deeper control

---

## License

This project is shared for **educational and portfolio purposes** only.

Feel free to explore the code, but do not use it as-is for production or commercial deployments.
