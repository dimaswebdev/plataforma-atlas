import type { LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="atlas-admin-page-header">
      <div className="min-w-0">
        <div className="atlas-admin-breadcrumb">
          <span>Painel</span>
          <span>/</span>
          <span>{title}</span>
        </div>
        <div className="atlas-admin-title-row mt-2">
          {Icon && <Icon className="atlas-admin-title-icon" aria-hidden="true" />}
          <h1 className="atlas-admin-title min-w-0 break-words text-white">{title}</h1>
        </div>
        {description && <p className="atlas-admin-description">{description}</p>}
      </div>

      {actions && <div className="atlas-admin-actions">{actions}</div>}
    </header>
  );
}
