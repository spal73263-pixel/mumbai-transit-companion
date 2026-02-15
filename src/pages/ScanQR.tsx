import { QrCode, Camera } from "lucide-react";
import Header from "@/components/Header";

const ScanQR = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Scan QR Ticket</h1>
          <p className="text-muted-foreground mt-1">Validate your ticket before boarding</p>
        </div>

        <div className="rounded-lg border-2 border-dashed border-accent/30 bg-card p-12 flex flex-col items-center justify-center shadow-card">
          <div className="w-24 h-24 rounded-2xl gradient-accent flex items-center justify-center mb-6">
            <QrCode className="h-12 w-12 text-accent-foreground" />
          </div>
          <p className="font-display font-semibold text-lg text-card-foreground mb-2">Point camera at QR code</p>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Scan your digital ticket QR code to validate before boarding
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg gradient-accent px-6 py-3 font-semibold text-accent-foreground shadow-card hover:opacity-90 transition-opacity">
            <Camera className="h-5 w-5" />
            Open Scanner
          </button>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-semibold text-card-foreground mb-3">Recent Scans</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-medium text-card-foreground">SR-K8X9P2</p>
                <p className="text-xs">Churchgate → Andheri</p>
              </div>
              <span className="text-xs text-crowd-low font-medium">✓ Valid</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-medium text-card-foreground">SR-M3N7Q1</p>
                <p className="text-xs">Versova → Ghatkopar (Metro)</p>
              </div>
              <span className="text-xs text-crowd-low font-medium">✓ Valid</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-card-foreground">SR-A5B2C8</p>
                <p className="text-xs">CST → Thane</p>
              </div>
              <span className="text-xs text-crowd-high font-medium">✗ Expired</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScanQR;
