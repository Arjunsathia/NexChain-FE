/**
 * Props that make a clickable div/tr behave like a button for keyboard and
 * screen-reader users: focusable, announced as a button, Enter/Space activate.
 * Key presses from nested buttons or links are left alone.
 */
export const pressable = (onActivate) =>
  !onActivate
    ? {}
    : {
        role: "button",
        tabIndex: 0,
        onClick: onActivate,
        onKeyDown: (e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate(e);
          }
        },
      };
