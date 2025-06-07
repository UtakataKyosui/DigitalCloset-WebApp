use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub use super::_entities::coordinates::{self, ActiveModel, Entity, Model};
pub use super::_entities::clothes_coordinates;

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateCoordinateParams {
    pub name: String,
    pub description: Option<String>,
    pub occasion: Option<String>,
    pub season: Option<String>,
    pub style: Option<String>,
    pub user_id: i32,
    pub is_favorite: Option<bool>,
    pub image_url: Option<String>,
    pub clothes_ids: Vec<i32>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateCoordinateParams {
    pub name: Option<String>,
    pub description: Option<String>,
    pub occasion: Option<String>,
    pub season: Option<String>,
    pub style: Option<String>,
    pub is_favorite: Option<bool>,
    pub image_url: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AddClothesToCoordinateParams {
    pub clothes_ids: Vec<i32>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ClothesPositionParams {
    pub clothes_id: i32,
    pub position: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CoordinateWithClothes {
    #[serde(flatten)]
    pub coordinate: Model,
    pub clothes: Vec<super::clothes::Model>,
}

#[derive(Debug, Validate, Deserialize)]
pub struct Validator {
    #[validate(length(min = 1, message = "Name must not be empty"))]
    pub name: String,
}

impl Validatable for ActiveModel {
    fn validator(&self) -> Box<dyn Validate> {
        Box::new(Validator {
            name: self.name.as_ref().to_owned(),
        })
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for super::_entities::coordinates::ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        self.validate()?;
        if insert {
            let mut this = self;
            this.pid = ActiveValue::Set(Uuid::new_v4());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

impl Model {
    /// Create a new coordinate with clothes
    pub async fn create_with_clothes(
        db: &DatabaseConnection,
        params: &CreateCoordinateParams,
    ) -> ModelResult<CoordinateWithClothes> {
        let txn = db.begin().await?;

        // Create coordinate
        let coordinate = coordinates::ActiveModel {
            name: ActiveValue::set(params.name.clone()),
            description: ActiveValue::set(params.description.clone()),
            occasion: ActiveValue::set(params.occasion.clone()),
            season: ActiveValue::set(params.season.clone()),
            style: ActiveValue::set(params.style.clone()),
            user_id: ActiveValue::set(params.user_id),
            is_favorite: ActiveValue::set(params.is_favorite.unwrap_or(false)),
            image_url: ActiveValue::set(params.image_url.clone()),
            ..Default::default()
        }
        .insert(&txn)
        .await?;

        // Add clothes to coordinate
        for clothes_id in &params.clothes_ids {
            clothes_coordinates::ActiveModel {
                clothes_id: ActiveValue::set(*clothes_id),
                coordinate_id: ActiveValue::set(coordinate.id),
                position: ActiveValue::set(None),
                notes: ActiveValue::set(None),
                ..Default::default()
            }
            .insert(&txn)
            .await?;
        }

        txn.commit().await?;

        // Load the coordinate with clothes
        Self::find_by_pid_with_clothes(db, &coordinate.pid.to_string()).await
    }

    /// Find coordinate by PID
    pub async fn find_by_pid(db: &DatabaseConnection, pid: &str) -> ModelResult<Self> {
        let parse_uuid = Uuid::parse_str(pid).map_err(|e| ModelError::Any(e.into()))?;
        let coordinate = coordinates::Entity::find()
            .filter(
                model::query::condition()
                    .eq(coordinates::Column::Pid, parse_uuid)
                    .build(),
            )
            .one(db)
            .await?;
        coordinate.ok_or_else(|| ModelError::EntityNotFound)
    }

    /// Find coordinate by PID with clothes
    pub async fn find_by_pid_with_clothes(
        db: &DatabaseConnection,
        pid: &str,
    ) -> ModelResult<CoordinateWithClothes> {
        let coordinate = Self::find_by_pid(db, pid).await?;
        let clothes = coordinate
            .find_related(super::_entities::clothes::Entity)
            .all(db)
            .await?;

        Ok(CoordinateWithClothes { coordinate, clothes })
    }

    /// Find all coordinates for a user
    pub async fn find_by_user(db: &DatabaseConnection, user_id: i32) -> ModelResult<Vec<Self>> {
        let coordinates = coordinates::Entity::find()
            .filter(
                model::query::condition()
                    .eq(coordinates::Column::UserId, user_id)
                    .build(),
            )
            .all(db)
            .await?;
        Ok(coordinates)
    }

    /// Find all coordinates for a user with clothes
    pub async fn find_by_user_with_clothes(
        db: &DatabaseConnection,
        user_id: i32,
    ) -> ModelResult<Vec<CoordinateWithClothes>> {
        let coordinates = Self::find_by_user(db, user_id).await?;
        let mut result = Vec::new();

        for coordinate in coordinates {
            let clothes = coordinate
                .find_related(super::_entities::clothes::Entity)
                .all(db)
                .await?;
            result.push(CoordinateWithClothes { coordinate, clothes });
        }

        Ok(result)
    }

    /// Update coordinate
    pub async fn update_by_pid(
        db: &DatabaseConnection,
        pid: &str,
        params: &UpdateCoordinateParams,
    ) -> ModelResult<Self> {
        let coordinate = Self::find_by_pid(db, pid).await?;
        let mut active_model = coordinate.into_active_model();

        if let Some(name) = &params.name {
            active_model.name = ActiveValue::set(name.clone());
        }
        if let Some(description) = &params.description {
            active_model.description = ActiveValue::set(Some(description.clone()));
        }
        if let Some(occasion) = &params.occasion {
            active_model.occasion = ActiveValue::set(Some(occasion.clone()));
        }
        if let Some(season) = &params.season {
            active_model.season = ActiveValue::set(Some(season.clone()));
        }
        if let Some(style) = &params.style {
            active_model.style = ActiveValue::set(Some(style.clone()));
        }
        if let Some(is_favorite) = params.is_favorite {
            active_model.is_favorite = ActiveValue::set(is_favorite);
        }
        if let Some(image_url) = &params.image_url {
            active_model.image_url = ActiveValue::set(Some(image_url.clone()));
        }

        Ok(active_model.update(db).await?)
    }

    /// Add clothes to coordinate
    pub async fn add_clothes(
        db: &DatabaseConnection,
        coordinate_pid: &str,
        params: &AddClothesToCoordinateParams,
    ) -> ModelResult<()> {
        let coordinate = Self::find_by_pid(db, coordinate_pid).await?;

        for clothes_id in &params.clothes_ids {
            // Check if the relation already exists
            let existing = clothes_coordinates::Entity::find()
                .filter(
                    model::query::condition()
                        .eq(clothes_coordinates::Column::ClothesId, *clothes_id)
                        .eq(clothes_coordinates::Column::CoordinateId, coordinate.id)
                        .build(),
                )
                .one(db)
                .await?;

            if existing.is_none() {
                clothes_coordinates::ActiveModel {
                    clothes_id: ActiveValue::set(*clothes_id),
                    coordinate_id: ActiveValue::set(coordinate.id),
                    position: ActiveValue::set(None),
                    notes: ActiveValue::set(None),
                    ..Default::default()
                }
                .insert(db)
                .await?;
            }
        }

        Ok(())
    }

    /// Remove clothes from coordinate
    pub async fn remove_clothes(
        db: &DatabaseConnection,
        coordinate_pid: &str,
        clothes_id: i32,
    ) -> ModelResult<()> {
        let coordinate = Self::find_by_pid(db, coordinate_pid).await?;

        clothes_coordinates::Entity::delete_many()
            .filter(
                model::query::condition()
                    .eq(clothes_coordinates::Column::ClothesId, clothes_id)
                    .eq(clothes_coordinates::Column::CoordinateId, coordinate.id)
                    .build(),
            )
            .exec(db)
            .await?;

        Ok(())
    }

    /// Update clothes position in coordinate
    pub async fn update_clothes_position(
        db: &DatabaseConnection,
        coordinate_pid: &str,
        params: &ClothesPositionParams,
    ) -> ModelResult<()> {
        let coordinate = Self::find_by_pid(db, coordinate_pid).await?;

        let relation = clothes_coordinates::Entity::find()
            .filter(
                model::query::condition()
                    .eq(clothes_coordinates::Column::ClothesId, params.clothes_id)
                    .eq(clothes_coordinates::Column::CoordinateId, coordinate.id)
                    .build(),
            )
            .one(db)
            .await?
            .ok_or_else(|| ModelError::EntityNotFound)?;

        let mut active_model = relation.into_active_model();
        active_model.position = ActiveValue::set(params.position.clone());
        active_model.notes = ActiveValue::set(params.notes.clone());
        active_model.update(db).await?;

        Ok(())
    }

    /// Delete coordinate by PID
    pub async fn delete_by_pid(db: &DatabaseConnection, pid: &str) -> ModelResult<()> {
        let coordinate = Self::find_by_pid(db, pid).await?;

        let txn = db.begin().await?;

        // Delete all clothes_coordinates relations
        clothes_coordinates::Entity::delete_many()
            .filter(
                model::query::condition()
                    .eq(clothes_coordinates::Column::CoordinateId, coordinate.id)
                    .build(),
            )
            .exec(&txn)
            .await?;

        // Delete the coordinate
        coordinate.delete(&txn).await?;

        txn.commit().await?;
        Ok(())
    }

    /// Find coordinates by season
    pub async fn find_by_season(
        db: &DatabaseConnection,
        user_id: i32,
        season: &str,
    ) -> ModelResult<Vec<Self>> {
        let coordinates = coordinates::Entity::find()
            .filter(
                model::query::condition()
                    .eq(coordinates::Column::UserId, user_id)
                    .eq(coordinates::Column::Season, season)
                    .build(),
            )
            .all(db)
            .await?;
        Ok(coordinates)
    }

    /// Find favorite coordinates
    pub async fn find_favorites(
        db: &DatabaseConnection,
        user_id: i32,
    ) -> ModelResult<Vec<Self>> {
        let coordinates = coordinates::Entity::find()
            .filter(
                model::query::condition()
                    .eq(coordinates::Column::UserId, user_id)
                    .eq(coordinates::Column::IsFavorite, true)
                    .build(),
            )
            .all(db)
            .await?;
        Ok(coordinates)
    }
}