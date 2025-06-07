use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "clothes_coordinates",
            &[
                ("id", ColType::PkAuto),
                ("clothes_id", ColType::Integer),
                ("coordinate_id", ColType::Integer),
                ("position", ColType::StringNull), // e.g., "top", "bottom", "accessory"
                ("notes", ColType::StringNull),
            ],
            &[
                ("clothes_id", "clothes", "id"),
                ("coordinate_id", "coordinates", "id"),
            ],
        )
        .await?;

        // Create unique constraint to prevent duplicate clothes-coordinate pairs
        create_index(
            m,
            "clothes_coordinates",
            "idx_clothes_coordinates_unique",
            &["clothes_id", "coordinate_id"],
            true,
        )
        .await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "clothes_coordinates").await?;
        Ok(())
    }
}