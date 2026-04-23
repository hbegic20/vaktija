export function getRamadanStatus(today, config) {
  const start = new Date(`${config.start}T00:00:00`);
  const end = new Date(`${config.end}T23:59:59`);
  const eid = new Date(`${config.eid}T00:00:00`);

  const isRamadan = today >= start && today <= end;
  const dayIndex = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const diffMs = Math.max(0, eid - today);
  const daysToEid = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hoursToEid = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutesToEid = Math.floor((diffMs / (1000 * 60)) % 60);
  const secondsToEid = Math.floor((diffMs / 1000) % 60);

  return {
    isRamadan,
    dayIndex: Math.min(Math.max(dayIndex, 1), totalDays),
    totalDays,
    progress: Math.round((Math.min(Math.max(dayIndex, 1), totalDays) / totalDays) * 100),
    daysToEid,
    timeToEid: {
      hours: String(hoursToEid).padStart(2, "0"),
      minutes: String(minutesToEid).padStart(2, "0"),
      seconds: String(secondsToEid).padStart(2, "0")
    }
  };
}

export function getHolidayCountdown(today, date) {
  const holiday = new Date(`${date}T00:00:00`);
  const diffMs = Math.max(0, holiday - today);
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return {
    days,
    time: {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0")
    }
  };
}

export function getNextBajram(today, bajrams = []) {
  const nextBajram = bajrams.find((item) => new Date(`${item.date}T00:00:00`) >= today) || bajrams[0];

  if (!nextBajram) {
    return {
      label: "Bajram",
      days: 0,
      time: { hours: "00", minutes: "00", seconds: "00" }
    };
  }

  const countdown = getHolidayCountdown(today, nextBajram.date);
  return {
    label: nextBajram.label,
    date: nextBajram.date,
    ...countdown
  };
}
