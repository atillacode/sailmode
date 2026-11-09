// What every page of sailmode.app shares: the colour past the page's ends, and the FAQ's spring.

const root = document.documentElement;

// The colour around the page, which Safari shows beside it (the sidebar on iPhone Duo), under its toolbar and past its
// ends: the sky's colour where one is on the page. The sky runs from --sky-top (the very top) through --sky-mid (55 %
// down) to --sky-end (the very bottom), as in style.css. The colour is taken from where the screen's top edge is at the
// top of the page, its middle halfway down, and its bottom edge at the end, so pulled past either end it matches too.
const followScroll = () => {
  const page = root.scrollHeight, range = page - innerHeight;
  const along = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
  const at = page > 0 ? (scrollY + innerHeight * along) / page : 0;
  const [from, to, part] = at <= 0.55 ? ["--sky-top", "--sky-mid", at / 0.55] : ["--sky-mid", "--sky-end", (at - 0.55) / 0.45];
  root.style.setProperty("--edge-from", `var(${from})`);
  root.style.setProperty("--edge-to", `var(${to})`);
  root.style.setProperty("--edge-at", `${(Math.min(1, Math.max(0, part)) * 100).toFixed(1)}%`);
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
