# TTMP — Manual Testing Checklist
**Date:** 2026-04-03
**Site:** https://transcript.taxmonitor.pro

---

## 6a — Header Mega Menu (test in browser)

- [x] Hover/click Resources in the header — mega menu appears
- [X] Mega menu has 3 columns: Discover, Explore, Tools & Extras
- [ ] CTA section shows "Need human review..." text and "Free Guide" button <---Should be 3 columns not 4.
- [ ] Log In button is visible in the mega menu
- [ ] Click each link in the Discover column — confirm each page loads
- [ ] Click each link in the Explore column — confirm each page loads
- [ ] Click each link in the Tools & Extras column — confirm each page loads
- [ ] Click "Free Guide" button — confirm it goes to `/magnets/guide`
- [ ] Click "Log In" — confirm it goes to `/login`
- [ ] On mobile (resize to 375px width): mega menu collapses to accordion
- [ ] On mobile: tap Resources — accordion expands with all sections
- [ ] On mobile: all links in accordion are tappable and navigate correctly

## 6b — Footer

- [ ] Scroll to footer on homepage
- [ ] Affiliate link is visible and clickable
- [ ] Click affiliate link — goes to `/affiliate` page
- [ ] Affiliate page renders with correct content (20% commission, how it works, CTAs)

## 6c — Login Page

- [ ] Navigate to `/login`
- [ ] Page shows centered card on dark background with TTMP logo
- [ ] Email input field is visible and accepts input
- [ ] "Sign in" or magic link button is visible
- [ ] Google OAuth option is visible
- [ ] "Create account" link is visible at bottom
- [ ] Enter a valid email and submit — confirm magic link flow initiates (check email)
- [ ] Click Google OAuth — confirm Google sign-in popup appears

## 6d — Loading Animation

- [ ] Hard refresh any page (Ctrl+Shift+R)
- [ ] Observe thin accent-color progress bar at top of viewport
- [ ] Bar animates across and fades out when page loads

## 6e — Resource Pages

- [ ] Navigate to `/resources/` — index page loads with list of resources
- [ ] Click into any IRS code page — confirm h1, content, breadcrumb (Home > Resources > [Title]), and CTA render
- [ ] Click into any explainer page — confirm same layout
- [ ] Confirm content width is ~860px centered, not full-width
- [ ] Confirm sidebar with related links appears on desktop
- [ ] On mobile: sidebar moves below content
- [ ] CTA appears after intro and at end of article

## 6f — Purchasing Flow (live Stripe)

- [ ] Navigate to pricing page
- [ ] Click "Buy" on the 10-token/$19 package
- [ ] Stripe checkout loads
- [ ] Use Stripe test card (4242 4242 4242 4242, any future date, any CVC)
- [ ] Complete purchase — confirm success page appears
- [ ] Confirm tokens are credited to your account (check dashboard or token usage page)

## 6g — Calendar Sync Flow

- [ ] Navigate to `/app/calendar` (must be logged in)
- [ ] Confirm calendar page loads
- [ ] If calendar sync is available, attempt to connect
- [ ] Verify events display correctly if synced

## 6h — Support Tickets Flow

- [ ] Navigate to `/app/support` (must be logged in)
- [ ] Confirm support page loads
- [ ] Submit a test ticket with subject "Test ticket" and body "Testing support flow"
- [ ] Confirm ticket appears in your ticket list
- [ ] Click into the ticket — confirm detail view loads
- [ ] Add a reply — confirm it appears

## 6i — App Navigation Flow

- [ ] Log in successfully
- [ ] Navigate to Dashboard — page loads with correct data
- [ ] Navigate to Reports — page loads
- [ ] Navigate to Token Usage — page loads with balance
- [ ] Navigate to Receipts — page loads
- [ ] Navigate to Account — page loads with account settings
- [ ] Navigate to Calendar — page loads
- [ ] Navigate to Support — page loads
- [ ] Log out — confirm redirect to homepage or login page
- [ ] Attempt to access `/app/dashboard` while logged out — confirm redirect to login
