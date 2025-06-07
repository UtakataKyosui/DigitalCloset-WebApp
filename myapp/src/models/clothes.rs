use loco_rs::prelude::*;
use sea_orm::prelude::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub use super::_entities::clothes::{self, ActiveModel, Entity, Model};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateClothesParams {
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
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateClothesParams {
    pub name: Option<String>,
    pub description: Option<String>,
    pub brand: Option<String>,
    pub category: Option<String>,
    pub size: Option<String>,
    pub color: Option<String>,
    pub material: Option<String>,
    pub price: Option<f64>,
    pub in_stock: Option<bool>,
    pub stock_quantity: Option<i32>,
    pub image_url: Option<String>,
}

#[derive(Debug, Validate, Deserialize)]
pub struct Validator {
    #[validate(length(min = 1, message = "Name must not be empty"))]
    pub name: String,
    #[validate(length(min = 1, message = "Brand must not be empty"))]
    pub brand: String,
    #[validate(length(min = 1, message = "Category must not be empty"))]
    pub category: String,
}

impl Validatable for ActiveModel {
    fn validator(&self) -> Box<dyn Validate> {
        Box::new(Validator {
            name: self.name.as_ref().to_owned(),
            brand: self.brand.as_ref().to_owned(),
            category: self.category.as_ref().to_owned(),
        })
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for super::_entities::clothes::ActiveModel {
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
    /// Get all coordinates that include this clothes item
    pub async fn get_coordinates(&self, db: &DatabaseConnection) -> ModelResult<Vec<super::coordinates::Model>> {
        let coordinates = self
            .find_related(super::_entities::coordinates::Entity)
            .all(db)
            .await?;
        Ok(coordinates)
    }
    /// Create a new clothes item
    pub async fn create(
        db: &DatabaseConnection,
        params: &CreateClothesParams,
    ) -> ModelResult<Self> {
        let clothes = clothes::ActiveModel {
            name: ActiveValue::set(params.name.clone()),
            description: ActiveValue::set(params.description.clone()),
            brand: ActiveValue::set(params.brand.clone()),
            category: ActiveValue::set(params.category.clone()),
            size: ActiveValue::set(params.size.clone()),
            color: ActiveValue::set(params.color.clone()),
            material: ActiveValue::set(params.material.clone()),
            price: ActiveValue::set(Decimal::from_f64_retain(params.price)
                .ok_or_else(|| ModelError::msg("Invalid price format"))?),
            in_stock: ActiveValue::set(params.in_stock),
            stock_quantity: ActiveValue::set(params.stock_quantity),
            image_url: ActiveValue::set(params.image_url.clone()),
            ..Default::default()
        }
        .insert(db)
        .await?;

        Ok(clothes)
    }

    /// Find clothes by PID
    pub async fn find_by_pid(db: &DatabaseConnection, pid: &str) -> ModelResult<Self> {
        let parse_uuid = Uuid::parse_str(pid).map_err(|e| ModelError::Any(e.into()))?;
        let clothes = clothes::Entity::find()
            .filter(clothes::Column::Pid.eq(parse_uuid))
            .one(db)
            .await?;
        clothes.ok_or_else(|| ModelError::EntityNotFound)
    }

    /// Find all clothes items
    pub async fn find_all(db: &DatabaseConnection) -> ModelResult<Vec<Self>> {
        let clothes = clothes::Entity::find().all(db).await?;
        Ok(clothes)
    }

    /// Find clothes by category
    pub async fn find_by_category(db: &DatabaseConnection, category: &str) -> ModelResult<Vec<Self>> {
        let clothes = clothes::Entity::find()
            .filter(clothes::Column::Category.eq(category))
            .all(db)
            .await?;
        Ok(clothes)
    }

    /// Update clothes item
    pub async fn update_by_pid(
        db: &DatabaseConnection,
        pid: &str,
        params: &UpdateClothesParams,
    ) -> ModelResult<Self> {
        let clothes = Self::find_by_pid(db, pid).await?;
        let mut active_model = clothes.into_active_model();

        if let Some(name) = &params.name {
            active_model.name = ActiveValue::set(name.clone());
        }
        if let Some(description) = &params.description {
            active_model.description = ActiveValue::set(Some(description.clone()));
        }
        if let Some(brand) = &params.brand {
            active_model.brand = ActiveValue::set(brand.clone());
        }
        if let Some(category) = &params.category {
            active_model.category = ActiveValue::set(category.clone());
        }
        if let Some(size) = &params.size {
            active_model.size = ActiveValue::set(size.clone());
        }
        if let Some(color) = &params.color {
            active_model.color = ActiveValue::set(color.clone());
        }
        if let Some(material) = &params.material {
            active_model.material = ActiveValue::set(Some(material.clone()));
        }
        if let Some(price) = params.price {
            active_model.price = ActiveValue::set(Decimal::from_f64_retain(price)
                .ok_or_else(|| ModelError::msg("Invalid price format"))?);
        }
        if let Some(in_stock) = params.in_stock {
            active_model.in_stock = ActiveValue::set(in_stock);
        }
        if let Some(stock_quantity) = params.stock_quantity {
            active_model.stock_quantity = ActiveValue::set(stock_quantity);
        }
        if let Some(image_url) = &params.image_url {
            active_model.image_url = ActiveValue::set(Some(image_url.clone()));
        }

        Ok(active_model.update(db).await?)
    }

    /// Delete clothes item by PID
    pub async fn delete_by_pid(db: &DatabaseConnection, pid: &str) -> ModelResult<()> {
        let clothes = Self::find_by_pid(db, pid).await?;
        clothes.delete(db).await?;
        Ok(())
    }
}