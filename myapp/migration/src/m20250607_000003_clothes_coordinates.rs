use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.create_table(
            Table::create()
                .table(Alias::new("clothes_coordinates"))
                .if_not_exists()
                .col(
                    ColumnDef::new(Alias::new("id"))
                        .integer()
                        .not_null()
                        .auto_increment()
                        .primary_key(),
                )
                .col(ColumnDef::new(Alias::new("clothes_id")).integer().not_null())
                .col(ColumnDef::new(Alias::new("coordinate_id")).integer().not_null())
                .col(ColumnDef::new(Alias::new("position")).string())
                .col(ColumnDef::new(Alias::new("notes")).string())
                .col(
                    ColumnDef::new(Alias::new("created_at"))
                        .timestamp_with_time_zone()
                        .not_null()
                        .default(Expr::current_timestamp()),
                )
                .col(
                    ColumnDef::new(Alias::new("updated_at"))
                        .timestamp_with_time_zone()
                        .not_null()
                        .default(Expr::current_timestamp()),
                )
                .to_owned(),
        )
        .await?;

        m.create_foreign_key(
            ForeignKey::create()
                .name("fk_clothes_coordinates_clothes_id")
                .from(Alias::new("clothes_coordinates"), Alias::new("clothes_id"))
                .to(Alias::new("clothes"), Alias::new("id"))
                .on_delete(ForeignKeyAction::Cascade)
                .to_owned(),
        )
        .await?;

        m.create_foreign_key(
            ForeignKey::create()
                .name("fk_clothes_coordinates_coordinate_id")
                .from(Alias::new("clothes_coordinates"), Alias::new("coordinate_id"))
                .to(Alias::new("coordinates"), Alias::new("id"))
                .on_delete(ForeignKeyAction::Cascade)
                .to_owned(),
        )
        .await?;

        // Create unique constraint to prevent duplicate clothes-coordinate pairs
        m.create_index(
            Index::create()
                .name("idx_clothes_coordinates_unique")
                .table(Alias::new("clothes_coordinates"))
                .col(Alias::new("clothes_id"))
                .col(Alias::new("coordinate_id"))
                .unique()
                .to_owned(),
        )
        .await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.drop_table(Table::drop().table(Alias::new("clothes_coordinates")).to_owned()).await?;
        Ok(())
    }
}