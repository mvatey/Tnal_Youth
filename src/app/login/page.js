import AuthLayout from "@/app/auth/layout";
import LoginForm from "@/components/auth/loginForm";

export default function LoginRedirectPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
