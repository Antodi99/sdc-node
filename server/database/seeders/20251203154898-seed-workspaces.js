"use strict";

export async function up(queryInterface) {
  const now = new Date();
  await queryInterface.bulkInsert("workspaces", [
    { name: "general", label: "General", created_at: now, updated_at: now },
    { name: "work", label: "Work", created_at: now, updated_at: now },
    { name: "ideas", label: "Ideas", created_at: now, updated_at: now },
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("workspaces", null, {});
}
