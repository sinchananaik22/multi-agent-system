"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProcessInput } from "@/components/process-input"
import { SystemOverview } from "@/components/system-overview"
import { AgentLogs } from "@/components/agent-logs"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Multi-Agent AI System</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SystemOverview />
      </div>

      <Tabs defaultValue="process" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="process">Process Input</TabsTrigger>
          <TabsTrigger value="memory">Shared Memory</TabsTrigger>
          <TabsTrigger value="logs">Agent Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="process">
          <Card>
            <CardHeader>
              <CardTitle>Process Input</CardTitle>
              <CardDescription>
                Submit a document (PDF, JSON, or Email) to be processed by the multi-agent system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProcessInput />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle>Shared Memory</CardTitle>
              <CardDescription>View the current state of the shared memory across agents.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto border rounded-md p-4">
                <pre id="memory-content" className="text-sm"></pre>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => {
                  document.getElementById("memory-content")!.innerHTML = "Refreshing..."
                  fetch("/api/memory")
                    .then((res) => res.json())
                    .then((data) => {
                      document.getElementById("memory-content")!.innerHTML = JSON.stringify(data, null, 2)
                    })
                }}
              >
                Refresh Memory
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Agent Logs</CardTitle>
              <CardDescription>View the activity logs from all agents in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <AgentLogs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
