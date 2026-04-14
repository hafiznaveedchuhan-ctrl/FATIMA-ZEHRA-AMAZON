import { PRODUCTS } from '@/lib/products'
import ProductDetailClient from '@/components/ProductDetailClient'

export async function generateStaticParams() {
  return PRODUCTS.map((product: any) => ({
    id: product.id.toString(),
  }))
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient params={params} />
}
