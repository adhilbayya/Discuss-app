import DiscussHome from "./components/DiscussHome";
import { getDiscussions } from "../actions/discussion.actions";
import { Label } from "@/components/ui/label";

export default async function DiscussPage() {
  const discussions = await getDiscussions();
  return (
    <div>
      <Label className="mb-3 text-3xl">Discuss</Label>
      <DiscussHome discussions={discussions} />
    </div>
  );
}
