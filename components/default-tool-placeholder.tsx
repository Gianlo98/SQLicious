import { ToolInvocation } from "ai";
import { PocketKnife, Loader2, StopCircle, CheckCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea, ScrollBar } from "./ui/scroll-area";



export type DefaultToolPlaceholderProps = {
  tool: ToolInvocation
  isLatestMessage?: boolean
  status?: string
}

export function DefaultToolPlaceholder({ tool, isLatestMessage, status }: DefaultToolPlaceholderProps) {
  const { state, toolName } = tool;

  console.log("DefaultToolPlaceholder", tool);
  return <>
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>

          <div className={"flex-1 flex items-center justify-center cursor-pointer" + (state === "result" ? "cursor-pointer" : "")}>
            <div className="flex items-center justify-center w-8 h-8 bg-zinc-50 dark:bg-zinc-800 rounded-full cursor-pointer">
              <PocketKnife className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium flex items-baseline gap-2">
                {state === "call" ? "Calling" : "Called"}{" "}
                <span className="font-mono bg-zinc-100 px-2 py-1 rounded-md">
                  {toolName}
                </span>
              </div>
            </div>
            <div className="w-5 h-5 flex items-center justify-center">
              {state === "call" ? (
                isLatestMessage && status !== "ready" ? (
                  <Loader2 className="animate-spin h-4 w-4 text-zinc-500" />
                ) : (
                  <StopCircle className="h-4 w-4 text-red-500" />
                )
              ) : state === "result" ? (
                <CheckCircle size={14} className="text-green-600" />
              ) : null}
            </div>
          </div>

        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className="h-[200px] w-full  p-4">
            <pre>
              <code>
                {JSON.stringify(tool, null, 2)
                .replaceAll(/\\t/g, "\t")
                .replaceAll(/\\r/g, "\r")
                .replaceAll(/\\n/g, "\n")
                .replaceAll(/\\'/g, "'")
                .replaceAll(/\\"/g, '"')
                .replaceAll(/\\\\/g, "\\")
                }
              </code>
            </pre>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

  </>
}
