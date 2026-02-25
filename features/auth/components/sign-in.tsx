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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SignInSchema, signInSchema } from "../utils/sign-in-schema";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Chuỗi suy nghĩ của robot (loop)
  const thoughts = useMemo(
    () => [
      "Hôm nay mình có thể hỗ trợ gì cho bạn tại Đại học Kiến trúc?",
      "Tôi sẽ trợ giúp bạn, cứ hỏi bất kỳ điều gì nhé.",
      "Đại học Kiến trúc rất tuyệt, cùng khám phá thêm nào!",
    ],
    [],
  );
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [fadeThought, setFadeThought] = useState(true);
  const [showBubble, setShowBubble] = useState(true);
  const [isTypingDots, setIsTypingDots] = useState(true);

  // Điều khiển flow suy nghĩ: delay nhẹ → 3 chấm → text → fade out → ẩn bubble → bubble mới + câu mới
  useEffect(() => {
    const appearDelay = 300; // độ trễ trước khi bubble mới xuất hiện
    const typingDuration = 1400;
    const textVisibleDuration = 5500;
    const fadeDuration = 800;
    const gapAfterHide = 400;

    // Reset state ngay khi đổi câu, nhưng chưa show bubble
    setShowBubble(false);
    setFadeThought(false);
    setIsTypingDots(true);

    // 1) Chờ 1 chút rồi cho bubble mới xuất hiện + 3 chấm
    const appearTimer = setTimeout(() => {
      setShowBubble(true);
      setFadeThought(true);
    }, appearDelay);

    // 2) Sau khi bubble xuất hiện, hiển thị 3 chấm trong một khoảng
    const dotsTimer = setTimeout(() => {
      setIsTypingDots(false);
    }, appearDelay + typingDuration);

    // 3) Giữ text thêm một lúc rồi fade out bubble
    const fadeTimer = setTimeout(
      () => {
        setFadeThought(false);
      },
      appearDelay + typingDuration + textVisibleDuration,
    );

    // 4) Sau khi fade xong, ẩn hẳn bubble
    const hideTimer = setTimeout(
      () => {
        setShowBubble(false);
      },
      appearDelay + typingDuration + textVisibleDuration + fadeDuration,
    );

    // 5) Đổi câu và khởi động lại chu kỳ sau một khoảng nhỏ
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
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
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
    <div className="relative grid min-h-screen w-full lg:grid-cols-2 bg-[#0f172a]">
      {/* Left Column - Animated Background */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* Lớp nền chung theo modern-minimal */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#91dbfd33,_transparent_55%),radial-gradient(circle_at_bottom,_#3c86fc44,_transparent_55%)]" />
        <div className="absolute inset-0 bg-linear-to-br from-[#91dbfd33] via-transparent to-[#3c86fc33]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Blob lớn */}
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-linear-to-br from-[#91dbfd] to-[#3c86fc] opacity-30 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute -bottom-32 -right-10 h-80 w-80 rounded-full bg-linear-to-br from-[#5bc5ff] to-[#3b82f6] opacity-30 blur-3xl animate-[pulse_6s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-[#1e3a8a] to-transparent opacity-40 blur-3xl" />

        {/* Hình khối nhỏ animate thêm chiều sâu */}
        <div className="absolute top-16 right-24 h-16 w-16 rotate-45 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-28 left-16 h-14 w-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_5s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 left-1/5 h-10 w-10 rotate-12 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_7s_ease-in-out_infinite_0.5s]" />
        <div className="absolute top-1/3 right-1/3 h-8 w-8 -rotate-12 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_8s_ease-in-out_infinite_1.5s]" />
        <div className="absolute bottom-12 right-1/4 h-6 w-16 rounded-full border border-white/5 bg-white/5/40 backdrop-blur-sm animate-[pulse_7s_ease-in-out_infinite_2s]" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* Header Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <Image
                src="/logocon/Logo_HAU.png"
                alt="logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-1 leading-none">
              <span className="text-md font-bold text-white tracking-wide">
                Đại học Kiến trúc Hà Nội
              </span>
              <span className="text-xs text-[#93c5fd] mt-0.5 tracking-wider uppercase font-medium">
                HANOI ARCHITECTURAL UNIVERSITY{" "}
              </span>
            </div>
          </Link>

          {/* Center: Lottie + Thought + Tagline */}
          <div className="flex flex-col items-center gap-6">
            {/* Lottie */}
            <div className="relative w-72 h-72">
              <div className="relative rounded-3xl border border-white/10 bg-white/5 overflow-hidden w-full h-full">
                <img
                  src="/Ai-Robot-Vector-Art_2026.gif"
                  alt="robot"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bubble suy nghĩ của robot (loop với text thường, zoom-in và fade cùng lúc) */}
              {showBubble && (
                <motion.div
                  className="absolute -top-6 -right-40 translate-x-4"
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{
                    opacity: fadeThought ? 1 : 0,
                    y: fadeThought ? 0 : -6,
                    scale: fadeThought ? 1 : 0.96,
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {/* Bubble chính */}
                  <div
                    className="relative w-64 min-h-[64px] 
                    rounded-2xl 
                    border border-white/15 
                    bg-slate-900/80 
                    px-4 py-3 
                    shadow-lg shadow-slate-900/60 
                    backdrop-blur-md 
                    flex items-center

                    after:content-['']
                    after:absolute
                    after:-bottom-3
                    after:left-8
                    after:w-0
                    after:h-0
                    after:border-l-[10px]
                    after:border-l-transparent
                    after:border-r-[10px]
                    after:border-r-transparent
                    after:border-t-[12px]
                    after:border-t-slate-900/80
                  "
                  >
                    {/* Nội dung (zoom in khi câu mới xuất hiện) */}
                    <motion.div
                      key={thoughtIndex}
                      className="flex items-center"
                      initial={{ opacity: 0, scale: 0.9, y: 4 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <p className="text-xs text-slate-50/90">
                        {thoughts[thoughtIndex]}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Heading */}
            <div className="text-center space-y-3 max-w-sm mt-4">
              {/* <div className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/30 px-4 py-1.5 text-xs font-semibold text-[#93c5fd] tracking-widest uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5bc5ff] animate-pulse" />
                AI Chatbot System
              </div> */}
              <h2 className="text-3xl font-bold tracking-tight text-white leading-snug">
                Chatbot hỗ trợ sinh viên{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-[#91dbfd] to-[#3b82f6]">
                  HAU AGENT
                </span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Hệ thống tư vấn thông minh ứng dụng trí tuệ nhân tạo, giúp hỗ
                trợ sinh viên, giảng viên và cán bộ Đại học Kiến trúc 24/7.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
              {[
                { value: "24/7", label: "Hỗ trợ" },
                { value: "AI", label: "Công nghệ" },
                { value: "HAU", label: "Đại học" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 py-3 backdrop-blur-sm"
                >
                  <span className="text-lg font-bold text-white">
                    {item.value}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-zinc-500 text-center">
            © {new Date().getFullYear()} Trường Đại học Kiến trúc Hà Nội. All
            rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Sign In Form */}
      <div className="relative flex items-center justify-center overflow-hidden p-6 lg:p-12">
        {/* Nền dùng chung với cột trái để đồng nhất */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#91dbfd33,_transparent_55%),radial-gradient(circle_at_bottom,_#3c86fc44,_transparent_55%)]" />
        {/* <div className="absolute inset-0 bg-linear-to-br from-[#91dbfd33] via-transparent to-[#3c86fc33]" /> */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Blob lớn đồng bộ màu */}
        {/* <div className="pointer-events-none absolute -top-24 -right-10 h-72 w-72 rounded-full bg-linear-to-br from-[#91dbfd] to-[#3c86fc] opacity-30 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" /> */}
        {/* <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-linear-to-br from-[#5bc5ff] to-[#3b82f6] opacity-25 blur-3xl animate-[pulse_7s_ease-in-out_infinite_1s]" /> */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-[#1e3a8a] to-transparent opacity-35 blur-3xl" />

        {/* Nhiều hình khối nhỏ hơn cho cân bố cục */}
        <div className="absolute top-16 left-10 h-12 w-12 rotate-45 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-24 right-12 h-10 w-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_9s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/3 right-1/4 h-9 w-9 -rotate-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm animate-[bounce_10s_ease-in-out_infinite_1.4s]" />
        <div className="absolute bottom-12 left-1/3 h-7 w-16 rounded-full border border-white/5 bg-white/5/40 backdrop-blur-sm animate-[pulse_9s_ease-in-out_infinite_2s]" />
        {/* Thêm một vài shape nhỏ để làm nền phong phú hơn */}
        <div className="absolute top-1/4 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border border-white/10 bg-white/10 backdrop-blur-sm" />
        <div className="absolute top-2/3 left-8 h-8 w-8 rotate-12 rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm" />

        {/* Stars */}
        <div className="absolute top-20 right-1/4 h-6 w-6 bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse star-shape" />
        <div className="absolute top-50 right-24 h-6 w-6 bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse star-shape" />

        <div className="relative mx-auto w-full max-w-[480px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#3b82f6] to-[#1e40af] text-sm font-black text-white shadow-md shadow-blue-500/30">
              UA
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white">
                Đại học Kiến trúc
              </span>
              <span className="text-[11px] text-[#93c5fd]">
                Chatbot AI System
              </span>
            </div>
          </div>

          {/* Card wrapper */}
          <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_8px_40px_rgba(15,23,42,0.5)] backdrop-blur-xl px-9 py-9 space-y-7">
            {/* Heading */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-3 py-1 text-[11px] font-semibold text-[#3b82f6] tracking-wider uppercase mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                Hệ thống quản trị
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Đăng nhập
              </h1>
              <p className="text-zinc-400 text-sm">
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
                      <FormLabel className="text-sm font-medium text-zinc-200">
                        Tên đăng nhập
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nhập tên đăng nhập"
                          disabled={isLoading}
                          className="h-11 bg-white/5 border-white/10 text-white rounded-lg focus-visible:ring-[#3b82f6] focus-visible:ring-1 focus-visible:border-[#3b82f6]/60 transition-all placeholder:text-zinc-500"
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
                        <FormLabel className="text-sm font-medium text-zinc-200">
                          Mật khẩu
                        </FormLabel>
                        <Link
                          href="/reset-password-1"
                          className="text-xs text-[#3b82f6] hover:text-[#2563eb] transition-colors font-medium"
                        >
                          Quên mật khẩu?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu"
                            disabled={isLoading}
                            className="h-11 bg-white/5 border-white/10 text-white rounded-lg focus-visible:ring-[#3b82f6] focus-visible:ring-1 focus-visible:border-[#3b82f6]/60 transition-all placeholder:text-zinc-500 pr-11"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
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

          {/* Below card hint */}
          <p className="mt-5 text-center text-xs text-white leading-relaxed">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-zinc-400 transition-colors">
              Điều khoản sử dụng
            </span>{" "}
            và{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-zinc-400 transition-colors">
              Chính sách bảo mật
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
