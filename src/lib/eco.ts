export type ScanRecord = { id: string; image: string; name: string; category: string | null; date: string };
export type EcoState = { scans: ScanRecord[]; rewards: string[]; activities: number };
export const emptyEco: EcoState = { scans: [], rewards: [], activities: 0 };
export function pointsFor(state: EcoState) { return state.scans.length * 10 + state.rewards.filter(r => r.startsWith('quiz:')).length * 20 + state.rewards.filter(r => r.startsWith('week:')).length * 50; }
export function reward(state: EcoState, id: string): EcoState { return state.rewards.includes(id) ? state : { ...state, rewards: [...state.rewards, id], activities: state.activities + (id.startsWith('week:') ? 1 : 0) }; }
export function addScan(state: EcoState, scan: ScanRecord): EcoState { return state.scans.some(s => s.id === scan.id) ? state : { ...state, scans: [...state.scans, scan] }; }
export function weekKey(date = new Date()) { const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0,10); }
