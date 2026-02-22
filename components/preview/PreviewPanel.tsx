'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StructureTab } from './StructureTab';
import { TestTab } from './TestTab';
import { CodeTab } from './CodeTab';

export function PreviewPanel() {
  const [activeTab, setActiveTab] = useState('structure');

  return (
    <div className="h-full flex flex-col bg-[var(--bg-surface)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tab Header */}
        <div className="border-b border-[var(--border-default)] px-4 pt-4">
          <TabsList className="w-full grid grid-cols-3 bg-[var(--bg-base)] p-1 rounded-lg">
            <TabsTrigger
              value="structure"
              className="data-[state=active]:bg-[var(--bg-elevated)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-tertiary)] rounded-md transition-all"
            >
              Structure
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="data-[state=active]:bg-[var(--bg-elevated)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-tertiary)] rounded-md transition-all"
            >
              Test
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="data-[state=active]:bg-[var(--bg-elevated)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-tertiary)] rounded-md transition-all"
            >
              Code
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="structure" className="h-full m-0">
            <StructureTab />
          </TabsContent>
          <TabsContent value="test" className="h-full m-0">
            <TestTab />
          </TabsContent>
          <TabsContent value="code" className="h-full m-0">
            <CodeTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
