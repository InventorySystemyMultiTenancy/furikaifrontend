import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "A senha precisa ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha precisa ter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha precisa ter ao menos um número"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "A senha precisa ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "A senha precisa ter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha precisa ter ao menos um número"),
});

export const addressSchema = z.object({
  label: z.string().min(1).default("Endereço"),
  recipientName: z.string().min(2, "Informe o nome do destinatário"),
  zip: z.string().regex(/^\d{8}$/, "CEP inválido"),
  street: z.string().min(2, "Informe o logradouro"),
  number: z.string().min(1, "Informe o número"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Informe o bairro"),
  city: z.string().min(1, "Informe a cidade"),
  state: z.string().length(2, "Use a sigla do estado"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Carrinho vazio"),
  addressId: z.string().min(1, "Selecione um endereço de entrega"),
  shippingService: z.enum(["PAC", "SEDEX"]),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "BOLETO"]),
  couponCode: z.string().optional().nullable(),
  installments: z.number().int().min(1).max(12).optional(),
  cardToken: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  shortDescription: z.string().optional(),
  description: z.string().min(1),
  composition: z.string().optional(),
  sizeGuide: z.string().optional(),
  price: z.number().positive(),
  costPrice: z.number().min(0),
  discountPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  limitedEdition: z.boolean().optional(),
  isNew: z.boolean().optional(),
  active: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        color: z.string().optional(),
        size: z.string().min(1),
        sku: z.string().min(1),
        stock: z.number().int().min(0),
      })
    )
    .min(1, "Cadastre ao menos uma variante"),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        publicId: z.string().optional(),
        alt: z.string().optional(),
        order: z.number().int().optional(),
      })
    )
    .optional(),
});

export const expenseSchema = z.object({
  description: z.string().min(2),
  amount: z.number().positive(),
  category: z.enum([
    "PRODUCAO",
    "COMPRA_ESTOQUE",
    "MARKETING",
    "ANUNCIOS",
    "EMBALAGEM",
    "FRETE",
    "EVENTOS",
    "MANUTENCAO",
    "SOFTWARE",
    "IMPOSTOS",
    "TAXAS",
    "ADMINISTRATIVO",
    "OUTROS",
  ]),
  date: z.string().min(1),
  type: z.enum(["pontual", "recorrente"]),
  paymentMethod: z.string().optional(),
  supplier: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const manualRevenueSchema = z.object({
  description: z.string().min(2),
  amount: z.number().positive(),
  date: z.string().min(1),
  category: z.string().default("outros"),
  notes: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrderValue: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email("E-mail inválido"),
});
