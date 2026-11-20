import { useEffect } from "react";

// Every horizontally scrolling row of tabs, chips or filters in the app
const ROW = ".overflow-x-auto.no-scrollbar, .premium-segmented, [data-scroll-row]";
const SELECTED = '[aria-selected="true"], [aria-current="page"], [aria-current="true"], [aria-pressed="true"]';

/** Marks which ends of a row have hidden content, so CSS can fade that edge */
function updateFades(row) {
  const max = row.scrollWidth - row.clientWidth;
  row.toggleAttribute("data-fade-start", max > 1 && row.scrollLeft > 1);
  row.toggleAttribute("data-fade-end", max > 1 && row.scrollLeft < max - 1);
}

/** Scrolls the row (never the page) so `item` is fully visible, centred if possible */
function revealItem(row, item, smooth) {
  if (row.scrollWidth <= row.clientWidth) return;
  const rowBox = row.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  if (box.left >= rowBox.left && box.right <= rowBox.right) return;
  const left = row.scrollLeft + (box.left - rowBox.left) - (rowBox.width - box.width) / 2;
  row.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
}

/**
 * App-wide behaviour for horizontal scroll rows (works for rows inside dialogs too):
 * fades the edge that has more content, and keeps the selected tab/chip in view
 * when the page opens and whenever the selection changes.
 */
export default function useScrollRows() {
  useEffect(() => {
    const tracked = new WeakSet();
    const onScroll = (e) => updateFades(e.currentTarget);
    let frame = 0;

    const scan = (smooth) => {
      frame = 0;
      document.querySelectorAll(ROW).forEach((row) => {
        if (!tracked.has(row)) {
          tracked.add(row);
          row.addEventListener("scroll", onScroll, { passive: true });
          const selected = row.querySelector(SELECTED);
          if (selected) revealItem(row, selected, false);
        }
        updateFades(row);
      });
      if (smooth) smooth.forEach(([row, item]) => revealItem(row, item, true));
    };

    let pendingReveal = [];
    let timer = 0;
    const flush = () => {
      timer = 0;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const reveal = pendingReveal;
        pendingReveal = [];
        scan(reveal);
      });
    };
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== "attributes" || m.target.getAttribute(m.attributeName) !== "true") continue;
        const row = m.target.closest(ROW);
        if (row) pendingReveal.push([row, m.target]);
      }
      // A selection change reacts on the next frame; other DOM churn (live prices) is batched
      if (pendingReveal.length) flush();
      else if (!timer) timer = setTimeout(flush, 250);
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-selected", "aria-current", "aria-pressed"],
    });

    const onResize = () => document.querySelectorAll(ROW).forEach(updateFades);
    window.addEventListener("resize", onResize);
    scan();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
      document.querySelectorAll(ROW).forEach((row) => row.removeEventListener("scroll", onScroll));
    };
  }, []);
}
