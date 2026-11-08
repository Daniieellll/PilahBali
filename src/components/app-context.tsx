import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { addScan, emptyEco, pointsFor, reward, type EcoState, type ScanRecord } from '@/lib/eco';
type App = { lang: 'id' | 'en'; setLang: (l: 'id'|'en') => void; dark: boolean; toggleDark: () => void; t: (id: string,en: string) => string; eco: EcoState; points: number; saveScan: (s: ScanRecord)=>void; earn: (id: string)=>void; storageError: boolean };
const Context = createContext<App | null>(null);
export function AppProvider({children}:{children: ReactNode}) {
 const [lang,setLang] = useState<'id'|'en'>('id'); const [dark,setDark] = useState(false); const [eco,setEco] = useState<EcoState>(emptyEco); const [ready,setReady] = useState(false); const [storageError,setStorageError]=useState(false);
 useEffect(()=>{ try {setLang(localStorage.getItem('pilah-language')==='en'?'en':'id');setDark(localStorage.getItem('pilah-theme')==='dark'); const saved=JSON.parse(localStorage.getItem('pilah-eco')||'null'); if(saved && Array.isArray(saved.scans) && Array.isArray(saved.rewards)) setEco(saved); } catch {setStorageError(true);} setReady(true); },[]);
 useEffect(()=>{ if(!ready)return; document.documentElement.lang=lang; document.documentElement.classList.toggle('dark',dark);try{localStorage.setItem('pilah-language',lang);localStorage.setItem('pilah-theme',dark?'dark':'light');localStorage.setItem('pilah-eco',JSON.stringify(eco));}catch{setStorageError(true);} },[lang,dark,eco,ready]);
 return <Context.Provider value={{lang,setLang,dark,toggleDark:()=>setDark(v=>!v),t:(id,en)=>lang==='id'?id:en,eco,points:pointsFor(eco),saveScan:s=>setEco(v=>addScan(v,s)),earn:id=>setEco(v=>reward(v,id)),storageError}}>{children}</Context.Provider>;
}
export function useApp(){ const app=useContext(Context);if(!app)throw new Error('AppProvider required');return app; }
