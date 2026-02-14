// app/ReduxProvider.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '../state/store';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
