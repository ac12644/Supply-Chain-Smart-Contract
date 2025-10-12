"use client";

import { useEffect } from "react";

export function HydrationFix() {
  useEffect(() => {
    // Remove browser extension attributes that cause hydration mismatches
    const removeExtensionAttributes = () => {
      const elements = document.querySelectorAll(
        "[bis_skin_checked], [bis_register], [data-new-gr-c-s-check-loaded], [data-gr-ext-installed], [__processed_a48d75fa-d2e6-4d81-a21e-2ffb3cc74a1f__]"
      );

      elements.forEach((element) => {
        // Remove problematic attributes
        element.removeAttribute("bis_skin_checked");
        element.removeAttribute("bis_register");
        element.removeAttribute("data-new-gr-c-s-check-loaded");
        element.removeAttribute("data-gr-ext-installed");
        element.removeAttribute(
          "__processed_a48d75fa-d2e6-4d81-a21e-2ffb3cc74a1f__"
        );
      });
    };

    // Run immediately and after a short delay to catch extensions that inject later
    removeExtensionAttributes();
    const timeoutId = setTimeout(removeExtensionAttributes, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
