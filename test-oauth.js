const fetch = require('node-fetch'); // or just global fetch in node 18+

async function test() {
  const response = await fetch("http://localhost:3000/api/auth/sign-in/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "google",
      callbackURL: "http://localhost:5173/dashboard",
    }),
  });
  console.log("Status:", response.status);
  console.log("Headers:", response.headers.raw());
  const text = await response.text();
  console.log("Body:", text);
}

test();
