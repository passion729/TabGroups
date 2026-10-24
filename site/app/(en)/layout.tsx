import { content } from "@/lib/content";
import { Root, metadataFor } from "../root";

export { viewport } from "../root";
export const metadata = metadataFor(content.en);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Root lang="en">{children}</Root>;
}
