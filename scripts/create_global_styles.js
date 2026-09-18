const fs = require("fs");

const raw = fs.readFileSync("archive/src_App (13).jsx", "utf8");
const lines = raw.split("\n");

function getSlice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join("\n");
}

const baseCss = getSlice(385, 450);
const btnCss = getSlice(726, 846);

const content = `/* ---------------------------------------------------------------
   GLOBAL STYLES & DYNAMIC THEME BUILDER
--------------------------------------------------------------- */
const buildCSS = (C) => \`
${baseCss}
\`;

${btnCss}

const CSS = buildCSS;

export { buildCSS, PREMIUM_BTN_CSS, CSS };
export default buildCSS;
`;

fs.writeFileSync("src/styles/globalStyles.js", content);
console.log("src/styles/globalStyles.js cleanly written with exact lines 385-450 and 726-846.");
