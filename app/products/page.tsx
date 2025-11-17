import { ProductsPage } from '@/src/components/ui/products-page'

export default function Home({
  searchParams }: { 
  searchParams: { fbUserId?: string } 
}) {
  const cartItems = [
    { id: '1', quantity: 2 },
    { id: '3', quantity: 1 },
  ]
  return <ProductsPage cartItems={cartItems} userId={searchParams.fbUserId} />
}
