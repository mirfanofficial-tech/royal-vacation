import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { api, resolveAssetUrl } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await api.cms.pages.get(slug).catch(() => null);
  if (!page) return {};
  return {
    title: page.meta_title || `${page.title} | Royal Vacation`,
    description: page.meta_description || page.excerpt || undefined,
  };
}

export default async function CmsPageDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await api.cms.pages.get(slug).catch(() => null);
  if (!page) notFound();

  const sanitizedContent = DOMPurify.sanitize(page.content);

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/40">
        <div className="mx-auto max-w-3xl px-10 py-6 lg:px-24">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              ...(page.parent_title ? [{ label: page.parent_title }] : []),
              { label: page.title },
            ]}
          />

          <article className="mt-4">
            <h1 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
              {page.title}
            </h1>
            {page.excerpt && (
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">{page.excerpt}</p>
            )}

            {page.featured_image_url && (
              <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={resolveAssetUrl(page.featured_image_url)}
                  alt={page.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 768px, 100vw"
                  priority
                />
              </div>
            )}

            <div
              className="prose prose-sm sm:prose-base mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
