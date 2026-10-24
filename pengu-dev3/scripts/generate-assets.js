const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'assets', 'animations');

// Base cute penguin SVG template
function createPenguinSvg({
  bodyColor = '#1b263b',
  bellyColor = '#f0f3f8',
  beakColor = '#f39c12',
  eyeType = 'open', // 'open', 'blink', 'wink', 'dizzy', 'sleep'
  bodyTilt = 0,
  bodyY = 0,
  leftFlipper = 'down', // 'down', 'up', 'wave', 'spread'
  rightFlipper = 'down',
  accessory = null,
  mouthOpen = false,
  beakYOffset = 0
}) {
  let eyesSvg = '';
  if (eyeType === 'open') {
    eyesSvg = `
      <circle cx="53" cy="50" r="5" fill="#1b263b"/>
      <circle cx="55" cy="48" r="1.8" fill="#ffffff"/>
      <circle cx="75" cy="50" r="5" fill="#1b263b"/>
      <circle cx="77" cy="48" r="1.8" fill="#ffffff"/>
    `;
  } else if (eyeType === 'blink') {
    eyesSvg = `
      <path d="M48 51 Q53 47 58 51" stroke="#1b263b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M70 51 Q75 47 80 51" stroke="#1b263b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    `;
  } else if (eyeType === 'sleep') {
    eyesSvg = `
      <path d="M48 52 Q53 56 58 52" stroke="#1b263b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M70 52 Q75 56 80 52" stroke="#1b263b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    `;
  } else if (eyeType === 'dizzy') {
    eyesSvg = `
      <path d="M50 47 L56 53 M56 47 L50 53" stroke="#1b263b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M72 47 L78 53 M78 47 L72 53" stroke="#1b263b" stroke-width="2.5" stroke-linecap="round"/>
    `;
  }

  let flippers = '';
  // Left flipper
  if (leftFlipper === 'down') {
    flippers += `<ellipse cx="28" cy="74" rx="8" ry="18" fill="${bodyColor}" transform="rotate(15 28 74)"/>`;
  } else if (leftFlipper === 'wave') {
    flippers += `<ellipse cx="22" cy="50" rx="8" ry="18" fill="${bodyColor}" transform="rotate(-40 22 50)"/>`;
  } else if (leftFlipper === 'spread') {
    flippers += `<ellipse cx="20" cy="65" rx="8" ry="18" fill="${bodyColor}" transform="rotate(-30 20 65)"/>`;
  }

  // Right flipper
  if (rightFlipper === 'down') {
    flippers += `<ellipse cx="100" cy="74" rx="8" ry="18" fill="${bodyColor}" transform="rotate(-15 100 74)"/>`;
  } else if (rightFlipper === 'wave') {
    flippers += `<ellipse cx="106" cy="50" rx="8" ry="18" fill="${bodyColor}" transform="rotate(40 106 50)"/>`;
  } else if (rightFlipper === 'spread') {
    flippers += `<ellipse cx="108" cy="65" rx="8" ry="18" fill="${bodyColor}" transform="rotate(30 108 65)"/>`;
  }

  // Beak & mouth
  let beakSvg = '';
  const by = 58 + beakYOffset;
  if (mouthOpen) {
    beakSvg = `
      <polygon points="56,${by} 72,${by} 64,${by + 11}" fill="${beakColor}"/>
      <ellipse cx="64" cy="${by + 4}" rx="4" ry="3" fill="#c0392b"/>
    `;
  } else {
    beakSvg = `<polygon points="56,${by} 72,${by} 64,${by + 9}" fill="${beakColor}"/>`;
  }

  // Feet
  const feetSvg = `
    <ellipse cx="48" cy="112" rx="12" ry="5" fill="#f39c12"/>
    <ellipse cx="80" cy="112" rx="12" ry="5" fill="#f39c12"/>
  `;

  // Extra accessory
  let extraSvg = '';
  if (accessory === 'sparkle') {
    extraSvg = `
      <circle cx="95" cy="35" r="3" fill="#f1c40f"/>
      <path d="M95 28 L95 42 M88 35 L102 35" stroke="#f1c40f" stroke-width="1.5"/>
    `;
  } else if (accessory === 'zzz') {
    extraSvg = `
      <text x="88" y="42" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#3498db">Z</text>
      <text x="98" y="32" font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#3498db">z</text>
      <text x="105" y="24" font-family="Arial, sans-serif" font-weight="bold" font-size="7" fill="#3498db">z</text>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <g transform="translate(0, ${bodyY}) rotate(${bodyTilt} 64 64)">
      ${feetSvg}
      ${flippers}
      <!-- Body -->
      <ellipse cx="64" cy="68" rx="38" ry="44" fill="${bodyColor}"/>
      <!-- White Belly -->
      <ellipse cx="64" cy="74" rx="27" ry="34" fill="${bellyColor}"/>
      <!-- Cheeks -->
      <ellipse cx="44" cy="59" rx="5" ry="3" fill="#ffb4a2" opacity="0.6"/>
      <ellipse cx="84" cy="59" rx="5" ry="3" fill="#ffb4a2" opacity="0.6"/>
      <!-- Eyes -->
      ${eyesSvg}
      <!-- Beak -->
      ${beakSvg}
      ${extraSvg}
    </g>
  </svg>`.trim();
}

const states = {
  idle: [
    createPenguinSvg({ eyeType: 'open', bodyY: 0 }),
    createPenguinSvg({ eyeType: 'blink', bodyY: 1 })
  ],
  hello: [
    createPenguinSvg({ eyeType: 'open', rightFlipper: 'down', bodyY: 0 }),
    createPenguinSvg({ eyeType: 'open', rightFlipper: 'wave', bodyY: -4, mouthOpen: true })
  ],
  walk: [
    createPenguinSvg({ eyeType: 'open', bodyTilt: -6, bodyY: -2, leftFlipper: 'spread' }),
    createPenguinSvg({ eyeType: 'open', bodyTilt: 6, bodyY: -2, rightFlipper: 'spread' })
  ],
  dragged: [
    createPenguinSvg({ eyeType: 'dizzy', leftFlipper: 'spread', rightFlipper: 'spread', bodyY: -6 }),
    createPenguinSvg({ eyeType: 'dizzy', leftFlipper: 'wave', rightFlipper: 'wave', bodyY: -8, mouthOpen: true })
  ],
  hover_jump: [
    createPenguinSvg({ eyeType: 'open', bodyY: 4 }),
    createPenguinSvg({ eyeType: 'open', leftFlipper: 'wave', rightFlipper: 'wave', bodyY: -12, mouthOpen: true })
  ],
  thinking: [
    createPenguinSvg({ eyeType: 'open', bodyTilt: 4, rightFlipper: 'spread', accessory: 'sparkle' }),
    createPenguinSvg({ eyeType: 'blink', bodyTilt: 6, rightFlipper: 'spread', accessory: 'sparkle' })
  ],
  sending: [
    createPenguinSvg({ eyeType: 'open', bodyTilt: 8, rightFlipper: 'wave', mouthOpen: true, bodyY: -2 }),
    createPenguinSvg({ eyeType: 'open', bodyTilt: 12, rightFlipper: 'spread', mouthOpen: false, bodyY: -4 })
  ],
  talking: [
    createPenguinSvg({ eyeType: 'open', mouthOpen: false, bodyY: 0 }),
    createPenguinSvg({ eyeType: 'open', mouthOpen: true, bodyY: -2 })
  ],
  sleeping: [
    createPenguinSvg({ eyeType: 'sleep', bodyY: 2, accessory: 'zzz' }),
    createPenguinSvg({ eyeType: 'sleep', bodyY: 3, accessory: 'zzz' })
  ]
};

for (const [state, frames] of Object.entries(states)) {
  const dir = path.join(baseDir, state);
  fs.mkdirSync(dir, { recursive: true });
  frames.forEach((svg, idx) => {
    fs.writeFileSync(path.join(dir, `frame-${idx}.svg`), svg, 'utf8');
  });
}

console.log('Successfully generated multi-frame SVG assets in', baseDir);
