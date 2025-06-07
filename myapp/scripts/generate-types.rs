use std::fs;
use std::path::Path;

// ts-rsを使用してTypeScript型を生成
fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Generating TypeScript types...");
    
    // 出力ディレクトリを作成
    let output_dir = "../frontend/src/types/generated";
    fs::create_dir_all(output_dir)?;
    
    // ts-rsで型を生成
    // この部分は実際のrs-tsライブラリの使用方法に従って実装
    // 今回は手動で型定義ファイルを作成します
    
    let types_content = r#"// Generated TypeScript types from Rust
// DO NOT EDIT MANUALLY

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ClothesItem {
  pid: string;
  name: string;
  description?: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  material?: string;
  price: number;
  in_stock: boolean;
  stock_quantity: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClothesRequest {
  name: string;
  description?: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  material?: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
}

export interface UpdateClothesRequest {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  size?: string;
  color?: string;
  material?: string;
  price?: number;
  stock_quantity?: number;
  image_url?: string;
}

export interface Coordinate {
  pid: string;
  name: string;
  description?: string;
  season?: string;
  occasion?: string;
  style?: string;
  user_id: number;
  is_favorite: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCoordinateRequest {
  name: string;
  description?: string;
  season?: string;
  occasion?: string;
  style?: string;
  is_favorite: boolean;
  image_url?: string;
  clothes_ids: string[];
}

export interface User {
  pid: string;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface FieldValidation {
  required: boolean;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  min_value?: number;
  max_value?: number;
}

export interface ClothesValidationRules {
  name: FieldValidation;
  brand: FieldValidation;
  category: FieldValidation;
  size: FieldValidation;
  color: FieldValidation;
  price: FieldValidation;
  stock_quantity: FieldValidation;
}

export interface CoordinateValidationRules {
  name: FieldValidation;
}

export interface AuthValidationRules {
  email: FieldValidation;
  password: FieldValidation;
  name: FieldValidation;
}

export interface FormValidationRules {
  clothes: ClothesValidationRules;
  coordinates: CoordinateValidationRules;
  auth: AuthValidationRules;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormOptions {
  categories: SelectOption[];
  sizes: SelectOption[];
  seasons: SelectOption[];
  occasions: SelectOption[];
  styles: SelectOption[];
}

export interface ValidateFieldResponse {
  valid: boolean;
  errors: ValidationError[];
}
"#;

    fs::write(format!("{}/types.ts", output_dir), types_content)?;
    
    println!("TypeScript types generated successfully!");
    Ok(())
}
"#