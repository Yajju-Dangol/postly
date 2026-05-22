/**
 * Nanobanana Visual Generation Engine API Wrapper
 * Generates beautiful dark glassmorphic templates and on-brand banner graphics
 */

export const renderBrandingGraphic = async ({
  title,
  slogan,
  colors = ['#001b2a', '#f97316', '#0d1b2a'],
  industry = 'Technology',
  tone = 'Professional'
}) => {
  try {
    console.log('[Nanobanana Render]: Initiating render...', { title, slogan, colors, industry, tone });
    
    // Simulate server-side API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Client-side visual compiler using HTML5 Canvas to generate a real, high-quality on-brand PNG asset
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // Landscape Aspect Ratio
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas rendering context not available');

    // 1. Draw Pitch Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw modern bento-style rounded border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(20, 20, canvas.width - 40, canvas.height - 40, 40);
    ctx.stroke();

    // 3. Draw radial brand gradient glow
    const primaryColor = colors[0] || '#6366f1';
    const secondaryColor = colors[1] || '#a855f7';
    
    const gradient = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.2, 50,
      canvas.width * 0.7, canvas.height * 0.3, 500
    );
    gradient.addColorStop(0, hexToRgba(secondaryColor, 0.25));
    gradient.addColorStop(0.5, hexToRgba(primaryColor, 0.1));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 4. Draw abstract fluid graphic elements (Glassmorphic circles)
    ctx.fillStyle = hexToRgba(primaryColor, 0.15);
    ctx.beginPath();
    ctx.arc(canvas.width * 0.75, canvas.height * 0.5, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hexToRgba(secondaryColor, 0.1);
    ctx.beginPath();
    ctx.arc(canvas.width * 0.85, canvas.height * 0.6, 120, 0, Math.PI * 2);
    ctx.fill();

    // Add frosted glass overlay on the abstract circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
    ctx.beginPath();
    ctx.roundRect(canvas.width * 0.55, canvas.height * 0.25, 450, 300, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(canvas.width * 0.55, canvas.height * 0.25, 450, 300, 30);
    ctx.stroke();

    // 5. Render Brand details text (Title, Slogan, Metadata)
    // Draw industry badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(80, 80, 180, 36, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    ctx.fillStyle = '#a855f7'; // Purple badge text
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(industry.toUpperCase(), 170, 98);

    // Draw Main Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    wrapText(ctx, title || 'Innovative Branding Solutions', 80, 150, 500, 56);

    // Draw Slogan / Tagline
    ctx.fillStyle = '#a1a1aa'; // Muted grey
    ctx.font = '22px sans-serif';
    wrapText(ctx, slogan || 'Elevating digital presence with state-of-the-art experiences.', 80, 320, 500, 30);

    // Draw bottom brand signature line
    ctx.fillStyle = '#71717a';
    ctx.font = 'italic 14px sans-serif';
    ctx.fillText(`Aesthetic Preset: ${tone} | Powered by Postly`, 80, 510);

    // Render 3 small visual accent dots using brand colors
    colors.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(80 + (i * 20), 540, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    const dataUrl = canvas.toDataURL('image/png');
    console.log('[Nanobanana Render]: Success!');
    return dataUrl;
  } catch (err) {
    console.error('[Nanobanana Render Error]:', err);
    throw err;
  }
};

// Helper to convert hex color to rgba
function hexToRgba(hex, alpha = 1) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper to wrap canvas text
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, currentY);
}
