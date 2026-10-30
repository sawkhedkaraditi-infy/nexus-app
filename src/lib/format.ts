const inrFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const inr = (n: number) => '₹' + inrFmt.format(Math.round(n));
export const num = (n: number) => inrFmt.format(Math.round(n));
export const crore = (n: number) => '₹' + inrFmt.format(Math.round(n)) + ' Cr';
export const lakh = (n: number) => (n >= 100 ? '₹' + (n / 100).toFixed(2) + ' Cr' : '₹' + n + ' L');

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const clock = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
