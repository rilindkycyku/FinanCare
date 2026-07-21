import { createContext, useCallback, useContext, useRef, useState } from "react";
import ConfirmModal from "../Components/ConfirmModal";

const DialogContext = createContext(null);

/** App-wide replacement for window.alert()/confirm() — same custom modal everywhere
 * instead of the browser's native "localhost:5173 says" dialog. Both return a Promise
 * so call sites just `await dialog.confirm(...)` where they used to call confirm(...). */
export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((result) => {
    setDialog(null);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const alertDialog = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        mode: "alert",
        message,
        title: opts.title ?? "Njoftim",
        confirmLabel: opts.confirmLabel ?? "Në rregull",
        variant: opts.variant ?? "info",
      });
    });
  }, []);

  const confirmDialog = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        mode: "confirm",
        message,
        title: opts.title ?? "Konfirmo",
        confirmLabel: opts.confirmLabel ?? "Vazhdo",
        cancelLabel: opts.cancelLabel ?? "Anulo",
        variant: opts.variant ?? "warning",
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ alert: alertDialog, confirm: confirmDialog }}>
      {children}
      {dialog && (
        <ConfirmModal
          show
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          variant={dialog.variant}
          hideCancel={dialog.mode === "alert"}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within a DialogProvider");
  return ctx;
}
