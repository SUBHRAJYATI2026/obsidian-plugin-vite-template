import { Plugin } from "obsidian";
import { createRoot, type Root } from "react-dom/client";
import { StrictMode } from "react";
import _React from "react";
import FloatingWidget from "./FloatingWidget";
import "./index.css";

export default class AIPlugin extends Plugin {
  private root: Root | null = null;
  private container: HTMLElement | null = null;
  private isWidgetOpen: boolean = false;

  async onload() {
    // Create a div and append to document.body
    this.addRibbonIcon("bot", "Obsidian Agent", (_evn: MouseEvent) => {
      this.toggleWidget();
    });

    this.container = document.createElement("div");
    this.container.id = "my-plugin-root";
    document.body.appendChild(this.container);

    // Mount React into it
    this.root = createRoot(this.container);
    this.root.render(
      <StrictMode>
        <FloatingWidget
          isOpen={this.isWidgetOpen}
          onToggle={() => this.toggleWidget()}
        />
      </StrictMode>,
    );
  }

  toggleWidget() {
    this.isWidgetOpen = !this.isWidgetOpen;
    this.root?.render(
      <StrictMode>
        <FloatingWidget
          isOpen={this.isWidgetOpen}
          onToggle={() => this.toggleWidget()}
        />
      </StrictMode>,
    );
  }

  onunload() {
    // Clean up on plugin disable
    this.root?.unmount();
    this.container?.remove();
  }
}
