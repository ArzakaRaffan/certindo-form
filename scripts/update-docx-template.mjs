import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";

const root = process.cwd();
const templatePath = path.join(root, "templates", "template.docx");
const logoPath = path.join(root, "public", "assets", "logo-certindo.png");
const signaturePath = path.join(root, "public", "assets", "ttd-manager-certindo.png");

const zip = new PizZip(fs.readFileSync(templatePath));
let documentXml = zip.file("word/document.xml").asText();
let documentRels = zip.file("word/_rels/document.xml.rels").asText();
let header2Rels = zip.file("word/_rels/header2.xml.rels").asText();

function replaceAll(source, replacements) {
  let result = source;
  for (const [from, to] of replacements) result = result.split(from).join(to);
  return result;
}

if (!documentXml.includes('xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"')) {
  documentXml = documentXml.replace(
    "<w:document ",
    '<w:document xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" '
  );
}

// Keep historical placeholders out of the generated document.
documentXml = replaceAll(documentXml, [
  ["({nama_staf_teknis})", ""],
  ["({nama_manajer_teknis})", ""],
  ["{#cek_lab}", "{#cek_in_our_lab}"],
  ["{/cek_lab}", "{/cek_in_our_lab}"],
  ["{^cek_lab}", "{^cek_in_our_lab}"],
  ["{#cek_insitu}", "{#cek_on_site}"],
  ["{/cek_insitu}", "{/cek_on_site}"],
  ["{^cek_insitu}", "{^cek_on_site}"],
  ["Lab PT Certindonesia", "In Our Lab"],
  ["Insitu", "On Site"],
]);

// Add the Hybrid option to the service-location row.
const serviceRowPattern = /<w:tr\b[^>]*>[\s\S]*?\{#cek_on_site\}[\s\S]*?<\/w:tr>/;
const serviceRowMatch = documentXml.match(serviceRowPattern);
if (serviceRowMatch && !serviceRowMatch[0].includes("{#cek_hybrid}")) {
  let serviceRow = serviceRowMatch[0];
  const lastParagraphEnd = serviceRow.lastIndexOf("</w:p>");
  const hybridRuns =
    '<w:r><w:br/></w:r>' +
    '<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr>' +
    '<w:t>{#cek_hybrid}√{/cek_hybrid}{^cek_hybrid}□{/cek_hybrid}</w:t></w:r>' +
    '<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="20"/></w:rPr>' +
    '<w:t xml:space="preserve"> Hybrid - In Our Lab &amp; On Site</w:t></w:r>';
  serviceRow =
    serviceRow.slice(0, lastParagraphEnd) + hybridRuns + serviceRow.slice(lastParagraphEnd);
  documentXml = documentXml.replace(serviceRowPattern, serviceRow);
}

// Remove the obsolete next-calibration-due-date row completely.
const tableRows = documentXml.match(/<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g) ?? [];
const deadlineRow = tableRows.find((row) =>
  row.includes("Penambahan Tenggat Kalibrasi pada Sertifikat")
);
if (deadlineRow) documentXml = documentXml.replace(deadlineRow, "");

const signatureDrawing =
  '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing>' +
  '<wp:inline distT="0" distB="0" distL="0" distR="0">' +
  '<wp:extent cx="950000" cy="650000"/><wp:effectExtent l="0" t="0" r="0" b="0"/>' +
  '<wp:docPr id="9001" name="Tanda tangan dan cap Manajer Teknis" descr="Tanda tangan dan cap Manajer Teknis"/>' +
  '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
  '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
  '<pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="ttd-manager-certindo.png" descr="Tanda tangan dan cap Manajer Teknis"/><pic:cNvPicPr/></pic:nvPicPr>' +
  '<pic:blipFill><a:blip r:embed="rId16"/><a:srcRect l="12000" t="21000" r="3000" b="19000"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
  '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="950000" cy="650000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
  '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';

// Always relocate the signature to the manager textbox. The staff textbox must
// remain empty, regardless of the template's previous state.
const modernTextBoxes = documentXml.match(/<wps:txbx>[\s\S]*?<\/wps:txbx>/g) ?? [];
const signatureTextBox = modernTextBoxes.find((box) => box.includes('r:embed="rId16"'));
const signatureParagraphPattern =
  /<w:p\b[^>]*>(?:(?!<\/w:p>)[\s\S])*?r:embed="rId16"(?:(?!<\/w:p>)[\s\S])*?<\/w:p>/;
const existingSignatureParagraph =
  signatureTextBox?.match(signatureParagraphPattern)?.[0] ?? signatureDrawing;
const normalizedSignatureParagraph = existingSignatureParagraph
  .replace(/<wp:extent cx="\d+" cy="\d+"\/>/, '<wp:extent cx="950000" cy="650000"/>')
  .replace(/<a:ext cx="\d+" cy="\d+"\/>/, '<a:ext cx="950000" cy="650000"/>')
  .replace(/<a:srcRect\b[^>]*\/>/, "")
  .replace(
    '<a:blip r:embed="rId16"/>',
    '<a:blip r:embed="rId16"/><a:srcRect l="12000" t="21000" r="3000" b="19000"/>'
  );
if (signatureTextBox) {
  documentXml = documentXml.replace(
    signatureTextBox,
    signatureTextBox.replace(signatureParagraphPattern, "")
  );
}

const refreshedTextBoxes = documentXml.match(/<wps:txbx>[\s\S]*?<\/wps:txbx>/g) ?? [];
const managerTextBox = refreshedTextBoxes.find((box) => box.includes("Diverifikasi Oleh:"));
if (!managerTextBox) throw new Error("Kotak verifikasi manajer tidak ditemukan.");

let updatedManagerTextBox = managerTextBox.replace(
  /<w:p\b[^>]*>(?:(?!<w:t>|<w:drawing>)[\s\S])*?<\/w:p>/g,
  ""
);
if (!updatedManagerTextBox.includes(">Manajer Teknis<")) {
  const verifiedTitleEnd = updatedManagerTextBox.indexOf(
    "</w:p>",
    updatedManagerTextBox.indexOf("Diverifikasi Oleh:")
  );
  const managerTitleParagraph =
    '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>Manajer Teknis</w:t></w:r></w:p>';
  updatedManagerTextBox =
    updatedManagerTextBox.slice(0, verifiedTitleEnd + 6) +
    managerTitleParagraph +
    updatedManagerTextBox.slice(verifiedTitleEnd + 6);
}
const managerTitleEnd = updatedManagerTextBox.indexOf(
  "</w:p>",
  updatedManagerTextBox.indexOf("Manajer Teknis")
);
if (managerTitleEnd < 0) throw new Error("Judul Manajer Teknis tidak ditemukan.");
  updatedManagerTextBox =
    updatedManagerTextBox.slice(0, managerTitleEnd + 6) +
    normalizedSignatureParagraph +
    updatedManagerTextBox.slice(managerTitleEnd + 6);
documentXml = documentXml.replace(managerTextBox, updatedManagerTextBox);

// Simplify the calibration-equipment table to: No., Equipment Name,
// Calibration Range, and Quantity.
const equipmentTablePattern =
  /<w:tbl>(?:(?!<\/w:tbl>)[\s\S])*?\{merek\}(?:(?!<\/w:tbl>)[\s\S])*?<\/w:tbl>/;
const equipmentTableMatch = documentXml.match(equipmentTablePattern);
if (equipmentTableMatch) {
  let equipmentTable = equipmentTableMatch[0];
  const widths = ["850", "6200", "5300", "1948"];
  const rows = equipmentTable.match(/<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g) ?? [];
  if (rows.length < 2) throw new Error("Struktur tabel alat tidak valid.");

  function setCellWidth(cell, width) {
    return cell.replace(/<w:tcW w:w="\d+" w:type="dxa"\/>/, `<w:tcW w:w="${width}" w:type="dxa"/>`);
  }

  const selectedIndexes = [0, 1, 5, 6];
  for (const row of rows.slice(0, 2)) {
    const cells = row.match(/<w:tc>[\s\S]*?<\/w:tc>/g) ?? [];
    if (cells.length !== 8) throw new Error("Tabel alat harus memiliki delapan kolom sebelum disederhanakan.");
    const selectedCells = selectedIndexes.map((index, targetIndex) =>
      setCellWidth(cells[index], widths[targetIndex])
    );
    if (row.includes("{#alat}")) {
      selectedCells[3] = selectedCells[3].replace("{jumlah}", "{jumlah}{/alat}");
    }
    const rowPrefixEnd = row.indexOf("<w:tc>");
    const rowSuffixStart = row.lastIndexOf("</w:tc>") + 7;
    const updatedRow =
      row.slice(0, rowPrefixEnd) +
      selectedCells.join("") +
      row.slice(rowSuffixStart);
    equipmentTable = equipmentTable.replace(row, updatedRow);
  }

  equipmentTable = equipmentTable.replace(
    /<w:tblGrid>[\s\S]*?<\/w:tblGrid>/,
    `<w:tblGrid>${widths.map((width) => `<w:gridCol w:w="${width}"/>`).join("")}</w:tblGrid>`
  );
  documentXml = documentXml.replace(equipmentTablePattern, equipmentTable);
}

if (!documentRels.includes('Id="rId16"')) {
  documentRels = documentRels.replace(
    "</Relationships>",
    '<Relationship Id="rId16" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/ttd-manager-certindo.png"/></Relationships>'
  );
}

// Replace every CERTINDO mark in the letterhead with the supplied official logo.
zip.file("word/media/image1.png", fs.readFileSync(logoPath));
zip.file("word/media/image3.png", fs.readFileSync(logoPath));
zip.file("word/media/ttd-manager-certindo.png", fs.readFileSync(signaturePath));
header2Rels = header2Rels.replace('Target="media/image3.jpeg"', 'Target="media/image3.png"');

zip.file("word/document.xml", documentXml);
zip.file("word/_rels/document.xml.rels", documentRels);
zip.file("word/_rels/header2.xml.rels", header2Rels);
fs.writeFileSync(templatePath, zip.generate({ type: "nodebuffer" }));

console.log("Template DOCX berhasil diperbarui.");
