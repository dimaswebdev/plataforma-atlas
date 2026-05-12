type ParticipantMetricInput = {
  willAttend?: unknown;
  guestsCount?: unknown;
};

export function getConfirmedGuestCount(participant: ParticipantMetricInput) {
  if (participant.willAttend !== "yes") return 0;

  const guestsCount = Number(participant.guestsCount || 0);
  if (!Number.isFinite(guestsCount)) return 0;

  return Math.max(0, Math.floor(guestsCount));
}

export function getParticipantPeopleCount(participant: ParticipantMetricInput) {
  if (participant.willAttend !== "yes") return 0;
  return 1 + getConfirmedGuestCount(participant);
}

export function calculateParticipantMetrics(participants: ParticipantMetricInput[]) {
  const confirmedParticipants = participants.filter((participant) => participant.willAttend === "yes").length;
  const totalGuests = participants.reduce((total, participant) => total + getConfirmedGuestCount(participant), 0);

  return {
    totalParticipants: participants.length,
    confirmedParticipants,
    totalGuests,
    totalPeople: confirmedParticipants + totalGuests,
  };
}
