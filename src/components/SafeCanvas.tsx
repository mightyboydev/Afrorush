"use client";

// src/components/SafeCanvas.tsx — Wraps @react-three/fiber Canvas in an error
// boundary so a Three.js / WebGL crash never takes down the whole page.
// If the Canvas throws (e.g. "Error creating WebGL context"), we render the
// fallback UI instead of bubbling up to Next.js's error overlay.

import { Component, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class SafeCanvas extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.warn("[SafeCanvas] Canvas crashed, showing fallback:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
