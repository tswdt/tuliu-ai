---
name: "ui-ux-pro-max"
description: "UI/UX design intelligence with searchable database. Invoke when building UI, choosing styles/colors/fonts, reviewing UX, or making design decisions."
---

# UI UX Pro Max

Comprehensive design guide for web and mobile applications. Contains 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 16 technology stacks. Searchable database with priority-based recommendations.

## Prerequisites

Check if Python is installed:

```bash
python3 --version || python --version
```

If Python is not installed, install it based on user's OS:

**macOS:**
```bash
brew install python3
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install python3
```

**Windows:**
```powershell
winget install Python.Python.3.12
```

---

## How to Use This Skill

Use this skill when the user requests any of the following:

| Scenario | Trigger Examples | Start From |
|----------|-----------------|------------|
| **New project / page** | "做一个 landing page"、"Build a dashboard" | Step 1 → Step 2 (design system) |
| **New component** | "Create a pricing card"、"Add a modal" | Step 3 (domain search: style, ux) |
| **Choose style / color / font** | "What style fits a fintech app?"、"推荐配色" | Step 2 (design system) |
| **Review existing UI** | "Review this page for UX issues"、"检查无障碍" | Quick Reference checklist above |
| **Fix a UI bug** | "Button hover is broken"、"Layout shifts on load" | Quick Reference → relevant section |
| **Improve / optimize** | "Make this faster"、"Improve mobile experience" | Step 3 (domain search: ux, react) |
| **Implement dark mode** | "Add dark mode support" | Step 3 (domain: style "dark mode") |
| **Add charts / data viz** | "Add an analytics dashboard chart" | Step 3 (domain: chart) |
| **Stack best practices** | "React performance tips"、"Next.js optimization" | Step 4 (stack search) |

Follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:
- **Product type**: Entertainment (social, video, music, gaming), Tool (scanner, editor, converter), Productivity (task manager, notes, calendar), or hybrid
- **Target audience**: C-end consumer users; consider age group, usage context (commute, leisure, work)
- **Style keywords**: playful, vibrant, minimal, dark mode, content-first, immersive, etc.
- **Stack**: React, Next.js, Vue, etc.

### Step 2: Generate Design System (REQUIRED)

**Always start with `--design-system`** to get comprehensive recommendations with reasoning:

```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This command:
1. Searches domains in parallel (product, style, color, landing, typography)
2. Applies reasoning rules from `ui-reasoning.csv` to select best matches
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

**Example:**
```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### Step 2b: Persist Design System (Master + Overrides Pattern)

To save the design system for **hierarchical retrieval across sessions**, add `--persist`:

```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

This creates:
- `design-system/MASTER.md` — Global Source of Truth with all design rules
- `design-system/pages/` — Folder for page-specific overrides

**With page-specific override:**
```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

### Step 3: Supplement with Detailed Searches (as needed)

After getting the design system, use domain searches to get additional details:

```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**When to use detailed searches:**

| Need | Domain | Example |
|------|--------|---------|
| Product type patterns | `product` | `--domain product "entertainment social"` |
| More style options | `style` | `--domain style "glassmorphism dark"` |
| Color palettes | `color` | `--domain color "entertainment vibrant"` |
| Font pairings | `typography` | `--domain typography "playful modern"` |
| Chart recommendations | `chart` | `--domain chart "real-time dashboard"` |
| UX best practices | `ux` | `--domain ux "animation accessibility"` |
| Landing structure | `landing` | `--domain landing "hero social-proof"` |
| React performance | `react` | `--domain react "rerender memo list"` |
| Web accessibility | `web` | `--domain web "accessibilityLabel touch safe-areas"` |
| AI prompt / CSS keywords | `prompt` | `--domain prompt "minimalism"` |

### Step 4: Stack Guidelines

Get stack-specific best practices:

```bash
python3 .trae/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <stack>
```

**Available stacks:** `react`, `nextjs`, `vue`, `svelte`, `astro`, `swiftui`, `react-native`, `flutter`, `nuxtjs`, `nuxt-ui`, `html-tailwind`, `shadcn`, `jetpack-compose`, `threejs`, `angular`, `laravel`

---

## Search Reference

### Available Domains

| Domain | Use For | Example Keywords |
|--------|---------|------------------|
| `product` | Product type recommendations | SaaS, e-commerce, portfolio, healthcare, beauty, service |
| `style` | UI styles, colors, effects | glassmorphism, minimalism, dark mode, brutalism |
| `typography` | Font pairings, Google Fonts | elegant, playful, professional, modern |
| `color` | Color palettes by product type | saas, ecommerce, healthcare, beauty, fintech, service |
| `landing` | Page structure, CTA strategies | hero, hero-centric, testimonial, pricing, social-proof |
| `chart` | Chart types, library recommendations | trend, comparison, timeline, funnel, pie |
| `ux` | Best practices, anti-patterns | animation, accessibility, z-index, loading |
| `react` | React/Next.js performance | waterfall, bundle, suspense, memo, rerender, cache |
| `web` | Web accessibility guidelines | aria, focus, semantic, form, input type |
| `prompt` | AI prompts, CSS keywords | (style name) |

---

## Common Rules for Professional UI

### Icons & Visual Elements

- Default icon library: **Phosphor (`@phosphor-icons/react`)** or **Lucide (`lucide-react`)**. When not found, use **Heroicons (`@heroicons/react`)** as backup.
- **No Emoji as Structural Icons** — Use vector-based icons. Emojis are font-dependent and inconsistent across platforms.
- **Vector-Only Assets** — Use SVG or platform vector icons that scale cleanly and support theming.
- **Consistent Icon Sizing** — Define icon sizes as design tokens (e.g., icon-sm, icon-md = 24px, icon-lg).
- **Touch Target Minimum** — Minimum 44×44px interactive area.

### Interaction (Web)

| Rule | Do | Don't |
|------|----|----- |
| **Click feedback** | Provide clear pressed/active feedback within 80-150ms | No visual response on click |
| **Animation timing** | Keep micro-interactions around 150-300ms with natural easing | Instant transitions or slow animations (>500ms) |
| **Accessibility focus** | Ensure focus order matches visual order and labels are descriptive | Unlabeled controls or confusing focus traversal |
| **Disabled state clarity** | Use disabled semantics, reduced emphasis, and no click action | Controls that look tappable but do nothing |
| **cursor-pointer** | Add cursor-pointer to all clickable elements | Missing cursor change on interactive elements |

### Light/Dark Mode Contrast

| Rule | Do | Don't |
|------|----|----- |
| **Text contrast (light)** | Maintain body text contrast >=4.5:1 against light surfaces | Low-contrast gray body text |
| **Text contrast (dark)** | Maintain primary text contrast >=4.5:1 on dark surfaces | Dark mode text that blends into background |
| **Token-driven theming** | Use semantic color tokens mapped per theme | Hardcoded per-screen hex values |
| **State contrast parity** | Keep states equally distinguishable in light and dark themes | Defining interaction states for one theme only |

### Layout & Spacing

| Rule | Do | Don't |
|------|----|----- |
| **8px spacing rhythm** | Use a consistent 4/8px spacing system for padding/gaps | Random spacing increments with no rhythm |
| **Mobile-first** | Design mobile-first, then scale up to tablet and desktop | Desktop-only design |
| **Breakpoint consistency** | Use systematic breakpoints (375 / 768 / 1024 / 1440) | Arbitrary breakpoints |
| **Container width** | Consistent max-width on desktop (max-w-6xl / 7xl) | Mixing arbitrary widths |
| **z-index management** | Define layered z-index scale (0 / 10 / 20 / 40 / 100 / 1000) | Random z-index values |

---

## Pre-Delivery Checklist

Before delivering UI code, verify these items:

### Visual Quality
- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons come from a consistent icon family and style
- [ ] Pressed-state visuals do not shift layout bounds or cause jitter
- [ ] Semantic theme tokens are used consistently (no ad-hoc hardcoded colors)

### Interaction
- [ ] All clickable elements provide clear feedback
- [ ] Micro-interaction timing stays in the 150-300ms range
- [ ] Disabled states are visually clear and non-interactive
- [ ] cursor-pointer on all clickable elements

### Light/Dark Mode
- [ ] Primary text contrast >=4.5:1 in both light and dark mode
- [ ] Secondary text contrast >=3:1 in both light and dark mode
- [ ] Dividers/borders and interaction states are distinguishable in both modes
- [ ] Both themes are tested before delivery

### Layout
- [ ] Verified on small phone, tablet, and desktop
- [ ] 4/8px spacing rhythm is maintained
- [ ] No horizontal scroll on mobile
- [ ] Responsive breakpoints are consistent

### Accessibility
- [ ] All meaningful images/icons have alt text / aria-labels
- [ ] Form fields have labels, hints, and clear error messages
- [ ] Color is not the only indicator
- [ ] Reduced motion and dynamic text size are supported
- [ ] Focus states visible for keyboard navigation
