"use client";

import { useParams } from "next/navigation";
import { useSession } from "@/lib/client";
import { Button, Card, Page, Spinner } from "@/components/ui";
import { PracticeScreen } from "@/components/practice/PracticeScreen";

export default function PracticeRoundPage() {
  const { id } = useParams<{ id: string }>();
  const { session, act, replace } = useSession();
  if (!session) return <Spinner />;
  const pr = session.practice[session.me]?.find((x) => x.id === id);
  return (
    <Page className="pt-6 flex flex-col gap-4">
      {pr ? (
        <PracticeScreen session={session} pr={pr} act={act} onView={replace} />
      ) : (
        <Card>
          <p className="text-muted">No practice round with this id on your account.</p>
          <Button className="mt-3" href="/practice">
            Back to practice
          </Button>
        </Card>
      )}
    </Page>
  );
}
