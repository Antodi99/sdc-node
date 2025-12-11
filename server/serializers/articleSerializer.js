export function serializeArticle(article) {
  const plain = article.toJSON();

  // Attachments
  plain.attachments = (plain.attachments || []).map(att => ({
    id: att.id,
    fileName: att.serverFilename,
    originalName: att.originalFilename,
    mimeType: att.mimeType,
    url: `/uploads/${plain.id}/${att.serverFilename}`,
  }));

  // Comments
  plain.comments = (plain.comments || []).map(c => ({
    id: c.id,
    author: c.author,
    content: c.content,
    createdAt: c.createdAt,
  }));

  // Workspace
  if (plain.workspace) {
    plain.workspace = {
      id: plain.workspace.id,
      name: plain.workspace.name,
      label: plain.workspace.label,
    };
  }

  return plain;
}
