import fetch from 'node-fetch';

async function main() {
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { "Authorization": "Bearer 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" }
  });
  const data = await res.json();
  const llamaModels = data.data.map((m: any) => m.id).filter((id: string) => id.toLowerCase().includes('llama'));
  console.log(llamaModels);
}

main();
