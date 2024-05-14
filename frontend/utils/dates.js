export default function parseTwitterDate(dateString) {
  const b = dateString.split(/[: ]/g);
  const m = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  return new Date(
    Date.UTC(
      Number(b[7]),
      m[b[1].toLowerCase()],
      Number(b[2]),
      Number(b[3]),
      Number(b[4]),
      Number(b[5])
    )
  );
}
