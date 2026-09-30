// ═══════════════════════════════════════════════════════════
// Web Push Notifications Hook
// Phase 9 implementation — stub
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";

/**
 * Manages Web Push notification subscription.
 *
 * TODO: Phase 9 — implement service worker registration + push subscription
 */
export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  void setIsSubscribed;
  void setIsSupported;

  async function subscribe() {
    // TODO: Phase 9
  }

  async function unsubscribe() {
    // TODO: Phase 9
  }

  return { isSubscribed, isSupported, subscribe, unsubscribe };
}
