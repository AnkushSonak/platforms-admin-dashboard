"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "../state/store";
import { restoreSessionAsync } from "../state/authentication/AuthenticationSlice";
import { CookieUtils } from "@/lib/utils/CookieUtils/CookieUtils";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, sessionChecked } = useSelector(
    (state: RootState) => state.authentication
  );

  /** 1️⃣ Restore session once on mount */
  useEffect(() => {
    if (!sessionChecked) {
      const token = CookieUtils.getCookie("tokenid");

      if (token) {
        dispatch(restoreSessionAsync());
      } else {
        // No token → mark session as checked manually
        // You should ideally have an action for this
        dispatch({ type: "authentication/sessionCheckedManually" });
      }
    }
  }, [dispatch, sessionChecked]);

  /** 2️⃣ Redirect only AFTER session check finishes */
  useEffect(() => {
    if (sessionChecked && !user) {
      router.replace("/signin");
    }
  }, [sessionChecked, user, router]);

  /** 3️⃣ Block rendering until session check completes */
  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  /** 4️⃣ Prevent flicker during redirect */
  if (!user) return null;

  return <>{children}</>;
}
