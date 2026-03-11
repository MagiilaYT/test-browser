import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Settings, Globe, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import './App.css';

// Working public proxy services
const PROXY_SERVICES = [
  { name: 'Ultraviolet (segso)', url: 'https://ultraviolet.segso.net/' },
  { name: 'Holy Unblocker', url: 'https://holyunblocker.org/' },
  { name: 'Incognito', url: 'https://incog.works/' },
];

// Preset cloaking options
const cloakingPresets = [
  { name: 'Default', title: 'Proxy Browser', icon: '/favicon.ico' },
  { name: 'Google', title: 'Google', icon: 'https://www.google.com/favicon.ico' },
  { name: 'Classroom', title: 'Google Classroom', icon: 'https://classroom.google.com/favicon.ico' },
  { name: 'Docs', title: 'Google Docs', icon: 'https://docs.google.com/favicon.ico' },
  { name: 'Drive', title: 'Google Drive', icon: 'https://drive.google.com/favicon.ico' },
  { name: 'YouTube', title: 'YouTube', icon: 'https://www.youtube.com/favicon.ico' },
  { name: 'Gmail', title: 'Gmail', icon: 'https://mail.google.com/favicon.ico' },
  { name: 'Wikipedia', title: 'Wikipedia', icon: 'https://www.wikipedia.org/favicon.ico' },
  { name: 'Canvas', title: 'Canvas', icon: 'https://canvas.instructure.com/favicon.ico' },
  { name: 'Khan Academy', title: 'Khan Academy', icon: 'https://www.khanacademy.org/favicon.ico' },
];

function App() {
  const [title, setTitle] = useState('Proxy Browser');
  const [customTitle, setCustomTitle] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico');
  const [showControls, setShowControls] = useState(true);
  const [panicKey, setPanicKey] = useState('`');
  const [proxyUrl, setProxyUrl] = useState(PROXY_SERVICES[0].url);
  const [targetUrl, setTargetUrl] = useState('https://duckduckgo.com');
  const [iframeSrc, setIframeSrc] = useState('');
  const [useDirectProxy] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Apply title and favicon changes
  useEffect(() => {
    document.title = title;
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
  }, [title, faviconUrl]);

  // Panic key handler - quickly switch to a "safe" page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === panicKey) {
        // Switch to Google Classroom appearance
        setTitle('Google Classroom');
        setFaviconUrl('https://classroom.google.com/favicon.ico');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panicKey]);

  // Load proxy when URL changes
  useEffect(() => {
    loadProxy();
  }, []);

  const loadProxy = () => {
    if (useDirectProxy) {
      // Use corsproxy.io for direct proxying
      setIframeSrc(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
    } else {
      // Use Ultraviolet proxy
      const encodedUrl = encodeURIComponent(targetUrl);
      setIframeSrc(`${proxyUrl}?q=${encodedUrl}`);
    }
  };

  const applyPreset = (preset: typeof cloakingPresets[0]) => {
    setTitle(preset.title);
    setFaviconUrl(preset.icon);
  };

  const applyCustomTitle = () => {
    if (customTitle.trim()) {
      setTitle(customTitle.trim());
    }
  };

  const handleProxyChange = (service: typeof PROXY_SERVICES[0]) => {
    setProxyUrl(service.url);
    // Reload with new proxy
    setTimeout(() => {
      const encodedUrl = encodeURIComponent(targetUrl);
      setIframeSrc(`${service.url}?q=${encodedUrl}`);
    }, 100);
  };

  const openInNewTab = () => {
    window.open(iframeSrc, '_blank');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Control Bar */}
      {showControls && (
        <div className="flex flex-col gap-2 px-4 py-2 bg-card border-b border-border">
          {/* Top Row */}
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Proxy Browser</span>
            
            <div className="flex-1" />
            
            {/* Proxy Service Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Proxy: {PROXY_SERVICES.find(s => s.url === proxyUrl)?.name || 'Custom'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Proxy Service</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PROXY_SERVICES.map((service) => (
                  <DropdownMenuItem key={service.name} onClick={() => handleProxyChange(service)}>
                    {service.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tab Cloaking Controls */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Tab Cloak
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Presets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {cloakingPresets.map((preset) => (
                  <DropdownMenuItem key={preset.name} onClick={() => applyPreset(preset)}>
                    <img 
                      src={preset.icon} 
                      alt="" 
                      className="w-4 h-4 mr-2"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {preset.name}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Custom Title</DropdownMenuLabel>
                <div className="p-2 flex gap-2">
                  <Input
                    placeholder="Enter custom title..."
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="h-8"
                    onKeyDown={(e) => e.key === 'Enter' && applyCustomTitle()}
                  />
                  <Button size="sm" onClick={applyCustomTitle}>Set</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Panic Key Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Panic: {panicKey}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Set Panic Key</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPanicKey('`')}>Backtick (`)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPanicKey('Escape')}>Escape</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPanicKey('F1')}>F1</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPanicKey('~')}>Tilde (~)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Toggle Controls */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowControls(false)}
              className="gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Hide
            </Button>
          </div>

          {/* Bottom Row - URL Input */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter URL to browse..."
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="flex-1 h-8"
              onKeyDown={(e) => e.key === 'Enter' && loadProxy()}
            />
            <Button size="sm" onClick={loadProxy} className="gap-2">
              <Search className="w-4 h-4" />
              Go
            </Button>
            <Button size="sm" variant="outline" onClick={openInNewTab}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Show Controls Button (when hidden) */}
      {!showControls && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(true)}
          className="absolute top-2 right-2 z-50 opacity-50 hover:opacity-100"
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}

      {/* Iframe Container */}
      <div className="flex-1 relative bg-black">
        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
            allow="fullscreen; clipboard-write; encrypted-media; picture-in-picture; autoplay"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Enter a URL and click Go to start browsing</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-1 bg-muted text-xs text-muted-foreground flex items-center justify-between">
        <span>Proxy: {proxyUrl}</span>
        <span>Target: {targetUrl}</span>
        <span>Press {panicKey} for panic mode</span>
      </div>
    </div>
  );
}

export default App;
