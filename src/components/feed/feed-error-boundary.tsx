"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { requestFeedReset } from "@/lib/feed-refresh";

interface FeedErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface FeedErrorBoundaryState {
  hasError: boolean;
}

export class FeedErrorBoundary extends Component<FeedErrorBoundaryProps, FeedErrorBoundaryState> {
  state: FeedErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): FeedErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Feed render error:", error, info.componentStack);
  }

  private handleReset = () => {
    requestFeedReset();
    this.props.onReset?.();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Feed needs a refresh</h2>
          <p className="mt-2 text-sm text-muted">
            Something went wrong while showing posts. This can happen after scrolling through a lot of
            content on slower devices.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={this.handleReset}>Try again</Button>
            <Button type="button" variant="outline" onClick={() => window.location.assign("/feed")}>
              Reload feed
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
