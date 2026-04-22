const fs = require('fs');
const content = fs.readFileSync('src/components/settings/SettingsPage.tsx', 'utf8');

let openBraces = 0;
let closeBraces = 0;
let openParens = 0;
let closeParens = 0;
let openBrackets = 0;
let closeBrackets = 0;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '{') openBraces++;
  if (char === '}') closeBraces++;
  if (char === '(') openParens++;
  if (char === ')') closeParens++;
  if (char === '[') openBrackets++;
  if (char === ']') closeBrackets++;
}

console.log('Braces: {', openBraces, '} ', closeBraces, 'diff:', openBraces - closeBraces);
console.log('Parentheses: (', openParens, ') ', closeParens, 'diff:', openParens - closeParens);
console.log('Brackets: [', openBrackets, '] ', closeBrackets, 'diff:', openBrackets - closeBrackets);
