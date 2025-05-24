import { Handle, Position } from "@xyflow/react";
import type { Job } from "./App";
import { Card, CardContent } from "./components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Badge } from "./components/ui/badge";

export function JobNode({
  data: { name, job },
}: {
  data: { name: string; job: Job };
}) {
  return (
    <>
      <Handle type="target" position={Position.Left} />

      <Card className="py-2">
        <CardContent>
          <Accordion type="single" collapsible defaultValue="steps">
            <AccordionItem value="steps">
              <AccordionTrigger className="justify-start">
                <div className="flex items-center gap-3">
                  {job.name || name}{" "}
                  {job["runs-on"] && <Badge>{job["runs-on"]}</Badge>}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {job.steps.length > 0 && (
                  <Accordion type="multiple" className="ml-2">
                    {job.steps.map((step, index) => (
                      <AccordionItem key={index} value={`step-${index}`}>
                        <AccordionTrigger className="justify-start">
                          {step.name || step.run || step.uses}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {step.run ? "run" : "uses"}
                            </Badge>
                            <code className="text-sm">
                              {step.run || step.uses}
                            </code>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}

                {job.uses && (
                  <div className="ml-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      uses
                    </Badge>
                    <code className="text-sm"> {job.uses}</code>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Handle type="source" position={Position.Right} />
    </>
  );
}
