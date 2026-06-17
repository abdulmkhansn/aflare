import { startConversation } from "@/app/(app)/actions/messages";
import { secondaryButtonClassName } from "@/lib/ui/classes";

type MessageButtonProps = {
  otherUserId: string;
};

export function MessageButton({ otherUserId }: MessageButtonProps) {
  return (
    <form action={startConversation}>
      <input type="hidden" name="user_id" value={otherUserId} />
      <button type="submit" className={secondaryButtonClassName}>
        Message
      </button>
    </form>
  );
}
