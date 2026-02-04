import { accounts, mails } from "@/constants/mail-data";
import { Mail } from "@/features/mail/components/mail";
import { AppBreadcrumb } from "@/components/breadcrumb";

export default function MailPage() {
  return (
    <>
      <div className="px-4 lg:px-6 py-4 flex flex-col gap-2">
        <AppBreadcrumb
          items={[
            {
              label: "Dashboard",
              href: "/dashboard",
            },
            {
              label: "Mail",
              href: "/mail",
            },
          ]}
        />
      </div>

      <div className="@container/main px-4 lg:px-6 space-y-6">
        <Mail
          accounts={accounts}
          mails={mails}
          navCollapsedSize={4}
          defaultLayout={[20, 32, 48]}
          defaultCollapsed={false}
        />
      </div>
    </>
  );
}
