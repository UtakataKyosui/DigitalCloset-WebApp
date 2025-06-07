use crate::models::{
    coordinates::{
        AddClothesToCoordinateParams, ClothesPositionParams, CreateCoordinateParams,
        UpdateCoordinateParams,
    },
    _entities::coordinates,
};
use axum::debug_handler;
use loco_rs::prelude::*;
use serde_json::json;

/// Create a new coordinate with clothes
#[debug_handler]
async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateCoordinateParams>,
) -> Result<Response> {
    let coordinate = coordinates::Model::create_with_clothes(&ctx.db, &params).await?;
    format::json(coordinate)
}

/// Get all coordinates for a user
#[debug_handler]
async fn list_by_user(
    State(ctx): State<AppContext>,
    Path(user_id): Path<i32>,
) -> Result<Response> {
    let coordinates = coordinates::Model::find_by_user_with_clothes(&ctx.db, user_id).await?;
    format::json(coordinates)
}

/// Get coordinate by PID with clothes
#[debug_handler]
async fn get_one(State(ctx): State<AppContext>, Path(pid): Path<String>) -> Result<Response> {
    let coordinate = coordinates::Model::find_by_pid_with_clothes(&ctx.db, &pid).await?;
    format::json(coordinate)
}

/// Update coordinate by PID
#[debug_handler]
async fn update(
    State(ctx): State<AppContext>,
    Path(pid): Path<String>,
    Json(params): Json<UpdateCoordinateParams>,
) -> Result<Response> {
    let coordinate = coordinates::Model::update_by_pid(&ctx.db, &pid, &params).await?;
    format::json(coordinate)
}

/// Delete coordinate by PID
#[debug_handler]
async fn delete(State(ctx): State<AppContext>, Path(pid): Path<String>) -> Result<Response> {
    coordinates::Model::delete_by_pid(&ctx.db, &pid).await?;
    format::json(json!({"msg": "Coordinate deleted successfully"}))
}

/// Add clothes to coordinate
#[debug_handler]
async fn add_clothes(
    State(ctx): State<AppContext>,
    Path(pid): Path<String>,
    Json(params): Json<AddClothesToCoordinateParams>,
) -> Result<Response> {
    coordinates::Model::add_clothes(&ctx.db, &pid, &params).await?;
    format::json(json!({"msg": "Clothes added to coordinate successfully"}))
}

/// Remove clothes from coordinate
#[debug_handler]
async fn remove_clothes(
    State(ctx): State<AppContext>,
    Path((pid, clothes_id)): Path<(String, i32)>,
) -> Result<Response> {
    coordinates::Model::remove_clothes(&ctx.db, &pid, clothes_id).await?;
    format::json(json!({"msg": "Clothes removed from coordinate successfully"}))
}

/// Update clothes position in coordinate
#[debug_handler]
async fn update_clothes_position(
    State(ctx): State<AppContext>,
    Path(pid): Path<String>,
    Json(params): Json<ClothesPositionParams>,
) -> Result<Response> {
    coordinates::Model::update_clothes_position(&ctx.db, &pid, &params).await?;
    format::json(json!({"msg": "Clothes position updated successfully"}))
}

/// Get coordinates by season for a user
#[debug_handler]
async fn get_by_season(
    State(ctx): State<AppContext>,
    Path((user_id, season)): Path<(i32, String)>,
) -> Result<Response> {
    let coordinates = coordinates::Model::find_by_season(&ctx.db, user_id, &season).await?;
    format::json(coordinates)
}

/// Get favorite coordinates for a user
#[debug_handler]
async fn get_favorites(
    State(ctx): State<AppContext>,
    Path(user_id): Path<i32>,
) -> Result<Response> {
    let coordinates = coordinates::Model::find_favorites(&ctx.db, user_id).await?;
    format::json(coordinates)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/coordinates")
        .add("/", post(create))
        .add("/user/:user_id", get(list_by_user))
        .add("/:pid", get(get_one))
        .add("/:pid", put(update))
        .add("/:pid", delete(delete))
        .add("/:pid/clothes", post(add_clothes))
        .add("/:pid/clothes/:clothes_id", delete(remove_clothes))
        .add("/:pid/clothes/position", put(update_clothes_position))
        .add("/user/:user_id/season/:season", get(get_by_season))
        .add("/user/:user_id/favorites", get(get_favorites))
}