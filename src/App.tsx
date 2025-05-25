import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import yml from "yaml";
import { z } from "zod";
import Graph from "./components/Graph";
import { Background, ReactFlowProvider } from "@xyflow/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { Toaster } from "sonner";

const exampleCode = `name: Node.js CI with Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Build project
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: |
            dist
            build
            out

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist

      - name: Simulate deployment
        run: echo "🚀 Deploying the contents of ./dist or ./build..."`;

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
export const jobSchema = z.object({
  name: z.string().optional(),
  "runs-on": z.string().optional(),
  needs: z.union([z.string(), z.array(z.string())]).optional(),
  steps: z.array(stepSchema).optional().default([]),
  uses: z.string().optional(),
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

export type Job = z.infer<typeof jobSchema>;
export type GithubWorkflow = z.infer<typeof githubWorkflowSchema>;

export default function App() {
  const [code, setCode] = useState<string | undefined>(
    localStorage.getItem("workflowCode") || exampleCode
  );
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<GithubWorkflow | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Runs with debounce on code change
  // This is to prevent the parsing from running on every keystroke
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      if (!code) {
        setWorkflow(null);
        setError(null);
      } else {
        // Parse the YAML code
        try {
          const parsedYaml = yml.parse(code);
          const workflowData = githubWorkflowSchema.parse(parsedYaml);
          setWorkflow(workflowData);
          setError(null);
        } catch (e) {
          setError((e as Error).message);
          setWorkflow(null);
        }

        localStorage.setItem("workflowCode", code);
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
    <main className="flex min-screen h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel maxSize={40} minSize={25} defaultSize={35}>
          <Editor
            defaultLanguage="yaml"
            value={code}
            onChange={setCode}
            theme="vs-dark"
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel maxSize={75} minSize={60} defaultSize={65}>
          <section className="p-4 h-full w-full">
            <ReactFlowProvider>
              {workflow && <Graph workflow={workflow} />}
              <Background />
            </ReactFlowProvider>

            {error && (
              <div className="text-red-500">
                <p>{error}</p>
              </div>
            )}
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Toaster />
    </main>
  );
}
