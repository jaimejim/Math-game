"use client";

import { useEffect } from "react";

export default function ManifestSwap() {
  useEffect(() => {
    const manifest = document.querySelector('link[rel="manifest"]');
    const appleMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]'
    );
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (manifest) manifest.setAttribute("href", "/manifest-mates.json");
    if (appleMeta) appleMeta.setAttribute("content", "Mates");
    if (appleIcon) appleIcon.setAttribute("href", "/icon-mates.svg");
    if (themeColor) themeColor.setAttribute("content", "#eab308");

    return () => {
      if (manifest) manifest.setAttribute("href", "/manifest.json");
      if (appleMeta) appleMeta.setAttribute("content", "Math Race!");
      if (appleIcon) appleIcon.setAttribute("href", "/icon-192.svg");
      if (themeColor) themeColor.setAttribute("content", "#1e1b4b");
    };
  }, []);

  return null;
}
