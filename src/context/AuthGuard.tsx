'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../state/store';
import { restoreSessionAsync } from '../state/authentication/AuthenticationSlice';
import { CookieUtils } from '@/lib/utils/CookieUtils/CookieUtils';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, user, sessionChecked } = useSelector((state: RootState) => state.authentication);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Only run this on the client
    const tokenFromCookie = CookieUtils.getCookie("tokenid");
    setToken(tokenFromCookie);

    if (!user && tokenFromCookie && !loading && !sessionChecked) {
      console.debug("AuthGuard: Restoring session with token:", tokenFromCookie);
      dispatch(restoreSessionAsync());
    }
  }, [user, loading, dispatch, sessionChecked]);

  console.debug("AuthGuard: user:", user);
  console.debug("AuthGuard: token from cookie:", token);
  console.debug("AuthGuard: loading:", loading);

  return <>{children}</>;
}
