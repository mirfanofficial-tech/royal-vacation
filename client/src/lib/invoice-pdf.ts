/**
 * Rasterises an on-page element into an A4 PDF and triggers a download.
 * Deps are imported lazily so they stay out of the main bundle.
 */
export async function downloadInvoicePdf(node: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  const img = canvas.toDataURL("image/jpeg", 0.92);

  let remaining = imgH;
  let position = 0;
  pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
  remaining -= pageH;

  while (remaining > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(img, "JPEG", 0, position, imgW, imgH);
    remaining -= pageH;
  }

  pdf.save(filename);
}
