use serde::{Deserialize, Serialize};
use ts_rs::TS;
use typeshare::typeshare;

// 共有する基本型

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
    pub errors: Option<Vec<ValidationError>>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct ValidationError {
    pub field: String,
    pub message: String,
    pub code: String,
}

// Clothes関連の型

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct ClothesItem {
    pub pid: String,
    pub name: String,
    pub description: Option<String>,
    pub brand: String,
    pub category: String,
    pub size: String,
    pub color: String,
    pub material: Option<String>,
    pub price: f64,
    pub in_stock: bool,
    pub stock_quantity: i32,
    pub image_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct CreateClothesRequest {
    pub name: String,
    pub description: Option<String>,
    pub brand: String,
    pub category: String,
    pub size: String,
    pub color: String,
    pub material: Option<String>,
    pub price: f64,
    pub stock_quantity: i32,
    pub image_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct UpdateClothesRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub brand: Option<String>,
    pub category: Option<String>,
    pub size: Option<String>,
    pub color: Option<String>,
    pub material: Option<String>,
    pub price: Option<f64>,
    pub stock_quantity: Option<i32>,
    pub image_url: Option<String>,
}

// Coordinates関連の型

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct Coordinate {
    pub pid: String,
    pub name: String,
    pub description: Option<String>,
    pub season: Option<String>,
    pub occasion: Option<String>,
    pub style: Option<String>,
    pub user_id: i32,
    pub is_favorite: bool,
    pub image_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct CreateCoordinateRequest {
    pub name: String,
    pub description: Option<String>,
    pub season: Option<String>,
    pub occasion: Option<String>,
    pub style: Option<String>,
    pub is_favorite: bool,
    pub image_url: Option<String>,
    pub clothes_ids: Vec<String>,
}

// Auth関連の型

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct User {
    pub pid: String,
    pub email: String,
    pub name: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct LoginResponse {
    pub token: String,
    pub user: User,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
#[typeshare]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

