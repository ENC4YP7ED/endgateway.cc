"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { appEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

type TurnstileStatus =
  | "idle"
  | "checking"
  | "approved"
  | "revoked"
  | "error"
  | "expired"
  | "unsupported";

type TurnstileGateProps = {
  className?: string;
};

type PendingExecution = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
};

export type TurnstileGateHandle = {
  execute: () => Promise<string>;
  reset: () => void;
};

const labels: Record<TurnstileStatus, string> = {
  idle: "Turnstile idle",
  checking: "Turnstile checking",
  approved: "Turnstile approved",
  revoked: "Turnstile revoked",
  error: "Turnstile error",
  expired: "Turnstile expired",
  unsupported: "Turnstile unavailable",
};

export const TurnstileGate = forwardRef<TurnstileGateHandle, TurnstileGateProps>(
  function TurnstileGate({ className }, ref) {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const pendingRef = useRef<PendingExecution | null>(null);
    const [status, setStatus] = useState<TurnstileStatus>("idle");

    useEffect(() => {
      let cancelled = false;

      const attach = () => {
        if (
          cancelled ||
          !mountRef.current ||
          !window.turnstile ||
          widgetIdRef.current
        ) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(mountRef.current, {
          sitekey: appEnv.turnstileSiteKey,
          execution: "execute",
          callback: (token: string) => {
            setStatus("approved");
            pendingRef.current?.resolve(token);
            pendingRef.current = null;
          },
          "error-callback": () => {
            setStatus("error");
            pendingRef.current?.reject(new Error("Turnstile verification failed."));
            pendingRef.current = null;
          },
          "expired-callback": () => {
            setStatus("expired");
            pendingRef.current?.reject(new Error("Turnstile token expired."));
            pendingRef.current = null;
          },
          "timeout-callback": () => {
            setStatus("revoked");
            pendingRef.current?.reject(new Error("Turnstile challenge timed out."));
            pendingRef.current = null;
          },
        });
      };

      attach();
      const interval = window.setInterval(attach, 180);

      return () => {
        cancelled = true;
        window.clearInterval(interval);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      execute() {
        if (!window.turnstile || !widgetIdRef.current) {
          setStatus("unsupported");
          return Promise.reject(new Error("Turnstile is not ready yet."));
        }

        if (pendingRef.current) {
          pendingRef.current.reject(new Error("Turnstile request interrupted."));
          pendingRef.current = null;
        }

        window.turnstile.reset(widgetIdRef.current);
        setStatus("checking");

        return new Promise<string>((resolve, reject) => {
          pendingRef.current = { resolve, reject };
          window.turnstile?.execute(widgetIdRef.current!);
        });
      },
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
        setStatus("idle");
      },
    }));

    return (
      <div className={cn("flex items-center justify-between gap-3", className)}>
        <div className="status-pill">
          <span className={cn("status-dot", status)} />
          <span>{labels[status]}</span>
        </div>
        <div className="text-right text-[0.72rem] uppercase tracking-[0.18em] text-[var(--muted)]">
          {appEnv.useTurnstileTestKeys ? "test keys active" : "invisible widget"}
        </div>
        <div ref={mountRef} className="sr-only" />
      </div>
    );
  },
);
