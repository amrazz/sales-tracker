'use client';

import { useState } from 'react';
import { Printer, Download, Image as ImageIcon, Share2, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

interface PrintActionsProps {
    targetId: string;
    fileName?: string;
}

export default function PrintActions({ targetId, fileName = 'Document' }: PrintActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [actionText, setActionText] = useState('');

    const getElement = () => {
        const element = document.getElementById(targetId);
        if (!element) throw new Error('Target element not found');
        return element;
    };

    const handlePrint = () => {
        setIsOpen(false);
        window.print();
    };

    const handleSavePDF = async () => {
        setIsOpen(false);
        setStatus('processing');
        setActionText('Generating PDF...');
        try {
            const element = getElement();
            const imgData = await htmlToImage.toPng(element, {
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });

            // A4 page in mm
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate image dimensions to fit page width
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pageWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${fileName}.pdf`);
            setStatus('success');
            setActionText('Saved!');
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF');
        } finally {
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleSavePNG = async () => {
        setIsOpen(false);
        setStatus('processing');
        setActionText('Saving Image...');
        try {
            const element = getElement();
            const dataUrl = await htmlToImage.toPng(element, {
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });
            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = dataUrl;
            link.click();
            setStatus('success');
            setActionText('Saved!');
        } catch (error) {
            console.error(error);
            alert('Failed to save Image');
        } finally {
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleShare = async () => {
        setIsOpen(false);
        setStatus('processing');
        setActionText('Preparing Share...');
        try {
            const element = getElement();
            const blob = await htmlToImage.toBlob(element, {
                pixelRatio: 2,
                backgroundColor: '#ffffff'
            });

            if (!blob) throw new Error('Failed to create blob');

            const file = new File([blob], `${fileName}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: fileName,
                    text: 'Sharing document from Sales Tracker',
                    files: [file]
                });
                setStatus('success');
                setActionText('Shared!');
            } else {
                // Fallback to manual download if sharing isn't supported
                alert("Your browser doesn't support direct file sharing. Saving image instead.");
                const link = document.createElement('a');
                link.download = `${fileName}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                setStatus('success');
                setActionText('Saved!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to share document');
        } finally {
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    if (status !== 'idle') {
        return (
            <div className="flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-2 rounded-xl h-10 shadow-md">
                {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                <span className="text-sm">{actionText}</span>
            </div>
        );
    }

    return (
        <div className="relative print:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-slate-900 text-white font-bold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md h-10"
            >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Export</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col p-2 gap-1">
                            <button onClick={handlePrint} className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-left transition-colors text-slate-700 font-bold text-sm">
                                <Printer className="w-4 h-4 text-slate-400" />
                                Standard Print
                            </button>
                            <button onClick={handleSavePDF} className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-left transition-colors text-slate-700 font-bold text-sm">
                                <Download className="w-4 h-4 text-slate-400" />
                                Save as PDF
                            </button>
                            <button onClick={handleSavePNG} className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-left transition-colors text-slate-700 font-bold text-sm">
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                Save as Image (PNG)
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2" />
                            <button onClick={handleShare} className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-left transition-colors text-blue-600 font-bold text-sm">
                                <Share2 className="w-4 h-4" />
                                Share File...
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
