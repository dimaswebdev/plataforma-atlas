import { Schedule } from "@/types/schedule";
import { formatDateBR } from "@/lib/utils";
import { CalendarDays, MapPin, Clock } from "lucide-react";

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  return (
    <div className="bg-atlas-navy-deep border border-atlas-navy-aero/30 rounded-lg p-6 shadow-sm hover:border-atlas-gold-main/50 transition-colors relative pl-12 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-atlas-gold-main"></div>
      
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center text-sm text-atlas-gold-main mb-2 font-semibold tracking-wider uppercase">
            <CalendarDays className="w-4 h-4 mr-2" />
            {formatDateBR(schedule.date)}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{schedule.title}</h3>
          {schedule.description && (
            <p className="text-atlas-text-muted text-sm mb-4">{schedule.description}</p>
          )}
        </div>
        
        <div className="flex flex-col gap-2 min-w-[200px] bg-atlas-navy-base p-4 rounded border border-atlas-navy-aero/20">
          {schedule.startTime && (
            <div className="flex items-center text-sm text-atlas-text-light">
              <Clock className="w-4 h-4 mr-2 text-atlas-navy-aero" />
              <span>{schedule.startTime} {schedule.endTime ? `às ${schedule.endTime}` : ''}</span>
            </div>
          )}
          {schedule.location && (
            <div className="flex items-start text-sm text-atlas-text-light">
              <MapPin className="w-4 h-4 mr-2 text-atlas-navy-aero shrink-0 mt-0.5" />
              <span>{schedule.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
