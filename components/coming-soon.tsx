import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function ComingSoon() {
  return (
    <div className="h-[calc(100vh-180px)]">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg bg-linear-to-br from-emerald-500/10 via-background to-green-500/10">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <Spinner className="size-12 text-emerald-500" />
            <h1 className="text-4xl font-bold leading-tight text-emerald-600">
              Coming Soon
            </h1>
            <p className="text-center text-muted-foreground">
              This page has not been created yet. <br />
              Stay tuned though!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
