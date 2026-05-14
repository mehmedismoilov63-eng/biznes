import type { Metadata } from "next";
import { VerifyOtpForm } from "../../../../components/features/auth/verify-otp-form";

export const metadata: Metadata = { title: "SMS tasdiqlash" };

export default function VerifyOtpPage() {
  return <VerifyOtpForm />;
}
