const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const fontkit = require("@pdf-lib/fontkit");

// ✅ Corrected asset paths
const fontPath = path.join(__dirname, "../fonts/NotoSans-Regular.ttf");
const checkmarkPath = path.join(__dirname, "../assessts/checkmark.png");

async function addVerificationTicket(fileName) {
  try {
    let pdfPath = fileName;
    if (!path.isAbsolute(fileName)) {
      pdfPath = path.join(__dirname, "../uploads", fileName);
    }

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`File not found: ${pdfPath}`);
    }

    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    pdfDoc.registerFontkit(fontkit);

    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font file not found: ${fontPath}`);
    }
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);

    // ✅ Get the first page and add verification text
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const textX = 50;
    const textY = 100;

    firstPage.drawText("Signature valid", {
      x: textX,
      y: textY,
      size: 12, // Small but readable
      font: customFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText("Digitally signed\nUNIQUE IDENTIFICATION\nAUTHORITY OF INDIA 02\nDate: " + new Date().toLocaleString(), {
      x: textX,
      y: textY - 18,
      size: 8, // Smaller for compact appearance
      font: customFont,
      color: rgb(0, 0, 0),
      lineHeight: 9, // Reduced spacing
    });

    // ✅ Embed checkmark and overlap it with text
    if (fs.existsSync(checkmarkPath)) {
      const checkmarkImageBytes = fs.readFileSync(checkmarkPath);
      const checkmarkImage = await pdfDoc.embedPng(checkmarkImageBytes);
      const checkmarkDims = checkmarkImage.scale(0.15); // Smaller tick size
    
      firstPage.drawImage(checkmarkImage, {
        x: textX + 35, // Centered above "Signature valid"
        y: textY + 35, // Reduced gap, closer to text
        width: checkmarkDims.width * 0.6, // Smaller tick
        height: checkmarkDims.height * 0.6,
        opacity: 1.0, // Fully visible
      });
    } else {
      console.warn("⚠️ Checkmark image not found, skipping...");
    }

    // ✅ Save the modified PDF
    const verifiedFileName = `verified_${path.basename(fileName)}`;
    const verifiedFilePath = path.join(__dirname, "../uploads", verifiedFileName);
    fs.writeFileSync(verifiedFilePath, await pdfDoc.save());

    console.log(`✅ Verified PDF generated: ${verifiedFilePath}`);
    return verifiedFileName;
  } catch (error) {
    console.error("❌ Error in addVerificationTicket:", error.message);
    throw new Error(error.message);
  }
}

module.exports = { addVerificationTicket };