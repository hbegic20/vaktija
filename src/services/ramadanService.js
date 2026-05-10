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

const DAY_MS = 1000 * 60 * 60 * 24;
const DEFAULT_BAJRAM_INTERVAL_DAYS = 354;

const parseDate = (date) => new Date(`${date}T00:00:00`);

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getIntervalDaysForLabel = (entries, label) => {
  const matchingEntries = entries.filter((entry) => entry.label === label);
  if (matchingEntries.length >= 2) {
    const last = parseDate(matchingEntries[matchingEntries.length - 1].date);
    const previous = parseDate(matchingEntries[matchingEntries.length - 2].date);
    return Math.max(1, Math.round((last - previous) / DAY_MS));
  }

  return DEFAULT_BAJRAM_INTERVAL_DAYS;
};

const expandBajramEntries = (bajrams, today) => {
  const sortedEntries = [...bajrams].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );

  if (!sortedEntries.length) {
    return [];
  }

  const futureBufferLimit = new Date(today);
  futureBufferLimit.setFullYear(futureBufferLimit.getFullYear() + 3);

  const lastConfiguredDate = parseDate(sortedEntries[sortedEntries.length - 1].date);
  if (lastConfiguredDate >= today) {
    return sortedEntries;
  }

  const intervalsByLabel = new Map(
    [...new Set(sortedEntries.map((entry) => entry.label))].map((label) => [
      label,
      getIntervalDaysForLabel(sortedEntries, label)
    ])
  );

  const latestByLabel = new Map();
  sortedEntries.forEach((entry) => {
    latestByLabel.set(entry.label, entry);
  });

  const expandedEntries = [...sortedEntries];

  while (true) {
    const nextCandidates = [...latestByLabel.values()].map((entry) => {
      const intervalDays = intervalsByLabel.get(entry.label) || DEFAULT_BAJRAM_INTERVAL_DAYS;
      const nextDate = parseDate(entry.date);
      nextDate.setDate(nextDate.getDate() + intervalDays);

      return {
        label: entry.label,
        date: formatDate(nextDate)
      };
    });

    nextCandidates.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
    const nextCandidate = nextCandidates[0];

    if (!nextCandidate || parseDate(nextCandidate.date) > futureBufferLimit) {
      break;
    }

    expandedEntries.push(nextCandidate);
    latestByLabel.set(nextCandidate.label, nextCandidate);
  }

  return expandedEntries.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
};

export function getNextBajram(today, bajrams = []) {
  const normalizedToday = new Date(today);
  const bajramEntries = expandBajramEntries(bajrams, normalizedToday);
  const nextBajram = bajramEntries.find((item) => parseDate(item.date) >= normalizedToday);

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
