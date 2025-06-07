use axum::debug_handler;
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use crate::shared_types::{
    FormValidationRules, FieldValidation, ClothesValidationRules, 
    CoordinateValidationRules, AuthValidationRules, FormOptions, SelectOption,
    ValidationError
};

#[derive(Debug, Deserialize)]
pub struct ValidateFieldRequest {
    pub field_name: String,
    pub value: String,
    pub form_type: String, // "clothes", "coordinates", "auth"
}

#[derive(Debug, Serialize)]
pub struct ValidateFieldResponse {
    pub valid: bool,
    pub errors: Vec<ValidationError>,
}

// バリデーションルールを取得
#[debug_handler]
async fn get_validation_rules() -> Result<Response> {
    let rules = FormValidationRules {
        clothes: ClothesValidationRules {
            name: FieldValidation {
                required: true,
                min_length: Some(1),
                max_length: Some(100),
                pattern: None,
                min_value: None,
                max_value: None,
            },
            brand: FieldValidation {
                required: true,
                min_length: Some(1),
                max_length: Some(50),
                pattern: None,
                min_value: None,
                max_value: None,
            },
            category: FieldValidation {
                required: true,
                min_length: Some(1),
                max_length: Some(30),
                pattern: None,
                min_value: None,
                max_value: None,
            },
            size: FieldValidation {
                required: true,
                min_length: Some(1),
                max_length: Some(10),
                pattern: None,
                min_value: None,
                max_value: None,
            },
            color: FieldValidation {
                required: true,
                min_length: Some(1),
                max_length: Some(30),
                pattern: None,
                min_value: None,
                max_value: None,
            },
            price: FieldValidation {
                required: true,
                min_length: None,
                max_length: None,
                pattern: None,
                min_value: Some(0.0),
                max_value: Some(1000000.0),
            },
            stock_quantity: FieldValidation {
                required: true,
                min_length: None,
                max_length: None,
                pattern: None,
                min_value: Some(0.0),
                max_value: Some(10000.0),
            },
        },
        coordinates: CoordinateValidationRules {
            name: FieldValidation {
                required: true,
                min_length: Some(1),
                max_length: Some(100),
                pattern: None,
                min_value: None,
                max_value: None,
            },
        },
        auth: AuthValidationRules {
            email: FieldValidation {
                required: true,
                min_length: Some(3),
                max_length: Some(255),
                pattern: Some(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$".to_string()),
                min_value: None,
                max_value: None,
            },
            password: FieldValidation {
                required: true,
                min_length: Some(8),
                max_length: Some(100),
                pattern: Some(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$".to_string()),
                min_value: None,
                max_value: None,
            },
            name: FieldValidation {
                required: true,
                min_length: Some(1),
                max_length: Some(50),
                pattern: None,
                min_value: None,
                max_value: None,
            },
        },
    };

    format::json(rules)
}

// フォーム選択肢を取得
#[debug_handler]
async fn get_form_options() -> Result<Response> {
    let options = FormOptions {
        categories: vec![
            SelectOption { value: "tops".to_string(), label: "トップス".to_string() },
            SelectOption { value: "bottoms".to_string(), label: "ボトムス".to_string() },
            SelectOption { value: "outerwear".to_string(), label: "アウター".to_string() },
            SelectOption { value: "shoes".to_string(), label: "シューズ".to_string() },
            SelectOption { value: "accessories".to_string(), label: "アクセサリー".to_string() },
            SelectOption { value: "bags".to_string(), label: "バッグ".to_string() },
        ],
        sizes: vec![
            SelectOption { value: "xs".to_string(), label: "XS".to_string() },
            SelectOption { value: "s".to_string(), label: "S".to_string() },
            SelectOption { value: "m".to_string(), label: "M".to_string() },
            SelectOption { value: "l".to_string(), label: "L".to_string() },
            SelectOption { value: "xl".to_string(), label: "XL".to_string() },
            SelectOption { value: "xxl".to_string(), label: "XXL".to_string() },
            SelectOption { value: "free".to_string(), label: "フリーサイズ".to_string() },
        ],
        seasons: vec![
            SelectOption { value: "spring".to_string(), label: "春".to_string() },
            SelectOption { value: "summer".to_string(), label: "夏".to_string() },
            SelectOption { value: "autumn".to_string(), label: "秋".to_string() },
            SelectOption { value: "winter".to_string(), label: "冬".to_string() },
            SelectOption { value: "all_season".to_string(), label: "オールシーズン".to_string() },
        ],
        occasions: vec![
            SelectOption { value: "casual".to_string(), label: "カジュアル".to_string() },
            SelectOption { value: "business".to_string(), label: "ビジネス".to_string() },
            SelectOption { value: "formal".to_string(), label: "フォーマル".to_string() },
            SelectOption { value: "party".to_string(), label: "パーティー".to_string() },
            SelectOption { value: "sport".to_string(), label: "スポーツ".to_string() },
            SelectOption { value: "date".to_string(), label: "デート".to_string() },
        ],
        styles: vec![
            SelectOption { value: "minimalist".to_string(), label: "ミニマル".to_string() },
            SelectOption { value: "street".to_string(), label: "ストリート".to_string() },
            SelectOption { value: "elegant".to_string(), label: "エレガント".to_string() },
            SelectOption { value: "vintage".to_string(), label: "ヴィンテージ".to_string() },
            SelectOption { value: "sporty".to_string(), label: "スポーティー".to_string() },
            SelectOption { value: "cute".to_string(), label: "キュート".to_string() },
        ],
    };

    format::json(options)
}

// 個別フィールドのバリデーション
#[debug_handler]
async fn validate_field(Json(params): Json<ValidateFieldRequest>) -> Result<Response> {
    let mut errors = Vec::new();

    match params.form_type.as_str() {
        "clothes" => {
            errors.extend(validate_clothes_field(&params.field_name, &params.value));
        },
        "coordinates" => {
            errors.extend(validate_coordinate_field(&params.field_name, &params.value));
        },
        "auth" => {
            errors.extend(validate_auth_field(&params.field_name, &params.value));
        },
        _ => {
            errors.push(ValidationError {
                field: "form_type".to_string(),
                message: "Invalid form type".to_string(),
                code: "INVALID_FORM_TYPE".to_string(),
            });
        }
    }

    let response = ValidateFieldResponse {
        valid: errors.is_empty(),
        errors,
    };

    format::json(response)
}

fn validate_clothes_field(field_name: &str, value: &str) -> Vec<ValidationError> {
    let mut errors = Vec::new();

    match field_name {
        "name" => {
            if value.trim().is_empty() {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "商品名は必須です".to_string(),
                    code: "REQUIRED".to_string(),
                });
            } else if value.len() > 100 {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "商品名は100文字以内で入力してください".to_string(),
                    code: "MAX_LENGTH".to_string(),
                });
            }
        },
        "brand" => {
            if value.trim().is_empty() {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "ブランド名は必須です".to_string(),
                    code: "REQUIRED".to_string(),
                });
            } else if value.len() > 50 {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "ブランド名は50文字以内で入力してください".to_string(),
                    code: "MAX_LENGTH".to_string(),
                });
            }
        },
        "price" => {
            if let Ok(price) = value.parse::<f64>() {
                if price < 0.0 {
                    errors.push(ValidationError {
                        field: field_name.to_string(),
                        message: "価格は0以上で入力してください".to_string(),
                        code: "MIN_VALUE".to_string(),
                    });
                } else if price > 1000000.0 {
                    errors.push(ValidationError {
                        field: field_name.to_string(),
                        message: "価格は1,000,000以下で入力してください".to_string(),
                        code: "MAX_VALUE".to_string(),
                    });
                }
            } else if !value.trim().is_empty() {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "有効な価格を入力してください".to_string(),
                    code: "INVALID_FORMAT".to_string(),
                });
            }
        },
        _ => {}
    }

    errors
}

fn validate_coordinate_field(field_name: &str, value: &str) -> Vec<ValidationError> {
    let mut errors = Vec::new();

    match field_name {
        "name" => {
            if value.trim().is_empty() {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "コーディネート名は必須です".to_string(),
                    code: "REQUIRED".to_string(),
                });
            } else if value.len() > 100 {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "コーディネート名は100文字以内で入力してください".to_string(),
                    code: "MAX_LENGTH".to_string(),
                });
            }
        },
        _ => {}
    }

    errors
}

fn validate_auth_field(field_name: &str, value: &str) -> Vec<ValidationError> {
    let mut errors = Vec::new();

    match field_name {
        "email" => {
            if value.trim().is_empty() {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "メールアドレスは必須です".to_string(),
                    code: "REQUIRED".to_string(),
                });
            } else {
                let email_regex = regex::Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
                if !email_regex.is_match(value) {
                    errors.push(ValidationError {
                        field: field_name.to_string(),
                        message: "有効なメールアドレスを入力してください".to_string(),
                        code: "INVALID_FORMAT".to_string(),
                    });
                }
            }
        },
        "password" => {
            if value.trim().is_empty() {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "パスワードは必須です".to_string(),
                    code: "REQUIRED".to_string(),
                });
            } else if value.len() < 8 {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "パスワードは8文字以上で入力してください".to_string(),
                    code: "MIN_LENGTH".to_string(),
                });
            } else {
                // Check for lowercase, uppercase, and digit separately
                let has_lowercase = value.chars().any(|c| c.is_ascii_lowercase());
                let has_uppercase = value.chars().any(|c| c.is_ascii_uppercase());
                let has_digit = value.chars().any(|c| c.is_ascii_digit());
                
                if !has_lowercase || !has_uppercase || !has_digit {
                    errors.push(ValidationError {
                        field: field_name.to_string(),
                        message: "パスワードは大文字、小文字、数字を含む必要があります".to_string(),
                        code: "INVALID_FORMAT".to_string(),
                    });
                }
            }
        },
        "name" => {
            if value.trim().is_empty() {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "名前は必須です".to_string(),
                    code: "REQUIRED".to_string(),
                });
            } else if value.len() > 50 {
                errors.push(ValidationError {
                    field: field_name.to_string(),
                    message: "名前は50文字以内で入力してください".to_string(),
                    code: "MAX_LENGTH".to_string(),
                });
            }
        },
        _ => {}
    }

    errors
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/validation")
        .add("/rules", get(get_validation_rules))
        .add("/options", get(get_form_options))
        .add("/field", post(validate_field))
}