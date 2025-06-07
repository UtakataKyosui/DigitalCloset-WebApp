use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(
            m,
            "clothes",
            &[
                ("id", ColType::PkAuto),
                ("pid", ColType::Uuid),
                ("name", ColType::String),
                ("description", ColType::StringNull),
                ("brand", ColType::String),
                ("category", ColType::String),
                ("size", ColType::String),
                ("color", ColType::String),
                ("material", ColType::StringNull),
                ("price", ColType::Decimal(Some((10, 2)))),
                ("in_stock", ColType::Boolean),
                ("stock_quantity", ColType::Integer),
                ("image_url", ColType::StringNull),
            ],
            &[],
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "clothes").await?;
        Ok(())
    }
}