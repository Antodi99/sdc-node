import db from "../database/models/index.js";
import { createSchema, updateSchema } from '../validators/workspaceSchemas.js'

const { Workspace } = db;

export async function listWorkspaces(req, res, next) {
  try {
    const ws = await Workspace.findAll({ order: [["id", "ASC"]] });
    res.json(ws);
  } catch (e) {
    next(e);
  }
}

export async function getWorkspaceById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return next({ status: 400, message: "Invalid id" });
    }

    const ws = await Workspace.findByPk(id);
    if (!ws) {
      return next({ status: 404, message: "Workspace not found" });
    }

    res.json(ws);
  } catch (e) {
    next(e);
  }
}

export async function createWorkspace(req, res, next) {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return next({ status: 400, message: error.message });

    const ws = await Workspace.create(value);
    res.status(201).json(ws);
  } catch (e) {
    next(e);
  }
}

export async function updateWorkspace(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { error, value } = updateSchema.validate(req.body);
    if (!Number.isFinite(id)) return next({ status: 400, message: "Invalid id" });
    if (error) return next({ status: 400, message: error.message });

    const ws = await Workspace.findByPk(id);
    if (!ws) return next({ status: 404, message: "Workspace not found" });

    await ws.update(value);
    res.json(ws);
  } catch (e) {
    next(e);
  }
}

export async function deleteWorkspace(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return next({ status: 400, message: "Invalid id" });

    const deleted = await Workspace.destroy({ where: { id } });
    if (!deleted) return next({ status: 404, message: "Workspace not found" });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
