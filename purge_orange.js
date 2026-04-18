const fs = require('fs');

const files = [
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/components/ui/Toast.module.css",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/not-found.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/(shop)/product/[id]/page.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/terms/page.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/suppliers/page.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/checkout/page.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/payment/success/page.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/payment/cancel/page.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/privacy/page.tsx",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/support/support.module.css",
  "c:/Users/gumaq/Downloads/FreshProduce/web/src/app/about/page.tsx"
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/#f97316/gi, '#111111');
    content = content.replace(/rgba\(249,115,22,0.3\)/gi, 'rgba(0,0,0,0.3)');
    fs.writeFileSync(file, content);
    console.log("Updated", file);
  }
}
