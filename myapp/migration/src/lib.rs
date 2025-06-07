#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;
mod m20250607_000001_clothes;
mod m20250607_000002_coordinates;
mod m20250607_000003_clothes_coordinates;

mod m20250607_154529_remove_verification_columns;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20250607_000001_clothes::Migration),
            Box::new(m20250607_000002_coordinates::Migration),
            Box::new(m20250607_000003_clothes_coordinates::Migration),
            Box::new(m20250607_154529_remove_verification_columns::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}