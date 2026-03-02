"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  MessageSquareText,
  BrainCircuit,
  GraduationCap,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SignInSchema, signInSchema } from "../utils/sign-in-schema";
import Image from "next/image";
import { motion } from "framer-motion";
import { LogoStepper } from "@/components/ui/logo-stepper";

export default function SignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const featureLogos = useMemo(
    () => [
      {
        icon: (
          <MessageSquareText className="w-6 h-6 text-white dark:text-[#60a5fa]" />
        ),
        label: "Hỏi đáp",
      },
      {
        icon: (
          <BrainCircuit className="w-6 h-6 text-white dark:text-[#60a5fa]" />
        ),
        label: "AI thông minh",
      },
      {
        icon: (
          <GraduationCap className="w-6 h-6 text-white dark:text-[#60a5fa]" />
        ),
        label: "Học thuật",
      },
      {
        icon: (
          <ShieldCheck className="w-6 h-6 text-white dark:text-[#60a5fa]" />
        ),
        label: "Bảo mật",
      },
      {
        icon: <Clock className="w-6 h-6 text-white dark:text-[#60a5fa]" />,
        label: "24/7",
      },
    ],
    [],
  );

  const thoughts = useMemo(
    () => [
      "Hôm nay mình có thể hỗ trợ gì cho bạn tại Đại học Kiến trúc?",
      "Hệ thống tư vấn thông minh ứng dụng trí tuệ nhân tạo, luôn sẵn sàng hỗ trợ 24/7.",
      "Mình ở đây để hỗ trợ sinh viên, giảng viên và cán bộ Đại học Kiến trúc.",
    ],
    [],
  );
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [fadeThought, setFadeThought] = useState(true);
  const [showBubble, setShowBubble] = useState(true);
  const [isTypingDots, setIsTypingDots] = useState(true);

  useEffect(() => {
    const appearDelay = 300;
    const typingDuration = 1400;
    const textVisibleDuration = 5500;
    const fadeDuration = 800;
    const gapAfterHide = 400;

    setShowBubble(false);
    setFadeThought(false);
    setIsTypingDots(true);

    const appearTimer = setTimeout(() => {
      setShowBubble(true);
      setFadeThought(true);
    }, appearDelay);

    const dotsTimer = setTimeout(() => {
      setIsTypingDots(false);
    }, appearDelay + typingDuration);

    const fadeTimer = setTimeout(
      () => {
        setFadeThought(false);
      },
      appearDelay + typingDuration + textVisibleDuration,
    );

    const hideTimer = setTimeout(
      () => {
        setShowBubble(false);
      },
      appearDelay + typingDuration + textVisibleDuration + fadeDuration,
    );

    const nextTimer = setTimeout(
      () => {
        setThoughtIndex((prev) => (prev + 1) % thoughts.length);
      },
      appearDelay +
        typingDuration +
        textVisibleDuration +
        fadeDuration +
        gapAfterHide,
    );

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(dotsTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [thoughtIndex, thoughts.length]);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInSchema) => {
    try {
      setIsLoading(true);
      await login(data.username, data.password);
      toast.success("Đăng nhập thành công!");
      const callbackUrl = searchParams.get("callbackUrl") || "/chats";
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden
        [background:linear-gradient(135deg,#5f9afa_45%,#3c86fc_45%,#3c86fc_75%,#b9dff7_100%)]
        dark:[background:#0f172a]"
    >
      {/* ===== GLOBAL BACKGROUND LAYERS ===== */}
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_top,#91dbfd33,transparent_55%),radial-gradient(circle_at_bottom,#3c86fc44,transparent_55%)]" />
      <div className="hidden dark:block absolute inset-0 bg-linear-to-br from-[#91dbfd22] via-transparent to-[#3c86fc22]" />
      <div
        className="absolute inset-0 opacity-[0.06] dark:opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Global blobs */}
      <div className="absolute -top-[10%] -left-[5%] h-[30%] w-[20%] rounded-full bg-white/40 dark:bg-blue-400/20 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute -bottom-[10%] right-[20%] h-[30%] w-[22%] rounded-full bg-white/30 dark:bg-sky-400/15 blur-3xl animate-[pulse_6s_ease-in-out_infinite_1s]" />
      <div className="absolute top-[30%] right-[5%] h-[25%] w-[18%] rounded-full bg-white/20 dark:bg-[#1e3a8a]/40 blur-3xl" />
      {/* Logo – 8% chiều rộng column */}
      <Link
        href="/"
        className="flex items-center gap-2 absolute top-[5%] translate-x-[50%]"
      >
        <div className="flex items-center justify-center bg-white rounded-lg shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-105 dark:bg-transparent">
          <Image
            src="/logocon/Logo_HAU.png"
            alt="logo"
            width={36}
            height={36}
            className="w-[4vh] h-[4vh] min-w-7 min-h-7 object-contain"
          />
        </div>
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="text-sm font-bold text-white tracking-wide">
            Đại học Kiến trúc Hà Nội
          </span>
          <span className="text-[10px] text-white/80 dark:text-[#93c5fd] tracking-wider uppercase font-medium">
            HANOI ARCHITECTURAL UNIVERSITY
          </span>
        </div>
      </Link>
      <div className="relative min-h-screen flex flex-col lg:grid lg:grid-cols-2">
        {/* ===== RIGHT COLUMN – Form + Mobile (50% màn hình) ===== */}

        <div className="flex flex-col flex-1 relative overflow-hidden">
          {/* Floating shapes – % */}

          <div className="absolute top-[8%] left-[5%] h-[3%] w-[3%] rotate-45 rounded-lg border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-sm animate-[bounce_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-[10%] right-[6%] h-[2.5%] w-[2.5%] rounded-full border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-sm animate-[bounce_9s_ease-in-out_infinite_1s]" />

          {/* Stars – dark only */}
          <div className="hidden dark:block absolute top-[10%] right-[25%] h-6 w-6 bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse star-shape" />
          <div className="hidden dark:block absolute bottom-[15%] right-[12%] h-5 w-5 bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse star-shape" />

          {/* ===== MOBILE BRANDING (lg:hidden) ===== */}
          <div
            className="lg:hidden relative overflow-hidden
              [background:linear-gradient(135deg,#91dbfd_0%,#3c86fc_45%,#5bc5ff_75%,#b9dff7_100%)]
              dark:[background:linear-gradient(160deg,#0f172a_0%,#1e3a8a_60%,#0f172a_100%)]
              pt-[5%] pb-[10%] px-[6%]"
          >
            <div className="absolute -top-[8%] -right-[8%] h-[35%] w-[35%] rounded-full bg-white/25 dark:bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-[8%] -left-[5%] h-[30%] w-[30%] rounded-full bg-white/20 dark:bg-sky-500/15 blur-3xl" />

            {/* Mobile logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-2.5 mb-[5%]"
            >
              <Image
                src="/logocon/Logo_HAU.png"
                alt="logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-white">
                  Đại học Kiến trúc Hà Nội
                </span>
                <span className="text-[10px] text-white/75 uppercase tracking-wider">
                  HANOI ARCHITECTURAL UNIVERSITY
                </span>
              </div>
            </Link>

            {/* Mobile GIF: 50% ngang viewport */}
            <div className="relative z-10 mx-auto w-[50%] max-w-[220px] aspect-square">
              <Image
                src="/Ai-Robot-Vector-Art_2026.gif"
                alt="robot"
                width={208}
                height={208}
                className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(59,130,246,0.3)]"
              />

              {/* Mobile bubble: cố định trên đỉnh đầu GIF */}
              {showBubble && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[105%]"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{
                    opacity: fadeThought ? 1 : 0,
                    scale: fadeThought ? 1 : 0.96,
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div
                    className="relative min-w-[160px] max-w-[220px] w-max min-h-[44px]
                    rounded-xl
                    border border-white/50 dark:border-white/15
                    bg-white/30 dark:bg-slate-950/90
                    backdrop-blur-xl
                    px-3 py-2.5
                    shadow-[0_6px_20px_rgba(0,0,0,0.1)] dark:shadow-lg
                    flex items-center"
                  >
                    <div className="absolute top-1.5 right-2 flex items-center gap-0.5 opacity-50">
                      <span className="h-1 w-1 rounded-full bg-white dark:bg-slate-400" />
                      <span className="h-1 w-1 rounded-full bg-white dark:bg-slate-400" />
                      <span className="h-1 w-1 rounded-full bg-white dark:bg-slate-400" />
                    </div>
                    <motion.div
                      key={`m-${thoughtIndex}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="flex items-center w-full"
                    >
                      {isTypingDots ? (
                        <div className="flex items-center gap-1.5 px-1 py-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-white leading-relaxed">
                            Suy nghĩ
                          </p>
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-300 animate-pulse"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="h-2 w-2 rounded-full bg-white dark:bg-slate-300 animate-pulse"
                            style={{ animationDelay: "200ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-white dark:bg-slate-300 animate-pulse"
                            style={{ animationDelay: "400ms" }}
                          />
                        </div>
                      ) : (
                        <p className="text-[11px] text-white dark:text-slate-100/90 leading-snug">
                          {thoughts[thoughtIndex]}
                        </p>
                      )}
                    </motion.div>
                    <div
                      className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0
                      border-l-8 border-l-transparent
                      border-r-8 border-r-transparent
                      border-t-10
                      border-t-white/30 dark:border-t-slate-950/90"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Mobile tagline */}
            <div className="relative z-10 text-center mt-[10%] space-y-3">
              <h2 className="text-xl font-bold text-white leading-snug">
                Chatbot hỗ trợ sinh viên{" "}
                <span className="font-black">HAU AGENT</span>
              </h2>
              <p className="text-xs text-white/70">
                Hệ thống hỗ trợ thông minh 24/7
              </p>
            </div>
          </div>

          {/* ===== FORM AREA – 85% ngang, center ===== */}
          <div className="flex-1 flex items-center justify-center p-[5%]">
            <div className="w-[90%] max-w-[600px] space-y-5 py-5">
              {/* Form card */}
              <div
                className="rounded-2xl
                  border border-white/30 dark:border-white/10
                  bg-white dark:bg-slate-900/70
                  shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(59,130,246,0.1)]
                  dark:shadow-[0_8px_40px_rgba(15,23,42,0.5)]
                  backdrop-blur-xl
                  px-[8%] py-[6%]
                  space-y-6"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-3 py-1 text-[11px] font-semibold text-[#3b82f6] tracking-wider uppercase mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                    Hệ thống quản trị
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Đăng nhập
                  </h1>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm">
                    Nhập thông tin tài khoản của bạn để tiếp tục
                  </p>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-zinc-200">
                            Tên đăng nhập
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Nhập tên đăng nhập"
                              disabled={isLoading}
                              className="h-11 bg-white dark:bg-white/5 border dark:border-white/10 text-gray-900 dark:text-white rounded-lg focus-visible:ring-[#3b82f6] focus-visible:ring-1 focus-visible:border-[#3b82f6]/60 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-zinc-200">
                              Mật khẩu
                            </FormLabel>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nhập mật khẩu"
                                disabled={isLoading}
                                className="h-11 bg-white/60 dark:bg-white/5 border dark:border-white/10 text-gray-900 dark:text-white rounded-lg focus-visible:ring-[#3b82f6] focus-visible:ring-1 focus-visible:border-[#3b82f6]/60 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500 pr-11"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                                tabIndex={-1}
                              >
                                {showPassword ? (
                                  <EyeOff className="size-4.5" />
                                ) : (
                                  <Eye className="size-4.5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      className="h-11 w-full bg-linear-to-r from-[#3b82f6] to-[#1e40af] font-semibold text-white rounded-lg transition-all duration-200 hover:from-[#2563eb] hover:to-[#1d4ed8] hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Đang đăng nhập...
                        </span>
                      ) : (
                        "Đăng nhập"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>

              <p className="text-center text-xs text-white dark:text-white/50 leading-relaxed">
                Bằng cách đăng nhập, bạn đồng ý với{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-white dark:hover:text-zinc-300 transition-colors">
                  Điều khoản sử dụng
                </span>{" "}
                và{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-white dark:hover:text-zinc-300 transition-colors">
                  Chính sách bảo mật
                </span>
                .
              </p>
            </div>
          </div>

          {/* Mobile footer */}
          <div className="lg:hidden px-[6%] pb-[4%]">
            <p className="text-xs text-white/50 dark:text-zinc-500 text-center">
              © {new Date().getFullYear()} Trường Đại học Kiến trúc Hà Nội. All
              rights reserved.
            </p>
          </div>
        </div>
        {/* ===== LEFT COLUMN – Desktop branding (50% màn hình) ===== */}
        <div className="hidden lg:flex flex-col relative overflow-hidden">
          {/* Floating shapes – % of column */}
          <div className="absolute top-[8%] right-[12%] h-[5%] w-[5%] rotate-45 rounded-xl border border-white/30 dark:border-white/10 bg-white/15 dark:bg-white/5 backdrop-blur-sm animate-[bounce_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-[10%] left-[8%] h-[4%] w-[4%] rounded-full border border-white/30 dark:border-white/10 bg-white/15 dark:bg-white/5 backdrop-blur-sm animate-[bounce_5s_ease-in-out_infinite_1s]" />

          <div className="relative z-10 flex h-full flex-col justify-center pb-[5%] pt-[20%]">
            {/* GIF + Title/Description (ngang) + LogoStepper (dưới) */}
            <div className="flex flex-col items-center gap-6">
              {/* Row: GIF bên trái – Text bên phải */}
              <div className="flex items-center gap-6 w-full max-w-[640px]">
                {/* GIF */}
                <div className="relative w-2/5 shrink-0 aspect-square max-w-[280px]">
                  <Image
                    src="/Ai-Robot-Vector-Art_2026.gif"
                    alt="robot"
                    width={320}
                    height={320}
                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.35)]"
                  />

                  {/* Bubble: cố định trên đỉnh đầu GIF */}
                  {showBubble && (
                    <motion.div
                      className="absolute top-0 left-1/2 -translate-x-1/10 -translate-y-[110%]"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{
                        opacity: fadeThought ? 1 : 0,
                        scale: fadeThought ? 1 : 0.92,
                      }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-[#3b82f6]/40 via-[#93c5fd]/30 to-[#3b82f6]/40 dark:from-[#3b82f6]/25 dark:via-[#60a5fa]/20 dark:to-[#3b82f6]/25 blur-sm" />

                      <div
                        className="relative min-w-[200px] max-w-[300px] w-max min-h-[56px]
                        rounded-2xl
                        border-4 border-[#60a5fa] dark:border-[#3b82f6]/30
                        bg-white dark:bg-[#0d1524]
                        px-4 py-3
                        shadow-[0_12px_40px_rgba(59,130,246,0.25),0_4px_12px_rgba(0,0,0,0.1)]
                        dark:shadow-[0_12px_40px_rgba(59,130,246,0.2),0_0_0_1px_rgba(59,130,246,0.1)]
                        flex items-center"
                      >
                        <motion.div
                          key={thoughtIndex}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                          className="flex items-center w-full pl-2"
                        >
                          {isTypingDots ? (
                            <div className="flex items-center gap-2 py-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-white leading-relaxed">
                                Suy nghĩ
                              </p>
                              <span
                                className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]/60 dark:bg-[#60a5fa]/60 animate-pulse"
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className="h-3 w-3 rounded-full bg-[#3b82f6] dark:bg-[#60a5fa] animate-pulse"
                                style={{ animationDelay: "200ms" }}
                              />
                              <span
                                className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]/60 dark:bg-[#60a5fa]/60 animate-pulse"
                                style={{ animationDelay: "400ms" }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-gray-800 dark:text-white leading-relaxed">
                              {thoughts[thoughtIndex]}
                            </p>
                          )}
                        </motion.div>

                        <div className="absolute -bottom-[16px] left-1/10">
                          <div
                            className="relative w-0 h-0
                            border-l-10 border-l-transparent
                            border-r-20 border-r-transparent
                            border-t-20
                            border-t-white dark:border-t-[#0f1d3a]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Title + Description */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="text-2xl xl:text-3xl 2xl:text-4xl font-black tracking-tight text-white">
                    HAU AGENT
                  </div>
                  <p className="text-white dark:text-zinc-400 text-xs xl:text-sm leading-relaxed pr-[10%]">
                    Hệ thống tư vấn thông minh ứng dụng trí tuệ nhân tạo, hỗ trợ
                    tư vấn tuyển sinh 24/7 và giúp quản lý giảng viên, cán bộ
                    Đại học Kiến trúc Hà Nội mọi lúc, mọi nơi.
                  </p>
                </div>
              </div>

              {/* LogoStepper – feature carousel */}
              <div className="w-full max-w-[640px] [&_.rounded-xl]:bg-white/15 [&_.rounded-xl]:dark:bg-white/5 [&_.rounded-xl]:border-white/25 [&_.rounded-xl]:dark:border-white/10 [&_.text-muted-foreground]:text-white/70 [&_.text-muted-foreground]:dark:text-zinc-400 [&_.bg-border]:bg-white/25 [&_.bg-border]:dark:bg-white/10">
                <LogoStepper
                  logos={featureLogos}
                  animationDuration={0.5}
                  animationDelay={5}
                  direction="loop"
                  visibleCount={5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
