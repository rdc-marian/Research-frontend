import React from "react";
import { X, ExternalLink, Download, FileText, Image as ImageIcon } from "lucide-react";

interface IncentiveProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  proofUrl: string | null;
  title?: string;
  doiLink?: string;
}

export const IncentiveProofModal: React.FC<IncentiveProofModalProps> = ({
  isOpen,
  onClose,
  proofUrl,
  title = "Supporting Proof & Attached Document",
  doiLink,
}) => {
  if (!isOpen || (!proofUrl && !doiLink)) return null;

  const isPdf = proofUrl?.startsWith("data:application/pdf") || proofUrl?.toLowerCase().endsWith(".pdf");
  const isUrl = proofUrl?.startsWith("http://") || proofUrl?.startsWith("https://");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#9B0302]/10 text-[#9B0302] flex items-center justify-center font-bold">
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-display">{title}</h3>
              <p className="text-xs text-slate-500">Official attachment for verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="my-4 flex-1 overflow-y-auto min-h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-4">
          {proofUrl ? (
            isPdf ? (
              <iframe src={proofUrl} className="w-full h-[60vh] rounded-lg border-0" title="PDF Document Viewer" />
            ) : isUrl ? (
              <div className="text-center p-8">
                <FileText className="w-12 h-12 text-[#9B0302] mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800 mb-2">Attached Document Link</p>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#9B0302] text-white rounded-xl text-xs font-semibold hover:bg-[#800201] transition"
                >
                  <ExternalLink className="w-4 h-4" /> Open External Document
                </a>
              </div>
            ) : (
              <img
                src={proofUrl}
                alt="Incentive Proof Document"
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-xs"
              />
            )
          ) : (
            <div className="text-center p-8">
              <p className="text-sm text-slate-500">No image attachment uploaded.</p>
            </div>
          )}

          {doiLink && (
            <div className="w-full mt-4 p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-600 truncate">DOI / Publication Link: {doiLink}</span>
              <a
                href={doiLink.startsWith("http") ? doiLink : `https://${doiLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B0302] hover:underline shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Visit Publication
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {proofUrl ? "Document attached by applicant" : "No file attached"}
          </div>
          <div className="flex items-center gap-2">
            {proofUrl && (
              <a
                href={proofUrl}
                download="Incentive_Proof_Document"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <Download className="w-3.5 h-3.5" /> Download / Open
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#9B0302] rounded-xl hover:bg-[#800201] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
