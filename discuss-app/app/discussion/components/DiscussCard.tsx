import { DiscussionProp } from "./DiscussHome";
import DiscussionCardItem from "./DiscussionCardItem";

export default function DiscussCard({ discussions }: DiscussionProp) {
  return (
    <div className="flex flex-col justify-center m-10 w-3/4">
      {discussions.map((discussion) => (
        <DiscussionCardItem key={discussion._id} discussion={discussion} />
      ))}
    </div>
  );
}
