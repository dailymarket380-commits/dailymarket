const fs = require('fs');

const files = [
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/components/dashboard/MagicAdd.module.css",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/(auth)/login/page.module.css",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/checkout/checkout.module.css",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/cart/cart.module.css",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/checkout/page.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/globals.css"
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/var\(--accent-orange\)/gi, '#111');
    content = content.replace(/var\(--brand-orange-light\)/gi, '#f1f5f9');
    content = content.replace(/var\(--brand-orange\)/gi, '#111');
    content = content.replace(/--brand-orange:.+;/g, '--brand-orange: #111;');
    content = content.replace(/--brand-orange-light:.+;/g, '--brand-orange-light: #f1f5f9;');
    content = content.replace(/--brand-orange-dark:.+;/g, '--brand-orange-dark: #000;');
    fs.writeFileSync(file, content);
    console.log("Updated", file);
  }
}
