import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { LoginForm } from "../../../../components/features/auth/login-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("login") };
}

export default function LoginPage() {
  return <LoginForm />;
}
