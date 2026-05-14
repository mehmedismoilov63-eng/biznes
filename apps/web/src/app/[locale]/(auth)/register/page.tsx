import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { RegisterForm } from "../../../../components/features/auth/register-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("register") };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
