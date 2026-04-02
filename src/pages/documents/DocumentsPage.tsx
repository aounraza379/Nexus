import React, { useState, useRef } from 'react';
import {
  FileText, Upload, Download, Trash2, Share2,
  PenTool, Eye, CheckCircle, Clock, FileEdit, X
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type DocStatus = 'Draft' | 'In Review' | 'Signed';

interface Doc {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  status: DocStatus;
  signed?: boolean;
}

const STATUS_CONFIG: Record<DocStatus, { bg: string; color: string; icon: React.ReactNode }> = {
  'Draft':     { bg: '#f1f5f9', color: '#64748b',  icon: <FileEdit size={11} /> },
  'In Review': { bg: '#fef3c7', color: '#92400e',  icon: <Clock size={11} /> },
  'Signed':    { bg: '#dcfce7', color: '#166534',  icon: <CheckCircle size={11} /> },
};

const INITIAL_DOCS: Doc[] = [
  { id: 1, name: 'Pitch Deck 2024.pdf',         type: 'PDF',         size: '2.4 MB', lastModified: '2024-02-15', shared: true,  status: 'Signed' },
  { id: 2, name: 'Financial Projections.xlsx',  type: 'Spreadsheet', size: '1.8 MB', lastModified: '2024-02-10', shared: false, status: 'In Review' },
  { id: 3, name: 'Business Plan.docx',          type: 'Document',    size: '3.2 MB', lastModified: '2024-02-05', shared: true,  status: 'Draft' },
  { id: 4, name: 'Market Research.pdf',         type: 'PDF',         size: '5.1 MB', lastModified: '2024-01-28', shared: false, status: 'In Review' },
  { id: 5, name: 'Investment Agreement.pdf',    type: 'PDF',         size: '1.1 MB', lastModified: '2024-01-20', shared: true,  status: 'Draft' },
];

const SignaturePad: React.FC<{ onSign: (sig: string) => void; onClose: () => void }> = ({ onSign, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    drawing.current = true;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.strokeStyle = '#1e40af';
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const confirm = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    onSign(canvas.toDataURL());
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--nexus-text-primary)' }}>E-Signature</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nexus-text-muted)' }}><X size={20} /></button>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--nexus-text-secondary)', marginBottom: 12 }}>Draw your signature in the box below</p>
        <canvas
          ref={canvasRef} width={424} height={160}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          style={{ border: '2px dashed var(--nexus-border)', borderRadius: 10, cursor: 'crosshair', display: 'block', width: '100%', background: '#f8fafc', touchAction: 'none' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <button onClick={clear} style={{ fontSize: '0.82rem', color: 'var(--nexus-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--nexus-border)', background: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
            <button onClick={confirm} disabled={!hasDrawn} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: hasDrawn ? 'var(--nexus-primary)' : '#e2e8f0', color: hasDrawn ? 'white' : 'var(--nexus-text-muted)', fontWeight: 700, fontSize: '0.875rem', cursor: hasDrawn ? 'pointer' : 'not-allowed' }}>
              Apply Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PreviewModal: React.FC<{ doc: Doc; onClose: () => void; onSign: () => void }> = ({ doc, onClose, onSign }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 600, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--nexus-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={18} color="var(--nexus-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--nexus-text-primary)' }}>{doc.name}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nexus-text-muted)' }}><X size={20} /></button>
      </div>
      <div style={{ padding: 24, background: '#f8fafc', minHeight: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', border: '1px solid var(--nexus-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Business Nexus</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--nexus-text-muted)', margin: 0 }}>Document Preview</p>
            </div>
            <StatusBadge status={doc.status} />
          </div>
          {[80, 60, 90, 45, 70, 55].map((w, i) => (
            <div key={i} style={{ height: 10, borderRadius: 4, background: '#e2e8f0', width: `${w}%`, marginBottom: 8 }} />
          ))}
          {doc.status === 'Signed' && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--nexus-border)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--nexus-text-muted)', marginBottom: 4 }}>Signed by</p>
              <p style={{ fontFamily: 'cursive', fontSize: '1.4rem', color: '#1e40af', margin: 0 }}>Sarah Johnson</p>
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--nexus-border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--nexus-border)', background: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Close</button>
        {doc.status !== 'Signed' && (
          <button onClick={onSign} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--nexus-primary)', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <PenTool size={15} /> Sign Document
          </button>
        )}
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: DocStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 700 }}>
      {cfg.icon} {status}
    </span>
  );
};

export const DocumentsPage: React.FC = () => {
  const [docs, setDocs]               = useState<Doc[]>(INITIAL_DOCS);
  const [previewDoc, setPreviewDoc]   = useState<Doc | null>(null);
  const [signDoc, setSignDoc]         = useState<Doc | null>(null);
  const [filterStatus, setFilterStatus] = useState<DocStatus | 'All'>('All');
  const [toast, setToast]             = useState('');
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: Doc = {
      id: Date.now(), name: file.name,
      type: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.xlsx') ? 'Spreadsheet' : 'Document',
      size: `${(file.size / 1048576).toFixed(1)} MB`,
      lastModified: new Date().toISOString().split('T')[0],
      shared: false, status: 'Draft',
    };
    setDocs(prev => [newDoc, ...prev]);
    showToast(`"${file.name}" uploaded successfully`);
    e.target.value = '';
  };

  const handleDelete = (id: number) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    showToast('Document deleted');
  };

  const handleSign = (doc: Doc) => {
    setPreviewDoc(null);
    setSignDoc(doc);
  };

  const applySignature = (_sig: string) => {
    if (!signDoc) return;
    setDocs(prev => prev.map(d => d.id === signDoc.id ? { ...d, status: 'Signed' } : d));
    showToast(`"${signDoc.name}" signed successfully`);
    setSignDoc(null);
  };

  const cycleStatus = (doc: Doc) => {
    const order: DocStatus[] = ['Draft', 'In Review', 'Signed'];
    const next = order[(order.indexOf(doc.status) + 1) % order.length];
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: next } : d));
  };

  const filtered = docs.filter(d => filterStatus === 'All' || d.status === filterStatus);
  const counts = { All: docs.length, Draft: docs.filter(d => d.status === 'Draft').length, 'In Review': docs.filter(d => d.status === 'In Review').length, Signed: docs.filter(d => d.status === 'Signed').length };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: '#16a34a', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.875rem', boxShadow: 'var(--nexus-shadow-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Upload, preview, sign and manage your deal documents</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.xlsx" onChange={handleUpload} style={{ display: 'none' }} />
          <Button leftIcon={<Upload size={18} />} onClick={() => fileInputRef.current?.click()}>
            Upload Document
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['All', 'Draft', 'In Review', 'Signed'] as const).map(f => (
          <button key={f} onClick={() => setFilterStatus(f)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.82rem',
            background: filterStatus === f ? 'white' : 'transparent',
            color: filterStatus === f ? 'var(--nexus-text-primary)' : 'var(--nexus-text-secondary)',
            boxShadow: filterStatus === f ? 'var(--nexus-shadow)' : 'none',
            transition: 'all 0.15s',
          }}>
            {f} <span style={{ marginLeft: 4, fontSize: '0.72rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: filterStatus === f ? 'var(--nexus-primary-light)' : '#e2e8f0', color: filterStatus === f ? 'var(--nexus-primary)' : 'var(--nexus-text-muted)' }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-lg font-medium text-gray-900">Storage</h2></CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">12.5 GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">7.5 GB</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Status Summary</h3>
              {(['Draft', 'In Review', 'Signed'] as DocStatus[]).map(s => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <StatusBadge status={s} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--nexus-text-primary)' }}>{counts[s]}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Documents ({filtered.length})</h2>
            </CardHeader>
            <CardBody>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--nexus-text-muted)' }}>
                  No documents found
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(doc => (
                    <div key={doc.id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                          {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                          <StatusBadge status={doc.status} />
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Modified {doc.lastModified}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        {/* Preview */}
                        <button onClick={() => setPreviewDoc(doc)} title="Preview" style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nexus-text-secondary)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Eye size={17} />
                        </button>
                        {/* Sign */}
                        {doc.status !== 'Signed' && (
                          <button onClick={() => handleSign(doc)} title="Sign" style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nexus-primary)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--nexus-primary-light)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <PenTool size={17} />
                          </button>
                        )}
                        {/* Cycle status */}
                        <button onClick={() => cycleStatus(doc)} title="Change status" style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nexus-text-secondary)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Share2 size={17} />
                        </button>
                        {/* Download */}
                        <button title="Download" style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nexus-text-secondary)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Download size={17} />
                        </button>
                        {/* Delete */}
                        <button onClick={() => handleDelete(doc.id)} title="Delete" style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nexus-danger)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--nexus-danger-light)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} onSign={() => handleSign(previewDoc)} />}
      {signDoc    && <SignaturePad onSign={applySignature} onClose={() => setSignDoc(null)} />}
    </div>
  );
};