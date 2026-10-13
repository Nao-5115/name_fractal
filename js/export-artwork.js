// Add a clear nameplate around the generated image before saving it.
function composeArtworkForSave(source, name, kana = '') {
  const output = document.createElement('canvas');
  const width = source.width;
  const headerHeight = Math.round(width * 0.19);
  const footerHeight = Math.round(width * 0.12);
  output.width = width;
  output.height = headerHeight + source.height + footerHeight;

  const context = output.getContext('2d');
  context.fillStyle = '#0d1733';
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(source, 0, headerHeight);

  const title = (name || '名前のない作品').trim();
  const subtitle = (kana || '').trim();
  const maxTitleWidth = width * 0.84;
  let fontSize = Math.round(width * (title.length > 8 ? 0.075 : 0.095));
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `600 ${fontSize}px "Yu Gothic", "Meiryo", sans-serif`;
  while (context.measureText(title).width > maxTitleWidth && fontSize > 20) {
    fontSize -= 2;
    context.font = `600 ${fontSize}px "Yu Gothic", "Meiryo", sans-serif`;
  }
  context.fillStyle = '#eef2f8';
  context.fillText(title, width / 2, headerHeight * (subtitle ? 0.43 : 0.5));

  if (subtitle) {
    context.fillStyle = '#9fb0d0';
    context.font = `400 ${Math.round(width * 0.035)}px "Yu Gothic", "Meiryo", sans-serif`;
    context.fillText(subtitle, width / 2, headerHeight * 0.76, maxTitleWidth);
  }

  context.strokeStyle = 'rgba(159, 176, 208, 0.55)';
  context.lineWidth = Math.max(1, width / 900);
  context.beginPath();
  context.moveTo(width * 0.08, headerHeight - context.lineWidth);
  context.lineTo(width * 0.92, headerHeight - context.lineWidth);
  context.stroke();

  context.fillStyle = '#9fb0d0';
  context.font = `400 ${Math.round(width * 0.025)}px "Yu Gothic", "Meiryo", sans-serif`;
  context.fillText('名前から生まれたフラクタル', width / 2, headerHeight + source.height + footerHeight / 2, width * 0.84);
  return output;
}
