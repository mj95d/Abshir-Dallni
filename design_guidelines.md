# Dalleni Design Guidelines

## Design Approach

**System-Based with Cultural Adaptation**: Using Material Design principles adapted for Saudi Arabian government services context, emphasizing trust, clarity, and cultural appropriateness. The design balances modern web standards with Middle Eastern aesthetic preferences.

## Core Design Principles

1. **Institutional Trust**: Clean, professional appearance that conveys government-grade reliability
2. **Bilingual Excellence**: Seamless Arabic-English switching with proper RTL/LTR layouts
3. **Clarity First**: Complex government processes made visually digestible
4. **Security Emphasis**: Visual cues reinforcing data protection and privacy

## Typography

**Arabic Font**: IBM Plex Sans Arabic (Google Fonts)
- Headings: font-semibold to font-bold
- Body: font-normal
- Excellent Arabic legibility and modern appearance

**English Font**: Inter (Google Fonts)
- Headings: font-semibold to font-bold  
- Body: font-normal
- Clean, professional, pairs well with Arabic

**Hierarchy**:
- Hero/Main Headings: text-4xl md:text-5xl
- Section Headings: text-2xl md:text-3xl
- Card Titles: text-lg md:text-xl
- Body Text: text-base
- Captions/Meta: text-sm

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: py-12, py-16
- Card gaps: gap-6, gap-8
- Margins: m-4, m-8

**Containers**:
- Max width: max-w-7xl
- Chat interface: max-w-4xl
- Form containers: max-w-2xl

**Grid Systems**:
- Service cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard widgets: grid-cols-1 md:grid-cols-2
- Feature lists: Single column for readability

## Component Library

**Navigation**:
- Sticky top header with language toggle (EN/AR flag icons)
- Mobile: Hamburger menu transforming to drawer
- Desktop: Horizontal nav with clear hierarchy
- Icons: Heroicons (outline for nav, solid for active states)

**AI Chat Interface** (Primary Feature):
- Chat bubbles: Rounded-2xl with distinct user/AI styling
- Message list: Scrollable container with padding
- Input: Large text area with send button (paper plane icon)
- Suggested prompts: Pill-shaped buttons below input
- Typing indicator: Animated dots

**Service Cards**:
- Elevated cards (shadow-md) with hover:shadow-lg transition
- Icon + Title + Brief description
- Arrow/chevron indicating clickability
- Organized in responsive grids

**Data Breach Alerts**:
- Alert banner with severity indicators
- Breach details in expandable accordions
- Action buttons prominently displayed
- Timeline view for historical breaches

**Dashboard Widgets**:
- Renewal countdown cards with progress indicators
- Recent inquiries list with timestamps
- Quick action tiles for common services
- Status badges (active/expired/pending)

**Forms**:
- Large, accessible input fields
- Clear labels with bilingual support
- Inline validation messages
- Primary action buttons: Large, prominent

**Modals/Overlays**:
- Service detail modals with complete information
- Confirmation dialogs for sensitive actions
- Backdrop blur for focus

## Images

**Hero Section**: 
Large hero image (min-h-[500px]) showing diverse Saudi professionals using digital services - modern workspace, traditional and contemporary clothing, multicultural representation. Image should convey trust and accessibility. Overlay: Semi-transparent gradient (from transparent to subtle dark tint) with blurred-background buttons.

**Service Category Icons**: 
Use Heroicons for government service categories (document-text, identification, credit-card, academic-cap, shield-check)

**Breach Alert Visuals**: 
Shield icons with warning states, minimalist breach timeline graphics

**Empty States**: 
Friendly illustrations for "no breaches found", "no saved inquiries" using simple line art

## RTL/LTR Considerations

- Use Tailwind's `dir="rtl"` with automatic flip classes
- Icons requiring directional context: Use `rtl:rotate-180` for arrows
- Maintain visual balance in both directions
- Text alignment: `text-right` for Arabic, `text-left` for English

## Accessibility

- Minimum touch target: 44px × 44px
- ARIA labels for all interactive elements
- High contrast ratios (WCAG AA minimum)
- Focus indicators: 2px ring with offset
- Keyboard navigation throughout

## Animations

**Minimal and Purposeful**:
- Page transitions: Subtle fade-in
- Card hover: shadow and scale (transform scale-105)
- Alert appearance: Slide-in from top
- Loading states: Pulse or spinner only
- NO scroll-triggered animations
- NO parallax effects

## Mobile Optimization

- Bottom navigation for key actions on mobile
- Large, thumb-friendly buttons
- Collapsible sections for long content
- Swipe gestures for chat history
- Fixed chat input at bottom on mobile

## Responsive Breakpoints

- Mobile: < 768px (single column, stacked)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (3-column grids, side-by-side layouts)