"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { EventHero } from "@/components/public/EventHero";
import { Countdown } from "@/components/public/Countdown";
import { Event } from "@/types/event";
import { UserRoundCheck } from "lucide-react";
import { DEFAULT_EVENT_ID } from "@/lib/constants";
import { db } from "@/lib/firebase";

type EventDataResponse = {
  event: (Partial<Event> & { date?: string | null; location?: string | null }) | null;
  confirmedCount: number | null;
  status?: string;
  error?: string;
};

const PUBLIC_STATS_DOC_ID = "main";

const fallbackEvent: Event = {
  id: "reencontro-30-anos-atlas-2027",
  title: "Reencontro 30 Anos - Turma ATLAS",
  subtitle: "Força Aérea Brasileira | 1997-2027",
  city: "Campo Grande/MS",
  eventMonth: "Março",
  eventYear: 2027,
  mainDate: "2027-03-20T10:00:00",
  status: "planning",
  budgetGoal: 110000,
  heroDescription:
    "Três décadas de histórias, missões, amizades e memórias. O Portal ATLAS reúne as informações oficiais do reencontro de 30 anos da turma, com programação, prestação de contas, souvenirs, orientações para quem vem de fora e comunicados da comissão organizadora.",
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

function isEventStatus(value: unknown): value is Event["status"] {
  return value === "planning" || value === "open" || value === "closed" || value === "completed";
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readPublicConfirmedCount(rawStats: unknown) {
  if (!rawStats || typeof rawStats !== "object" || Array.isArray(rawStats)) {
    return null;
  }

  const statsRecord = rawStats as Record<string, unknown>;
  const directCount = readNumber(statsRecord.confirmedCount);
  if (directCount !== null) return directCount;

  const legacyStats = statsRecord.publicStats;
  if (!legacyStats || typeof legacyStats !== "object" || Array.isArray(legacyStats)) {
    return null;
  }

  return readNumber((legacyStats as Record<string, unknown>).confirmedCount);
}

function normalizeEvent(rawEvent: EventDataResponse["event"]): Event {
  if (!rawEvent) return fallbackEvent;

  return {
    ...fallbackEvent,
    ...rawEvent,
    title: readString(rawEvent.title) || fallbackEvent.title,
    subtitle: readString(rawEvent.subtitle) || fallbackEvent.subtitle,
    city: readString(rawEvent.city) || readString(rawEvent.location) || fallbackEvent.city,
    eventMonth: readString(rawEvent.eventMonth) || fallbackEvent.eventMonth,
    eventYear: typeof rawEvent.eventYear === "number" ? rawEvent.eventYear : fallbackEvent.eventYear,
    mainDate: readString(rawEvent.mainDate) || readString(rawEvent.date) || fallbackEvent.mainDate,
    status: isEventStatus(rawEvent.status) ? rawEvent.status : fallbackEvent.status,
    budgetGoal: typeof rawEvent.budgetGoal === "number" ? rawEvent.budgetGoal : fallbackEvent.budgetGoal,
    heroDescription: readString(rawEvent.heroDescription) || fallbackEvent.heroDescription,
    createdAt: rawEvent.createdAt || fallbackEvent.createdAt,
    updatedAt: rawEvent.updatedAt || fallbackEvent.updatedAt,
  };
}

async function readJsonResponse<T>(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function Home() {
  const [event, setEvent] = useState<Event>(fallbackEvent);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData(markAsLoaded = true) {
      try {
        const res = await fetch("/api/event-data", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const data = await readJsonResponse<EventDataResponse>(res);

        if (!res.ok || !data) {
          throw new Error(`Event data unavailable (${res.status})`);
        }

        if (!isMounted) return;
        setEvent(normalizeEvent(data.event));
        setConfirmedCount(typeof data.confirmedCount === "number" ? data.confirmedCount : null);
      } catch (err) {
        if (!isMounted) return;
        console.warn("Event data fallback enabled:", err);
        if (markAsLoaded) {
          setEvent(fallbackEvent);
          setConfirmedCount(null);
        }
      } finally {
        if (isMounted && markAsLoaded) {
          setLoading(false);
        }
      }
    }

    const unsubscribe = onSnapshot(
      doc(db, "events", DEFAULT_EVENT_ID, "publicStats", PUBLIC_STATS_DOC_ID),
      (snapshot) => {
        if (!isMounted) return;

        if (!snapshot.exists()) {
          console.warn(`Public confirmed counter missing at events/${DEFAULT_EVENT_ID}/publicStats/${PUBLIC_STATS_DOC_ID}`);
          void loadData(false);
          return;
        }

        const realtimeStats = { id: snapshot.id, ...snapshot.data() };
        const realtimeCount = readPublicConfirmedCount(realtimeStats);

        if (realtimeCount !== null) {
          setConfirmedCount(realtimeCount);
        } else {
          console.warn(`Public confirmed counter has no numeric confirmedCount at events/${DEFAULT_EVENT_ID}/publicStats/${PUBLIC_STATS_DOC_ID}`);
        }

        setLoading(false);
      },
      (error) => {
        console.warn(`Public confirmed counter listener unavailable at events/${DEFAULT_EVENT_ID}/publicStats/${PUBLIC_STATS_DOC_ID}:`, error);
      }
    );

    void loadData();
    const refreshInterval = window.setInterval(() => {
      void loadData(false);
    }, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-atlas-navy-base">
        <div className="atlas-loading-label animate-pulse">Carregando portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e1c]">
      <EventHero event={event}>
        <div
          className="group w-full min-w-0 cursor-default rounded-lg border border-atlas-gold-main/40 bg-transparent px-5 py-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-atlas-gold-main hover:bg-white/5 hover:shadow-2xl hover:shadow-atlas-gold-main/20 sm:px-8"
        >
          <p className="atlas-kicker mb-3 flex items-center gap-2 text-atlas-gold-main">
            <UserRoundCheck className="h-4 w-4" />
            Confirmados
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <span className="atlas-feature-value text-white" aria-live="polite">{confirmedCount ?? "--"}</span>
            <span className="mb-1 text-sm text-atlas-text-muted">
              {confirmedCount === null ? "contagem indisponível" : "militares"}
            </span>
          </div>
        </div>

        {event.mainDate && <Countdown targetDateStr={event.mainDate} compact />}
      </EventHero>
    </div>
  );
}
