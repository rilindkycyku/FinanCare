// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import users from "../data/users.json";
import toast from "react-hot-toast";

export interface User {
  IDPartneri: number;

  // Core info
  EmriBiznesit: string;
  Username: string;
  Password?: string; // Only during login – never stored after

  // Fiscal & Contact
  NUI?: string;
  NRF?: string;
  TVSH?: string;
  Email?: string;
  Adresa?: string;
  NrKontaktit?: string;
  ShkurtesaPartnerit?: string;

  // Rabat / Bonus Program (new system)
  Rabati?: number;                // e.g. 2.00, 4.00, or undefined/0 if no discount
  LlojiKarteles?: string | null;  // e.g. "Bonus"
  KodiKartela?: string | null;    // e.g. "B000014000003"

  // System flags
  isDeleted?: string; // "false" or "true" as in JSON

  // For self-registered users waiting for approval
  isPendingApproval?: boolean;
  pendingSince?: string; // ISO date string
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount + show pending toast once per day
  useEffect(() => {
    const savedUserJson = localStorage.getItem("user");
    if (!savedUserJson) return;

    try {
      const parsed = JSON.parse(savedUserJson) as Partial<User>;

      // Normalize and type-safe user
      const loadedUser: User = {
        IDPartneri: Number(parsed.IDPartneri),
        EmriBiznesit: parsed.EmriBiznesit || "Partner i panjohur",
        Username: parsed.Username || "",
        // Do NOT restore Password
        NUI: parsed.NUI,
        NRF: parsed.NRF,
        TVSH: parsed.TVSH,
        Email: parsed.Email,
        Adresa: parsed.Adresa,
        NrKontaktit: parsed.NrKontaktit,
        ShkurtesaPartnerit: parsed.ShkurtesaPartnerit,
        Rabati: parsed.Rabati !== undefined ? Number(parsed.Rabati) : undefined,
        LlojiKarteles: parsed.LlojiKarteles ?? undefined,
        KodiKartela: parsed.KodiKartela ?? undefined,
        isDeleted: parsed.isDeleted,
        isPendingApproval: parsed.isPendingApproval === true,
        pendingSince: parsed.pendingSince,
      };

      setUser(loadedUser);

      // Show pending approval toast only once per day
      if (loadedUser.isPendingApproval) {
        const lastShown = localStorage.getItem("pendingToastLastShown");
        const today = new Date().toDateString();

        if (lastShown !== today) {
          toast(
            <div className="flex items-center gap-4">
              <svg
                className="w-7 h-7 text-amber-600 flex-shrink-0 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-bold text-amber-900">
                  Llogaria jote është në pritje të miratimit
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Mund të porositësh tani – aktivizimi i plotë brenda 48 orëve!
                </p>
              </div>
            </div>,
            {
              duration: 8000,
              style: {
                background: "#fffbeb",
                color: "#92400e",
                border: "2px solid #fbbf24",
                borderRadius: "16px",
                padding: "18px 24px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                maxWidth: "500px",
              },
            }
          );

          localStorage.setItem("pendingToastLastShown", today);
        }
      }
    } catch (err) {
      console.error("Gabim në leximin e përdoruesit nga localStorage", err);
      localStorage.removeItem("user");
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = users.find((u: any) => {
      const matchUsername = String(u.Username || "").trim() === username.trim();
      const matchPassword = String(u.Password || "").trim() === password.trim();
      const isNotDeleted = u.isDeleted !== "true";
      return matchUsername && matchPassword && isNotDeleted;
    });

    if (!foundUser) {
      return false;
    }

    // Remove password and prepare clean user object
    const { Password, ...safeUser } = foundUser;

    const loggedInUser: User = {
      IDPartneri: Number(safeUser.IDPartneri),
      EmriBiznesit: safeUser.EmriBiznesit || "Partner",
      Username: safeUser.Username || "",
      NUI: safeUser.NUI,
      NRF: safeUser.NRF,
      TVSH: safeUser.TVSH,
      Email: safeUser.Email,
      Adresa: safeUser.Adresa,
      NrKontaktit: safeUser.NrKontaktit,
      ShkurtesaPartnerit: safeUser.ShkurtesaPartnerit,
      Rabati: safeUser.Rabati !== undefined ? Number(safeUser.Rabati) : undefined,
      LlojiKarteles: safeUser.LlojiKarteles ?? undefined,
      KodiKartela: safeUser.KodiKartela ?? undefined,
      isDeleted: safeUser.isDeleted,
      // If you want to support pending users from JSON, add logic here
      // isPendingApproval: false, // usually false for official users
    };

    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    toast.success(`Mirë se erdhe, ${loggedInUser.EmriBiznesit}!`, {
      icon: "👋",
      duration: 5000,
    });

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("pendingToastLastShown");
    toast.success("Ke dal me sukses nga llogaria", { icon: "👋" });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth duhet të përdoret brenda AuthProvider");
  }
  return context;
};