// Audio thumbnail generation utility
export function generateAudioThumbnail(audioUrl: string, title: string, artist: string): string {
  // Generate a colorful thumbnail based on the title and artist
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
    '#a29bfe', '#fd79a8', '#e17055', '#00b894', '#fdcb6e'
  ];
  
  // Simple hash function to get consistent color for same title/artist
  const hash = (title + artist).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colorIndex = Math.abs(hash) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Create SVG thumbnail
  const svg = `
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustBrightness(backgroundColor, -20)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="150" height="150" fill="url(#grad)" rx="8"/>
      <circle cx="75" cy="60" r="20" fill="white" opacity="0.9"/>
      <polygon points="70,50 70,70 85,60" fill="${backgroundColor}"/>
      <text x="75" y="95" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
        ${truncateText(title, 12)}
      </text>
      <text x="75" y="110" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" opacity="0.8">
        ${truncateText(artist, 15)}
      </text>
      <rect x="20" y="125" width="110" height="2" fill="white" opacity="0.3" rx="1"/>
      <rect x="20" y="125" width="60" height="2" fill="white" opacity="0.7" rx="1"/>
    </svg>
  `;
  
  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function generateVideoThumbnail(videoUrl: string, title: string, artist: string): string {
  // Generate a video-style thumbnail
  const colors = [
    '#e74c3c', '#3498db', '#9b59b6', '#e67e22', '#1abc9c',
    '#f39c12', '#2ecc71', '#34495e', '#e91e63', '#673ab7'
  ];
  
  const hash = (title + artist).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colorIndex = Math.abs(hash) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  const svg = `
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="videoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustBrightness(backgroundColor, -30)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill="url(#videoGrad)" rx="8"/>
      <circle cx="100" cy="50" r="25" fill="white" opacity="0.9"/>
      <polygon points="90,35 90,65 115,50" fill="${backgroundColor}"/>
      <text x="100" y="85" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
        ${truncateText(title, 18)}
      </text>
      <text x="100" y="100" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" opacity="0.8">
        ${truncateText(artist, 20)}
      </text>
      <rect x="10" y="10" width="30" height="15" fill="black" opacity="0.7" rx="2"/>
      <text x="25" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="8">HD</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function getAudioWaveformThumbnail(audioUrl: string, title: string): string {
  // Generate a waveform-style thumbnail
  const svg = `
    <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="150" height="150" fill="#1a1a2e" rx="8"/>
      <g fill="url(#waveGrad)">
        ${generateWaveformBars()}
      </g>
      <text x="75" y="130" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">
        ${truncateText(title, 15)}
      </text>
      <circle cx="75" cy="75" r="15" fill="white" opacity="0.9"/>
      <polygon points="70,70 70,80 80,75" fill="#667eea"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function generateWaveformBars(): string {
  let bars = '';
  const barCount = 20;
  const barWidth = 4;
  const spacing = 2;
  const startX = 15;
  
  for (let i = 0; i < barCount; i++) {
    const height = Math.random() * 60 + 10;
    const x = startX + i * (barWidth + spacing);
    const y = 75 - height / 2;
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="2"/>`;
  }
  
  return bars;
}

