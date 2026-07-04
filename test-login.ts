import { auth } from "./src/config/better-auth";

async function main() {
  try {
    const res = await auth.api.signInEmail({
      body: {
        email: "vijayasai6.9.6@gmail.com",
        password: "Vijay@1234"
      }
    });
    console.log("Success:", res);
  } catch (err: any) {
    console.error("Error:", err.message);
    console.error(err);
  }
}

main();
