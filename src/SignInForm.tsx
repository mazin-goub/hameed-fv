"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);

    try {
      // Wait for signIn to complete – this ensures Convex auth state updates
      await signIn("password", formData);

      // Optional: small delay to let auth propagate (usually not needed, but safe)
      // No need to navigate – the app will automatically switch to Authenticated view
      toast.success(flow === "signIn" ? "Signed in successfully!" : "Account created!");
    } catch (error: any) {
      let toastTitle = "";
      if (error.message.includes("Invalid password")) {
        toastTitle = "Invalid password. Please try again.";
      } else if (error.message.includes("already exists")) {
        toastTitle = "An account with this email already exists.";
      } else {
        toastTitle =
          flow === "signIn"
            ? "Could not sign in, did you mean to sign up?"
            : "Could not sign up, did you mean to sign in?";
      }
      toast.error(toastTitle);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all"
          style={{
            backgroundColor: '#451a03',
            borderColor: '#facc15',
            color: '#fadd8c',
          }}
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="w-full px-4 py-3 rounded-lg border-2 outline-none transition-all"
          style={{
            backgroundColor: '#451a03',
            borderColor: '#facc15',
            color: '#fadd8c',
          }}
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button
          className="w-full px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(to right, #facc15, #d97706)',
            color: '#451a03',
          }}
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Please wait..." : flow === "signIn" ? "Sign in" : "Sign up"}
        </button>

        <div className="text-center text-sm" style={{ color: '#d97706' }}>
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="font-medium hover:underline cursor-pointer"
            style={{ color: '#fadd8c' }}
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow" style={{ borderColor: '#facc15' }} />
        <span className="mx-4" style={{ color: '#fadd8c' }}>or</span>
        <hr className="my-4 grow" style={{ borderColor: '#facc15' }} />
      </div>

      <button
        className="w-full px-4 py-3 rounded-lg font-semibold transition-all"
        style={{
          background: 'linear-gradient(to right, #facc15, #d97706)',
          color: '#451a03',
        }}
        onClick={async () => {
          setSubmitting(true);
          try {
            await signIn("anonymous");
            toast.success("Signed in anonymously!");
          } catch {
            toast.error("Anonymous sign-in failed");
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={submitting}
      >
        Sign in anonymously
      </button>
    </div>
  );
}