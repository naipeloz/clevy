import Link from "next/link";
import { BrandLockup } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDict } from "@/lib/i18n";

export async function PublicHeader() {
  const t = await getDict();
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 48px",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <BrandLockup />
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LanguageSwitcher />
        <Link
          href="/login"
          style={{
            fontSize: 13,
            color: "var(--fg)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {t.publicJobs.signIn}
        </Link>
      </div>
    </header>
  );
}
