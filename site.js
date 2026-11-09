// What every page of sailmode.app shares: the colour past the page's ends, and the FAQ's spring.

const root = document.documentElement;

// Pulled past the top or the bottom (rubber-band scrolling), Safari and Chrome show the page's own background colour
// there. The sky runs from aqua at the top to nearly white at the bottom, so that colour follows the scroll: the sky's
// top until the middle of the page, its end after it (html.past-middle in style.css).
const followScroll = () => {
  root.classList.toggle("past-middle", scrollY > (root.scrollHeight - innerHeight) / 2);
};
addEventListener("scroll", followScroll, { passive: true });
addEventListener("resize", followScroll);
followScroll();

// The FAQ. A question opens on a spring that doesn't bounce, as SwiftUI's .smooth does, the answer fading in as it
// unfolds; closing runs the same spring back, quicker, and a tap mid-way turns it around from where it is.
// Without motion (Reduce Motion), questions open and close at once, as the browser does by itself.
const motion = matchMedia("(prefers-reduced-motion: no-preference)");

// A critically damped spring with a 0.25 s response: x(t) = 1 − (1 + ωt)·e^(−ωt), sampled for CSS's linear().
const spring = (() => {
  const omega = (2 * Math.PI) / 0.25, length = 0.31, steps = 48;
  const points = Array.from({ length: steps }, (_, i) => {
    const t = (i / steps) * length;
    return (1 - (1 + omega * t) * Math.exp(-omega * t)).toFixed(4);
  });
  return `linear(${points.join(", ")}, 1)`;
})();
root.style.setProperty("--spring", spring);

for (const details of document.querySelectorAll(".faq details")) {
  const answer = details.querySelector(".answer");
  details.querySelector("summary").addEventListener("click", (event) => {
    if (!motion.matches || !answer) return;
    event.preventDefault();
    const isOpen = details.dataset.state ? details.dataset.state === "open" : details.open;
    // Where the answer is now, also mid-way through a spring.
    const height = details.open ? answer.getBoundingClientRect().height : 0;
    const opacity = details.open ? Number(getComputedStyle(answer).opacity) : 0;
    answer.getAnimations().forEach((animation) => animation.cancel());
    details.dataset.state = isOpen ? "closed" : "open";
    if (isOpen) {
      answer.animate([{ height: `${height}px`, opacity }, { height: "0px", opacity: 0 }], { duration: 230, easing: spring })
        .onfinish = () => { if (details.dataset.state === "closed") details.open = false; };
    } else {
      details.open = true;
      answer.animate([{ height: `${height}px`, opacity }, { height: `${answer.scrollHeight}px`, opacity: 1 }],
                     { duration: 380, easing: spring });
    }
  });
}
