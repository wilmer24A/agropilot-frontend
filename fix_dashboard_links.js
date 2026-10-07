const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const old = `import { useEffect, useState } from "react";`;
const new_ = `import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";`;
content = content.replace(old, new_);

const old2 = `export default function Dashboard() {
  const [datos, setDatos] = useState<Dashboard | null>(null);`;
const new2 = `export default function Dashboard() {
  const router = useRouter();
  const [datos, setDatos] = useState<Dashboard | null>(null);`;
content = content.replace(old2, new2);

const old3 = `{datos.urgente.map((p, i) => <TarjetaParcela key={i} parcela={p} urgente={true} />)}`;
const new3 = `{datos.urgente.map((p, i) => <div key={i} onClick={() => router.push(\`/parcelas/\${p.id}\`)} className="cursor-pointer"><TarjetaParcela parcela={p} urgente={true} /></div>)}`;
content = content.replace(old3, new3);

const old4 = `{datos.bien.map((p, i) => <TarjetaParcela key={i} parcela={p} urgente={false} />)}`;
const new4 = `{datos.bien.map((p, i) => <div key={i} onClick={() => router.push(\`/parcelas/\${p.id}\`)} className="cursor-pointer"><TarjetaParcela parcela={p} urgente={false} /></div>)}`;
content = content.replace(old4, new4);

fs.writeFileSync('app/page.tsx', content);
console.log('Links añadidos al dashboard');