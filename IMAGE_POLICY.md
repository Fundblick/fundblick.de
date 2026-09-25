# FundBlick image policy

Live merchant products should provide a valid product image. During the simulator/live-beta phase, image-less test products remain renderable so category, filter, coupon and offer-comparison flows can still be exercised. The UI must use an icon-only placeholder that never competes with product copy. Broken remote image URLs must degrade to the same placeholder.

Before real affiliate feeds are promoted to production, import adapters should reject or quarantine product records without a usable image unless a documented merchant exception applies.
