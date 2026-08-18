# Jagruk Bharat design system

Status: locked. New pages must use these tokens and shared components. Changes require explicit approval.

## Color tokens

| Role | Default | Hover | Pressed | Supporting surface |
| --- | --- | --- | --- | --- |
| Primary | `#1264B9` | `#0E539D` | `#093F78` | `#E1EFFB` |
| Accent | `#38BDF8` | — | — | Accent is not a background color |
| Emergency | `#DC2626` | `#B91C1C` | `#991B1B` | `#FEF2F2` |
| Success | `#15803D` | — | — | `#F0FDF4` |
| Warning | `#D97706` | — | — | `#FFFBEB` |

Emergency red is reserved for immediate danger, destructive actions, and validation errors. Success green is reserved for live, verified, and safe states.

## Neutral tokens

| Role | Value |
| --- | --- |
| App background | `#EDF1F2` |
| Card and control surface | `#FFFFFF` |
| Subtle surface | `#F7F9F9` |
| Primary text | `#0F172A` |
| Secondary text | `#475569` |
| Muted text | `#64748B` |
| Border | `#CBD5E1` |
| Strong border | `#94A3B8` |

## Hazard colors

| Hazard | Marker/filter color |
| --- | --- |
| Road accident | `#DC2626` |
| Fire or smoke | `#F97316` |
| Flooding | `#3B82F6` |
| Landslide | `#B45309` |
| Blocked route | `#059669` |
| Unsafe infrastructure | `#EAB308` |
| Electrical hazard | `#8B5CF6` |
| Pollution or waste | `#64748B` |
| Severe weather | `#0891B2` |
| Other public hazard | `#DC2626` |

## Typography

- Display and headings: Public Sans, weights 600 and 700.
- Body and controls: Source Sans 3, weights 400 and 600.
- Statistics and counters: IBM Plex Mono, weights 500 and 600.
- Page title: 36/44 px desktop, 32/40 px compact screens.
- Section title: 24/32 px.
- Subsection title: 18/24 px.
- Body: 16/24 px.
- Supporting text: 14/20 px.
- Utility text: 12/16 px.

## Spacing and shape

- Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64, 96` px.
- Card and section radius: 8 px.
- Button and input radius: 6 px.
- Shadows are limited to floating overlays such as menus and dialogs.

## Components and usage

- Icon library: Lucide React only. Default interface icons are 16 or 20 px and use a 1.5–2 px stroke.
- Header: `AppHeader` is the shared 72 px application header.
- Buttons: `Button` provides the only primary, secondary, and destructive treatments.
- Cards: `Card` is a single white surface with an 8 px radius and one-pixel border.
- Empty states: `EmptyState` uses one Lucide icon, one line of text, and an optional action.
- Statistics: `StatCard` uses IBM Plex Mono for the numeric value.
- Do not use decorative gradients, decorative emergency/success colors, or card-on-card nesting.
