"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DISTRACTION_REASONS } from "@/lib/types";

type Step = "reason" | "caught";

/** Mounted only while the user is drifting, so each open starts clean. */
export function DriftModal({
  onRecord,
  onReturn,
  onDismiss,
}: {
  /** Called with the chosen reason the moment the user confirms. */
  onRecord: (reason: string) => void;
  /** Called when the user is ready to resume. */
  onReturn: () => void;
  /** Closed without choosing a reason — nothing recorded. */
  onDismiss: () => void;
}) {
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState<string>(DISTRACTION_REASONS[0]);

  function confirm() {
    onRecord(reason);
    setStep("caught");
  }

  return (
    <Modal
      open
      label={step === "reason" ? "What pulled you away?" : "Return to the task"}
      onClose={step === "reason" ? onDismiss : onReturn}
    >
      {step === "reason" ? (
        <>
          <p className="label">What pulled you away?</p>

          <div
            role="radiogroup"
            aria-label="Distraction reason"
            className="mt-5 flex flex-col"
          >
            {DISTRACTION_REASONS.map((option, index) => {
              const selected = reason === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-autofocus={index === 0 ? "" : undefined}
                  onClick={() => setReason(option)}
                  onDoubleClick={confirm}
                  className={`-mx-2 flex items-center gap-3 rounded-[3px] px-2 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-[#181818] text-fg"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  <span
                    className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      selected ? "border-fg" : "border-border-strong"
                    }`}
                  >
                    {selected ? (
                      <span className="size-1.5 rounded-full bg-fg" />
                    ) : null}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            onClick={confirm}
          >
            Return to task
          </Button>
        </>
      ) : (
        <>
          <p className="text-[15px] leading-relaxed text-fg">
            You caught yourself.
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-muted">
            Return to the task.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="mt-8 w-full"
            data-autofocus=""
            onClick={onReturn}
          >
            Continue
          </Button>
        </>
      )}
    </Modal>
  );
}
