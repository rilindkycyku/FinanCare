// src/utils/cartIntegrityChecker.ts → VERSIONI FINAL (pa IDKategoritEPartnerit)
import users from "../data/users.json";
import type { User } from "../context/AuthContext";
import toast from "react-hot-toast";

export const validateSavedUser = (): {
  isValid: boolean;
  shouldLogout: boolean;
  reason?: string;
} => {
  const savedUserJson = localStorage.getItem("user");
  if (!savedUserJson) {
    return { isValid: false, shouldLogout: true, reason: "Nuk ka përdorues" };
  }

  let savedUser: User;
  try {
    savedUser = JSON.parse(savedUserJson);
  } catch {
    return { isValid: false, shouldLogout: true, reason: "JSON i dëmtuar" };
  }

  // Përdorues në pritje – lejohet pa validim të plotë
  if (savedUser.isPendingApproval === true) {
    return { isValid: true, shouldLogout: false };
  }

  // Kontrollo nëse ka IDPartneri
  if (!savedUser.IDPartneri) {
    return { isValid: false, shouldLogout: true, reason: "Mungon ID" };
  }

  // Krahaso me listën zyrtare të përdoruesve
  const officialUser = users.find(
    (u: any) => Number(u.IDPartneri) === Number(savedUser.IDPartneri)
  );

  if (!officialUser) {
    return { isValid: false, shouldLogout: true, reason: "Përdoruesi u fshi nga sistemi" };
  }

  if (officialUser.isDeleted === "true") {
    return { isValid: false, shouldLogout: true, reason: "Llogaria u çaktivizua" };
  }

  // Nëse gjithçka është në rregull
  return { isValid: true, shouldLogout: false };
};

export const runIntegrityCheck = (): { didLogout: boolean } => {
  const check = validateSavedUser();

  if (check.shouldLogout) {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    toast.error(check.reason || "Duhet të kyçesh përsëri", {
      duration: 8000,
      style: { background: "#fee2e2", color: "#991b1b" },
    });
    setTimeout(() => window.location.href = "/login", 3000);
    return { didLogout: true };
  }

  return { didLogout: false };
};