import { LoginForm } from "@/components/auth/login-form";
import Logo from "@/components/Logo";
import LoginPanel from "@/components/auth/LoginPanel";

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col gap-4 p-6 md:p-10 bg-background">
        {/* subtle top gradient strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <LoginPanel />
    </div>
  );
}
