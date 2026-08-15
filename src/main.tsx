import { Notice, Plugin } from "obsidian";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { StrictMode } from "react";
import _React from "react";
import FloatingWidget from "./FloatingWidget";
import "./index.css";

export default class AIPlugin extends Plugin {
  private root: Root | null = null;
  private container: HTMLElement | null = null;

  async onload() {
    // Create a div and append to document.body
    this.addRibbonIcon("bot", "Obsidian Agent", (_evn: MouseEvent) => {
      new Notice("This is a notice");
    });

    this.container = document.createElement("div");
    this.container.id = "my-plugin-root";
    document.body.appendChild(this.container);

    // Mount React into it
    this.root = createRoot(this.container);
    this.root.render(
      <StrictMode>
        <FloatingWidget />
      </StrictMode>,
    );
  }

  onunload() {
    // Clean up on plugin disable
    this.root?.unmount();
    this.container?.remove();
  }
}
