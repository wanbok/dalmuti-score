"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/store";
import { useHydration } from "@/hooks/useHydration";
import { Button } from "./Button";

interface CoachmarkStep {
  targetSelector: string;
  message: string;
  placement: "top" | "bottom";
}

const TOTAL_STEPS = 5;

const GROUP_RANGES = {
  sessions: { start: 0, end: 2 },
  "session-detail": { start: 3, end: 4 },
} as const;

interface CoachmarkOverlayProps {
  steps: CoachmarkStep[];
  group: keyof typeof GROUP_RANGES;
}

function computeTooltipPosition(
  targetRect: DOMRect,
  placement: "top" | "bottom",
  tooltipHeight: number,
  padding: number = 12
): { top: number; actualPlacement: "top" | "bottom" } {
  if (placement === "bottom") {
    const top = targetRect.bottom + padding;
    if (top + tooltipHeight > window.innerHeight - padding) {
      return { top: targetRect.top - tooltipHeight - padding, actualPlacement: "top" };
    }
    return { top, actualPlacement: "bottom" };
  }

  const top = targetRect.top - tooltipHeight - padding;
  if (top < padding) {
    return { top: targetRect.bottom + padding, actualPlacement: "bottom" };
  }
  return { top, actualPlacement: "top" };
}

export function CoachmarkOverlay({ steps, group }: CoachmarkOverlayProps) {
  const hydrated = useHydration();
  const onboardingCompleted = useStore((s) => s.onboardingCompleted);
  const globalStep = useStore((s) => s.onboardingStep);
  const setOnboardingStep = useStore((s) => s.setOnboardingStep);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(0);

  const range = GROUP_RANGES[group];
  const localIndex = globalStep - range.start;
  const isVisible = !onboardingCompleted && globalStep >= range.start && globalStep <= range.end;
  const currentStep = isVisible && localIndex >= 0 && localIndex < steps.length ? steps[localIndex] : null;

  const updateTargetRect = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  // Auto-skip if target not in DOM
  useEffect(() => {
    if (!isVisible || !currentStep) return;
    // Small delay to let the DOM settle after navigation
    const timer = setTimeout(() => {
      const el = document.querySelector(currentStep.targetSelector);
      if (!el) {
        if (globalStep >= TOTAL_STEPS - 1) {
          completeOnboarding();
        } else {
          setOnboardingStep(globalStep + 1);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [globalStep, isVisible, currentStep, completeOnboarding, setOnboardingStep]);

  // Measure target + listen for resize/scroll
  useEffect(() => {
    if (!isVisible || !currentStep) return;
    const raf = requestAnimationFrame(() => updateTargetRect());
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [isVisible, currentStep, updateTargetRect]);

  // Measure tooltip height
  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.getBoundingClientRect().height);
    }
  }, [globalStep, targetRect]);

  // Escape to dismiss
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") completeOnboarding();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, completeOnboarding]);

  if (!hydrated || !isVisible || !targetRect || !currentStep) return null;

  const handleNext = () => {
    if (globalStep >= TOTAL_STEPS - 1) {
      completeOnboarding();
    } else {
      setOnboardingStep(globalStep + 1);
    }
  };

  const spotlightPadding = 6;
  const spotlightStyle = {
    top: targetRect.top - spotlightPadding,
    left: targetRect.left - spotlightPadding,
    width: targetRect.width + spotlightPadding * 2,
    height: targetRect.height + spotlightPadding * 2,
  };

  const tooltipPos = computeTooltipPosition(
    targetRect,
    currentStep.placement,
    tooltipHeight || 120,
    12
  );

  // Center tooltip horizontally within viewport, clamped
  const tooltipWidth = 280;
  const tooltipLeft = Math.max(
    16,
    Math.min(
      targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      window.innerWidth - tooltipWidth - 16
    )
  );

  const isLastStep = globalStep >= TOTAL_STEPS - 1;

  const overlay = (
    <div
      className="fixed inset-0 z-[100]"
      style={{ animation: "coachmark-in 200ms ease-out" }}
      onClick={completeOnboarding}
      role="presentation"
    >
      {/* Spotlight cutout */}
      <div
        className="absolute rounded-2xl transition-all duration-300 ease-out"
        style={{
          ...spotlightStyle,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-label="온보딩 안내"
        className="absolute rounded-2xl border border-border bg-surface-elevated p-4 shadow-xl"
        style={{
          top: tooltipPos.top,
          left: tooltipLeft,
          width: tooltipWidth,
          animation: "coachmark-tooltip-in 200ms ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-text-primary leading-relaxed mb-3">
          {currentStep.message}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-tertiary tabular-nums">
            {globalStep + 1}/{TOTAL_STEPS}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={completeOnboarding}>
              건너뛰기
            </Button>
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? "완료" : "다음"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

export { type CoachmarkStep };
