import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const title = "ScamMirror 防诈镜｜转账之前，照一照";
  const description =
    "上传或粘贴可疑信息，标出风险证据，并获得一条更安全的独立核验路径。";

  return {
    title,
    description,
    applicationName: "ScamMirror 防诈镜",
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    keywords: ["反诈", "诈骗识别", "AI safety", "ScamMirror"],
    openGraph: {
      title: "ScamMirror 防诈镜",
      description: "不猜真假，帮你停下来核验。",
      type: "website",
      locale: "zh_CN",
      images: [
        {
          url: `${baseUrl}/og.png`,
          width: 1200,
          height: 630,
          alt: "ScamMirror 防诈镜｜转账之前，照一照",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "ScamMirror 防诈镜",
      description: "不猜真假，帮你停下来核验。",
      images: [`${baseUrl}/og.png`],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f3f0e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
