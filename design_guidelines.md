# Design Guidelines: System Design Learning Platform

## Design Approach

**Selected Approach**: Hybrid - Reference-based with Design System foundation

**References**: LeetCode (problem browsing, submission flow), Linear (clean productivity aesthetic, navigation), Notion (content organization), GitHub (code-focused UI patterns)

**Design System Base**: Material Design principles for visual feedback and content-rich interactions

**Core Principles**:
- Prioritize clarity and focus for learning
- Minimize visual distractions in the editor workspace
- Create clear visual hierarchy for problem difficulty and status
- Professional, technical aesthetic that builds credibility

## Typography System

**Font Stack**: 
- Primary: Inter (Google Fonts) - UI elements, body text
- Monospace: JetBrains Mono - code snippets, technical content

**Hierarchy**:
- Hero/Landing: text-5xl to text-6xl, font-bold
- Page Titles: text-3xl to text-4xl, font-semibold
- Section Headers: text-2xl, font-semibold
- Card Titles: text-lg, font-medium
- Body: text-base, font-normal
- Captions/Meta: text-sm, font-normal
- Technical Labels: text-xs, font-mono, uppercase tracking-wide

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Tight spacing: p-2, gap-2 (badges, chips)
- Standard spacing: p-4, gap-4 (cards, list items)
- Section spacing: py-12, py-16, py-24 (page sections)
- Large spacing: p-8, gap-8 (major containers)

**Grid Structure**:
- Container max-width: max-w-7xl
- Content areas: max-w-4xl for reading content, max-w-6xl for dashboards
- Editor workspace: Full-width with fixed sidebars (300px config panel)

## Core Components

### Navigation
**Top Navigation Bar**: Fixed, full-width
- Logo left, navigation center, profile/auth right
- Navigation items: Problems, Leaderboard, My Submissions, (Admin)
- Height: h-16
- Search bar integrated (max-w-md)

### Problem Library Page
**Layout**: Two-column on desktop (sidebar + main)
- Left sidebar (w-64): Filters (difficulty chips, tag checkboxes), sticky positioned
- Main area: Problem cards in grid (grid-cols-1 lg:grid-cols-2)

**Problem Card**:
- Compact design with clear difficulty badge (top-right)
- Title (text-lg font-semibold), tags row, solve status indicator
- Hover state with subtle elevation
- Grid pattern, not list

### Problem Detail Page
**Structure**: Single column, focused layout
- Breadcrumb navigation at top
- Problem title with difficulty badge and action buttons (Submit, Save)
- Tabbed interface: Description | Hints | Discussions | Submissions
- Description in MDX with syntax highlighting
- Sticky action bar at bottom on scroll

### React Flow Editor Page
**Layout**: Full-screen workspace (minus header)
- Three panels: Component Palette (left, w-64), Canvas (center, flex-1), Config Panel (right, w-80)
- Component Palette: Categorized draggable components with icons and labels
- Canvas: Dark grid background, zoom controls (bottom-right), minimap (top-right corner)
- Config Panel: Selected node properties, collapsible sections
- Bottom action bar: Undo/Redo, Export, Submit Design, Save Draft
- Toolbar above canvas: alignment tools, delete, duplicate

### Submission Flow
**Modal/Slide-over**: Right-side slide-over panel (w-[600px])
- Preview of diagram (thumbnail)
- Explanation textarea (min-h-48)
- Score preview (if re-submission)
- Submit button (large, prominent)

### Leaderboard Page
**Table Design**: Full-width responsive table
- Rank column with medals for top 3 (🥇🥈🥉)
- Avatar + Username, XP, Solved Count, Badges (icon array)
- Striped rows, hover highlighting
- User's own row highlighted distinctly
- Top 10 featured cards above table with stats

### Profile/Dashboard
**Grid Layout**: Stats cards in grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Total XP, Problems Solved, Badges Earned, Rank
- Recent submissions list with thumbnails
- Badge showcase with descriptions
- Activity graph

### Admin Dashboard
**Sidebar Layout**: Persistent left sidebar (w-64) + main content area
- Sidebar: stacked navigation links with icons
- Main area: data tables with actions (Edit, Delete, Approve)
- Analytics cards with charts
- CRUD modals for problems (large, centered)

### Comments Section
**Threaded Design**: Nested with indentation (pl-8 per level)
- Avatar + username + timestamp header
- Upvote button (left aligned), reply button (inline)
- Input box at top for new comments
- Load more button for pagination

### Authentication Pages
**Centered Cards**: Single column, max-w-md mx-auto
- Clean form design with clear labels
- Social login options if applicable
- Link to alternate action (Login ↔ Register)

## Component Library

**Badges**: 
- Difficulty: Rounded pill badges with icon (Easy/Medium/Hard)
- Achievement badges: Larger with descriptive text below
- Tag chips: Small, rounded, dismissible in filters

**Buttons**:
- Primary: Filled, rounded, medium padding (px-6 py-3)
- Secondary: Outlined
- Ghost: Text-only for tertiary actions
- Icon buttons: Square (h-10 w-10), rounded

**Cards**:
- Elevated with subtle shadow
- Rounded corners (rounded-lg)
- Padding (p-6)
- Hover state with increased elevation

**Forms**:
- Clear label above input
- Input fields: bordered, rounded, focus ring
- Validation messages below field
- Helper text in muted style

**Modals/Dialogs**:
- Centered with overlay backdrop
- Max width constraints (max-w-2xl for forms, max-w-4xl for content)
- Close button (top-right)

**Tables**:
- Bordered with header background treatment
- Sticky headers for long tables
- Action columns right-aligned
- Pagination controls below

## Icons
**Library**: Heroicons (via CDN)
- Outline variants for navigation and secondary actions
- Solid variants for filled states and emphasis
- Consistent sizing (w-5 h-5 for inline, w-6 h-6 for standalone)

## Animations
**Minimal, Purposeful**:
- Page transitions: Simple fade
- Card hover: Subtle elevation change (no transform)
- Modal enter/exit: Fade + scale (scale-95 to scale-100)
- Loading states: Skeleton screens, no spinners in main content
- NO animations on the React Flow canvas interactions (performance)

## Accessibility
- Keyboard navigation for all interactive elements
- Focus indicators on all form inputs and buttons
- ARIA labels for icon-only buttons
- Contrast ratios meeting WCAG AA standards
- Form error messages announced to screen readers

## Images
**Minimal Image Usage**:
- User avatars (circular, consistent sizing)
- Badge icons (illustrative, not photographic)
- Diagram thumbnails (generated from React Flow JSON)
- NO hero image on landing page - lead with value proposition text and action

**Landing Page**: Text-first approach with immediate CTA to browse problems or sign up. Focus on clarity of purpose over visual decoration.