import * as path from 'path';
import { Router, static as serveStatic } from 'express';

export default function(cfg: any) {
  const swagger = Router();

  // Path to swagger-ui
  const dist = path.join(cfg.dir.library, 'swagger-ui');

  // Path to documents
  const docs = cfg.dir.documents;

  swagger.get('/api-docs.json', (req, res) => {
    res.sendFile(path.join(docs, 'api-docs.json'));
  });

  swagger.use('/ui', serveStatic(dist));
  swagger.get('/ui', (req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });

  return swagger;
}
