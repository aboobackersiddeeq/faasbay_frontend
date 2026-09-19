// ============================================================================
// FaasBay Commerce OS — Rich Product Description Editor
// Comprehensive WYSIWYG / Markdown / Preview Editor for Product Descriptions
// ============================================================================
import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Minus,
  Link as LinkIcon,
  Undo2,
  Redo2,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  Trash2,
  Copy,
  Check,
  FileText,
  PlusCircle,
  ChevronDown,
} from "lucide-react";

interface RichDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  productTitle?: string;
}

export const RichDescriptionEditor: React.FC<RichDescriptionEditorProps> = ({
  value,
  onChange,
  placeholder = "Provide an engaging product description covering highlights, materials, specs, or usage instructions...",
  productTitle,
}) => {
  const [activeTab, setActiveTab] = useState<"write" | "preview" | "split">("write");
  const [copied, setCopied] = useState(false);
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(2);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close template dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTemplatesDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to wrap or insert text around current selection
  const formatSelection = (prefix: string, suffix: string = "", defaultText: string = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value ? `${value}\n${prefix}${defaultText}${suffix}` : `${prefix}${defaultText}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end) || defaultText;

    const before = currentText.substring(0, start);
    const after = currentText.substring(end);

    const updated = `${before}${prefix}${selectedText}${suffix}${after}`;
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  // Helper to prefix each selected line (for lists, quotes, headings)
  const formatLines = (linePrefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value ? `${value}\n${linePrefix}Item` : `${linePrefix}Item`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const before = currentText.substring(0, start);
    const selected = currentText.substring(start, end);
    const after = currentText.substring(end);

    const lines = (selected || "Item").split("\n");
    const formatted = lines.map((line) => `${linePrefix}${line.replace(/^([#>\-•*]|\d+\.)\s*/, "")}`).join("\n");

    const updated = `${before}${formatted}${after}`;
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    }, 10);
  };

  const handleInsertTable = () => {
    let tableMd = "\n";
    // Header
    tableMd += "| " + Array.from({ length: tableCols }, (_, i) => i === 0 ? "Specification" : "Details").join(" | ") + " |\n";
    tableMd += "| " + Array.from({ length: tableCols }, () => "---").join(" | ") + " |\n";
    // Rows
    for (let r = 0; r < tableRows; r++) {
      tableMd += "| " + Array.from({ length: tableCols }, (_, c) => c === 0 ? `Spec ${r + 1}` : "Value").join(" | ") + " |\n";
    }
    tableMd += "\n";

    formatSelection(tableMd, "", "");
    setShowTableModal(false);
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith("http://") || linkUrl.startsWith("https://") ? linkUrl : `https://${linkUrl}`;
    const text = linkText.trim() || url;
    formatSelection(`[${text}](${url})`, "", "");
    setLinkText("");
    setLinkUrl("");
    setShowLinkModal(false);
  };

  const handleInsertTemplate = (templateType: string) => {
    setShowTemplatesDropdown(false);
    let template = "";

    switch (templateType) {
      case "highlights":
        template = `### Key Highlights & Features
• **Premium Craftsmanship**: Engineered with high-grade durable materials for longevity.
• **Ergonomic Design**: Perfectly styled for maximum comfort and everyday convenience.
• **100% Quality Assurance**: Thoroughly tested and verified to meet international standards.
• **Fast Express Shipping**: Dispatched swiftly with tracked, secure courier delivery.`;
        break;

      case "specs":
        template = `### Technical Specifications
| Specification | Details |
| --- | --- |
| **Material / Build** | Premium Grade Aluminum & Polycarbonate |
| **Dimensions & Weight** | Standard Form Factor • Lightweight 240g |
| **Compatibility** | Universal Multi-Device Support |
| **Warranty & Support** | 1-Year Brand Replacement Guarantee |
| **Origin** | Manufactured in India |`;
        break;

      case "care":
        template = `### Care & Maintenance Guide
• **Cleaning**: Wipe gently with a soft dry microfiber cloth. Avoid harsh chemicals.
• **Storage**: Store in a cool, dry place away from direct high humidity and sunlight.
• **Usage Precautions**: Follow included user manual guidelines for optimal durability.`;
        break;

      case "box":
        template = `### What's In The Box
• 1x ${productTitle || "FaasBay Premium Product"}
• 1x User Guide & Quick Setup Manual
• 1x Official Warranty Card & Authenticity Certificate
• 1x Protective Packaging / Travel Case`;
        break;

      case "size_guide":
        template = `### Size & Fit Instructions
• **True to Size**: Standard universal sizing fits comfortably.
• If you prefer a relaxed or looser fit, we recommend ordering one size up.
• Refer to our detailed size measurement chart in the media gallery.`;
        break;

      default:
        break;
    }

    if (!template) return;
    const current = value || "";
    const updated = current.trim() ? `${current}\n\n${template}` : template;
    onChange(updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Render markdown/plain text to rich preview elements
  const renderPreview = (text: string) => {
    if (!text.trim()) {
      return (
        <div className="py-12 text-center text-slate-400">
          <FileText size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-xs font-medium">No description content written yet.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Use the editor toolbar or template chips above to compose a rich product overview.
          </p>
        </div>
      );
    }

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableHeader: string[] = [];
    let tableRowsData: string[][] = [];

    const flushTable = (keyIndex: number) => {
      if (inTable && tableHeader.length > 0) {
        elements.push(
          <div key={`table-${keyIndex}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {tableHeader.map((h, i) => (
                    <th key={i} className="px-3 py-2 font-semibold text-slate-700">
                      {h.replace(/\*\*/g, "").trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tableRowsData.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-slate-600">
                        {cell.startsWith("**") && cell.endsWith("**") ? (
                          <strong className="font-semibold text-slate-900">{cell.replace(/\*\*/g, "").trim()}</strong>
                        ) : (
                          cell.trim()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeader = [];
        tableRowsData = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check table markdown
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const parts = trimmed.split("|").filter((p, i, arr) => i > 0 && i < arr.length - 1).map((s) => s.trim());
        if (parts.every((p) => /^:?-+:?$/.test(p))) {
          // Divider row
          return;
        }
        if (!inTable) {
          inTable = true;
          tableHeader = parts;
        } else {
          tableRowsData.push(parts);
        }
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      if (!trimmed) {
        elements.push(<div key={`empty-${idx}`} className="h-2" />);
        return;
      }

      // Headings
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B0CB1F]" />
            {trimmed.replace("### ", "")}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h3 key={idx} className="text-base font-bold text-slate-900 mt-5 mb-2 border-b border-slate-100 pb-1">
            {trimmed.replace("## ", "")}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h2 key={idx} className="text-lg font-bold text-slate-900 mt-6 mb-2">
            {trimmed.replace("# ", "")}
          </h2>
        );
        return;
      }

      // Horizontal Rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        elements.push(<hr key={idx} className="my-3 border-slate-200" />);
        return;
      }

      // Blockquotes / Callouts
      if (trimmed.startsWith("> ")) {
        elements.push(
          <div key={idx} className="my-2 p-3 bg-amber-50/60 border-l-3 border-amber-400 rounded-r-lg text-xs text-amber-900 leading-relaxed italic">
            {trimmed.replace("> ", "")}
          </div>
        );
        return;
      }

      // Bullet List
      if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const textContent = trimmed.replace(/^[•\-*]\s*/, "");
        elements.push(
          <div key={idx} className="flex items-start gap-2 py-0.5 text-xs text-slate-700 leading-relaxed">
            <span className="text-[#849a15] font-bold text-sm leading-none mt-0.5">•</span>
            <div dangerouslySetInnerHTML={{
              __html: textContent
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
                .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline inline-flex items-center gap-0.5">$1</a>')
            }} />
          </div>
        );
        return;
      }

      // Numbered List
      if (/^\d+\.\s+/.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+)\.\s+/);
        const num = numMatch ? numMatch[1] : "1";
        const textContent = trimmed.replace(/^\d+\.\s+/, "");
        elements.push(
          <div key={idx} className="flex items-start gap-2 py-0.5 text-xs text-slate-700 leading-relaxed">
            <span className="text-slate-400 font-semibold text-xs leading-tight min-w-[18px]">{num}.</span>
            <div dangerouslySetInnerHTML={{
              __html: textContent
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
            }} />
          </div>
        );
        return;
      }

      // Checkbox / Tasks
      if (trimmed.startsWith("[ ] ") || trimmed.startsWith("[x] ") || trimmed.startsWith("[X] ")) {
        const checked = trimmed.startsWith("[x] ") || trimmed.startsWith("[X] ");
        const textContent = trimmed.slice(4);
        elements.push(
          <div key={idx} className="flex items-center gap-2 py-0.5 text-xs text-slate-700 leading-relaxed">
            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${checked ? "bg-[#B0CB1F] text-slate-900 font-bold" : "border border-slate-300"}`}>
              {checked ? "✓" : ""}
            </span>
            <div dangerouslySetInnerHTML={{
              __html: textContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
            }} />
          </div>
        );
        return;
      }

      // Regular Paragraph
      elements.push(
        <p
          key={idx}
          className="text-xs text-slate-700 leading-relaxed my-1"
          dangerouslySetInnerHTML={{
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
              .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
              .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
              .replace(/~~(.*?)~~/g, '<del class="line-through text-slate-400">$1</del>')
              .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')
              .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
          }}
        />
      );
    });

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden transition-all focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
      {/* ── Top Header Toolbar ────────────────────────────────────────── */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "write"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Edit3 size={13} />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Eye size={13} />
            <span>Store Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "split"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Side-by-side View"
          >
            <Columns size={13} />
            <span>Split View</span>
          </button>
        </div>

        {/* Right: AI & Templates & Clear Actions */}
        <div className="flex items-center gap-1.5">
          {/* Templates Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowTemplatesDropdown((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <PlusCircle size={13} className="text-slate-500" />
              <span>Insert Template</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {showTemplatesDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Pre-built Product Blocks
                </div>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate("highlights")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="font-medium">🌟 Key Highlights & Features</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600">Bullets</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate("specs")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="font-medium">📋 Technical Specs Table</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate("care")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="font-medium">🧼 Care & Materials Guide</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600">Care</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate("box")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="font-medium">📦 In The Box & Packaging</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600">Package</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate("size_guide")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="font-medium">📏 Size & Fit Instructions</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600">Sizing</span>
                </button>
              </div>
            )}
          </div>

          {/* Copy Button */}
          {value && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Copy Description Text"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          )}

          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Clear all description"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Formatting Tools Ribbon (Active during Write & Split modes) ─ */}
      {activeTab !== "preview" && (
        <div className="bg-slate-50/60 border-b border-slate-200/60 px-2.5 py-1.5 flex flex-wrap items-center gap-1 text-slate-700 select-none">
          {/* Headings */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => formatLines("# ")}
              className="px-1.5 py-1 rounded-md hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => formatLines("## ")}
              className="px-1.5 py-1 rounded-md hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => formatLines("### ")}
              className="px-1.5 py-1 rounded-md hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Heading 3 (Section)"
            >
              H3
            </button>
          </div>

          {/* Inline Formats */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => formatSelection("**", "**", "bold text")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer font-bold"
              title="Bold (**text**)"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onClick={() => formatSelection("*", "*", "italic text")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer italic"
              title="Italic (*text*)"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              onClick={() => formatSelection("<u>", "</u>", "underlined text")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Underline (<u>text</u>)"
            >
              <Underline size={13} />
            </button>
            <button
              type="button"
              onClick={() => formatSelection("~~", "~~", "strikethrough text")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough size={13} />
            </button>
          </div>

          {/* Lists & Checklists */}
          <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
            <button
              type="button"
              onClick={() => formatLines("• ")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Bullet Point List (•)"
            >
              <List size={13} />
            </button>
            <button
              type="button"
              onClick={() => formatLines("1. ")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Numbered List (1. 2. 3.)"
            >
              <ListOrdered size={13} />
            </button>
            <button
              type="button"
              onClick={() => formatLines("[x] ")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Feature Checklist Item (☑)"
            >
              <CheckSquare size={13} />
            </button>
          </div>

          {/* Block Elements: Quote, Table, Divider, Link */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => formatLines("> ")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Highlight Quote / Callout Box"
            >
              <Quote size={13} />
            </button>
            <button
              type="button"
              onClick={() => setShowTableModal(true)}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Insert Specs Table"
            >
              <TableIcon size={13} />
            </button>
            <button
              type="button"
              onClick={() => formatSelection("\n---\n", "", "")}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Horizontal Divider"
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-700 transition-colors cursor-pointer"
              title="Insert Hyperlink"
            >
              <LinkIcon size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content Area (Write, Preview, or Split) ─────────────── */}
      <div className="min-h-[200px]">
        {activeTab === "write" && (
          <textarea
            ref={textareaRef}
            rows={8}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none leading-relaxed font-mono resize-y border-none bg-transparent"
          />
        )}

        {activeTab === "preview" && (
          <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto bg-slate-50/40 divide-y divide-slate-100">
            <div className="max-w-2xl mx-auto">{renderPreview(value)}</div>
          </div>
        )}

        {activeTab === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[220px]">
            {/* Left: Raw / Markdown editor */}
            <div className="p-1 bg-white">
              <textarea
                ref={textareaRef}
                rows={9}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full min-h-[200px] p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none leading-relaxed font-mono resize-none border-none"
              />
            </div>
            {/* Right: Live Rendered Output */}
            <div className="p-4 max-h-[320px] overflow-y-auto bg-slate-50/50">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-2">
                Live Storefront Preview
              </div>
              {renderPreview(value)}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Status Bar ─────────────────────────────────────────── */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
          <span>•</span>
          <span>~{readTime} min read</span>
        </div>
        <div className="text-[10px] text-slate-400 hidden sm:flex items-center gap-2">
          <span>Supports rich Markdown, lists & tables</span>
        </div>
      </div>

      {/* ── Table Insert Modal ────────────────────────────────────────── */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <TableIcon size={14} className="text-slate-700" />
                Insert Specifications Table
              </h3>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">Rows</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">Columns</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg cursor-pointer shadow-2xs"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Link Insert Modal ─────────────────────────────────────────── */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <LinkIcon size={14} className="text-slate-700" />
                Insert Web Link
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">Display Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Official Warranty Terms"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1">Link URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/guide"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg cursor-pointer shadow-2xs disabled:opacity-40"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
