type ParticipantMetricInput = {
  willAttend?: unknown;
  guestsCount?: unknown;
  authUid?: unknown;
  email?: unknown;
  registrationStatus?: unknown;
  wantsToHelpCommittee?: unknown;
  officialKit?: unknown;
};

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasOfficialKitResponse(participant: ParticipantMetricInput) {
  const officialKit = participant.officialKit;
  return typeof officialKit === "object"
    && officialKit !== null
    && !Array.isArray(officialKit)
    && "interest" in officialKit
    && hasText((officialKit as { interest?: unknown }).interest);
}

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

export function calculateParticipantPortalMetrics(participants: ParticipantMetricInput[]) {
  const submittedRegistrations = participants.length;
  const linkedAccounts = participants.filter((participant) => (
    hasText(participant.authUid) || participant.registrationStatus === "linked"
  )).length;
  const participantsWithEmail = participants.filter((participant) => hasText(participant.email)).length;
  const participantsWithoutEmail = Math.max(0, submittedRegistrations - participantsWithEmail);
  const committeeVolunteers = participants.filter((participant) => participant.wantsToHelpCommittee === true).length;
  const kitResponses = participants.filter(hasOfficialKitResponse).length;

  return {
    submittedRegistrations,
    linkedAccounts,
    pendingAccountLink: Math.max(0, submittedRegistrations - linkedAccounts),
    participantsWithEmail,
    participantsWithoutEmail,
    committeeVolunteers,
    kitResponses,
  };
}
