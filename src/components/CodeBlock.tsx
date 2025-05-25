import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

export function CodeBlock({ code }: { code: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard!");
  };

  return (
    <code className="bg-neutral-700 text-white py-1 px-2 rounded-sm flex items-center justify-between gap-3 w-full">
      <pre className="text-orange-400">{code}</pre>

      <button onClick={handleCopy} className="p-2">
        <CopyIcon className="size-3" />
      </button>
    </code>
  );
}
