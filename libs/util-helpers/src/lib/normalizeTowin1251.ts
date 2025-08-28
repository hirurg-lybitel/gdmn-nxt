export function normalizeToWin1251(text: string): string {
  const replacements: Record<string, string> = {
    '←': '<-',
    '→': '->',
    '↑': '^',
    '↓': 'v',
    '∞': '8',
    '≠': '!=',
    '≤': '<=',
    '≥': '>=',
    '√': '\\\\/',
    'π': 'pi',
    '±': '±',
    '€': '€',
    '…': '…',
    '–': '–',
    '—': '—',
    '−': '-',
    '―': '-',
    '•': '•',
    '™': '™',
    '©': '©',
    '®': '®',
    '№': '№',
    '“': '“',
    '”': '”',
    '‘': '‘',
    '’': '’',
    '«': '«',
    '»': '»',
    '″': '"',
    '′': '\''
  };

  return [...text].map(char => {
    const code = char.charCodeAt(0);

    const isAscii = code >= 0x00 && code <= 0x7F;
    const isCyrillic = code >= 0x0400 && code <= 0x04FF;
    const isYo = code === 0xA8 || code === 0xB8;

    if (isAscii || isCyrillic || isYo) {
      return char;
    }

    if (replacements[char]) {
      return replacements[char];
    }

    return '?';
  }).join('');
}
