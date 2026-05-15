export class CreateProductDto {
  title: string;
  category: string;
  description: string | null;
  price: number;
  color: string;
  inventory: number | null;
  image: string | null;
  image_altText: string | null;
}
