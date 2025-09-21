// pages/sign-in.js
import { SignIn } from "@clerk/nextjs";
export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <SignIn redirectUrl="/practice" />
    </main>
  );
}

// pages/sign-up.js
import { SignUp } from "@clerk/nextjs";
export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <SignUp redirectUrl="/practice" />
    </main>
  );
}
