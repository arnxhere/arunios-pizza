# 🍕 Arunios Pizza — Up-to-Down Scroll Animation & Full Website

A complete, high-performance pizza e-commerce website combining an Apple-style **up-to-down scroll animation** (210 frames) at the top, transitioning seamlessly into the full restaurant storefront below.

## 🚀 Live Local Server
The development server is active and running:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🌟 Key Features & Layout Structure

### 1. Fixed Top Navigation Bar
- **Branded Logo & Links**: Fixed glassmorphic navigation header staying accessible at the top.
- **Specification Menu Anchors**: Direct smooth scroll links to each section: **Story** (`#animation-section`), **Menu** (`#menu`), **Craft Secret** (`#craft`), **Crust Lab** (`#customizer`), **Deals & Combos** (`#combos`), **Reviews** (`#reviews`), and **Mobile App** (`#app`).
- **Live Frame Indicator & Quick Order**: Displays current animation frame in real-time (`FRAME 001 / 210`) with an instant "Order Online" CTA and responsive mobile menu.

### 2. Up-to-Down Cinematic Scroll Animation (Top Section)
- **Brand Hero Banner in Black Font Style**: Prominent black font **ARUNIOS PIZZA** heading in *Space Grotesk* (800) and black **"Yours craving our resposibility"** subheading in *Plus Jakarta Sans* (700) matching the website's dark typography palette.
- **Dynamic 45% Fade Transition**: The headline and subheading fade away smoothly as the user scrolls through the first **45%** of the animation section, giving complete focus to the visual pizza craft and cheese pull.
- **Natural Scrubbing**: Scrolling down from top to bottom drives the frames smoothly from `001` (molten cheese swirl) to `210` (the ultimate double-cheese slice pull); scrolling upwards scrubs backwards.
- **Sticky Viewport**: While scrolling through the animation section, the canvas stays pinned full-screen. Once the animation completes, the page naturally continues scrolling down into the rest of the website.
- **100% In-Memory Preload**: All 210 frames are preloaded into memory before rendering, ensuring zero dropped frames and no freezing.

### 2. Full Storefront Sections (Directly Below Animation)
- **Fast Category Rail & Filter Bar**: Sticky category navigation (Cheesy, Fiery Spice, Meat Lovers, Veggie, Drinks) with instant filtering.
- **Signature & Best Seller Menu**: 6 handcrafted stone-baked pizza cards with pricing, calorie info, and Quick Add buttons.
- **The Arunios Craft Secret**: 4-step craft proof breakdown (48-hr fermentation, San Marzano DOP tomatoes, quad-cheese melt, 550°F stone hearth).
- **Live Pizza & Crust Customizer**: Interactive crust selector (Hand-Tossed, Stuffed Rim, Thin, Gluten-Friendly), sauce choices, toppings, and dynamic price calculator.
- **Party Packs & Combo Deals**: Game Night Mega Box and Solo Crave Express offers.
- **Customer Testimonials**: Verified foodie reviews and social proof.
- **VIP Rewards & App Download**: QR code scanner and mobile app download banner.
- **Full Brand Footer**: VIP club signup, store locations, opening hours, and menu directory.

---

## ⚡ Deployment on Vercel

This repository is pre-configured for zero-config 1-click deployment on [Vercel](https://vercel.com):

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
2. Select **"Import Git Repository"** and select `arnxhere/arunios-pizza`.
3. **Framework Preset**: Leave as **Other** (Static HTML).
4. **Root Directory**: `./` (Default).
5. Click **"Deploy"**.

### What makes it flexible for Vercel:
- **Preloaded `/frames/`**: All 210 animation frames are bundled directly in the repository with immutable HTTP cache headers (`Cache-Control: public, max-age=31536000, immutable`).
- **`vercel.json`**: Pre-configures static routing, CORS headers, and `/api/frames` rewrite to `/api/frames.json`.
- **Serverless API Fallback**: Includes `/api/frames.js` and `/api/frames.json` to guarantee instantaneous frame index discovery across any hosting environment.

---

## 💻 Local Development
```powershell
python server.py 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
