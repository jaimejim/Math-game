import type { Metadata } from "next";
import ManifestSwap from "./ManifestSwap";

export const metadata: Metadata = {
  title: "Mates",
};

export default function NumerosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ManifestSwap />
      {children}
    </>
  );
}
