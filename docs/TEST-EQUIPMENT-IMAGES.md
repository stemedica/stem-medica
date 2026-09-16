# Equipment image preview

Five illustrative test images were generated with the built-in image generator (not the CLI), inspected, and optimized to 1000px WebP. They are generic equipment illustrations, **not authentic manufacturer/model photos**, and include “ILLUSTRATIVE TEST IMAGE” in the image itself. Replace them through the CMS before publishing real inventory.

Saved assets: `scripts/fixtures/equipment-images/{monitor,ecg,ventilator,sterilizer,microscope}.webp`.

The guarded, repeatable script `npx tsx scripts/seed-test-equipment-images.ts --confirm-test-branch` fills only blank images on the five known test products/categories. It archives the previous catalogue, uses revision checks, preserves uploaded images, and verifies the result. Image links are in the Neon test branch; binary media remains local development storage. Production is untouched.

## Final prompt set

Monitor:

> Use case: product-mockup. Generate one photographic sample asset for a medical equipment website test catalogue. Subject: a generic unbranded portable patient monitor, three-quarter front view, white enclosure, dark screen with subtle blue/green waveform graphics, no readable clinical values. Entire equipment visible, centered, occupies 70% of frame. Wide 4:3 product photograph, pale cool-white seamless studio backdrop, soft professional light, navy-blue accent details, gentle contact shadow, crisp realistic materials. Not a specific manufacturer's model. No brand names, people or accessories. Include a small clearly readable bottom caption: "ILLUSTRATIVE TEST IMAGE". This is an illustrative website layout preview, not real inventory photography.

Other four images used this prompt, substituting each subject below:

> Use case: product-mockup. One photographic sample asset for a medical equipment website test catalogue. Subject: [subject]. Entire equipment visible, centered, occupies 70% of frame. Wide 4:3 photograph, pale cool-white seamless studio backdrop, soft professional light, gentle contact shadow, crisp realistic materials, three-quarter view. Not a specific manufacturer's model. No brand names or people. Include a small clearly readable bottom caption: "ILLUSTRATIVE TEST IMAGE". This is a website layout preview, not real inventory photography.

- ECG: a generic unbranded compact tabletop ECG electrocardiograph machine with a wide dark display, white enclosure, integrated paper roll slot and a small orderly coil of leads
- Ventilator: a generic unbranded ICU ventilator on a wheeled stand with a dark display, white and blue housing and neatly looped breathing tube
- Sterilizer: a generic unbranded tabletop steam sterilizer with a round stainless-steel chamber door and white housing
- Microscope: a generic unbranded upright binocular laboratory microscope with white body, black stage and navy details

## Mobile homepage

Below 640px, equipment is a native horizontal snap rail, with a next-card peek, swipe instruction, position counter and 44px previous/next buttons. There is no autoplay or carousel dependency. Keyboard focus reveals linked cards; reduced motion disables smooth button scrolling. Category changes reset to the first product. Single-item categories do not show redundant controls. Tablet and desktop retain grids; full catalogue remains a searchable grid.
