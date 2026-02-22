'use client';

import { useStore } from '@/lib/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Server } from 'lucide-react';
import { useState, useEffect } from 'react';
import { TransportType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ServerConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ServerConfigPanel({ isOpen, onClose }: ServerConfigPanelProps) {
  const { serverConfig, updateServerConfig } = useStore();

  const [name, setName] = useState(serverConfig.name);
  const [version, setVersion] = useState(serverConfig.version);
  const [transport, setTransport] = useState<TransportType>(serverConfig.transport);
  const [httpPort, setHttpPort] = useState(serverConfig.httpPort);

  useEffect(() => {
    setName(serverConfig.name);
    setVersion(serverConfig.version);
    setTransport(serverConfig.transport);
    setHttpPort(serverConfig.httpPort);
  }, [serverConfig]);

  const handleSave = () => {
    updateServerConfig({
      name,
      version,
      transport,
      httpPort,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md z-[101]"
          >
            <div className="surface-overlay shadow-2xl overflow-hidden mx-4">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                    <Server className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)]">Server Settings</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onClose}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-6">
                {/* Server Name */}
                <div className="space-y-2">
                  <Label htmlFor="server-name" className="text-[var(--text-secondary)]">Server Name</Label>
                  <Input
                    id="server-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="my-mcp-server"
                    className="bg-[var(--bg-elevated)] border-[var(--border-default)] focus:border-[var(--accent)]"
                  />
                </div>

                {/* Version */}
                <div className="space-y-2">
                  <Label htmlFor="server-version" className="text-[var(--text-secondary)]">Version</Label>
                  <Input
                    id="server-version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="bg-[var(--bg-elevated)] border-[var(--border-default)] focus:border-[var(--accent)]"
                  />
                </div>

                {/* Transport */}
                <div className="space-y-2">
                  <Label htmlFor="transport" className="text-[var(--text-secondary)]">Transport</Label>
                  <Select
                    value={transport}
                    onValueChange={(value: TransportType) => setTransport(value)}
                  >
                    <SelectTrigger className="bg-[var(--bg-elevated)] border-[var(--border-default)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="surface-overlay">
                      <SelectItem value="stdio">stdio (Standard I/O)</SelectItem>
                      <SelectItem value="http">HTTP (Streamable HTTP)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {transport === 'stdio'
                      ? 'Communicates via stdin/stdout. Best for local CLI tools.'
                      : 'Exposes the server over HTTP. Best for remote or web-based clients.'}
                  </p>
                </div>

                {/* HTTP Port - only shown when HTTP transport selected */}
                {transport === 'http' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="http-port" className="text-[var(--text-secondary)]">HTTP Port</Label>
                    <Input
                      id="http-port"
                      type="number"
                      value={httpPort}
                      onChange={(e) => setHttpPort(parseInt(e.target.value) || 3000)}
                      placeholder="3000"
                      min={1}
                      max={65535}
                      className="bg-[var(--bg-elevated)] border-[var(--border-default)] focus:border-[var(--accent)]"
                    />
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-[var(--border-default)] flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="hover:shadow-[var(--shadow-glow)] transition-shadow">
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
