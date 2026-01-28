import { parseDocument } from "htmlparser2";

export function renderHtmlToPdf(doc, html) {
  const dom = parseDocument(html);

  function textInline(text, opts = {}) {
    const cleaned = text.replace(/\s+/g, " ");
    if (!cleaned.trim()) return;
    doc.text(cleaned, { ...opts, continued: true });
  }

  function closeLine() {
    doc.text("", { continued: false });
  }

  function walk(nodes, opts = {}) {
    for (const node of nodes) {
      if (node.type === "text") {
        textInline(node.data, opts);
        continue;
      }

      if (node.type !== "tag") continue;

      switch (node.name) {
        case "br":
          closeLine();
          doc.moveDown(0.5);
          break;

        case "p":
          closeLine();
          doc.moveDown(0.5);
          walk(node.children || [], opts);
          closeLine();
          doc.moveDown();
          break;

        case "h1":
          closeLine();
          doc.moveDown(0.8);
          doc.font("Helvetica-Bold").fontSize(22);
          walk(node.children || [], opts);
          closeLine();
          doc.font("Helvetica").fontSize(12);
          doc.moveDown(0.8);
          break;

        case "h2":
          closeLine();
          doc.moveDown(0.7);
          doc.font("Helvetica-Bold").fontSize(18);
          walk(node.children || [], opts);
          closeLine();
          doc.font("Helvetica").fontSize(12);
          doc.moveDown(0.7);
          break;

        case "h3":
          closeLine();
          doc.moveDown(0.6);
          doc.font("Helvetica-Bold").fontSize(16);
          walk(node.children || [], opts);
          closeLine();
          doc.font("Helvetica").fontSize(12);
          doc.moveDown(0.6);
          break;

        case "h4":
          closeLine();
          doc.moveDown(0.5);
          doc.font("Helvetica-Bold").fontSize(14);
          walk(node.children || [], opts);
          closeLine();
          doc.font("Helvetica").fontSize(12);
          doc.moveDown(0.5);
          break;

        case "h5":
          closeLine();
          doc.moveDown(0.4);
          doc.font("Helvetica-Bold").fontSize(13);
          walk(node.children || [], opts);
          closeLine();
          doc.font("Helvetica").fontSize(12);
          doc.moveDown(0.4);
          break;

        case "h6":
          closeLine();
          doc.moveDown(0.3);
          doc.font("Helvetica-Bold").fontSize(12);
          walk(node.children || [], opts);
          closeLine();
          doc.font("Helvetica").fontSize(12);
          doc.moveDown(0.3);
          break;

        case "strong":
        case "b":
          doc.font("Helvetica-Bold");
          walk(node.children || [], opts);
          doc.font("Helvetica");
          break;

        case "em":
        case "i":
          doc.font("Helvetica-Oblique");
          walk(node.children || [], opts);
          doc.font("Helvetica");
          break;

        case "u":
          walk(node.children || [], { ...opts, underline: true });
          break;

        case "a": {
          const href = node.attribs?.href || "";
          doc.fillColor("#1f6feb");
          walk(node.children || [], { ...opts, underline: true });
          textInline(` (${href})`);
          doc.fillColor("black");
          break;
        }

        case "ul":
          closeLine();
          doc.moveDown(0.5);
          for (const li of node.children || []) {
            if (li.name === "li") {
              doc.text("• ", { continued: true });
              walk(li.children || [], opts);
              closeLine();
              doc.moveDown(1.1);
            }
          }
          doc.moveDown();
          break;

        case "ol":
          closeLine();
          doc.moveDown(0.5);
          let i = 1;
          for (const li of node.children || []) {
            if (li.name === "li") {
              doc.text(`${i}. `, { continued: true });
              walk(li.children || [], opts);
              closeLine();
              doc.moveDown(1.1);
              i++;
            }
          }
          doc.moveDown();
          break;

        case "li":
          walk(node.children || [], opts);
          break;

        default:
          walk(node.children || [], opts);
          break;
      }
    }
  }

  walk(dom.children || []);
  closeLine();
}
