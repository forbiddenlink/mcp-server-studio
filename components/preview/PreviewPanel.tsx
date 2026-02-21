'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StructureTab } from './StructureTab';
import { TestTab } from './TestTab';
import { CodeTab } from './CodeTab';

export function PreviewPanel() {
  const [activeTab, setActiveTab] = useState('structure');

  return (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4 pt-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>

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
