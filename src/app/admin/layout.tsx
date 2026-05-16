import { AdminLayout } from "@/components/admin/AdminLayout";
import { tailAdminFont } from "@/design-system/tailadmin/fonts";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={tailAdminFont.variable}>
      <AdminLayout>{children}</AdminLayout>
    </div>
  );
}
