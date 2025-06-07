use crate::models::{
    clothes::{CreateClothesParams, UpdateClothesParams},
    _entities::clothes,
};
use axum::debug_handler;
use loco_rs::prelude::*;
use serde_json::json;

/// Create a new clothes item
#[debug_handler]
async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateClothesParams>,
) -> Result<Response> {
    let clothes = clothes::Model::create(&ctx.db, &params).await?;
    format::json(clothes)
}

/// Get all clothes items
#[debug_handler]
async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let clothes = clothes::Model::find_all(&ctx.db).await?;
    format::json(clothes)
}

/// Get clothes item by PID
#[debug_handler]
async fn get_one(State(ctx): State<AppContext>, Path(pid): Path<String>) -> Result<Response> {
    let clothes = clothes::Model::find_by_pid(&ctx.db, &pid).await?;
    format::json(clothes)
}

/// Update clothes item by PID
#[debug_handler]
async fn update(
    State(ctx): State<AppContext>,
    Path(pid): Path<String>,
    Json(params): Json<UpdateClothesParams>,
) -> Result<Response> {
    let clothes = clothes::Model::update_by_pid(&ctx.db, &pid, &params).await?;
    format::json(clothes)
}

/// Delete clothes item by PID
#[debug_handler]
async fn delete_clothes(State(ctx): State<AppContext>, Path(pid): Path<String>) -> Result<Response> {
    clothes::Model::delete_by_pid(&ctx.db, &pid).await?;
    format::json(json!({"msg": "Deleted successfully"}))
}

/// Get clothes by category
#[debug_handler]
async fn get_by_category(
    State(ctx): State<AppContext>,
    Path(category): Path<String>,
) -> Result<Response> {
    let clothes = clothes::Model::find_by_category(&ctx.db, &category).await?;
    format::json(clothes)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/clothes")
        .add("/", post(create))
        .add("/", get(list))
        .add("/{pid}", get(get_one))
        .add("/{pid}", put(update))
        .add("/{pid}", delete(delete_clothes))
        .add("/category/{category}", get(get_by_category))
}