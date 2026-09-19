# Homepage hero animation

The full hero background uses original abstract blue and teal SVG ribbons, animated with transform-only CSS. There is no equipment illustration or video download.

The background makes one 4.8-second opening movement and then settles; there is no pause/play control. Reduced-motion preferences show static linework. Text and links work without animation.

On phones the hero fills the available first screen below the header and above the contact bar (using the stable small viewport height; content can grow on shorter screens). A down-arrow link gently moves three times, then rests. It links to the equipment section with smooth scrolling; reduced-motion users get instant scrolling. Desktop keeps its shorter product-first hero.

Edit `src/components/HeroAnimation.tsx` and the hero styles in `src/app/globals.css`. The previous video environment variables are no longer used.
