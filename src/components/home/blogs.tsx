import Image from "next/image";
import Link from "next/link";
import { featuredBlogs } from "@/lib/mock-data";

export function Blogs() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-navy">Featured Blogs</h2>
        <Link href="#" className="text-sm font-semibold text-gold hover:underline">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredBlogs.map((post) => (
          <Link key={post.id} href="#" className="group flex flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <h3 className="line-clamp-2 font-heading text-base font-semibold text-navy group-hover:underline">
              {post.title}
            </h3>
            <p className="text-xs text-muted-foreground">{post.date}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
