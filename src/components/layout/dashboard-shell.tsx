import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardShellProps = {
  heading: string;
  description: string;
  statusLabel?: string;
  children?: React.ReactNode;
};

export function DashboardShell({
  heading,
  description,
  statusLabel,
  children,
}: DashboardShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {statusLabel ? (
          <p className="text-sm">
            審査状態: <span className="font-medium">{statusLabel}</span>
          </p>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">次のステップ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {children}
        </CardContent>
      </Card>
    </main>
  );
}
