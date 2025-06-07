use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "coordinates",
            &[
                ("id", ColType::PkAuto),
                ("pid", ColType::Uuid),
                ("name", ColType::String),
                ("description", ColType::StringNull),
                ("occasion", ColType::StringNull),
                ("season", ColType::StringNull),
                ("style", ColType::StringNull),
                ("user_id", ColType::Integer),
                ("is_favorite", ColType::Boolean),
                ("image_url", ColType::StringNull),
            ],
            &[],
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "coordinates").await?;
        Ok(())
    }
}