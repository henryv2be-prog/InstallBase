import { notFound } from "next/navigation";
import { getProduct } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { PostCard } from "@/components/feed/post-card";
import { Badge } from "@/components/ui/badge";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProduct(slug), auth()]);
  if (!product) notFound();

  const posts = product.postProducts.map((pp) => pp.post);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Badge variant="secondary">{product.brand?.name}</Badge>
        <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
        {product.model && <p className="text-gray-500">Model: {product.model}</p>}
        {product.description && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">{product.description}</p>
        )}
        <p className="mt-4 text-sm text-gray-500">
          Used in {posts.length} installation{posts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-bold">Posts using this product</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
        ))}
      </div>
    </div>
  );
}
