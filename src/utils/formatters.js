export const T = () => new Date().toISOString().slice(0, 10);

export const uid = () => Math.floor(Date.now() * 1000 + Math.random() * 1000);

export const srt = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);

export const dOff = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const getNowDateString = () => new Date().toLocaleDateString();
