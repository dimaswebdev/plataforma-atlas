import {
  TailAdminCard,
  TailAdminCardContent,
  TailAdminCardDescription,
  TailAdminCardFooter,
  TailAdminCardHeader,
  TailAdminCardTitle,
  TailAdminComponentCard,
} from "@/components/ui-tailadmin";
import type {
  TailAdminCardProps,
  TailAdminComponentCardProps,
} from "@/components/ui-tailadmin";

export type AppCardProps = TailAdminCardProps;
export type AppComponentCardProps = TailAdminComponentCardProps;

export const AppCard = TailAdminCard;
export const AppCardHeader = TailAdminCardHeader;
export const AppCardTitle = TailAdminCardTitle;
export const AppCardDescription = TailAdminCardDescription;
export const AppCardContent = TailAdminCardContent;
export const AppCardFooter = TailAdminCardFooter;
export const AppComponentCard = TailAdminComponentCard;

export default AppCard;
