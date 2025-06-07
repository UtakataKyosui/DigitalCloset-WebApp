use crate::models::{
    clothes::{CreateClothesParams, UpdateClothesParams},
    coordinates::{CreateCoordinateParams, UpdateCoordinateParams},
    _entities::{clothes, coordinates},
};
use axum::debug_handler;
use loco_rs::prelude::*;
use serde_json::json;

/// Submit new clothes item form
#[debug_handler]
async fn submit_clothes_form(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateClothesParams>,
) -> Result<Response> {
    let clothes = clothes::Model::create(&ctx.db, &params).await?;
    format::json(json!({
        "success": true,
        "message": "Clothes item created successfully",
        "data": clothes
    }))
}

/// Submit new coordinate form
#[debug_handler]
async fn submit_coordinate_form(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateCoordinateParams>,
) -> Result<Response> {
    let coordinate = coordinates::Model::create_with_clothes(&ctx.db, &params).await?;
    format::json(json!({
        "success": true,
        "message": "Coordinate created successfully",
        "data": coordinate
    }))
}

/// Submit clothes update form
#[debug_handler]
async fn update_clothes_form(
    State(ctx): State<AppContext>,
    Path(pid): Path<String>,
    Json(params): Json<UpdateClothesParams>,
) -> Result<Response> {
    let clothes = clothes::Model::update_by_pid(&ctx.db, &pid, &params).await?;
    format::json(json!({
        "success": true,
        "message": "Clothes item updated successfully",
        "data": clothes
    }))
}

/// Submit coordinate update form
#[debug_handler]
async fn update_coordinate_form(
    State(ctx): State<AppContext>,
    Path(pid): Path<String>,
    Json(params): Json<UpdateCoordinateParams>,
) -> Result<Response> {
    let coordinate = coordinates::Model::update_by_pid(&ctx.db, &pid, &params).await?;
    format::json(json!({
        "success": true,
        "message": "Coordinate updated successfully",
        "data": coordinate
    }))
}

/// Health check endpoint for forms
#[debug_handler]
async fn form_health() -> Result<Response> {
    format::json(json!({
        "status": "ok",
        "message": "Forms API is healthy"
    }))
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/forms")
        .add("/health", get(form_health))
        .add("/clothes", post(submit_clothes_form))
        .add("/clothes/{pid}", put(update_clothes_form))
        .add("/coordinates", post(submit_coordinate_form))
        .add("/coordinates/{pid}", put(update_coordinate_form))
}