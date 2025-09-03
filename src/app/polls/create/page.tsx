import { CreatePollForm } from "@/features/polls/components/create-poll-form";
import { Protected } from "@/features/auth/context/auth-context";

export default function CreatePollPage() {
    return (
        <Protected>
            <div className="py-6">
                <CreatePollForm />
            </div>
        </Protected>
    );
}
