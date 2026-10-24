import { content } from "@/lib/content";
import { Root, metadataFor } from "../root";

export { viewport } from "../root";
export const metadata = metadataFor(content.zh);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Root lang="zh-CN">{children}</Root>;
}
