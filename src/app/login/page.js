import AuthLayout from "@/app/auth/layout";
import LoginPage from "@/app/auth/login/page";

export default function LoginRedirectPage() {
  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  );
}
