import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import yml from "yaml";
import { z } from "zod";

// Step can be either a "run" or a "uses" step, both with optional name
const stepSchema = z
  .object({
    name: z.string().optional(),
    run: z.string().optional(),
    uses: z.string().optional(),
  })
  .refine((step) => step.run || step.uses, {
    message: "Each step must have either 'run' or 'uses'",
  });

// Job schema with optional `needs`
const jobSchema = z.object({
  "runs-on": z.string(),
  needs: z.union([z.string(), z.array(z.string())]).optional(),
  steps: z.array(stepSchema),
});

// Jobs: map of job names to job definitions
const jobsSchema = z.record(jobSchema);

// Triggers like `push`, `pull_request`, etc.
const onSchema = z.union([
  z.string(),
  z.record(z.any()), // for cases like: on: { push: { branches: [...] } }
]);

// Full GitHub workflow schema
export const githubWorkflowSchema = z.object({
  name: z.string().optional(),
  on: onSchema,
  jobs: jobsSchema,
});

type GithubWorkflow = z.infer<typeof githubWorkflowSchema>;

export default function App() {
  const [code, setCode] = useState<string | undefined>();
  const [workflow, setWorkflow] = useState<GithubWorkflow | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Runs with 2s debounce on code change
  // This is to prevent the parsing from running on every keystroke
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      if (!code) {
        setWorkflow(null);
      } else {
        // Parse the YAML code
        try {
          const parsedYaml = yml.parse(code);
          const workflowData = githubWorkflowSchema.parse(parsedYaml);

          setWorkflow(workflowData);
        } catch (e) {
          alert("Invalid YAML or schema: " + e);
          setWorkflow(null);
        }
      }

      clearTimeout(timeoutRef.current!);
      timeoutRef.current = null;
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [code]);

  return (
    <main className="flex">
      <Editor
        height="100vh"
        width="30%"
        defaultLanguage="yaml"
        value={code}
        onChange={setCode}
        theme="vs-dark"
      />

      <section className="p-4">
        <pre>{JSON.stringify(workflow, null, 2)}</pre>
      </section>
    </main>
  );
}
