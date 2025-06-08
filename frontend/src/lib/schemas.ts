import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(6, 'パスワードは6文字以上で入力してください'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .min(2, '名前は2文字以上で入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(6, 'パスワードは6文字以上で入力してください'),
  password_confirmation: z
    .string()
    .min(1, 'パスワード確認を入力してください'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'パスワードが一致しません',
  path: ['password_confirmation'],
});

// Clothes schema
export const clothesSchema = z.object({
  name: z
    .string()
    .min(1, '商品名を入力してください')
    .min(2, '商品名は2文字以上で入力してください'),
  brand: z
    .string()
    .min(1, 'ブランド名を入力してください'),
  category: z
    .string()
    .min(1, 'カテゴリを選択してください'),
  size: z
    .string()
    .min(1, 'サイズを選択してください'),
  color: z
    .string()
    .min(1, '色を入力してください'),
  material: z
    .string()
    .optional(),
  price: z
    .coerce
    .number()
    .min(0, '価格は0以上で入力してください')
    .optional(),
  stock: z
    .coerce
    .number()
    .int('在庫は整数で入力してください')
    .min(0, '在庫は0以上で入力してください')
    .optional(),
});

// Coordinates schema
export const coordinatesSchema = z.object({
  name: z
    .string()
    .min(1, 'コーディネート名を入力してください')
    .min(2, 'コーディネート名は2文字以上で入力してください'),
  season: z
    .enum(['spring', 'summer', 'autumn', 'winter'], {
      errorMap: () => ({ message: '季節を選択してください' }),
    }),
  occasion: z
    .string()
    .min(1, '場面を入力してください'),
  style: z
    .string()
    .min(1, 'スタイルを入力してください'),
  description: z
    .string()
    .optional(),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ClothesFormData = z.infer<typeof clothesSchema>;
export type CoordinatesFormData = z.infer<typeof coordinatesSchema>;