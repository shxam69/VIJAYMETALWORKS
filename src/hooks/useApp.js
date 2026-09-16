import { useContext, createContext } from 'react';

export const AppCtx = createContext({});
export const useAppCtx = () => useContext(AppCtx);

export default useAppCtx;
