// Add a clear nameplate around the generated image before saving it.
function composeArtworkForSave(
  source,
  name,
  kana = "",
  shapeLabel = "",
  themeLabel = "",
) {
  const output = document.createElement("canvas");
  const width = source.width;
  const headerHeight = Math.round(width * 0.19);
  const footerHeight = Math.round(width * 0.12);
  output.width = width;
  output.height = headerHeight + source.height + footerHeight;

  const context = output.getContext("2d");
  context.fillStyle = "#0d1733";
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(source, 0, headerHeight);

  const title = (name || "名前のない作品").trim();
  const subtitle = (kana || "").trim();
  const maxTitleWidth = width * 0.84;
  let fontSize = Math.round(width * (title.length > 8 ? 0.075 : 0.095));
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `600 ${fontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
  while (context.measureText(title).width > maxTitleWidth && fontSize > 20) {
    fontSize -= 2;
    context.font = `600 ${fontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
  }
  context.fillStyle = "#eef2f8";
  context.fillText(title, width / 2, headerHeight * (subtitle ? 0.43 : 0.5));

  if (subtitle) {
    context.fillStyle = "#9fb0d0";
    context.font = `400 ${Math.round(width * 0.035)}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
    context.fillText(subtitle, width / 2, headerHeight * 0.76, maxTitleWidth);
  }

  context.strokeStyle = "rgba(159, 176, 208, 0.55)";
  context.lineWidth = Math.max(1, width / 900);
  context.beginPath();
  context.moveTo(width * 0.08, headerHeight - context.lineWidth);
  context.lineTo(width * 0.92, headerHeight - context.lineWidth);
  context.stroke();

  const footerY = headerHeight + source.height;
  const tagFontSize = Math.round(width * 0.026);
  const tagHeight = Math.round(footerHeight * 0.42);
  const gap = Math.round(width * 0.025);
  const tags = [
    ["形", shapeLabel],
    ["色", themeLabel],
  ].filter(([, value]) => value);

  context.font = `400 ${tagFontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
  const tagWidths = tags.map(([label, value]) => {
    const labelWidth = context.measureText(label).width;
    context.font = `600 ${tagFontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
    const valueWidth = context.measureText(value).width;
    context.font = `400 ${tagFontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
    return labelWidth + tagFontSize * 0.45 + valueWidth + tagFontSize * 1.25;
  });
  const groupWidth =
    tagWidths.reduce((sum, value) => sum + value, 0) +
    gap * Math.max(0, tags.length - 1);
  let tagX = (width - groupWidth) / 2;
  const tagY = footerY + (footerHeight - tagHeight) * 0.25;

  tags.forEach(([label, value], index) => {
    const tagWidth = tagWidths[index];
    const radius = tagHeight / 2;
    context.beginPath();
    context.moveTo(tagX + radius, tagY);
    context.arcTo(
      tagX + tagWidth,
      tagY,
      tagX + tagWidth,
      tagY + tagHeight,
      radius,
    );
    context.arcTo(
      tagX + tagWidth,
      tagY + tagHeight,
      tagX,
      tagY + tagHeight,
      radius,
    );
    context.arcTo(tagX, tagY + tagHeight, tagX, tagY, radius);
    context.arcTo(tagX, tagY, tagX + tagWidth, tagY, radius);
    context.closePath();
    context.fillStyle = "rgba(238, 242, 248, 0.08)";
    context.fill();
    context.strokeStyle = "rgba(159, 176, 208, 0.6)";
    context.lineWidth = Math.max(1, width / 1200);
    context.stroke();

    const textY = tagY + tagHeight / 2;
    let textX = tagX + tagFontSize * 0.65;
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillStyle = "#9fb0d0";
    context.font = `400 ${tagFontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
    context.fillText(label, textX, textY);
    textX += context.measureText(label).width + tagFontSize * 0.45;
    context.fillStyle = "#eef2f8";
    context.font = `600 ${tagFontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
    context.fillText(value, textX, textY);
    tagX += tagWidth + gap;
  });

  context.fillStyle = "#9fb0d0";
  context.font = `400 ${Math.round(width * 0.025)}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    "名前から生まれたフラクタル",
    width / 2,
    footerY + footerHeight * 0.82,
    width * 0.84,
  );
  return output;
}
