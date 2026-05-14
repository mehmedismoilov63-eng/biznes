import { Body, Controller, Get, Inject, Post, UnauthorizedException } from "@nestjs/common";
import { OtpPurpose } from "@prisma/client";
import { createToken, getCurrentUserId, hashPassword, OTP_CODE, OTP_TTL_SECONDS } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

type AuthUserResponse = {
  id: string;
  phone: string;
  role: string;
  language: string;
  profile: unknown;
};

type TokenResponse = {
  user: AuthUserResponse;
  accessToken: string;
};

const OTP_EXPIRES_MS = OTP_TTL_SECONDS * 1000;

@Controller("auth")
export class AuthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Post("register")
  async register(@Body() body: { phone?: unknown; password?: unknown }): Promise<{ otpToken: string; expiresIn: number; debugCode: string; message: string }> {
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!phone || !password) {
      throw new UnauthorizedException("Telefon va parol majburiy");
    }

    await this.prisma.user.upsert({
      where: { phone },
      update: { passwordHash: hashPassword(password) },
      create: {
        phone,
        passwordHash: hashPassword(password),
        profile: {
          create: {
            firstName: "Yangi",
            lastName: "Foydalanuvchi",
            username: `user_${createToken("u").slice(2, 8)}`,
          },
        },
      },
    });

    const otp = await this.prisma.otpCode.create({
      data: {
        phone,
        codeHash: hashPassword(OTP_CODE),
        purpose: OtpPurpose.REGISTER,
        expiresAt: new Date(Date.now() + OTP_EXPIRES_MS),
      },
    });

    return {
      otpToken: otp.id,
      expiresIn: OTP_TTL_SECONDS,
      debugCode: OTP_CODE,
      message: "OTP SMS yuborildi",
    };
  }

  @Post("verify-otp")
  async verifyOtp(@Body() body: { otpToken?: unknown; code?: unknown }): Promise<TokenResponse & { ok: true }> {
    const otpToken = typeof body.otpToken === "string" ? body.otpToken : "";
    const code = typeof body.code === "string" ? body.code : "";
    const otp = await this.prisma.otpCode.findUnique({ where: { id: otpToken } });

    if (!otp || otp.consumedAt || otp.expiresAt < new Date() || otp.codeHash !== hashPassword(code)) {
      throw new UnauthorizedException("OTP kod noto'g'ri");
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { phone: otp.phone },
      include: { profile: true },
    });

    return {
      ok: true,
      user,
      accessToken: createToken("access"),
    };
  }

  @Post("login")
  async login(@Body() body: { phone?: unknown; password?: unknown }): Promise<TokenResponse> {
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { profile: true },
    });

    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new UnauthorizedException("Telefon yoki parol noto'g'ri");
    }

    return {
      user,
      accessToken: createToken("access"),
    };
  }

  @Post("resend-otp")
  async resendOtp(@Body() body: { otpToken?: unknown }): Promise<{ otpToken: string; expiresIn: number; debugCode: string }> {
    const otpToken = typeof body.otpToken === "string" ? body.otpToken : "";
    const original = await this.prisma.otpCode.findUnique({ where: { id: otpToken } });
    if (!original || original.consumedAt || original.expiresAt < new Date()) {
      throw new UnauthorizedException("Asl OTP topilmadi yoki muddati o'tgan");
    }

    await this.prisma.otpCode.update({ where: { id: otpToken }, data: { consumedAt: new Date() } });

    const newOtp = await this.prisma.otpCode.create({
      data: {
        phone: original.phone,
        codeHash: hashPassword(OTP_CODE),
        purpose: OtpPurpose.REGISTER,
        expiresAt: new Date(Date.now() + OTP_EXPIRES_MS),
      },
    });

    return { otpToken: newOtp.id, expiresIn: OTP_TTL_SECONDS, debugCode: OTP_CODE };
  }

  @Post("refresh")
  refresh(): { accessToken: string } {
    return { accessToken: createToken("access") };
  }

  @Post("logout")
  logout(): { ok: true } {
    return { ok: true };
  }

  @Get("me")
  async me(): Promise<AuthUserResponse> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: getCurrentUserId() },
      include: { profile: true },
    });
  }
}
